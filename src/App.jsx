import { useMemo, useState } from "react";
import { categories, drinks, options, statusSteps } from "./data/menu.js";

function DoodleLayer() {
  return (
    <div className="doodle-layer" aria-hidden="true">
      <span className="doodle doodle--star">✦</span>
      <span className="doodle doodle--spark">✧</span>
      <span className="doodle doodle--moth">⋈</span>
      <span className="doodle doodle--lemon">◐</span>
      <span className="doodle doodle--bubble">○</span>
      <span className="doodle doodle--arrow">↝</span>
    </div>
  );
}

function StreetLamp({ side = "left" }) {
  return (
    <div className={`street-lamp street-lamp--${side}`} aria-hidden="true">
      <span className="street-lamp__glow" />
      <span className="street-lamp__cap" />
      <span className="street-lamp__glass" />
      <span className="street-lamp__post" />
    </div>
  );
}

function HeroPoster() {
  return (
    <header className="hero">
      <StreetLamp side="left" />
      <StreetLamp side="right" />
      <DoodleLayer />
      <section className="paper-sign" aria-labelledby="hero-title">
        <div className="paper-sign__inner">
          <p className="eyebrow"><span /> Private Bar Menu <span /></p>
          <div className="hero-stars" aria-hidden="true">✦　✧　✦</div>
          <h1 id="hero-title">Jimmy’s</h1>
          <p className="hero-title-sub">Bar Menu</p>
          <p className="journey"><span /> about the journey <span /></p>
          <p className="hero-copy">暮色收进杯底，街灯刚刚亮起。</p>
          <a className="hero-button" href="#menu">
            今晚喝什么 <span aria-hidden="true">↓</span>
          </a>
          <span className="corner-star corner-star--top" aria-hidden="true">✦</span>
          <span className="corner-star corner-star--bottom" aria-hidden="true">✦</span>
        </div>
      </section>
    </header>
  );
}

function SectionRibbon({ category }) {
  return (
    <div className="section-ribbon">
      <span aria-hidden="true">{category.doodle}</span>
      <div>
        <p>{category.en}</p>
        <h2>{category.name}</h2>
      </div>
      <span aria-hidden="true">{category.doodle}</span>
    </div>
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

function CocktailIllustration({ drink, large = false }) {
  return (
    <div className={`cocktail-illo ${large ? "cocktail-illo--large" : ""}`} style={{ "--drink": drink.color, "--accent": drink.accent }}>
      <svg viewBox="0 0 220 220" role="img" aria-label={`${drink.nameZh}手绘酒杯插画`}>
        <defs>
          <filter id={`${drink.id}-rough`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
          </filter>
          <linearGradient id={`${drink.id}-liquid`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--drink)" />
          </linearGradient>
        </defs>
        <g className="illo-lines" filter={`url(#${drink.id}-rough)`}>
          {drink.glass === "rocks" && <RocksGlass id={drink.id} />}
          {drink.glass === "coupe" && <CoupeGlass id={drink.id} />}
          {drink.glass === "margarita" && <MargaritaGlass id={drink.id} />}
          {drink.glass === "highball" && <HighballGlass id={drink.id} />}
          {drink.glass === "martini" && <MartiniGlass id={drink.id} />}
          <CitrusGarnish glass={drink.glass} />
          <g className="bubbles">
            <circle cx="154" cy="54" r="5" />
            <circle cx="171" cy="75" r="3.5" />
            <circle cx="46" cy="65" r="3" />
          </g>
        </g>
      </svg>
      <span className="hand-note">{drink.tags[0]}</span>
    </div>
  );
}

function RocksGlass({ id }) {
  return (
    <>
      <path className="liquid" d="M61 103h98l-9 62H70z" fill={`url(#${id}-liquid)`} />
      <path className="foam" d="M62 96c23-10 70-11 95 0 6 3 5 12-2 14-26 7-62 7-90 0-8-2-10-11-3-14z" />
      <path d="M55 88h111l-13 88c-2 11-11 18-23 18H91c-12 0-21-7-23-18z" />
      <path d="M77 121l24-13 13 24-24 14zM118 119l24-13 12 25-25 12z" />
    </>
  );
}

function CoupeGlass({ id }) {
  return (
    <>
      <path className="liquid" d="M50 83c14 20 34 31 60 31s46-11 60-31z" fill={`url(#${id}-liquid)`} />
      <path d="M42 73h136c-11 38-34 58-68 58S53 111 42 73z" />
      <path d="M110 131v45M75 188c23-10 47-10 70 0" />
    </>
  );
}

function MargaritaGlass({ id }) {
  return (
    <>
      <path className="liquid" d="M48 82h124c-14 24-34 37-62 37S62 106 48 82z" fill={`url(#${id}-liquid)`} />
      <path d="M40 70h140l-18 44c-7 17-25 28-52 28s-45-11-52-28z" />
      <path d="M110 141v39M76 190c21-9 47-9 68 0M49 70c28 7 91 7 121 0" />
    </>
  );
}

function HighballGlass({ id }) {
  return (
    <>
      <path className="liquid" d="M76 77h68l-7 102H84z" fill={`url(#${id}-liquid)`} />
      <path d="M68 54h84l-9 137c-1 8-8 14-17 14H94c-9 0-16-6-17-14z" />
      <path d="M88 90l18-12 12 20-18 12zM112 128l18-12 12 21-18 11zM91 153l16-9 10 17-17 10z" />
    </>
  );
}

function MartiniGlass({ id }) {
  return (
    <>
      <path className="liquid" d="M46 75h128l-64 59z" fill={`url(#${id}-liquid)`} />
      <path d="M38 64h144l-72 72z" />
      <path d="M110 136v43M76 190c21-9 47-9 68 0" />
    </>
  );
}

function CitrusGarnish({ glass }) {
  const x = glass === "highball" ? 146 : 151;
  const y = glass === "rocks" ? 90 : 74;
  return (
    <g className="garnish">
      <circle cx={x} cy={y} r="17" />
      <path d={`M${x - 13} ${y}h26M${x} ${y - 13}v26M${x - 9} ${y - 9}l18 18M${x + 9} ${y - 9}l-18 18`} />
    </g>
  );
}

function InfoPill({ label, value }) {
  return (
    <span className="info-pill">
      <small>{label}</small>{value}
    </span>
  );
}

function DrinkCard({ drink, onOpen }) {
  return (
    <article className="drink-card">
      <div className="drink-card__stamp">{drink.number}</div>
      <CocktailIllustration drink={drink} />
      <div className="drink-card__body">
        <p className="drink-card__category">{categories.find((item) => item.id === drink.category)?.name}</p>
        <h3>{drink.nameZh}</h3>
        <p className="drink-card__en">{drink.nameEn}</p>
        <div className="drink-card__meta">
          <InfoPill label="基酒" value={drink.base} />
          <InfoPill label="风味" value={drink.flavor} />
          <InfoPill label="酒精度" value={drink.alcohol} />
        </div>
        <p className="drink-card__note">{drink.note}</p>
        <div className="drink-card__footer">
          <AlcoholDots level={drink.alcohol} />
          <button className="sketch-button" type="button" onClick={() => onOpen(drink)}>
            看看这杯 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function OptionChip({ value, selected, onToggle }) {
  return (
    <button className={`option-chip ${selected ? "is-selected" : ""}`} type="button" onClick={onToggle}>
      {value}
    </button>
  );
}

function DrinkDetailSheet({ drink, selectedOptions, onToggleOption, onClose, onAdd }) {
  if (!drink) return null;

  return (
    <div className="sheet-layer" role="presentation">
      <button className="sheet-backdrop" type="button" onClick={onClose} aria-label="关闭详情" />
      <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        <div className="detail-sheet__image">
          <CocktailIllustration drink={drink} large />
        </div>
        <div className="detail-sheet__content">
          <p className="eyebrow detail-eyebrow">Tonight’s Pick</p>
          <h2 id="detail-title">{drink.nameZh}</h2>
          <p className="detail-en">{drink.nameEn}</p>
          <div className="detail-tags">
            {drink.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="detail-grid">
            <InfoPill label="基酒" value={drink.base} />
            <InfoPill label="风味" value={drink.flavor} />
            <InfoPill label="酒精度" value={drink.alcohol} />
          </div>
          <p className="detail-audience">适合：{drink.audience}</p>
          <p className="detail-note">{drink.note}</p>
          <div className="option-section">
            <p>今晚小调整</p>
            <div className="option-grid">
              {options.map((option) => (
                <OptionChip
                  key={option}
                  value={option}
                  selected={selectedOptions.includes(option)}
                  onToggle={() => onToggleOption(option)}
                />
              ))}
            </div>
          </div>
          <button className="primary-button" type="button" onClick={() => onAdd(drink)}>
            今晚就喝这杯
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`status-pill status-pill--${statusSteps.indexOf(status)}`}>{status}</span>;
}

function OrderDock({ orders, onAdvance, onClear }) {
  const total = orders.length;
  return (
    <aside className={`order-dock ${total ? "is-visible" : ""}`} aria-live="polite">
      <div className="order-dock__header">
        <div>
          <p>Tonight List</p>
          <h2>今晚酒单</h2>
        </div>
        {total > 0 && <button type="button" onClick={onClear}>清空</button>}
      </div>
      {total === 0 ? (
        <p className="order-dock__empty">先挑一杯，Jimmy 再开始备杯。</p>
      ) : (
        <div className="order-dock__items">
          {orders.map((order) => (
            <article key={order.id} className="order-mini">
              <div>
                <h3>{order.drink.nameZh}</h3>
                <p>{order.options.length ? order.options.join(" · ") : "照 Jimmy 的默认配方"}</p>
              </div>
              <button type="button" onClick={() => onAdvance(order.id)}>
                <StatusPill status={order.status} />
              </button>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const [activeDrink, setActiveDrink] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [orders, setOrders] = useState([]);

  const drinksByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      drinks: drinks.filter((drink) => drink.category === category.id)
    }));
  }, []);

  function openDrink(drink) {
    setSelectedOptions([]);
    setActiveDrink(drink);
  }

  function toggleOption(option) {
    setSelectedOptions((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

  function addDrink(drink) {
    setOrders((current) => [
      ...current,
      {
        id: `${drink.id}-${Date.now()}`,
        drink,
        options: selectedOptions,
        status: statusSteps[0]
      }
    ]);
    setActiveDrink(null);
    setSelectedOptions([]);
  }

  function advanceStatus(orderId) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const nextIndex = Math.min(statusSteps.indexOf(order.status) + 1, statusSteps.length - 1);
        return { ...order, status: statusSteps[nextIndex] };
      })
    );
  }

  return (
    <>
      <a className="skip-link" href="#menu">跳到酒单</a>
      <HeroPoster />
      <main id="menu" className="menu-page">
        <section className="intro-card">
          <p className="eyebrow"><span /> The Cocktail List <span /></p>
          <h2>翻到喜欢的那一杯</h2>
          <p>酒单不是外卖菜单，它更像一张摊开的手绘地图：看见风味、选点小偏好，然后把今晚交给 Jimmy。</p>
          <div className="intro-card__notes" aria-label="氛围注解">
            <span>✦ 下班后</span>
            <span>◐ 街灯亮起</span>
            <span>↝ 周末开始</span>
          </div>
        </section>

        {drinksByCategory.map((category) => (
          <section className="menu-section" key={category.id} aria-labelledby={`${category.id}-title`}>
            <SectionRibbon category={category} />
            <p className="category-note">{category.note}</p>
            <div className="drink-list">
              {category.drinks.map((drink) => (
                <DrinkCard key={drink.id} drink={drink} onOpen={openDrink} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <footer className="site-footer">
        <p>Jimmy’s Bar Menu</p>
        <span>about the journey</span>
      </footer>
      <OrderDock orders={orders} onAdvance={advanceStatus} onClear={() => setOrders([])} />
      <DrinkDetailSheet
        drink={activeDrink}
        selectedOptions={selectedOptions}
        onToggleOption={toggleOption}
        onClose={() => setActiveDrink(null)}
        onAdd={addDrink}
      />
    </>
  );
}
