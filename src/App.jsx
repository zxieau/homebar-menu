import { useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  dealerBaseOptions,
  dealerFlavorOptions,
  drinks,
  optionGroups,
  statusSteps,
  sweetnessOptions
} from "./data/menu.js";
import { recipes } from "./data/recipes.js";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

const STORAGE_KEY = "jimmys-homebar-orders-v3";
const SUBMITTED_TICKET_KEY = "jimmys-homebar-submitted-ticket-v1";
const SUBMITTED_TICKETS_KEY = "jimmys-homebar-submitted-tickets-v2";
const SERVED_STAMP_KEY = "jimmys-homebar-served-stamps-v1";
const GUEST_NAME_KEY = "jimmys-bar-guest-name";
const GUEST_ID_KEY = "jimmys-bar-guest-id";
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
    <section className="hero-poster" aria-labelledby="hero-title">
      <img
        className="hero-artwork"
        src={assetUrl("assets/hero/jimmys-bar-hero-v2.webp")}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        onError={(event) => {
          const fallback = assetUrl("assets/hero/jimmys-bar-hero-v2.jpg");
          if (event.currentTarget.src !== fallback) {
            event.currentTarget.src = fallback;
          }
        }}
      />
      <div className="hero-handbill">
        <PaperMarks />
        <p className="overline">Private Home Bar</p>
        <h1 id="hero-title">Jimmy’s Bar</h1>
        <p className="hero-subtitle">Menu after dusk</p>
        <div className="rule-line" />
        <p className="hero-copy">街灯亮起后，选一杯今晚的 pour。</p>
        <a href="#menu" className="hero-link">Start the Menu</a>
      </div>
    </section>
  );
}

function HeroPoster() {
  return (
    <header className="hero">
      <HeroIllustration />
    </header>
  );
}

function StrengthBadge({ level }) {
  return (
    <span className="info-pill info-pill--strength" aria-label={`酒精度：${level}`}>
      <small>Strength</small>
      {level}
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
        decoding="async"
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

function getItemType(item) {
  return item?.type || "drink";
}

function isDrinkItem(item) {
  return getItemType(item) === "drink";
}

function isSnackItem(item) {
  return getItemType(item) === "snack";
}

function isCustomItem(item) {
  return getItemType(item) === "custom";
}

function formatChoice(option) {
  if (!option) return "";
  return `${option.labelEn} / ${option.labelZh}`;
}

function findDealerBase(baseId) {
  return dealerBaseOptions.find((option) => option.id === baseId) || dealerBaseOptions[0];
}

function findDealerFlavor(flavorId) {
  return dealerFlavorOptions.find((option) => option.id === flavorId) || dealerFlavorOptions[0];
}

function generateDealerChoice(baseId, flavorId) {
  const base = findDealerBase(baseId);
  const flavor = findDealerFlavor(flavorId);
  const nameSeeds = {
    citrus: ["暮色酸咒", "Dusk Sour Spell"],
    sweet: ["灯下蜜语", "Lantern Velvet"],
    strong: ["午夜暗牌", "Midnight Draw"],
    fizzy: ["星尘气泡", "Stardust Highball"]
  };
  const [nameZh, nameEn] = nameSeeds[flavor.id] || nameSeeds.citrus;
  const finalNameZh = `${base.labelZh}${nameZh}`;
  const finalNameEn = `${base.labelEn} ${nameEn}`;

  return {
    nameZh: finalNameZh,
    nameEn: finalNameEn,
    description: `${base.character}打底，${flavor.tone}。这杯会按现场心情微调，但保持好喝、不乱来。`,
    recipeCue: {
      ingredients: [base.core, ...flavor.ingredients],
      method: flavor.method,
      glass: flavor.id === "fizzy" ? "Highball / 长饮杯" : flavor.id === "strong" ? "Rocks / 古典杯" : "Coupe / 鸡尾酒杯",
      garnish: flavor.garnish,
      prepNotes: `Dealer’s Choice：客人选择 ${base.labelEn} / ${base.labelZh} + ${flavor.labelEn} / ${flavor.labelZh}。先按建议配方出杯，最后根据备注微调。`
    }
  };
}

function formatOrderAdjustments(order) {
  if (isSnackItem(order.drink)) {
    return [order.remark].filter(Boolean);
  }

  if (isCustomItem(order.drink)) {
    const generated = generateDealerChoice(order.dealerBase, order.dealerFlavor);
    return [
      `${findDealerBase(order.dealerBase).labelEn} / ${findDealerBase(order.dealerBase).labelZh}`,
      `${findDealerFlavor(order.dealerFlavor).labelEn} / ${findDealerFlavor(order.dealerFlavor).labelZh}`,
      generated.nameZh,
      order.remark
    ].filter(Boolean);
  }

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

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function fitCanvasText(context, text, maxWidth, initialSize, minSize, fontFamily, weight = 700) {
  let size = initialSize;
  do {
    context.font = `${weight} ${size}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size > minSize);
  return minSize;
}

function drawCenteredCanvasText(context, text, y, options = {}) {
  const {
    color = "#2f2118",
    font = 'Georgia, "Songti SC", serif',
    size = 36,
    weight = 700,
    letterSpacing = 0
  } = options;
  context.save();
  context.fillStyle = color;
  context.font = `${weight} ${size}px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (!letterSpacing) {
    context.fillText(text, 561, y);
  } else {
    const glyphs = Array.from(text);
    const widths = glyphs.map((glyph) => context.measureText(glyph).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + letterSpacing * (glyphs.length - 1);
    let x = 561 - totalWidth / 2;
    glyphs.forEach((glyph, index) => {
      context.fillText(glyph, x + widths[index] / 2, y);
      x += widths[index] + letterSpacing;
    });
  }
  context.restore();
}

async function createKeepsakeImage(ticket) {
  await document.fonts?.ready;
  const background = await loadCanvasImage(assetUrl("assets/share/jimmys-night-keepsake-v1.webp"));
  const canvas = document.createElement("canvas");
  canvas.width = 1122;
  canvas.height = 1402;
  const context = canvas.getContext("2d");
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const guestName = getOrderGuestName(ticket).slice(0, 24);
  const guestSize = fitCanvasText(
    context,
    guestName,
    690,
    82,
    46,
    'Georgia, "Songti SC", serif',
    700
  );
  const dateLabel = ticket.created_at
    ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(ticket.created_at))
    : new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  const items = (Array.isArray(ticket.items) ? ticket.items : []).slice(0, 4);

  drawCenteredCanvasText(context, "JIMMY'S HOME BAR", 236, {
    size: 43,
    color: "#352419",
    letterSpacing: 5
  });
  drawCenteredCanvasText(context, "PRIVATE MENU · AFTER DUSK", 291, {
    size: 21,
    weight: 600,
    color: "#765030",
    letterSpacing: 3
  });
  drawCenteredCanvasText(context, "A NIGHT FOR", 450, {
    size: 22,
    weight: 700,
    color: "#815d3b",
    letterSpacing: 5
  });
  drawCenteredCanvasText(context, guestName, 523, {
    size: guestSize,
    color: "#2c1d14"
  });

  context.save();
  context.strokeStyle = "rgba(82, 55, 35, 0.72)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(333, 579);
  context.lineTo(789, 579);
  context.stroke();
  context.restore();

  drawCenteredCanvasText(context, `TICKET #${ticket.ticket_no || "—"}  ·  ${dateLabel}`, 622, {
    size: 22,
    weight: 600,
    color: "#6d4a30",
    letterSpacing: 1
  });
  drawCenteredCanvasText(context, "TONIGHT'S ORDER", 698, {
    size: 22,
    color: "#815d3b",
    letterSpacing: 4
  });

  const itemStartY = 756;
  items.forEach((item, index) => {
    const label = `${item.name_en || item.name_zh || "House Pour"}  × ${item.quantity || 1}`;
    const lineSize = fitCanvasText(context, label, 660, 34, 24, 'Georgia, "Songti SC", serif', 700);
    drawCenteredCanvasText(context, label, itemStartY + index * 57, {
      size: lineSize,
      color: "#38271b"
    });
  });

  if ((ticket.items || []).length > items.length) {
    drawCenteredCanvasText(context, `+ ${(ticket.items || []).length - items.length} more from tonight's menu`, itemStartY + items.length * 57, {
      size: 21,
      weight: 600,
      color: "#765030"
    });
  }

  drawCenteredCanvasText(context, "JIMMY'S HOME BAR · SHANGHAI", 968, {
    size: 19,
    weight: 700,
    color: "#765030",
    letterSpacing: 3
  });

  return canvas.toDataURL("image/jpeg", 0.92);
}

function createGuestId() {
  return `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
}

function readGuestProfile() {
  const storedId = window.localStorage.getItem(GUEST_ID_KEY) || createGuestId();
  const storedName = window.localStorage.getItem(GUEST_NAME_KEY) || storedId;
  window.localStorage.setItem(GUEST_ID_KEY, storedId);
  window.localStorage.setItem(GUEST_NAME_KEY, storedName);
  return { guestId: storedId, guestName: storedName };
}

function readSubmittedTicket() {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_TICKET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readSubmittedTickets() {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_TICKETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return parsed.filter((ticket) => ticket?.id);
  } catch {
    // Fall through to legacy migration.
  }

  const legacyTicket = readSubmittedTicket();
  return legacyTicket?.id ? [legacyTicket] : [];
}

function upsertTicket(tickets, nextTicket) {
  if (!nextTicket?.id) return tickets;
  const withoutCurrent = tickets.filter((ticket) => ticket.id !== nextTicket.id);
  return [nextTicket, ...withoutCurrent].slice(0, 12);
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
  const itemType = getItemType(order.drink);
  const baseItem = {
    line_id: order.id,
    type: itemType,
    drink_id: order.drink.id,
    name_zh: order.drink.nameZh,
    name_en: order.drink.nameEn,
    quantity: order.quantity,
    remark: order.remark || ""
  };

  if (isSnackItem(order.drink)) {
    return {
      ...baseItem,
      recipe_cue: order.drink.prepCue || {
        ingredients: [order.drink.nameZh],
        method: "按现场现有小食快速出盘。",
        glass: "小碟",
        garnish: "",
        prepNotes: "小食无需酒类客制化。"
      }
    };
  }

  if (isCustomItem(order.drink)) {
    const generated = generateDealerChoice(order.dealerBase, order.dealerFlavor);
    return {
      ...baseItem,
      name_zh: generated.nameZh,
      name_en: generated.nameEn,
      dealer_choice: {
        base: findDealerBase(order.dealerBase),
        flavor: findDealerFlavor(order.dealerFlavor),
        description: generated.description
      },
      selections: [
        { id: order.dealerBase, label: `${findDealerBase(order.dealerBase).labelEn} / ${findDealerBase(order.dealerBase).labelZh}` },
        { id: order.dealerFlavor, label: `${findDealerFlavor(order.dealerFlavor).labelEn} / ${findDealerFlavor(order.dealerFlavor).labelZh}` }
      ],
      recipe_cue: generated.recipeCue
    };
  }

  const singleSelections = Object.values(order.singleSelections || {}).map(serializeSelection).filter(Boolean);
  const multiSelections = (order.multiSelections || []).map(serializeSelection).filter(Boolean);
  const sweetness = findSweetness(order.sweetness);

  return {
    ...baseItem,
    sweetness: sweetness
      ? {
          id: sweetness.id,
          labelEn: sweetness.labelEn,
          labelZh: sweetness.labelZh,
          label: formatChoice(sweetness)
        }
      : null,
    selections: [...singleSelections, ...multiSelections]
  };
}

function formatBackendItemAdjustments(item) {
  const sweetness = item.sweetness?.label || "";
  const selections = (item.selections || []).map((selection) => selection.label || `${selection.labelEn} / ${selection.labelZh}`);
  const dealerDescription = item.dealer_choice?.description || "";
  return [sweetness, ...selections, dealerDescription, item.remark].filter(Boolean);
}

function readServedStampIds() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SERVED_STAMP_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markServedStampSeen(ticketId) {
  const nextIds = Array.from(new Set([...readServedStampIds(), ticketId])).slice(-80);
  window.localStorage.setItem(SERVED_STAMP_KEY, JSON.stringify(nextIds));
}

function getMenuItemById(itemId) {
  return drinks.find((drink) => drink.id === itemId) || null;
}

function getAnonymousItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function buildPulse(orders = []) {
  const statusCounts = adminStatusSteps.reduce((acc, status) => {
    acc[status.id] = 0;
    return acc;
  }, {});
  const itemMap = new Map();
  const categoryCounts = new Map();
  let totalItems = 0;
  let servedItems = 0;

  for (const order of orders) {
    const status = normalizeStatus(order.status);
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    for (const item of getAnonymousItems(order)) {
      const quantity = Number(item.quantity) || 1;
      const key = item.drink_id || item.name_en || item.name_zh || "unknown";
      const menuItem = getMenuItemById(item.drink_id);
      const itemType = item.type || menuItem?.type || "drink";
      const existing = itemMap.get(key) || {
        id: key,
        nameZh: item.name_zh || menuItem?.nameZh || "神秘小票",
        nameEn: item.name_en || menuItem?.nameEn || "House Item",
        type: itemType,
        quantity: 0
      };
      existing.quantity += quantity;
      itemMap.set(key, existing);
      totalItems += quantity;

      if (status === "served") {
        servedItems += quantity;
      }

      const categoryId = menuItem?.category || (itemType === "snack" ? "snacks" : itemType === "custom" ? "mystery" : "unknown");
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + quantity);
    }
  }

  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity || a.nameEn.localeCompare(b.nameEn))
    .slice(0, 3);
  const topCategoryId = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const topCategory = categories.find((category) => category.id === topCategoryId);
  const moodCopy = topCategory
    ? `${topCategory.en} is leading tonight / 今晚大家偏爱${topCategory.name}。`
    : orders.length
      ? "The board is waking up / 今晚吧台正在热起来。"
      : "Tonight board is warming up / 今晚吧台正在热身。";

  return {
    totalTickets: orders.length,
    totalItems,
    servedItems,
    queuedTickets: statusCounts.queued || 0,
    mixingTickets: statusCounts.mixing || 0,
    servedTickets: statusCounts.served || 0,
    cancelledTickets: statusCounts.cancelled || 0,
    topItems,
    moodCopy
  };
}

function getOrderGuestName(order) {
  return order?.guest_name?.trim() || "Guest / 未命名朋友";
}

function getOrderGuestLine(order) {
  const name = getOrderGuestName(order);
  return order?.guest_id && order.guest_id !== order.guest_name ? `${name} · ${order.guest_id}` : name;
}

function isAdminRoute() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.replace(/\/$/, "");
  return path === `${base}/admin` || path === "/admin" || window.location.hash === "#/admin";
}

function CategoryNav({ activeCategory, onChange }) {
  return (
    <nav className="category-nav" aria-label="酒单分类">
      <button
        type="button"
        className={activeCategory === "all" ? "is-active" : ""}
        aria-pressed={activeCategory === "all"}
        onClick={() => onChange("all")}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={activeCategory === category.id ? "is-active" : ""}
          aria-pressed={activeCategory === category.id}
          onClick={() => onChange(category.id)}
        >
          {category.shortLabel || `${category.en} / ${category.name}`}
        </button>
      ))}
    </nav>
  );
}

function DrinkCard({ drink, category, focused, onOpen }) {
  const itemType = getItemType(drink);
  const actionLabel = itemType === "snack" ? "Add Snack" : itemType === "custom" ? "Make My Pour" : "Add to Ticket";

  return (
    <article
      className={`drink-card drink-card--${itemType} ${focused ? "is-focused" : ""} ${drink.available ? "" : "is-sold-out"}`}
      data-drink-id={drink.id}
    >
      <PaperMarks />
      {!drink.available && <span className="soldout-stamp">今日售罄</span>}
      <div className="drink-card__top">
        <div>
          <p className="overline">{category.code}. {category.en} / {category.name}</p>
          <h3>{drink.nameZh}</h3>
          <p className="drink-card__en">{drink.nameEn}</p>
        </div>
      </div>
      <DrinkImage drink={drink} />
      <p className="drink-card__note">{drink.note}</p>
      <div className="tag-row" aria-label="风味标签">
        {drink.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="drink-card__meta">
        {isDrinkItem(drink) ? (
          <>
            <InfoPill label="基酒" value={drink.base} />
            <StrengthBadge level={drink.alcohol} />
          </>
        ) : isCustomItem(drink) ? (
          <>
            <InfoPill label="玩法" value="基酒 + 风味" />
            <InfoPill label="出品" value="现场生成" />
          </>
        ) : (
          <>
            <InfoPill label="类别" value="小食" />
            <InfoPill label="节奏" value="先上也可以" />
          </>
        )}
      </div>
      <button className="ticket-button" type="button" disabled={!drink.available} onClick={() => onOpen(drink)}>
        {actionLabel}
      </button>
    </article>
  );
}

function OptionChip({ option, selected, onToggle }) {
  return (
    <button className={`option-chip ${selected ? "is-selected" : ""}`} type="button" aria-pressed={selected} onClick={onToggle}>
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
  const generatedDealer = isCustomItem(drink) ? generateDealerChoice(draft.dealerBase, draft.dealerFlavor) : null;
  const sheetLabel = isSnackItem(drink) ? "Bar Snack" : isCustomItem(drink) ? "Dealer’s Choice" : "Tonight’s Pour";
  const actionLabel = isSnackItem(drink) ? "Add Snack" : isCustomItem(drink) ? "Add Mystery Pour" : "Add to Ticket";

  return (
    <div className="sheet-layer" role="presentation">
      <button className="sheet-backdrop" type="button" onClick={onClose} aria-label="关闭详情" />
      <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        <PaperMarks />
        <div className="detail-sheet__hero">
          <DrinkImage drink={drink} large />
          <div>
            <p className="overline">{sheetLabel}</p>
            <h2 id="detail-title">{drink.nameZh}</h2>
            <p className="detail-en">{drink.nameEn}</p>
          </div>
        </div>
        <div className="detail-sheet__content">
          <div className="tag-row">
            {drink.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          {isDrinkItem(drink) && (
            <div className="detail-grid">
              <InfoPill label="基酒" value={drink.base} />
              <InfoPill label="风味" value={drink.flavor} />
              <InfoPill label="酒精度" value={drink.alcohol} />
            </div>
          )}
          {isSnackItem(drink) && (
            <div className="detail-grid">
              <InfoPill label="类别" value="小食" />
              <InfoPill label="适合" value="分享 / 垫胃" />
            </div>
          )}
          {isCustomItem(drink) && (
            <div className="detail-grid">
              <InfoPill label="玩法" value="选基酒" />
              <InfoPill label="风味" value="选方向" />
            </div>
          )}
          <p className="detail-copy">{drink.note}</p>
          <p className="detail-audience">适合：{drink.audience}</p>

          {isCustomItem(drink) && (
            <>
              <div className="option-section">
                <p>Base Spirit</p>
                <div className="option-grid option-grid--dealer">
                  {dealerBaseOptions.map((option) => (
                    <OptionChip
                      key={option.id}
                      option={option}
                      selected={draft.dealerBase === option.id}
                      onToggle={() => onPatchDraft({ dealerBase: option.id })}
                    />
                  ))}
                </div>
              </div>
              <div className="option-section">
                <p>Flavor Profile</p>
                <div className="option-grid option-grid--two">
                  {dealerFlavorOptions.map((option) => (
                    <OptionChip
                      key={option.id}
                      option={option}
                      selected={draft.dealerFlavor === option.id}
                      onToggle={() => onPatchDraft({ dealerFlavor: option.id })}
                    />
                  ))}
                </div>
              </div>
              <div className="dealer-preview" aria-live="polite">
                <p className="overline">Tonight’s Secret</p>
                <h3>{generatedDealer.nameZh}</h3>
                <span>{generatedDealer.nameEn}</span>
                <p>{generatedDealer.description}</p>
              </div>
            </>
          )}

          {isDrinkItem(drink) && drink.sweetness && (
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

          {isDrinkItem(drink) && (
            <>
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
            </>
          )}

          {isSnackItem(drink) && (
            <div className="snack-note">
              <p className="overline">Snack Cue</p>
              <span>小食只需要数量和备注；如果想要多酱、少盐、先上，可以写在备注里。</span>
            </div>
          )}

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
              placeholder={isSnackItem(drink) ? "例如：多一点酱、先上、少盐" : isCustomItem(drink) ? "例如：别太甜、酒感明显一点" : "例如：less sour, first round"}
              onChange={(event) => onPatchDraft({ remark: event.target.value })}
            />
          </label>

          <button className="primary-button" type="button" onClick={() => onAdd(drink)}>
            {actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }) {
  const statusItem = findStatus(status);
  const statusIndex = Math.max(0, adminStatusSteps.findIndex((item) => item.id === statusItem.id));
  return <span className={`status-pill status-pill--${statusIndex}`}>{statusItem.labelEn} / {statusItem.labelZh}</span>;
}

function GuestIdentity({ guestName, onChange }) {
  return (
    <section className="guest-card" aria-label="点单昵称">
      <div>
        <p className="overline">Guest name</p>
        <label htmlFor="guest-name">给自己取个名字，方便 Jimmy 送酒</label>
      </div>
      <input
        id="guest-name"
        type="text"
        value={guestName}
        maxLength={24}
        placeholder="比如 Alex、3号桌、小王、蓝色卫衣"
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}

function ServedStampToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="served-toast" role="status" aria-live="polite">
      <button type="button" onClick={onClose} aria-label="关闭已完成提示">×</button>
      <p className="overline">Served / 已完成</p>
      <h2>Ticket #{toast.ticketNo} is ready.</h2>
      <span>Cheers, {toast.guestName}.</span>
    </div>
  );
}

function ShareKeepsakeSheet({ ticket, onClose }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [shareState, setShareState] = useState({ loading: false, message: "", error: "" });

  useEffect(() => {
    if (!ticket) return undefined;
    let cancelled = false;
    setPreviewUrl("");
    setShareState({ loading: true, message: "", error: "" });

    createKeepsakeImage(ticket)
      .then((url) => {
        if (cancelled) return;
        setPreviewUrl(url);
        setShareState({ loading: false, message: "", error: "" });
      })
      .catch(() => {
        if (cancelled) return;
        setShareState({ loading: false, message: "", error: "纪念卡生成失败，请关闭后再试一次。" });
      });

    return () => {
      cancelled = true;
    };
  }, [ticket?.id]);

  if (!ticket) return null;

  function downloadKeepsake() {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `jimmys-home-bar-ticket-${ticket.ticket_no || "tonight"}.jpg`;
    link.click();
    setShareState({ loading: false, error: "", message: "图片已准备好；手机端也可以长按预览图保存。" });
  }

  async function shareKeepsake() {
    if (!previewUrl || shareState.loading) return;
    setShareState({ loading: true, message: "", error: "" });

    try {
      const blob = await fetch(previewUrl).then((response) => response.blob());
      const file = new File([blob], `jimmys-home-bar-${ticket.ticket_no || "tonight"}.jpg`, { type: "image/jpeg" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          files: [file],
          title: "Jimmy’s Home Bar",
          text: `今晚在 Jimmy’s Home Bar 的小票 #${ticket.ticket_no || "—"}`
        });
        setShareState({ loading: false, error: "", message: "分享面板已打开。" });
        return;
      }

      downloadKeepsake();
    } catch (error) {
      if (error?.name === "AbortError") {
        setShareState({ loading: false, message: "", error: "" });
      } else {
        setShareState({ loading: false, message: "", error: "系统分享没有打开，可以长按图片保存。" });
      }
    }
  }

  return (
    <div className="sheet-layer keepsake-layer" role="presentation">
      <button className="sheet-backdrop" type="button" onClick={onClose} aria-label="关闭今晚纪念卡" />
      <section className="keepsake-sheet" role="dialog" aria-modal="true" aria-labelledby="keepsake-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        <header className="keepsake-sheet__header">
          <p className="overline">A little secret from the bar</p>
          <h2 id="keepsake-title">今晚纪念卡</h2>
          <p>名字和今晚的小票会像油墨一样落在手绘菜单上。</p>
        </header>

        <div className="keepsake-preview" aria-live="polite">
          {previewUrl ? (
            <img src={previewUrl} alt={`${getOrderGuestName(ticket)} 在 Jimmy’s Home Bar 的今晚纪念卡`} />
          ) : (
            <div className="keepsake-loading">
              <span aria-hidden="true" />
              <p>{shareState.error || "正在盖上今晚的印记…"}</p>
            </div>
          )}
        </div>

        <div className="keepsake-actions">
          <button className="primary-button" type="button" onClick={shareKeepsake} disabled={!previewUrl || shareState.loading}>
            {shareState.loading ? "Preparing..." : "Share Tonight / 分享"}
          </button>
          <button type="button" onClick={downloadKeepsake} disabled={!previewUrl}>Save Image / 保存图片</button>
        </div>
        <p className="keepsake-hint">朋友圈可从系统分享面板选择；若微信浏览器限制下载，请长按上方图片保存。</p>
        {shareState.message && <p className="keepsake-message">{shareState.message}</p>}
        {shareState.error && previewUrl && <p className="submit-error">{shareState.error}</p>}
      </section>
    </div>
  );
}

function OrderDock({ orders, submittedTickets, ticketNotice, onOpen }) {
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  const latestTicket = submittedTickets[0];

  if (!orders.length && !submittedTickets.length && !ticketNotice) return null;

  return (
    <button className="order-dock order-dock--compact" type="button" onClick={onOpen} aria-live="polite">
      <div>
        <p className="overline">{ticketNotice ? "Bar Notice" : "My Ticket"}</p>
        <h2>
          {ticketNotice
            ? "今晚订单已清空"
            : orders.length
              ? `待发送 ${totalQuantity} 项`
              : `${submittedTickets.length} 张已发送小票`}
        </h2>
      </div>
      <div className="order-dock__right">
        {latestTicket && <StatusPill status={latestTicket.status} />}
        <span>View</span>
      </div>
    </button>
  );
}

function TicketSheet({ open, orders, submittedTickets, ticketNotice, submitState, onClose, onRemove, onClear, onSubmit, onShare }) {
  if (!open) return null;
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);

  return (
    <div className="sheet-layer ticket-sheet-layer" role="presentation">
      <button className="sheet-backdrop" type="button" onClick={onClose} aria-label="关闭我的订单" />
      <section className="ticket-sheet" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        <PaperMarks />
        <header className="ticket-sheet__header">
          <p className="overline">My Ticket</p>
          <h2 id="ticket-title">我的订单</h2>
          <p>这里会显示待发送的小票和已经发给吧台的订单。</p>
        </header>

        {ticketNotice && (
          <div className="ticket-notice">
            <p className="overline">Tonight’s tickets cleared</p>
            <span>{ticketNotice}</span>
          </div>
        )}

        <section className="ticket-section">
          <div className="ticket-section__title">
            <div>
              <p className="overline">Draft Ticket</p>
              <h3>待发送 <span>{totalQuantity} 项</span></h3>
            </div>
            {orders.length > 0 && <button type="button" onClick={onClear}>清空</button>}
          </div>
          {orders.length ? (
            <div className="order-dock__items order-dock__items--sheet">
              {orders.map((order, index) => (
                <article className="order-mini" key={order.id}>
                  <div>
                    <h3>#{index + 1} {order.drink.nameZh} × {order.quantity}</h3>
                    <p>{formatOrderAdjustments(order).join(" · ") || "House Pour / 默认配方"}</p>
                  </div>
                  <div className="order-mini__actions">
                    <button type="button" onClick={() => onRemove(order.id)} aria-label={`删除 ${order.drink.nameZh}`}>删</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="ticket-empty">还没有待发送的内容。选一杯酒，或者先加点小食。</p>
          )}
          {submitState.error && <p className="submit-error">{submitState.error}</p>}
          {orders.length > 0 && (
            <button className="submit-ticket-button" type="button" onClick={onSubmit} disabled={submitState.loading}>
              {submitState.loading ? "Sending..." : "Send to Bar"}
            </button>
          )}
        </section>

        <section className="ticket-section">
          <div className="ticket-section__title">
            <div>
              <p className="overline">Sent Tickets</p>
              <h3>已发送 <span>{submittedTickets.length} 张</span></h3>
            </div>
          </div>
          {submittedTickets.length ? (
            <div className="submitted-ticket-list">
              {submittedTickets.map((ticket) => (
                <article className={`submitted-ticket submitted-ticket--${ticket.status}`} key={ticket.id}>
                  <header>
                    <div>
                      <p className="overline">Ticket #{ticket.ticket_no}</p>
                      <h3>{getOrderGuestLine(ticket)}</h3>
                      <span>{formatDateTime(ticket.created_at)}</span>
                    </div>
                    <StatusPill status={ticket.status} />
                  </header>
                  <ul>
                    {(Array.isArray(ticket.items) ? ticket.items : []).map((item) => (
                      <li key={item.line_id || `${item.drink_id}-${item.name_en}`}>
                        <span>{item.name_zh} × {item.quantity}</span>
                        <small>{formatBackendItemAdjustments(item).join(" · ") || "House Pour / 默认配方"}</small>
                      </li>
                    ))}
                  </ul>
                  <button className="keepsake-trigger" type="button" onClick={() => onShare(ticket)}>
                    Make a Memory <span>生成今晚纪念卡</span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="ticket-empty">还没有发送到吧台的订单。</p>
          )}
        </section>
      </section>
    </div>
  );
}

function createDraft(drink = null) {
  return {
    sweetness: drink?.sweetness ? "house-sweet" : "",
    singleSelections: {},
    multiSelections: [],
    dealerBase: dealerBaseOptions[0]?.id || "",
    dealerFlavor: dealerFlavorOptions[0]?.id || "",
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
  if (adminStatusSteps.some((item) => item.id === status)) return status;
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
  const initialGuestProfile = useMemo(() => readGuestProfile(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [focusedDrinkId, setFocusedDrinkId] = useState(drinks[0].id);
  const [activeDrink, setActiveDrink] = useState(null);
  const [draft, setDraft] = useState(createDraft());
  const [orders, setOrders] = useState(() => readStoredOrders());
  const [submitState, setSubmitState] = useState({ loading: false, error: "" });
  const [submittedTickets, setSubmittedTickets] = useState(() => readSubmittedTickets());
  const submittedTicketsRef = useRef(submittedTickets);
  const [ticketSheetOpen, setTicketSheetOpen] = useState(false);
  const [shareTicket, setShareTicket] = useState(null);
  const [ticketNotice, setTicketNotice] = useState("");
  const [servedToast, setServedToast] = useState(null);
  const [guestId] = useState(initialGuestProfile.guestId);
  const [guestName, setGuestName] = useState(initialGuestProfile.guestName);

  const visibleDrinks = useMemo(() => {
    if (activeCategory === "all") return drinks;
    return drinks.filter((drink) => drink.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    setFocusedDrinkId(visibleDrinks[0]?.id || drinks[0].id);
    if (hasMountedRef.current) {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const normalizedName = guestName.trim() || guestId;
    window.localStorage.setItem(GUEST_ID_KEY, guestId);
    window.localStorage.setItem(GUEST_NAME_KEY, normalizedName);
  }, [guestId, guestName]);

  useEffect(() => {
    window.localStorage.setItem(SUBMITTED_TICKETS_KEY, JSON.stringify(submittedTickets));
    window.localStorage.removeItem(SUBMITTED_TICKET_KEY);
    submittedTicketsRef.current = submittedTickets;
  }, [submittedTickets]);

  useEffect(() => {
    if (!isSupabaseConfigured || !submittedTickets.length) return undefined;

    let cancelled = false;
    const knownIds = new Set(submittedTickets.map((ticket) => ticket.id));

    async function refreshSubmittedTickets() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("id", Array.from(knownIds));

      if (cancelled || error) return;
      if (data?.length) {
        const liveMap = new Map(data.map((ticket) => [ticket.id, ticket]));
        const previousMap = new Map(submittedTicketsRef.current.map((ticket) => [ticket.id, ticket]));

        data.forEach((ticket) => {
          const previous = previousMap.get(ticket.id);
          if (ticket.status === "served" && previous?.status !== "served") {
            const servedIds = readServedStampIds();
            if (!servedIds.includes(ticket.id)) {
              markServedStampSeen(ticket.id);
              setServedToast({ ticketNo: ticket.ticket_no, guestName: getOrderGuestName(ticket) });
            }
          }
        });

        setSubmittedTickets((current) => current.map((ticket) => liveMap.get(ticket.id) || ticket).filter((ticket) => liveMap.has(ticket.id)));
        setTicketNotice("");
      } else {
        setSubmittedTickets([]);
        setOrders([]);
        setTicketNotice("Tonight’s tickets cleared / 今晚订单已清空。");
      }
    }

    refreshSubmittedTickets();
    const pollTimer = window.setInterval(refreshSubmittedTickets, 6000);

    const channel = supabase
      .channel("jimmys-orders-customer-tickets")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if (!knownIds.has(payload.new?.id)) return;
        if (payload.new?.status === "served" && payload.old?.status !== "served") {
          const servedIds = readServedStampIds();
          if (!servedIds.includes(payload.new.id)) {
            markServedStampSeen(payload.new.id);
            setServedToast({
              ticketNo: payload.new.ticket_no,
              guestName: getOrderGuestName(payload.new)
            });
          }
        }
        setSubmittedTickets((current) => current.map((ticket) => (ticket.id === payload.new.id ? payload.new : ticket)));
        setTicketNotice("");
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "orders" }, (payload) => {
        if (!knownIds.has(payload.old?.id)) return;
        setSubmittedTickets((current) => current.filter((ticket) => ticket.id !== payload.old.id));
        setTicketNotice("Tonight’s tickets cleared / 今晚订单已清空。");
      })
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [submittedTickets.map((ticket) => ticket.id).join("|")]);

  useEffect(() => {
    if (!servedToast) return undefined;
    const timer = window.setTimeout(() => setServedToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [servedToast]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const channel = supabase
      .channel("jimmys-orders-customer-close-bar")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "orders" }, () => {
        setSubmittedTickets([]);
        setOrders([]);
        setTicketNotice("Tonight’s tickets cleared / 今晚订单已清空。");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-sheet-open", Boolean(activeDrink) || ticketSheetOpen || Boolean(shareTicket));
    return () => document.body.classList.remove("is-sheet-open");
  }, [activeDrink, ticketSheetOpen, shareTicket]);

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
        dealerBase: draft.dealerBase,
        dealerFlavor: draft.dealerFlavor,
        quantity: draft.quantity,
        remark: draft.remark.trim(),
        status: statusSteps[0].id
      }
    ]);
    setTicketNotice("");
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
      guest_name: guestName.trim() || guestId,
      guest_id: guestId,
      items: orders.map(serializeOrderItem)
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      setSubmitState({
        loading: false,
        error: "网络或 Supabase 写入失败，小票没有丢，可以稍后重试。"
      });
      return;
    }

    setSubmittedTickets((current) => upsertTicket(current, data));
    setOrders([]);
    setTicketNotice("");
    setSubmitState({ loading: false, error: "" });
  }

  return (
    <>
      <a className="skip-link" href="#menu">跳到酒单</a>
      <HeroPoster />
      <main id="menu" className="menu-page">
        <GuestIdentity guestName={guestName} onChange={setGuestName} />
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
        submittedTickets={submittedTickets}
        ticketNotice={ticketNotice}
        onOpen={() => setTicketSheetOpen(true)}
      />
      <TicketSheet
        open={ticketSheetOpen}
        orders={orders}
        submittedTickets={submittedTickets}
        ticketNotice={ticketNotice}
        submitState={submitState}
        onClose={() => setTicketSheetOpen(false)}
        onRemove={(orderId) => setOrders((current) => current.filter((order) => order.id !== orderId))}
        onClear={() => setOrders([])}
        onSubmit={submitTicket}
        onShare={(ticket) => {
          setTicketSheetOpen(false);
          setShareTicket(ticket);
        }}
      />
      <DrinkDetailSheet
        drink={activeDrink}
        draft={draft}
        onPatchDraft={patchDraft}
        onToggleGroupedOption={toggleGroupedOption}
        onClose={() => setActiveDrink(null)}
        onAdd={addDrink}
      />
      <ShareKeepsakeSheet ticket={shareTicket} onClose={() => setShareTicket(null)} />
      <ServedStampToast toast={servedToast} onClose={() => setServedToast(null)} />
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

function joinRecipeField(value) {
  if (Array.isArray(value)) return value.join(" / ");
  return value || "";
}

function AdminPulse({ pulse }) {
  return (
    <section className="admin-pulse" aria-label="Tonight Pulse">
      <div>
        <p className="overline">Tonight Pulse</p>
        <h2>{pulse.totalTickets} tickets · {pulse.totalItems} items</h2>
      </div>
      <dl>
        <div>
          <dt>Queued</dt>
          <dd>{pulse.queuedTickets}</dd>
        </div>
        <div>
          <dt>Mixing</dt>
          <dd>{pulse.mixingTickets}</dd>
        </div>
        <div>
          <dt>Served</dt>
          <dd>{pulse.servedTickets}</dd>
        </div>
        <div>
          <dt>Done items</dt>
          <dd>{pulse.servedItems}</dd>
        </div>
      </dl>
    </section>
  );
}

function AdminOrderCard({ order, recipeMap, onStatusChange }) {
  const status = findStatus(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <article className={`admin-order admin-order--${status.id}`}>
      <header className="admin-order__header">
        <div>
          <p className="overline">Ticket #{order.ticket_no}</p>
          <h2>{status.labelEn} / {status.labelZh}</h2>
          <span>{getOrderGuestLine(order)} · {formatDateTime(order.created_at)}</span>
        </div>
        <div className="admin-order__actions">
          <button type="button" onClick={() => onStatusChange(order.id, "mixing")}>Mark Mixing</button>
          <button type="button" onClick={() => onStatusChange(order.id, "served")}>Mark Served</button>
          <button type="button" onClick={() => onStatusChange(order.id, "cancelled")}>Cancel</button>
        </div>
      </header>

      <div className="admin-order__items">
        {items.map((item) => {
          const recipe = item.recipe_cue || recipeMap.get(item.drink_id);
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
                      <dd>{joinRecipeField(recipe.ingredients)}</dd>
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
                      <dd>{recipe.prepNotes || recipe.prep_notes}</dd>
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
  const [activeStatus, setActiveStatus] = useState("all");
  const [adminState, setAdminState] = useState({ loading: false, error: "" });
  const [closeBarState, setCloseBarState] = useState({ loading: false, message: "", error: "" });

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

  async function closeBar() {
    if (!isSupabaseConfigured || closeBarState.loading) return;
    const confirmed = window.confirm("确定要打烊并清空所有订单吗？该操作会删除所有当前订单，无法恢复。");
    if (!confirmed) return;

    setCloseBarState({ loading: true, message: "", error: "" });
    // 营业结束重置订单：清空当前 orders 表，让所有顾客端通过 realtime 同步归零。
    const { error } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      setCloseBarState({ loading: false, message: "", error: "打烊失败，请检查 Supabase delete policy 后重试。" });
      loadOrders();
      return;
    }

    setOrders([]);
    setCloseBarState({ loading: false, message: "已打烊，订单已清空。", error: "" });
  }

  if (!unlocked) {
    return <AdminLogin pin={pin} setPin={setPin} error={unlockError} onUnlock={handleUnlock} />;
  }

  const counts = adminStatusSteps.reduce((acc, status) => {
    acc[status.id] = orders.filter((order) => order.status === status.id).length;
    return acc;
  }, {});
  const visibleOrders = orders.filter((order) => activeStatus === "all" || order.status === activeStatus);
  const adminPulse = buildPulse(orders);

  return (
    <main className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="overline">Jimmy’s Back Bar</p>
          <h1>Tonight’s Tickets</h1>
          <p>订单队列、调制状态和每杯酒的 recipe cue。</p>
        </div>
        <div className="admin-hero__actions">
          <button type="button" className="close-bar-button" onClick={closeBar} disabled={closeBarState.loading}>
            <span>{closeBarState.loading ? "Closing..." : "Close Bar"}</span>
            <small>打烊</small>
          </button>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
              setUnlocked(false);
            }}
          >
            Lock
          </button>
        </div>
      </header>

      <AdminPulse pulse={adminPulse} />

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
      {closeBarState.error && <p className="admin-error admin-error--wide">{closeBarState.error}</p>}
      {closeBarState.message && <p className="admin-success admin-success--wide">{closeBarState.message}</p>}
      {adminState.loading && <p className="admin-loading">Loading tickets...</p>}

      <section className="admin-board" aria-label="订单队列">
        {visibleOrders.length ? (
          visibleOrders.map((order) => (
            <AdminOrderCard key={order.id} order={order} recipeMap={recipeMap} onStatusChange={updateOrderStatus} />
          ))
        ) : (
          <div className="admin-empty">
            <p className="overline">Quiet Bar</p>
            <h2>{closeBarState.message ? "已打烊，订单已清空" : "现在没有这个状态的订单"}</h2>
            <p>{closeBarState.message ? "刷新后订单也不会重新出现。" : "等第一张小票飞进来，吧台就热闹了。"}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return isAdminRoute() ? <AdminApp /> : <CustomerApp />;
}
