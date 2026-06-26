(function () {
  "use strict";

  const data = window.HOMEBAR_DATA;
  const STORAGE_KEY = "jimmys-homebar-cart-v2";
  const LEGACY_STORAGE_KEY = "jimmys-homebar-cart-v1";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const els = {
    tabs: document.querySelector("#category-tabs"),
    menu: document.querySelector("#menu-content"),
    modalLayer: document.querySelector("#modal-layer"),
    specialLayer: document.querySelector("#special-layer"),
    cartLayer: document.querySelector("#cart-layer"),
    fallbackLayer: document.querySelector("#fallback-layer"),
    form: document.querySelector("#order-form"),
    modalId: document.querySelector("#modal-id"),
    modalType: document.querySelector("#modal-type"),
    modalCategory: document.querySelector("#modal-category"),
    modalTitle: document.querySelector("#modal-title"),
    modalEn: document.querySelector("#modal-en"),
    modalImage: document.querySelector("#modal-image"),
    modalMetrics: document.querySelector("#modal-metrics"),
    modalDescription: document.querySelector("#modal-description"),
    sweetnessField: document.querySelector("#sweetness-field"),
    sweetnessOptions: document.querySelector("#sweetness-options"),
    note: document.querySelector("#order-note"),
    qtyValue: document.querySelector("#qty-value"),
    specialForm: document.querySelector("#special-form"),
    specialResult: document.querySelector("#special-result"),
    luckyNumber: document.querySelector("#lucky-number"),
    cartBar: document.querySelector("#cart-bar"),
    cartCount: document.querySelector("#cart-count"),
    cartItems: document.querySelector("#cart-items"),
    cartEmpty: document.querySelector("#cart-empty"),
    cartFooter: document.querySelector("#cart-footer"),
    copyOrder: document.querySelector("#copy-order"),
    fallbackText: document.querySelector("#fallback-text"),
    toast: document.querySelector("#toast")
  };

  let cart = loadCart();
  let quantity = 1;
  let toastTimer;
  let latestSpecial = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getCategory(id) {
    return data.categories.find((category) => category.id === id);
  }

  function getDrink(id) {
    return data.drinks.find((drink) => drink.id === id);
  }

  function getSnack(id) {
    return data.snacks.find((snack) => snack.id === id);
  }

  function getItem(item) {
    if (item.type === "drink") return getDrink(item.itemId);
    if (item.type === "snack") return getSnack(item.itemId);
    if (item.type === "special") return item.special;
    return null;
  }

  function getItemTitle(item) {
    const source = getItem(item);
    return source ? `${source.nameZh}${source.nameEn ? ` (${source.nameEn})` : ""}` : "未知项目";
  }

  function getStrengthDots(value) {
    const active = Math.max(1, Math.min(5, Number(value) || 1));
    return Array.from({ length: 5 }, (_, index) => `<span class="${index < active ? "is-active" : ""}"></span>`).join("");
  }

  function getDoodleNote(drink) {
    const notes = {
      "sweet-sour": "酸甜平衡，开场很稳",
      refreshing: "清爽一点，聊天好喝",
      strong: "慢慢喝，后劲在后面"
    };
    return notes[drink.category] || "今晚可以试试";
  }

  function loadCart() {
    const stored = parseStoredCart(STORAGE_KEY);
    if (stored) return stored;

    const legacy = parseStoredCart(LEGACY_STORAGE_KEY, true);
    if (legacy) return legacy;

    return [];
  }

  function parseStoredCart(key, legacy = false) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (!Array.isArray(stored)) return null;
      return stored
        .map((item) => normalizeCartItem(item, legacy))
        .filter(Boolean);
    } catch (_) {
      return null;
    }
  }

  function normalizeCartItem(item, legacy) {
    const quantityValue = Number(item.quantity);
    if (!Number.isInteger(quantityValue) || quantityValue <= 0) return null;

    if (legacy && item.drinkId && getDrink(item.drinkId)) {
      return {
        key: item.key || createKey(),
        type: "drink",
        itemId: item.drinkId,
        sweetness: item.sweetness || "",
        note: item.note || "",
        quantity: quantityValue
      };
    }

    if (item.type === "drink" && getDrink(item.itemId)) return { ...item, quantity: quantityValue };
    if (item.type === "snack" && getSnack(item.itemId)) return { ...item, quantity: quantityValue };
    if (item.type === "special" && item.special?.nameZh) return { ...item, quantity: quantityValue };
    return null;
  }

  function createKey() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  function renderTabs() {
    const tabs = [
      ...data.categories.map((category) => ({ id: category.id, label: category.shortName })),
      { id: "snacks", label: "小食" }
    ];
    els.tabs.innerHTML = tabs
      .map((tab, index) => `<a class="category-tab${index === 0 ? " is-active" : ""}" href="#${tab.id}">${escapeHtml(tab.label)}</a>`)
      .join("");
  }

  function renderMenu() {
    const drinkSections = data.categories
      .map((category) => {
        const drinks = data.drinks.filter((drink) => drink.category === category.id);
        return `
          <section id="${category.id}" class="menu-section" data-category-section>
            <div class="menu-section__heading">
              <span class="menu-section__mark" aria-hidden="true">${category.icon}</span>
              <div>
                <p>${escapeHtml(category.en)}</p>
                <h3>${escapeHtml(category.name)}</h3>
              </div>
            </div>
            <p class="menu-section__intro">${escapeHtml(category.intro)}</p>
            <div class="card-flow">
              ${drinks.map(renderDrinkCard).join("")}
            </div>
          </section>`;
      })
      .join("");

    els.menu.innerHTML = `
      ${drinkSections}
      <section id="snacks" class="menu-section snack-section" data-category-section>
        <div class="menu-section__heading">
          <span class="menu-section__mark" aria-hidden="true">✧</span>
          <div>
            <p>Bar Bites</p>
            <h3>小食</h3>
          </div>
        </div>
        <p class="menu-section__intro">先垫一点，酒会更好喝。</p>
        <div class="snack-grid">
          ${data.snacks.map(renderSnackCard).join("")}
        </div>
      </section>`;
  }

  function renderDrinkCard(drink) {
    const category = getCategory(drink.category);
    return `
      <article class="drink-card${drink.available ? "" : " is-sold-out"}" data-drink-card="${drink.id}">
        <div class="drink-card__media">
          <img class="drink-card__image" src="${drink.image}" alt="${escapeHtml(drink.nameZh)}复古鸡尾酒插画" loading="lazy" />
          <span class="drink-card__number">${drink.number}</span>
          ${drink.available ? "" : '<span class="sold-out-badge">今晚售罄</span>'}
        </div>
        <div class="drink-card__body">
          <div class="drink-card__title">
            <div>
              <p class="drink-card__category">${escapeHtml(category.shortName)}</p>
              <h4>${escapeHtml(drink.nameZh)}</h4>
              <p>${escapeHtml(drink.nameEn)}</p>
            </div>
            <div class="strength-dots" aria-label="酒精度 ${drink.strength} / 5">${getStrengthDots(drink.strength)}</div>
          </div>
          <div class="info-pills">
            <span>基酒 · ${escapeHtml(drink.baseSpirit)}</span>
            <span>风味 · ${escapeHtml(drink.flavors.slice(0, 2).join(" / "))}</span>
            <span>酒精度 · ${escapeHtml(drink.strengthLabel)}</span>
          </div>
          <p class="doodle-note"><span aria-hidden="true">↳</span>${escapeHtml(getDoodleNote(drink))}</p>
          <p class="drink-card__description">${escapeHtml(drink.description)}</p>
          <button class="add-button" type="button" data-order-drink="${drink.id}" ${drink.available ? "" : "disabled"}>
            ${drink.available ? "看看这杯" : "暂不可点"}<span aria-hidden="true">↗</span>
          </button>
        </div>
      </article>`;
  }

  function renderSnackCard(snack) {
    return `
      <article class="snack-card${snack.available ? "" : " is-sold-out"}">
        <div class="snack-card__icon" aria-hidden="true">${snack.icon}</div>
        <div>
          <p class="drink-card__category">Bar Bite</p>
          <h4>${escapeHtml(snack.nameZh)}</h4>
          <p>${escapeHtml(snack.nameEn)}</p>
          <div class="info-pills">
            ${snack.flavors.map((flavor) => `<span>${escapeHtml(flavor)}</span>`).join("")}
          </div>
          <p class="snack-card__description">${escapeHtml(snack.description)}</p>
          <button class="add-button" type="button" data-order-snack="${snack.id}" ${snack.available ? "" : "disabled"}>
            ${snack.available ? "加入小食" : "暂不可点"}<span aria-hidden="true">+</span>
          </button>
        </div>
      </article>`;
  }

  function openLayer(layer) {
    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add("is-open"));
    document.body.classList.add("no-scroll");
  }

  function closeLayer(layer) {
    layer.classList.remove("is-open");
    window.setTimeout(() => {
      layer.hidden = true;
      if (![els.modalLayer, els.specialLayer, els.cartLayer, els.fallbackLayer].some((item) => !item.hidden)) {
        document.body.classList.remove("no-scroll");
      }
    }, 260);
  }

  function playDrinkReveal(drink, trigger) {
    if (prefersReducedMotion || !trigger) return Promise.resolve();

    const card = trigger.closest("[data-drink-card]");
    const sourceImage = card?.querySelector(".drink-card__image");
    const rect = sourceImage?.getBoundingClientRect();
    if (!sourceImage || !rect?.width || !rect?.height) return Promise.resolve();

    const overlay = document.createElement("div");
    overlay.className = "cinema-reveal";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="cinema-reveal__stage">
        <img src="${drink.image}" alt="" />
        <div class="cinema-reveal__glow"></div>
        <div class="cinema-reveal__caption">
          <span>${escapeHtml(drink.number)}</span>
          <strong>${escapeHtml(drink.nameZh)}</strong>
          <small>${escapeHtml(drink.nameEn)}</small>
        </div>
      </div>`;

    const stage = overlay.querySelector(".cinema-reveal__stage");
    stage.style.left = `${rect.left}px`;
    stage.style.top = `${rect.top}px`;
    stage.style.width = `${rect.width}px`;
    stage.style.height = `${rect.height}px`;
    document.body.appendChild(overlay);

    card.classList.add("is-peeking");
    document.body.classList.add("no-scroll");

    return new Promise((resolve) => {
      requestAnimationFrame(() => overlay.classList.add("is-active"));
      window.setTimeout(() => {
        overlay.classList.add("is-leaving");
        card.classList.remove("is-peeking");
        window.setTimeout(() => overlay.remove(), 260);
        resolve();
      }, 760);
    });
  }

  async function openDrinkModal(drinkId, trigger) {
    const drink = getDrink(drinkId);
    if (!drink || !drink.available) return;
    const category = getCategory(drink.category);
    quantity = 1;
    els.modalType.value = "drink";
    els.modalId.value = drink.id;
    els.modalCategory.textContent = category.name;
    els.modalTitle.textContent = drink.nameZh;
    els.modalEn.textContent = drink.nameEn;
    els.modalImage.src = drink.image;
    els.modalImage.alt = `${drink.nameZh}插画`;
    els.modalDescription.textContent = drink.description;
    els.modalMetrics.innerHTML = `
      <div><span>基酒</span><strong>${escapeHtml(drink.baseSpirit)}</strong></div>
      <div><span>风味</span><strong>${escapeHtml(drink.flavors.join(" / "))}</strong></div>
      <div><span>酒精度</span><strong>${escapeHtml(drink.strengthLabel)}</strong><div class="strength-dots">${getStrengthDots(drink.strength)}</div></div>`;
    els.note.value = "";
    els.qtyValue.textContent = String(quantity);
    els.sweetnessField.hidden = drink.sweetnessOptions.length === 0;
    els.sweetnessOptions.innerHTML = drink.sweetnessOptions
      .map((option, index) => `
        <label class="choice-pill">
          <input type="radio" name="sweetness" value="${escapeHtml(option)}" ${index === 0 ? "checked" : ""} />
          <span>${escapeHtml(option)}</span>
        </label>`)
      .join("");
    await playDrinkReveal(drink, trigger);
    openLayer(els.modalLayer);
    window.setTimeout(() => els.modalLayer.querySelector(".sheet__close").focus(), 120);
  }

  function addSnackToCart(snackId) {
    const snack = getSnack(snackId);
    if (!snack || !snack.available) return;
    const existing = cart.find((item) => item.type === "snack" && item.itemId === snack.id && !item.note);
    if (existing) existing.quantity += 1;
    else cart.push({ key: createKey(), type: "snack", itemId: snack.id, note: "", quantity: 1 });
    saveCart();
    showToast(`${snack.nameZh}已加入订单`);
  }

  function addModalItemToCart(event) {
    event.preventDefault();
    const type = els.modalType.value;
    const note = els.note.value.trim();

    if (type === "drink") {
      const drink = getDrink(els.modalId.value);
      if (!drink) return;
      const sweetness = drink.sweetnessOptions.length
        ? els.form.querySelector('input[name="sweetness"]:checked')?.value || drink.sweetnessOptions[0]
        : "";
      const existing = cart.find((item) => item.type === "drink" && item.itemId === drink.id && item.sweetness === sweetness && item.note === note);
      if (existing) existing.quantity += quantity;
      else cart.push({ key: createKey(), type: "drink", itemId: drink.id, sweetness, note, quantity });
      saveCart();
      closeLayer(els.modalLayer);
      showToast(`${drink.nameZh}已加入订单`);
    }
  }

  function getSpecialFormValues() {
    const formData = new FormData(els.specialForm);
    return {
      mood: formData.get("mood") || "fresh",
      strength: formData.get("strength") || "standard",
      atmosphere: formData.get("atmosphere") || "sunset",
      luckyNumber: els.luckyNumber.value.trim() || String(Math.floor(Math.random() * 9) + 1)
    };
  }

  function generateSpecial(values) {
    const mood = data.specialBuilder.moods[values.mood] || data.specialBuilder.moods.fresh;
    const atmosphere = data.specialBuilder.atmospheres[values.atmosphere] || "今晚";
    const seed = Number(values.luckyNumber.replace(/\D/g, "")) || values.luckyNumber.length || 7;
    const base = mood.bases[seed % mood.bases.length];
    const mixerA = mood.mixers[seed % mood.mixers.length];
    const mixerB = mood.mixers[(seed + 1) % mood.mixers.length];
    const name = data.specialBuilder.names[(seed + values.mood.length + values.atmosphere.length) % data.specialBuilder.names.length];
    const strengthAdjust = values.strength === "light" ? -1 : values.strength === "bold" ? 1 : 0;
    const strength = Math.max(1, Math.min(5, mood.strength + strengthAdjust));
    const strengthLabel = ["很低", "低中", "中等", "高", "很高"][strength - 1];

    return {
      nameZh: `随机特调 · ${name}`,
      nameEn: "Off-menu Special",
      baseSpirit: base,
      flavors: [mood.label, atmosphere, strengthLabel],
      strength,
      strengthLabel,
      description: `${atmosphere}版非菜单特调：以${base}为底，搭配${mixerA}和${mixerB}。整体是${mood.flavor}。幸运数字 ${values.luckyNumber} 决定了今晚的比例。`,
      recipe: `${base} + ${mixerA} + ${mixerB}，冰镇后出杯。`,
      image: "",
      icon: "🍸"
    };
  }

  function renderSpecialResult(special) {
    els.specialResult.hidden = false;
    els.specialResult.innerHTML = `
      <div class="special-card">
        <div class="special-card__glass" aria-hidden="true">🍸</div>
        <div>
          <p class="section-kicker">OFF-MENU</p>
          <h3>${escapeHtml(special.nameZh)}</h3>
          <p>${escapeHtml(special.description)}</p>
          <div class="detail-metrics detail-metrics--compact">
            <div><span>基酒</span><strong>${escapeHtml(special.baseSpirit)}</strong></div>
            <div><span>配方方向</span><strong>${escapeHtml(special.recipe)}</strong></div>
            <div><span>酒精度</span><strong>${escapeHtml(special.strengthLabel)}</strong><div class="strength-dots">${getStrengthDots(special.strength)}</div></div>
          </div>
          <button class="primary-button primary-button--full" type="button" data-add-special>把这杯加入订单</button>
        </div>
      </div>`;
  }

  function addSpecialToCart() {
    if (!latestSpecial) return;
    cart.push({ key: createKey(), type: "special", special: latestSpecial, note: "", quantity: 1 });
    saveCart();
    closeLayer(els.specialLayer);
    showToast("随机特调已加入订单");
  }

  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    els.cartCount.textContent = String(total);
    els.cartBar.hidden = total === 0;
    els.cartEmpty.hidden = cart.length !== 0;
    els.cartFooter.hidden = cart.length === 0;
    els.cartItems.innerHTML = cart.map(renderCartItem).join("");
  }

  function renderCartItem(item) {
    const source = getItem(item);
    if (!source) return "";
    const imageHtml = item.type === "drink"
      ? `<img src="${source.image}" alt="" />`
      : `<div class="cart-item__icon" aria-hidden="true">${escapeHtml(source.icon || "🍸")}</div>`;
    const typeLabel = item.type === "snack" ? "小食" : item.type === "special" ? "随机特调" : source.nameEn;
    return `
      <article class="cart-item" data-cart-key="${item.key}">
        ${imageHtml}
        <div class="cart-item__body">
          <div class="cart-item__top">
            <div>
              <h3>${escapeHtml(source.nameZh)}</h3>
              <p>${escapeHtml(typeLabel)}</p>
            </div>
            <button type="button" data-remove aria-label="移除${escapeHtml(source.nameZh)}">移除</button>
          </div>
          ${item.sweetness ? `<p class="cart-item__meta">甜度：${escapeHtml(item.sweetness)}</p>` : ""}
          ${source.baseSpirit ? `<p class="cart-item__meta">基酒：${escapeHtml(source.baseSpirit)} · 酒精度：${escapeHtml(source.strengthLabel || "")}</p>` : ""}
          ${item.note ? `<p class="cart-item__meta">备注：${escapeHtml(item.note)}</p>` : ""}
          <div class="quantity quantity--small">
            <button type="button" data-cart-minus aria-label="减少数量">−</button>
            <output>${item.quantity}</output>
            <button type="button" data-cart-plus aria-label="增加数量">＋</button>
          </div>
        </div>
      </article>`;
  }

  function updateCartItem(key, delta) {
    const item = cart.find((entry) => entry.key === key);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.key !== key);
    saveCart();
  }

  function buildOrderText() {
    const lines = [`🍸 ${data.barName} 新订单`, ""];
    cart.forEach((item, index) => {
      const source = getItem(item);
      if (!source) return;
      lines.push(`${index + 1}. ${item.quantity} × ${getItemTitle(item)}`);
      if (item.sweetness) lines.push(`   甜度：${item.sweetness}`);
      if (item.type === "special") {
        lines.push(`   基酒：${source.baseSpirit}`);
        lines.push(`   配方方向：${source.recipe}`);
      }
      if (item.note) lines.push(`   备注：${item.note}`);
      lines.push("");
    });
    lines.push(`共 ${cart.reduce((sum, item) => sum + item.quantity, 0)} 项`, "请 Jimmy 确认。");
    return lines.join("\n");
  }

  async function copyOrder() {
    const text = buildOrderText();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      closeLayer(els.cartLayer);
      showToast("订单已复制，去微信粘贴发送吧");
    } catch (_) {
      els.fallbackText.value = text;
      closeLayer(els.cartLayer);
      window.setTimeout(() => {
        openLayer(els.fallbackLayer);
        els.fallbackText.focus();
        els.fallbackText.select();
      }, 260);
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
  }

  function setupCategoryObserver() {
    const tabs = Array.from(els.tabs.querySelectorAll(".category-tab"));
    const sections = document.querySelectorAll("[data-category-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        tabs.forEach((tab) => tab.classList.toggle("is-active", tab.getAttribute("href") === `#${visible.target.id}`));
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.2, 0.5] }
    );
    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("click", (event) => {
    const orderButton = event.target.closest("[data-order-drink]");
    if (orderButton) openDrinkModal(orderButton.dataset.orderDrink, orderButton);

    const media = event.target.closest(".drink-card__media");
    if (media && !orderButton) {
      const card = media.closest("[data-drink-card]");
      if (card) openDrinkModal(card.dataset.drinkCard, media);
    }

    const snackButton = event.target.closest("[data-order-snack]");
    if (snackButton) addSnackToCart(snackButton.dataset.orderSnack);

    if (event.target.closest("[data-open-special]")) openLayer(els.specialLayer);
    if (event.target.closest("[data-add-special]")) addSpecialToCart();

    if (event.target.closest("[data-close]")) closeLayer(els.modalLayer);
    if (event.target.closest("[data-special-close]")) closeLayer(els.specialLayer);
    if (event.target.closest("[data-cart-close]")) closeLayer(els.cartLayer);
    if (event.target.closest("[data-fallback-close]")) closeLayer(els.fallbackLayer);

    const itemElement = event.target.closest("[data-cart-key]");
    if (itemElement) {
      const key = itemElement.dataset.cartKey;
      if (event.target.closest("[data-cart-minus]")) updateCartItem(key, -1);
      if (event.target.closest("[data-cart-plus]")) updateCartItem(key, 1);
      if (event.target.closest("[data-remove]")) {
        cart = cart.filter((item) => item.key !== key);
        saveCart();
      }
    }
  });

  document.querySelector("#qty-minus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    els.qtyValue.textContent = String(quantity);
  });

  document.querySelector("#qty-plus").addEventListener("click", () => {
    quantity = Math.min(12, quantity + 1);
    els.qtyValue.textContent = String(quantity);
  });

  els.form.addEventListener("submit", addModalItemToCart);
  els.specialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    latestSpecial = generateSpecial(getSpecialFormValues());
    renderSpecialResult(latestSpecial);
  });
  els.cartBar.addEventListener("click", () => openLayer(els.cartLayer));
  els.copyOrder.addEventListener("click", copyOrder);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    [els.modalLayer, els.specialLayer, els.cartLayer, els.fallbackLayer].forEach((layer) => {
      if (!layer.hidden) closeLayer(layer);
    });
  });

  renderTabs();
  renderMenu();
  renderCart();
  setupCategoryObserver();
})();
