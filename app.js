(function () {
  "use strict";

  const data = window.HOMEBAR_DATA;
  const STORAGE_KEY = "jimmys-homebar-cart-v1";
  const els = {
    tabs: document.querySelector("#category-tabs"),
    menu: document.querySelector("#menu-content"),
    modalLayer: document.querySelector("#modal-layer"),
    cartLayer: document.querySelector("#cart-layer"),
    fallbackLayer: document.querySelector("#fallback-layer"),
    form: document.querySelector("#order-form"),
    modalId: document.querySelector("#modal-id"),
    modalCategory: document.querySelector("#modal-category"),
    modalTitle: document.querySelector("#modal-title"),
    modalEn: document.querySelector("#modal-en"),
    sweetnessField: document.querySelector("#sweetness-field"),
    sweetnessOptions: document.querySelector("#sweetness-options"),
    note: document.querySelector("#order-note"),
    qtyValue: document.querySelector("#qty-value"),
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

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getDrink(id) {
    return data.drinks.find((drink) => drink.id === id);
  }

  function getCategory(id) {
    return data.categories.find((category) => category.id === id);
  }

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(stored)) return [];
      return stored.filter((item) => getDrink(item.drinkId) && Number.isInteger(item.quantity) && item.quantity > 0);
    } catch (_) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  function renderTabs() {
    els.tabs.innerHTML = data.categories
      .map((category, index) => `<a class="category-tab${index === 0 ? " is-active" : ""}" href="#${category.id}">${escapeHtml(category.shortName)}</a>`)
      .join("");
  }

  function renderMenu() {
    els.menu.innerHTML = data.categories
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
            <div class="drink-grid">
              ${drinks.map(renderDrinkCard).join("")}
            </div>
          </section>`;
      })
      .join("");
  }

  function renderDrinkCard(drink) {
    return `
      <article class="drink-card${drink.available ? "" : " is-sold-out"}">
        <div class="drink-card__image-wrap">
          <img class="drink-card__image" src="${drink.image}" alt="${escapeHtml(drink.nameZh)}复古鸡尾酒插画" loading="lazy" />
          <span class="drink-card__number">${drink.number}</span>
          ${drink.available ? "" : '<span class="sold-out-badge">今晚售罄</span>'}
        </div>
        <div class="drink-card__body">
          <div class="drink-card__title">
            <div>
              <h4>${escapeHtml(drink.nameZh)}</h4>
              <p>${escapeHtml(drink.nameEn)}</p>
            </div>
            <span class="drink-card__line" aria-hidden="true"></span>
          </div>
          <p class="drink-card__description">${escapeHtml(drink.description)}</p>
          <button class="add-button" type="button" data-order-drink="${drink.id}" ${drink.available ? "" : "disabled"}>
            ${drink.available ? "选择这杯" : "暂不可点"}<span aria-hidden="true">${drink.available ? "+" : ""}</span>
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
      if (![els.modalLayer, els.cartLayer, els.fallbackLayer].some((item) => !item.hidden)) {
        document.body.classList.remove("no-scroll");
      }
    }, 230);
  }

  function openOrderModal(drinkId) {
    const drink = getDrink(drinkId);
    if (!drink || !drink.available) return;
    const category = getCategory(drink.category);
    quantity = 1;
    els.modalId.value = drink.id;
    els.modalCategory.textContent = category.shortName;
    els.modalTitle.textContent = drink.nameZh;
    els.modalEn.textContent = drink.nameEn;
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
    openLayer(els.modalLayer);
    window.setTimeout(() => els.modalLayer.querySelector(".sheet__close").focus(), 100);
  }

  function addToCart(event) {
    event.preventDefault();
    const drink = getDrink(els.modalId.value);
    if (!drink) return;
    const sweetness = drink.sweetnessOptions.length
      ? els.form.querySelector('input[name="sweetness"]:checked')?.value || drink.sweetnessOptions[0]
      : "";
    const note = els.note.value.trim();
    const existing = cart.find((item) => item.drinkId === drink.id && item.sweetness === sweetness && item.note === note);
    if (existing) existing.quantity += quantity;
    else cart.push({ key: `${Date.now()}-${Math.random().toString(16).slice(2)}`, drinkId: drink.id, sweetness, note, quantity });
    saveCart();
    closeLayer(els.modalLayer);
    showToast(`${drink.nameZh}已加入订单`);
  }

  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    els.cartCount.textContent = String(total);
    els.cartBar.hidden = total === 0;
    els.cartEmpty.hidden = cart.length !== 0;
    els.cartFooter.hidden = cart.length === 0;
    els.cartItems.innerHTML = cart
      .map((item) => {
        const drink = getDrink(item.drinkId);
        return `
          <article class="cart-item" data-cart-key="${item.key}">
            <img src="${drink.image}" alt="" />
            <div class="cart-item__body">
              <div class="cart-item__top">
                <div>
                  <h3>${escapeHtml(drink.nameZh)}</h3>
                  <p>${escapeHtml(drink.nameEn)}</p>
                </div>
                <button type="button" data-remove aria-label="移除${escapeHtml(drink.nameZh)}">移除</button>
              </div>
              ${item.sweetness ? `<p class="cart-item__meta">甜度：${escapeHtml(item.sweetness)}</p>` : ""}
              ${item.note ? `<p class="cart-item__meta">备注：${escapeHtml(item.note)}</p>` : ""}
              <div class="quantity quantity--small">
                <button type="button" data-cart-minus aria-label="减少数量">−</button>
                <output>${item.quantity}</output>
                <button type="button" data-cart-plus aria-label="增加数量">＋</button>
              </div>
            </div>
          </article>`;
      })
      .join("");
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
      const drink = getDrink(item.drinkId);
      lines.push(`${index + 1}. ${item.quantity} × ${drink.nameZh} (${drink.nameEn})`);
      if (item.sweetness) lines.push(`   甜度：${item.sweetness}`);
      if (item.note) lines.push(`   备注：${item.note}`);
      lines.push("");
    });
    lines.push(`共 ${cart.reduce((sum, item) => sum + item.quantity, 0)} 杯`, "请 Jimmy 确认，辛苦啦。");
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
      }, 240);
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
      { rootMargin: "-30% 0px -58%", threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("click", (event) => {
    const orderButton = event.target.closest("[data-order-drink]");
    if (orderButton) openOrderModal(orderButton.dataset.orderDrink);

    if (event.target.closest("[data-close]")) closeLayer(els.modalLayer);
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
  els.form.addEventListener("submit", addToCart);
  els.cartBar.addEventListener("click", () => openLayer(els.cartLayer));
  els.copyOrder.addEventListener("click", copyOrder);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    [els.modalLayer, els.cartLayer, els.fallbackLayer].forEach((layer) => {
      if (!layer.hidden) closeLayer(layer);
    });
  });

  renderTabs();
  renderMenu();
  renderCart();
  setupCategoryObserver();
})();
