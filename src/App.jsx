import { useEffect, useMemo, useRef, useState } from "react";
import { categories, drinks, optionGroups, statusSteps, sweetnessOptions } from "./data/menu.js";
import { recipes } from "./data/recipes.js";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

const STORAGE_KEY = "jimmys-homebar-orders-v3";
const ADMIN_SESSION_KEY = "jimmys-homebar-admin-unlocked";
const cancelledStatus = { id: "cancelled", labelEn: "Cancelled", labelZh: "已取消" };
const adminStatusSteps = [...statusSteps, cancelledStatus];

function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function PaperMarks() {
  return (
    <div className="paper-marks" aria-hidden="true">
      <span className="paper-mark paper-mark--top" />
      <span className="paper-mark paper-mark--right" />
      <span className="paper-mark paper-mark--bottom" />
      <span className="paper-mark paper-mark--left" />
    </div>
  );
}

function HeroIllustration() {
  return (
    <figure className="hero-art" aria-label="黄昏英伦街道路灯、纸张菜单和私人酒吧氛围插画">
      <img src={assetUrl("assets/hero/jimmys-bar-hero-v1.webp")} alt="" aria-hidden="true" />
      <figcaption>Jimmy’s Home Bar</figcaption>
    </figure>
  );
}

function HeroPoster() {
  return (
    <header className="hero">
      <HeroIllustration />
      <section className="hero-ticket" aria-labelledby="hero-title">
        <PaperMarks />
        <p className="overline">Private Home Bar</p>
        <h1 id="hero-title">Jimmy’s Bar</h1>
        <div className="rule-line" />
        <p>After dusk. Pick a pour.</p>
        <a href="#menu" className="hero-link">Start the Menu</a>
      </section>
    </header>
  );
}

function AlcoholDots({ level }) {
  const count = level === "高" ? 5 : level === "中高" ? 4 : level === "中等" ? 3 : 2;
  return (
    <span className="alcohol-dots" aria-label={`酒精度：${level}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < count ? "is-filled" : ""} />
      ))}
    </span>
  );
}

function DrinkImage({ drink, large = false }) {
  return (
    <figure className={`drink-image ${large ? "drink-image--large" : ""}`}>
      <img
        src={assetUrl(drink.image)}
        alt={`${drink.nameZh} 插画`}
        loading={large ? "eager" : "lazy"}
        onError={(event) => {
          if (drink.fallbackImage && event.currentTarget.src !== assetUrl(drink.fallbackImage)) {
            event.currentTarget.src = assetUrl(drink.fallbackImage);
          }
        }}
      />
    </figure>
  );
}

function InfoPill({ label, value }) {
  return (
    <span className="info-pill">
      <small>{label}</small>
      {value}
    </span>
  );
}

const legacyOptionMap = {
  少冰: { groupId: "ice", optionId: "less-ice" },
  多冰: { groupId: "ice", optionId: "extra-ice" },
  偏酸: { groupId: "house-adjustments", optionId: "more-sour" },
  酒精加强: { groupId: "house-adjustments", optionId: "stronger" }
};

const legacySweetnessMap = {
  少甜: "less-sweet",
  标准甜: "house-sweet"
};

const legacyStatusMap = {
  排队中: "queued",
  调制中: "mixing",
  已完成: "served"
};

function findOption(optionId) {
  for (const group of optionGroups) {
    const option = group.options.find((item) => item.id === optionId);
    if (option) return option;
  }
  return null;
}

function findStatus(statusId) {
  return adminStatusSteps.find((status) => status.id === statusId) || statusSteps[0];
}

function findSweetness(sweetnessId) {
  return sweetnessOptions.find((option) => option.id === sweetnessId) || null;
}

function formatChoice(option) {
  if (!option) return "";
  return `${option.labelEn} / ${option.labelZh}`;
}

function formatOrderAdjustments(order) {
  const sweetness = formatChoice(findSweetness(order.sweetness));
  const singleSelections = Object.values(order.singleSelections || {}).map((optionId) => formatChoice(findOption(optionId)));
  const multiSelections = (order.multiSelections || []).map((optionId) => formatChoice(findOption(optionId)));
  return [sweetness, ...singleSelections, ...multiSelections, order.remark].filter(Boolean);
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function serializeSelection(optionId) {
  const option = findOption(optionId);
  if (!option) return null;
  return {
    id: option.id,
    labelEn: option.labelEn,
    labelZh: option.labelZh,
    label: formatChoice(option)
  };
}

function serializeOrderItem(order) {
  const singleSelections = Object.values(order.singleSelections || {}).map(serializeSelection).filter(Boolean);
  const multiSelections = (order.multiSelections || []).map(serializeSelection).filter(Boolean);
  const sweetness = findSweetness(order.sweetness);

  return {
    line_id: order.id,
    drink_id: order.drink.id,
    name_zh: order.drink.nameZh,
    name_en: order.drink.nameEn,
    quantity: order.quantity,
    sweetness: sweetness
      ? {
          id: sweetness.id,
          labelEn: sweetness.labelEn,
          labelZh: sweetness.labelZh,
          label: formatChoice(sweetness)
        }
      : null,
    selections: [...singleSelections, ...multiSelections],
    remark: order.remark || ""
  };
}

function formatBackendItemAdjustments(item) {
  const sweetness = item.sweetness?.label || "";
  const selections = (item.selections || []).map((selection) => selection.label || `${selection.labelEn} / ${selection.labelZh}`);
  return [sweetness, ...selections, item.remark].filter(Boolean);
}

function isAdminRoute() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.replace(/\/$/, "");
  return path === `${base}/admin` || path === "/admin" || window.location.hash === "#/admin";
}

function CategoryNav({ activeCategory, onChange }) {
  return (
    <nav className="category-nav" aria-label="酒单分类">
      <button type="button" className={activeCategory === "all" ? "is-active" : ""} onClick={() => onChange("all")}>
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={activeCategory === category.id ? "is-active" : ""}
          onClick={() => onChange(category.id)}
        >
          {category.code}. {category.en} / {category.name}
        </button>
      ))}
    </nav>
  );
}

function DrinkCard({ drink, category, focused, onOpen }) {
  return (
    <article className={`drink-card ${focused ? "is-focused" : ""} ${drink.available ? "" : "is-sold-out"}`} data-drink-id={drink.id}>
      <PaperMarks />
      <div className="drink-card__number">{drink.number}</div>
      {!drink.available && <span className="soldout-stamp">今日售罄</span>}
      <div className="drink-card__top">
        <div>
          <p className="overline">{category.code}. {category.en} / {category.name}</p>
          <h3>{drink.nameZh}</h3>
          <p className="drink-card__en">{drink.nameEn}</p>
        </div>
        <AlcoholDots level={drink.alcohol} />
      </div>
      <DrinkImage drink={drink} />
      <p className="drink-card__note">{drink.note}</p>
      <div className="tag-row" aria-label="风味标签">
        {drink.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="drink-card__meta">
        <InfoPill label="基酒" value={drink.base} />
        <InfoPill label="烈度" value={drink.alcohol} />
      </div>
      <button className="ticket-button" type="button" disabled={!drink.available} onClick={() => onOpen(drink)}>
        Add to Ticket
      </button>
    </article>
  );
}

function OptionChip({ option, selected, onToggle }) {
  return (
    <button className={`option-chip ${selected ? "is-selected" : ""}`} type="button" onClick={onToggle}>
      <span className="option-chip__en">{option.labelEn}</span>
      <span className="option-chip__zh">{option.labelZh}</span>
    </button>
  );
}

function QuantityPicker({ value, onChange }) {
  return (
    <div className="quantity-picker" aria-label="数量选择">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="减少数量">-</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(9, value + 1))} aria-label="增加数量">+</button>
    </div>
  );
}

function DrinkDetailSheet({ drink, draft, onPatchDraft, onToggleGroupedOption, onClose, onAdd }) {
  if (!drink) return null;

  return (
    <div className="sheet-layer" role="presentation">
      <button className="sheet-backdrop" type="button" onClick={onClose} aria-label="关闭详情" />
      <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        <PaperMarks />
        <div className="detail-sheet__hero">
          <DrinkImage drink={drink} large />
          <div>
            <p className="overline">Tonight’s Pour</p>
            <h2 id="detail-title">{drink.nameZh}</h2>
            <p className="detail-en">{drink.nameEn}</p>
          </div>
        </div>
        <div className="detail-sheet__content">
          <div className="tag-row">
            {drink.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="detail-grid">
            <InfoPill label="基酒" value={drink.base} />
            <InfoPill label="风味" value={drink.flavor} />
            <InfoPill label="酒精度" value={drink.alcohol} />
          </div>
          <p className="detail-copy">{drink.note}</p>
          <p className="detail-audience">适合：{drink.audience}</p>

          {drink.sweetness && (
            <div className="option-section">
              <p>Sweetness</p>
              <div className="option-grid option-grid--two">
                {sweetnessOptions.map((option) => (
                  <OptionChip
                    key={option.id}
                    option={option}
                    selected={draft.sweetness === option.id}
                    onToggle={() => onPatchDraft({ sweetness: option.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {optionGroups.map((group) => (
            <div className="option-section" key={group.id}>
              <p>{group.title}</p>
              <div className="option-grid">
                {group.options.map((option) => (
                  <OptionChip
                    key={option.id}
                    option={option}
                    selected={
                      group.type === "single"
                        ? draft.singleSelections[group.id] === option.id
                        : draft.multiSelections.includes(option.id)
                    }
                    onToggle={() => onToggleGroupedOption(group, option)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="detail-form-row">
            <label>
              <span>Quantity</span>
              <QuantityPicker value={draft.quantity} onChange={(quantity) => onPatchDraft({ quantity })} />
            </label>
          </div>

          <label className="remark-field">
            <span>Bartender Note</span>
            <textarea
              rows={3}
              value={draft.remark}
              placeholder="例如：less sour, first round"
              onChange={(event) => onPatchDraft({ remark: event.target.value })}
            />
          </label>

          <button className="primary-button" type="button" onClick={() => onAdd(drink)}>
            Add to Ticket
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }) {
  const statusItem = findStatus(status);
  const statusIndex = statusSteps.findIndex((item) => item.id === statusItem.id);
  return <span className={`status-pill status-pill--${statusIndex}`}>{statusItem.labelEn} / {statusItem.labelZh}</span>;
}

function OrderDock({ orders, onAdvance, onRemove, onClear, onSubmit, submitState, submittedTicket }) {
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);

  if (!orders.length && !submittedTicket) return null;

  return (
    <aside className="order-dock" aria-live="polite">
      {submittedTicket ? (
        <div className="ticket-success">
          <p className="overline">Ticket sent</p>
          <h2>Ticket #{submittedTicket.ticket_no}</h2>
          <span>Queued / 排队中</span>
        </div>
      ) : (
        <>
          <div className="order-dock__header">
            <div>
              <p className="overline">Bartender ticket</p>
              <h2>今晚小票 <span>{totalQuantity} 杯</span></h2>
            </div>
            <button type="button" onClick={onClear}>清空</button>
          </div>
          <div className="order-dock__items">
            {orders.map((order, index) => (
              <article className="order-mini" key={order.id}>
                <div>
                  <h3>#{index + 1} {order.drink.nameZh} × {order.quantity}</h3>
                  <p>{formatOrderAdjustments(order).join(" · ") || "House Pour / 默认配方"}</p>
                </div>
                <div className="order-mini__actions">
                  <button type="button" onClick={() => onAdvance(order.id)} aria-label={`推进 ${order.drink.nameZh} 状态`}>
                    <StatusPill status={order.status} />
                  </button>
                  <button type="button" onClick={() => onRemove(order.id)} aria-label={`删除 ${order.drink.nameZh}`}>删</button>
                </div>
              </article>
            ))}
          </div>
          {submitState.error && <p className="submit-error">{submitState.error}</p>}
          <button className="submit-ticket-button" type="button" onClick={onSubmit} disabled={submitState.loading}>
            {submitState.loading ? "Sending..." : "Send to Bar"}
          </button>
        </>
      )}
    </aside>
  );
}

function createDraft(drink = null) {
  return {
    sweetness: drink?.sweetness ? "house-sweet" : "",
    singleSelections: {},
    multiSelections: [],
    quantity: 1,
    remark: ""
  };
}

function normalizeLegacyOptions(options = []) {
  const singleSelections = {};
  const multiSelections = [];

  for (const option of options) {
    const mapped = legacyOptionMap[option];
    if (!mapped) continue;
    const group = optionGroups.find((item) => item.id === mapped.groupId);
    if (group?.type === "single") {
      singleSelections[group.id] = mapped.optionId;
    } else {
      multiSelections.push(mapped.optionId);
    }
  }

  return { singleSelections, multiSelections };
}

function normalizeSweetness(sweetness) {
  if (!sweetness) return "";
  if (sweetnessOptions.some((option) => option.id === sweetness)) return sweetness;
  return legacySweetnessMap[sweetness] || "";
}

function normalizeStatus(status) {
  if (!status) return statusSteps[0].id;
  if (statusSteps.some((item) => item.id === status)) return status;
  return legacyStatusMap[status] || statusSteps[0].id;
}

function readStoredOrders() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((order) => {
        const legacy = normalizeLegacyOptions(order.options);
        return {
          ...order,
          drink: drinks.find((drink) => drink.id === order.drinkId) || order.drink,
          sweetness: normalizeSweetness(order.sweetness),
          singleSelections: order.singleSelections || legacy.singleSelections,
          multiSelections: order.multiSelections || legacy.multiSelections,
          status: normalizeStatus(order.status)
        };
      })
      .filter((order) => order.drink);
  } catch {
    return [];
  }
}

function CustomerApp() {
  const deckRef = useRef(null);
  const hasMountedRef = useRef(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [focusedDrinkId, setFocusedDrinkId] = useState(drinks[0].id);
  const [activeDrink, setActiveDrink] = useState(null);
  const [draft, setDraft] = useState(createDraft());
  const [orders, setOrders] = useState(() => readStoredOrders());
  const [submitState, setSubmitState] = useState({ loading: false, error: "" });
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const visibleDrinks = useMemo(() => {
    if (activeCategory === "all") return drinks;
    return drinks.filter((drink) => drink.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    setFocusedDrinkId(visibleDrinks[0]?.id || drinks[0].id);
    if (hasMountedRef.current) {
      deckRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      hasMountedRef.current = true;
    }
  }, [visibleDrinks]);

  useEffect(() => {
    const stored = orders.map((order) => ({
      ...order,
      drinkId: order.drink.id,
      drink: undefined
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [orders]);

  useEffect(() => {
    document.body.classList.toggle("is-sheet-open", Boolean(activeDrink));
    return () => document.body.classList.remove("is-sheet-open");
  }, [activeDrink]);

  useEffect(() => {
    function updateFocusedCard() {
      const deck = deckRef.current;
      if (!deck) return;
      const cards = Array.from(deck.querySelectorAll("[data-drink-id]"));
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      const closest = cards.reduce((current, card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = window.scrollY + rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (!current || distance < current.distance) return { id: card.dataset.drinkId, distance };
        return current;
      }, null);

      if (closest?.id) {
        setFocusedDrinkId((current) => (current === closest.id ? current : closest.id));
      }
    }

    updateFocusedCard();
    window.addEventListener("scroll", updateFocusedCard, { passive: true });
    window.addEventListener("resize", updateFocusedCard);
    return () => {
      window.removeEventListener("scroll", updateFocusedCard);
      window.removeEventListener("resize", updateFocusedCard);
    };
  }, [visibleDrinks]);

  function handleDeckScroll() {
    const deck = deckRef.current;
    if (!deck) return;
    const cards = Array.from(deck.querySelectorAll("[data-drink-id]"));
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    const closest = cards.reduce((current, card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = window.scrollY + rect.top + rect.height / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (!current || distance < current.distance) return { id: card.dataset.drinkId, distance };
      return current;
    }, null);

    if (closest?.id && closest.id !== focusedDrinkId) {
      setFocusedDrinkId(closest.id);
    }
  }

  function openDrink(drink) {
    if (!drink.available) return;
    setDraft(createDraft(drink));
    setActiveDrink(drink);
  }

  function patchDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function toggleGroupedOption(group, option) {
    // Single groups are mutually exclusive: picking one option replaces the previous option in that group.
    setDraft((current) => ({
      ...current,
      singleSelections:
        group.type === "single"
          ? {
              ...current.singleSelections,
              [group.id]: current.singleSelections[group.id] === option.id ? "" : option.id
            }
          : current.singleSelections,
      multiSelections:
        group.type === "multi"
          ? current.multiSelections.includes(option.id)
            ? current.multiSelections.filter((item) => item !== option.id)
            : [...current.multiSelections, option.id]
          : current.multiSelections
    }));
  }

  function addDrink(drink) {
    setOrders((current) => [
      ...current,
      {
        id: `${drink.id}-${Date.now()}`,
        drink,
        drinkId: drink.id,
        sweetness: draft.sweetness,
        singleSelections: draft.singleSelections,
        multiSelections: draft.multiSelections,
        quantity: draft.quantity,
        remark: draft.remark.trim(),
        status: statusSteps[0].id
      }
    ]);
    setSubmittedTicket(null);
    setActiveDrink(null);
    setDraft(createDraft());
  }

  async function submitTicket() {
    if (!orders.length || submitState.loading) return;

    if (!isSupabaseConfigured) {
      setSubmitState({
        loading: false,
        error: "Supabase 尚未配置，今晚小票已保存在本机；配置 .env 后可提交到后台。"
      });
      return;
    }

    setSubmitState({ loading: true, error: "" });

    const payload = {
      status: "queued",
      items: orders.map(serializeOrderItem)
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("id,ticket_no,status,created_at")
      .single();

    if (error) {
      setSubmitState({
        loading: false,
        error: "网络或 Supabase 写入失败，小票没有丢，可以稍后重试。"
      });
      return;
    }

    setSubmittedTicket(data);
    setOrders([]);
    setSubmitState({ loading: false, error: "" });
  }

  function advanceStatus(orderId) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const currentIndex = Math.max(0, statusSteps.findIndex((status) => status.id === order.status));
        const nextIndex = Math.min(currentIndex + 1, statusSteps.length - 1);
        return { ...order, status: statusSteps[nextIndex].id };
      })
    );
  }

  return (
    <>
      <a className="skip-link" href="#menu">跳到酒单</a>
      <HeroPoster />
      <main id="menu" className="menu-page">
        <CategoryNav activeCategory={activeCategory} onChange={setActiveCategory} />
        <section className="drink-deck" ref={deckRef} onPointerMove={handleDeckScroll} aria-label="鸡尾酒卡片">
          {visibleDrinks.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              category={categories.find((category) => category.id === drink.category)}
              focused={drink.id === focusedDrinkId}
              onOpen={openDrink}
            />
          ))}
        </section>
      </main>
      <footer className="site-footer">
        <p>Jimmy’s Bar Menu</p>
        <span>private handbill edition</span>
      </footer>
      <OrderDock
        orders={orders}
        onAdvance={advanceStatus}
        onRemove={(orderId) => setOrders((current) => current.filter((order) => order.id !== orderId))}
        onClear={() => setOrders([])}
        onSubmit={submitTicket}
        submitState={submitState}
        submittedTicket={submittedTicket}
      />
      <DrinkDetailSheet
        drink={activeDrink}
        draft={draft}
        onPatchDraft={patchDraft}
        onToggleGroupedOption={toggleGroupedOption}
        onClose={() => setActiveDrink(null)}
        onAdd={addDrink}
      />
    </>
  );
}

function AdminLogin({ pin, setPin, error, onUnlock }) {
  return (
    <main className="admin-page admin-page--login">
      <section className="admin-login">
        <PaperMarks />
        <p className="overline">Jimmy’s Back Bar</p>
        <h1>Admin Ticket Room</h1>
        <p>输入你的私人 PIN 后查看今晚订单和配方提示。</p>
        <form onSubmit={onUnlock}>
          <label>
            <span>Bar PIN</span>
            <input
              inputMode="numeric"
              type="password"
              value={pin}
              autoComplete="current-password"
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••"
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="primary-button" type="submit">Unlock Admin</button>
        </form>
      </section>
    </main>
  );
}

function AdminOrderCard({ order, recipeMap, onStatusChange }) {
  const status = findStatus(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <article className="admin-order">
      <header className="admin-order__header">
        <div>
          <p className="overline">Ticket #{order.ticket_no}</p>
          <h2>{status.labelEn} / {status.labelZh}</h2>
          <span>{formatDateTime(order.created_at)}</span>
        </div>
        <div className="admin-order__actions">
          <button type="button" onClick={() => onStatusChange(order.id, "mixing")}>Mixing</button>
          <button type="button" onClick={() => onStatusChange(order.id, "served")}>Served</button>
          <button type="button" onClick={() => onStatusChange(order.id, "cancelled")}>Cancel</button>
        </div>
      </header>

      <div className="admin-order__items">
        {items.map((item) => {
          const recipe = recipeMap.get(item.drink_id);
          const adjustments = formatBackendItemAdjustments(item);

          return (
            <section className="admin-line-item" key={item.line_id || `${item.drink_id}-${item.name_en}`}>
              <div className="admin-line-item__summary">
                <h3>{item.name_zh} <span>{item.name_en}</span></h3>
                <strong>× {item.quantity}</strong>
              </div>
              <p>{adjustments.join(" · ") || "House Pour / 默认配方"}</p>
              {recipe && (
                <div className="recipe-card">
                  <p className="overline">Recipe Cue</p>
                  <dl>
                    <div>
                      <dt>Ingredients</dt>
                      <dd>{recipe.ingredients.join(" / ")}</dd>
                    </div>
                    <div>
                      <dt>Method</dt>
                      <dd>{recipe.method}</dd>
                    </div>
                    <div>
                      <dt>Glass</dt>
                      <dd>{recipe.glass}</dd>
                    </div>
                    <div>
                      <dt>Garnish</dt>
                      <dd>{recipe.garnish}</dd>
                    </div>
                    <div>
                      <dt>Prep Notes</dt>
                      <dd>{recipe.prepNotes}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}

function AdminApp() {
  const configuredPin = import.meta.env.VITE_ADMIN_PIN?.trim() || "";
  const [pin, setPin] = useState("");
  const [unlockError, setUnlockError] = useState(
    configuredPin ? "" : "Admin PIN 尚未配置。请在本地 .env 或 GitHub Secrets 中设置 VITE_ADMIN_PIN。"
  );
  const [unlocked, setUnlocked] = useState(() => Boolean(configuredPin) && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState("queued");
  const [adminState, setAdminState] = useState({ loading: false, error: "" });

  const recipeMap = useMemo(() => new Map(recipes.map((recipe) => [recipe.drinkId, recipe])), []);

  async function loadOrders() {
    if (!isSupabaseConfigured) {
      setAdminState({ loading: false, error: "Supabase 尚未配置。请先创建项目、执行 SQL，并填写 .env。" });
      return;
    }

    setAdminState({ loading: true, error: "" });
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      setAdminState({ loading: false, error: "订单读取失败，请检查 Supabase URL、anon key 和 RLS policy。" });
      return;
    }

    setOrders(data || []);
    setAdminState({ loading: false, error: "" });
  }

  useEffect(() => {
    if (!unlocked) return undefined;
    loadOrders();

    if (!isSupabaseConfigured) return undefined;

    const channel = supabase
      .channel("jimmys-orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked]);

  function handleUnlock(event) {
    event.preventDefault();
    if (!configuredPin) {
      setUnlockError("Admin PIN 尚未配置。请在本地 .env 或 GitHub Secrets 中设置 VITE_ADMIN_PIN。");
      return;
    }
    if (pin.trim() !== configuredPin) {
      setUnlockError("PIN 不对。今晚的吧台门还没开。");
      return;
    }
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setUnlocked(true);
    setUnlockError("");
  }

  async function updateOrderStatus(orderId, status) {
    if (!isSupabaseConfigured) return;
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      setAdminState({ loading: false, error: "状态更新失败，已保留页面当前显示；请刷新确认。" });
      loadOrders();
    }
  }

  if (!unlocked) {
    return <AdminLogin pin={pin} setPin={setPin} error={unlockError} onUnlock={handleUnlock} />;
  }

  const counts = adminStatusSteps.reduce((acc, status) => {
    acc[status.id] = orders.filter((order) => order.status === status.id).length;
    return acc;
  }, {});
  const visibleOrders = orders.filter((order) => activeStatus === "all" || order.status === activeStatus);

  return (
    <main className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="overline">Jimmy’s Back Bar</p>
          <h1>Tonight’s Tickets</h1>
          <p>订单队列、调制状态和每杯酒的 recipe cue。</p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
            setUnlocked(false);
          }}
        >
          Lock
        </button>
      </header>

      <nav className="admin-filters" aria-label="订单状态筛选">
        <button type="button" className={activeStatus === "all" ? "is-active" : ""} onClick={() => setActiveStatus("all")}>
          All <span>{orders.length}</span>
        </button>
        {adminStatusSteps.map((status) => (
          <button
            key={status.id}
            type="button"
            className={activeStatus === status.id ? "is-active" : ""}
            onClick={() => setActiveStatus(status.id)}
          >
            {status.labelEn} <span>{counts[status.id] || 0}</span>
          </button>
        ))}
      </nav>

      {adminState.error && <p className="admin-error admin-error--wide">{adminState.error}</p>}
      {adminState.loading && <p className="admin-loading">Loading tickets...</p>}

      <section className="admin-board" aria-label="订单队列">
        {visibleOrders.length ? (
          visibleOrders.map((order) => (
            <AdminOrderCard key={order.id} order={order} recipeMap={recipeMap} onStatusChange={updateOrderStatus} />
          ))
        ) : (
          <div className="admin-empty">
            <p className="overline">Quiet Bar</p>
            <h2>现在没有这个状态的订单</h2>
            <p>等第一张小票飞进来，吧台就热闹了。</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return isAdminRoute() ? <AdminApp /> : <CustomerApp />;
}
