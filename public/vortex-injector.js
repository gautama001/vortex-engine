(function () {
  "use strict";

  if (window.__VORTEX_WIDGET_BOOTSTRAPPED__) {
    return;
  }

  window.__VORTEX_WIDGET_BOOTSTRAPPED__ = true;

  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="vortex-injector.js"]');

  if (!currentScript) {
    return;
  }

  var scriptUrl;
  try {
    scriptUrl = new URL(currentScript.src, window.location.href);
  } catch (_error) {
    return;
  }

  var apiOrigin =
    scriptUrl.searchParams.get("api_origin") ||
    window.__VORTEX_API_ORIGIN__ ||
    scriptUrl.origin;
  var observer = null;
  var bootTimer = null;
  var productOptionCache = {};
  var activeQuickAddOverlay = null;

  function getStoreId() {
    return (
      scriptUrl.searchParams.get("store") ||
      scriptUrl.searchParams.get("store_id") ||
      (window.LS &&
      window.LS.store &&
      window.LS.store.id !== undefined &&
      window.LS.store.id !== null
        ? String(window.LS.store.id)
        : "")
    );
  }

  function resolveStoreUrl() {
    return window.LS &&
      window.LS.store &&
      typeof window.LS.store.url === "string" &&
      window.LS.store.url
      ? window.LS.store.url.replace(/\/+$/, "")
      : window.location.origin;
  }

  function normalizeHandle(handle) {
    if (!handle) {
      return "";
    }

    return String(handle)
      .replace(/^\/+/, "")
      .replace(/^productos\//, "")
      .replace(/\/+$/, "");
  }

  function isVisibleElement(element) {
    if (!element) {
      return false;
    }

    var style = window.getComputedStyle(element);
    var rect = element.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function findProductAnchor() {
    var selectors = [
      '[data-store^="product-form-"]',
      '[data-store="related-products"]',
      '[data-store="product-detail"]',
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var element = document.querySelector(selectors[i]);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function findCartAnchor() {
    var selectors = [
      '[data-store="cart-total"]',
      '[data-store="cart-form"]',
      '[data-store="cart-page"]',
      '[data-component="cart"]',
      '[data-modal-id="modal-cart"]',
      '[data-modal="modal-cart"]',
      '.js-fullscreen-modal[data-component="cart"]',
      '.js-modal[data-component="cart"]',
      '.js-modal-open[data-component="cart"]',
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var element = document.querySelector(selectors[i]);

      if (element && isVisibleElement(element)) {
        return element;
      }
    }

    return null;
  }

  function findCartSeedProductId() {
    var anchor = document.querySelector('[data-store^="cart-item-"]');

    if (anchor) {
      var attribute = anchor.getAttribute("data-store") || "";
      var match = attribute.match(/^cart-item-(\d+)/);

      if (match && match[1]) {
        return match[1];
      }
    }

    var items =
      window.LS &&
      window.LS.cart &&
      Array.isArray(window.LS.cart.items)
        ? window.LS.cart.items
        : [];

    if (items.length > 0 && items[0].product && items[0].product.id) {
      return String(items[0].product.id);
    }

    return "";
  }

  function resolveContext() {
    var cartAnchor = findCartAnchor();
    var cartProductId = findCartSeedProductId();

    if (cartAnchor && cartProductId) {
      return {
        anchor: cartAnchor,
        page: "cart",
        productId: cartProductId,
        widgetId: "vortex-widget-cart",
      };
    }

    if (window.LS && window.LS.product && window.LS.product.id) {
      return {
        anchor: findProductAnchor(),
        page: "product",
        productId: String(window.LS.product.id),
        widgetId: "vortex-widget-product",
      };
    }

    return null;
  }

  function ensureStyles() {
    if (document.getElementById("vortex-widget-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "vortex-widget-styles";
    style.textContent =
      ".vortex-widget{margin:24px 0;padding:24px;border-radius:24px;background:linear-gradient(180deg,rgba(7,17,26,.96),rgba(3,8,14,.98));border:1px solid rgba(255,255,255,.09);box-shadow:0 30px 80px -50px rgba(34,211,238,.5);color:#eef6ff;font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif}" +
      ".vortex-widget__eyebrow{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.3);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#cffafe}" +
      ".vortex-widget__title{margin:14px 0 8px;font-size:24px;line-height:1.1;color:#fff}" +
      ".vortex-widget__copy{margin:0 0 18px;color:#b4c6d9;font-size:14px;line-height:1.6}" +
      ".vortex-widget__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}" +
      ".vortex-widget__card{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}" +
      ".vortex-widget__image{width:100%;aspect-ratio:1/1;border-radius:16px;object-fit:cover;background:rgba(255,255,255,.05)}" +
      ".vortex-widget__image--placeholder{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))}" +
      ".vortex-widget__name{margin:0;font-size:15px;line-height:1.4;color:#fff}" +
      ".vortex-widget__meta{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#b4c6d9;font-size:13px}" +
      ".vortex-widget__button{height:42px;border-radius:999px;border:0;background:#67e8f9;color:#042030;font-weight:700;cursor:pointer;transition:transform .15s ease,opacity .15s ease}" +
      ".vortex-widget__button[disabled]{opacity:.65;cursor:wait}" +
      ".vortex-widget__button:hover{transform:translateY(-1px)}" +
      ".vortex-quickadd-overlay{--vortex-modal-bg:#07111a;--vortex-modal-accent:#67e8f9;--vortex-modal-radius:24px;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(2,6,12,.72);backdrop-filter:blur(10px)}" +
      ".vortex-quickadd-modal{position:relative;width:min(560px,100%);max-height:min(80vh,720px);overflow:auto;border-radius:calc(var(--vortex-modal-radius) + 4px);border:1px solid color-mix(in srgb,var(--vortex-modal-accent) 22%, rgba(255,255,255,.08));background:linear-gradient(180deg,var(--vortex-modal-bg),color-mix(in srgb,var(--vortex-modal-bg) 88%, #02060c 12%));padding:24px;color:#eef6ff;box-shadow:0 40px 100px -40px color-mix(in srgb,var(--vortex-modal-accent) 42%, transparent)}" +
      ".vortex-quickadd-close{position:absolute;top:16px;right:16px;border:1px solid color-mix(in srgb,var(--vortex-modal-accent) 18%, rgba(255,255,255,.06));background:rgba(255,255,255,.08);color:#fff;width:38px;height:38px;border-radius:999px;font-size:24px;line-height:1;cursor:pointer}" +
      ".vortex-quickadd-header{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;align-items:start}" +
      ".vortex-quickadd-image{width:96px;height:96px;border-radius:20px;object-fit:cover;background:rgba(255,255,255,.06)}" +
      ".vortex-quickadd-image--placeholder{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))}" +
      ".vortex-quickadd-copy h4{margin:6px 0 8px;font-size:22px;line-height:1.15;color:#fff}" +
      ".vortex-quickadd-copy p{margin:0;color:#b4c6d9;font-size:14px;line-height:1.6}" +
      ".vortex-quickadd-body{display:grid;gap:16px;margin-top:20px}" +
      ".vortex-quickadd-options{display:grid;gap:14px}" +
      ".vortex-quickadd-field{display:grid;gap:8px}" +
      ".vortex-quickadd-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8}" +
      ".vortex-quickadd-select{height:46px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);padding:0 14px;color:#e2e8f0;font:inherit}" +
      ".vortex-quickadd-select.is-placeholder{color:#94a3b8}" +
      ".vortex-quickadd-select option{color:#0f172a;background:#ffffff}" +
      ".vortex-quickadd-submit{width:100%}" +
      "@media (max-width:640px){.vortex-quickadd-modal{padding:20px}.vortex-quickadd-header{grid-template-columns:1fr}.vortex-quickadd-image{width:100%;height:auto;aspect-ratio:1/1}}";
    document.head.appendChild(style);
  }

  function buildProductUrl(item) {
    var handle = normalizeHandle(item && item.handle);

    if (!handle) {
      return "#";
    }

    return resolveStoreUrl() + "/productos/" + handle;
  }

  function getCurrencyCode() {
    return window.LS &&
      window.LS.currency &&
      typeof window.LS.currency.code === "string"
      ? window.LS.currency.code
      : "ARS";
  }

  function formatMoney(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "";
    }

    try {
      return new Intl.NumberFormat("es-AR", {
        currency: getCurrencyCode(),
        style: "currency",
      }).format(value);
    } catch (_error) {
      return "$" + value;
    }
  }

  function getContrastTextColor(hexColor) {
    var normalized = String(hexColor || "").replace("#", "");

    if (normalized.length === 3) {
      normalized = normalized
        .split("")
        .map(function (character) {
          return character + character;
        })
        .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return "#08131f";
    }

    var red = parseInt(normalized.slice(0, 2), 16);
    var green = parseInt(normalized.slice(2, 4), 16);
    var blue = parseInt(normalized.slice(4, 6), 16);
    var luminance = red * 0.299 + green * 0.587 + blue * 0.114;

    return luminance > 176 ? "#08131f" : "#f8fafc";
  }

  function prettyReason(reason) {
    switch (reason) {
      case "shared-category":
        return "categoria relacionada";
      case "shared-tag":
        return "tag relacionado";
      case "frequently-bought-together":
        return "fbt";
      case "manual-pick":
        return "seleccion manual";
      default:
        return "best seller";
    }
  }

  function prettyStrategy(strategy) {
    switch (strategy) {
      case "comprados-juntos":
        return "Comprados juntos (FBT)";
      case "seleccion-manual":
        return "Seleccion manual";
      case "related-products":
        return "IA Engine";
      default:
        return "Best sellers fallback";
    }
  }

  function getQuickAddEndpoint(item) {
    var storeId = getStoreId();

    if (!item || !item.productId || !storeId) {
      return "";
    }

    return (
      apiOrigin +
      "/api/v1/store/product-options?store_id=" +
      encodeURIComponent(storeId) +
      "&product_id=" +
      encodeURIComponent(item.productId)
    );
  }

  function fetchProductOptions(item) {
    var endpoint = getQuickAddEndpoint(item);

    if (!endpoint) {
      return Promise.resolve(null);
    }

    if (!productOptionCache[endpoint]) {
      productOptionCache[endpoint] = fetch(endpoint, {
        credentials: "omit",
        method: "GET",
        mode: "cors",
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Failed to fetch product options");
          }

          return response.json();
        })
        .then(function (payload) {
          return payload && payload.product ? payload.product : null;
        })
        .catch(function () {
          delete productOptionCache[endpoint];
          return null;
        });
    }

    return productOptionCache[endpoint];
  }

  function closeQuickAddOverlay() {
    if (!activeQuickAddOverlay) {
      return;
    }

    activeQuickAddOverlay.remove();
    activeQuickAddOverlay = null;
  }

  function getVariantValues(variant) {
    return Array.isArray(variant && variant.values) ? variant.values : [];
  }

  function getOptionValues(snapshot, selection, optionIndex) {
    if (!snapshot || !Array.isArray(snapshot.variants)) {
      return [];
    }

    var values = [];
    var valueSet = {};

    snapshot.variants.forEach(function (variant) {
      if (!variant || !variant.available) {
        return;
      }

      var variantValues = getVariantValues(variant);
      var matchesOtherOptions = true;

      for (var index = 0; index < selection.length; index += 1) {
        if (index === optionIndex) {
          continue;
        }

        if (selection[index] && variantValues[index] !== selection[index]) {
          matchesOtherOptions = false;
          break;
        }
      }

      if (!matchesOtherOptions) {
        return;
      }

      var nextValue = variantValues[optionIndex];

      if (nextValue && !valueSet[nextValue]) {
        valueSet[nextValue] = true;
        values.push(nextValue);
      }
    });

    return values;
  }

  function findMatchingVariant(snapshot, selection) {
    if (!snapshot || !Array.isArray(snapshot.variants)) {
      return null;
    }

    var isComplete = selection.every(function (value) {
      return Boolean(value);
    });

    if (!isComplete) {
      return null;
    }

    for (var index = 0; index < snapshot.variants.length; index += 1) {
      var variant = snapshot.variants[index];

      if (!variant || !variant.available) {
        continue;
      }

      var variantValues = getVariantValues(variant);
      var matchesSelection = selection.every(function (selectedValue, selectedIndex) {
        return variantValues[selectedIndex] === selectedValue;
      });

      if (matchesSelection) {
        return variant;
      }
    }

    return null;
  }

  function buildInitialSelection(snapshot) {
    var selection = [];
    var optionCount = Array.isArray(snapshot && snapshot.options) ? snapshot.options.length : 0;

    for (var index = 0; index < optionCount; index += 1) {
      var optionValues = getOptionValues(snapshot, selection, index);
      selection[index] = optionValues.length === 1 ? optionValues[0] : "";
    }

    return selection;
  }

  function getSelectionPrompt(snapshot) {
    var optionNames = Array.isArray(snapshot && snapshot.options)
      ? snapshot.options
          .map(function (option) {
            return option && option.name ? String(option.name).toLowerCase() : "";
          })
          .filter(Boolean)
      : [];

    if (optionNames.length === 0) {
      return "Elegi una variante";
    }

    if (optionNames.length === 1) {
      return "Elegi " + optionNames[0];
    }

    if (optionNames.length === 2) {
      return "Elegi " + optionNames[0] + " y " + optionNames[1];
    }

    return "Elegi opciones";
  }

  function createHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;

    return input;
  }

  function buildSyntheticCartForm(snapshot, selection) {
    if (!snapshot || !snapshot.productId) {
      return null;
    }

    var form = document.createElement("form");
    form.action = resolveStoreUrl() + "/comprar/";
    form.className = "js-product-form";
    form.method = "post";
    form.style.display = "none";
    form.setAttribute("data-store", "product-form-" + String(snapshot.productId));
    form.appendChild(createHiddenInput("add_to_cart", String(snapshot.productId)));
    form.appendChild(createHiddenInput("quantity", "1"));

    selection.forEach(function (value, index) {
      if (!value) {
        return;
      }

      form.appendChild(createHiddenInput("variation[" + index + "]", value));
    });

    return form;
  }

  function nativeAddToCart(snapshot, selection) {
    if (
      !snapshot ||
      !snapshot.productId ||
      !Array.isArray(selection) ||
      selection.length === 0 ||
      !window.LS ||
      typeof window.LS.addToCartEnhanced !== "function" ||
      typeof window.jQueryNuvem !== "function"
    ) {
      return Promise.reject(new Error("Native add to cart unavailable"));
    }

    var form = buildSyntheticCartForm(snapshot, selection);

    if (!form) {
      return Promise.reject(new Error("Unable to build cart form"));
    }

    document.body.appendChild(form);

    return new Promise(function (resolve, reject) {
      var settled = false;

      function cleanup() {
        if (form.parentNode) {
          form.parentNode.removeChild(form);
        }
      }

      function handleResolve() {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        resolve();
      }

      function handleReject() {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        reject(new Error("Native add to cart failed"));
      }

      try {
        window.LS.addToCartEnhanced(
          window.jQueryNuvem(form),
          "Listo",
          "Agregando...",
          "No hay mas stock de este producto.",
          false,
          handleResolve,
          handleReject
        );
      } catch (_error) {
        handleReject();
      }
    });
  }

  function addVariantToCart(input) {
    var fallbackItem = input && input.fallbackItem ? input.fallbackItem : null;
    var selection =
      input && Array.isArray(input.selection) ? input.selection.slice() : [];
    var snapshot = input && input.snapshot ? input.snapshot : null;
    var triggerButton = input && input.triggerButton ? input.triggerButton : null;
    var variantId = input && input.variantId ? input.variantId : null;
    var originalText = triggerButton ? triggerButton.textContent : "";
    var shouldTryNative = snapshot && selection.length > 0;

    function restoreAfterSuccess() {
      if (triggerButton) {
        triggerButton.textContent = "Agregado";
      }

      closeQuickAddOverlay();
      scheduleBoot(220);

      window.setTimeout(function () {
        if (triggerButton) {
          triggerButton.disabled = false;
          triggerButton.textContent = originalText;
        }
      }, 1200);
    }

    function restoreAfterFailure() {
      if (triggerButton) {
        triggerButton.disabled = false;
        triggerButton.textContent = "Ver producto";
      }

      window.location.href = buildProductUrl(fallbackItem);
    }

    function tryDirectAdd() {
      if (!variantId || !window.LS || !window.LS.cart || typeof window.LS.cart.addItem !== "function") {
        return Promise.reject(new Error("Direct add unavailable"));
      }

      return Promise.resolve(window.LS.cart.addItem(variantId, 1));
    }

    if (!variantId && !shouldTryNative) {
      restoreAfterFailure();
      return Promise.resolve();
    }

    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.textContent = "Agregando...";
    }

    return (shouldTryNative ? nativeAddToCart(snapshot, selection) : tryDirectAdd())
      .catch(function () {
        if (shouldTryNative) {
          return tryDirectAdd();
        }

        throw new Error("Unable to add item");
      })
      .then(function () {
        restoreAfterSuccess();
      })
      .catch(function () {
        restoreAfterFailure();
      });
  }

  function openVariantSelector(snapshot, item, triggerButton, widgetConfig) {
    closeQuickAddOverlay();

    var selection = buildInitialSelection(snapshot);
    var overlay = document.createElement("div");
    var modal = document.createElement("div");
    var closeButton = document.createElement("button");
    var header = document.createElement("div");
    var body = document.createElement("div");
    var optionsContainer = document.createElement("div");
    var submitButton = document.createElement("button");
    var currentVariant = null;

    overlay.className = "vortex-quickadd-overlay";
    overlay.style.setProperty("--vortex-modal-accent", widgetConfig.accentColor);
    overlay.style.setProperty("--vortex-modal-bg", widgetConfig.backgroundColor);
    overlay.style.setProperty(
      "--vortex-modal-radius",
      String(Math.max(widgetConfig.borderRadius, 18)) + "px"
    );
    modal.className = "vortex-quickadd-modal";
    overlay.appendChild(modal);
    activeQuickAddOverlay = overlay;

    closeButton.className = "vortex-quickadd-close";
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closeQuickAddOverlay);

    closeButton.innerHTML = "&times;";

    header.className = "vortex-quickadd-header";
    header.innerHTML =
      (snapshot.imageUrl
        ? '<img class="vortex-quickadd-image" src="' +
          snapshot.imageUrl +
          '" alt="' +
          (snapshot.name || "Producto") +
          '">'
        : '<div class="vortex-quickadd-image vortex-quickadd-image--placeholder"></div>') +
      '<div class="vortex-quickadd-copy"><h4>' +
      (snapshot.name || item.name || "Producto") +
      "</h4><p>Elegi las variantes antes de agregar al carrito.</p></div>";

    body.className = "vortex-quickadd-body";
    optionsContainer.className = "vortex-quickadd-options";

    submitButton.className = "vortex-widget__button vortex-quickadd-submit";
    submitButton.style.background = widgetConfig.accentColor;
    submitButton.style.color = getContrastTextColor(widgetConfig.accentColor);
    submitButton.textContent = widgetConfig.quickAddLabel;
    submitButton.type = "button";

    function renderSelectorState() {
      optionsContainer.innerHTML = "";

      (snapshot.options || []).forEach(function (option, optionIndex) {
        var optionValues = getOptionValues(snapshot, selection, optionIndex);
        var field = document.createElement("label");
        var caption = document.createElement("span");
        var select = document.createElement("select");
        var placeholderOption = document.createElement("option");

        field.className = "vortex-quickadd-field";
        caption.className = "vortex-quickadd-label";
        caption.textContent = option.name || "Opcion";

        select.className = "vortex-quickadd-select";
        select.dataset.optionIndex = String(optionIndex);
        select.innerHTML =
          '<option value="">' +
          "Elegir " +
          (option.name || "opcion").toLowerCase() +
          "</option>";
        select.innerHTML = "";
        placeholderOption.value = "";
        placeholderOption.textContent =
          "Elegir " + (option.name || "opcion").toLowerCase();
        placeholderOption.style.background = "#ffffff";
        placeholderOption.style.color = "#0f172a";
        select.appendChild(placeholderOption);

        optionValues.forEach(function (value) {
          var optionNode = document.createElement("option");
          optionNode.value = value;
          optionNode.textContent = value;
          optionNode.selected = selection[optionIndex] === value;
          optionNode.style.background = "#ffffff";
          optionNode.style.color = "#0f172a";
          select.appendChild(optionNode);
        });

        select.value = selection[optionIndex] || "";
        select.classList.toggle("is-placeholder", !selection[optionIndex]);

        select.addEventListener("change", function (event) {
          var nextValue = event.target.value || "";
          selection[optionIndex] = nextValue;

          for (var index = optionIndex + 1; index < selection.length; index += 1) {
            var downstreamValues = getOptionValues(snapshot, selection, index);

            if (downstreamValues.indexOf(selection[index]) === -1) {
              selection[index] = downstreamValues.length === 1 ? downstreamValues[0] : "";
            }
          }

          renderSelectorState();
        });

        field.appendChild(caption);
        field.appendChild(select);
        optionsContainer.appendChild(field);
      });

      currentVariant = findMatchingVariant(snapshot, selection);

      if (currentVariant && currentVariant.price) {
        submitButton.textContent =
          widgetConfig.quickAddLabel + " · " + formatMoney(currentVariant.price);
        submitButton.disabled = false;
      } else {
        submitButton.textContent = getSelectionPrompt(snapshot);
        submitButton.disabled = true;
      }

      if (currentVariant && typeof currentVariant.price === "number") {
        submitButton.textContent =
          widgetConfig.quickAddLabel + " - " + formatMoney(currentVariant.price);
      }
    }

    submitButton.addEventListener("click", function () {
      if (!currentVariant) {
        return;
      }

      addVariantToCart({
        fallbackItem: item,
        selection: selection,
        snapshot: snapshot,
        triggerButton: submitButton,
        variantId: currentVariant.id,
      });
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeQuickAddOverlay();
      }
    });

    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(body);
    body.appendChild(optionsContainer);
    body.appendChild(submitButton);
    document.body.appendChild(overlay);
    renderSelectorState();
  }

  function handleQuickAdd(item, button, widgetConfig) {
    var variantCount =
      typeof item.variantCount === "number" && item.variantCount > 0 ? item.variantCount : 0;

    if (variantCount <= 1 && item && item.variantId) {
      addVariantToCart({
        fallbackItem: item,
        triggerButton: button,
        variantId: item.variantId,
      });
      return;
    }

    button.disabled = true;
    button.textContent = "Cargando opciones...";

    fetchProductOptions(item)
      .then(function (snapshot) {
        if (
          snapshot &&
          Array.isArray(snapshot.variants) &&
          snapshot.variants.filter(function (variant) {
            return variant && variant.available;
          }).length === 1
        ) {
          var onlyVariant = snapshot.variants.find(function (variant) {
            return variant && variant.available;
          });

          if (onlyVariant) {
            return addVariantToCart({
              fallbackItem: item,
              selection: getVariantValues(onlyVariant),
              snapshot: snapshot,
              triggerButton: button,
              variantId: onlyVariant.id,
            });
          }
        }

        if (!snapshot) {
          throw new Error("Missing snapshot");
        }

        button.disabled = false;
        button.textContent = widgetConfig.quickAddLabel;
        openVariantSelector(snapshot, item, button, widgetConfig);
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = "Ver producto";
        window.location.href = buildProductUrl(item);
      });
  }

  function getWidgetConfig(payload) {
    var widget = payload && payload.widget ? payload.widget : {};

    return {
      accentColor:
        typeof widget.accentColor === "string" && widget.accentColor
          ? widget.accentColor
          : "#67e8f9",
      backgroundColor:
        typeof widget.backgroundColor === "string" && widget.backgroundColor
          ? widget.backgroundColor
          : "#07111a",
      borderRadius:
        typeof widget.borderRadius === "number" && !Number.isNaN(widget.borderRadius)
          ? widget.borderRadius
          : 24,
      cartPageEnabled: widget.cartPageEnabled !== false,
      enabled: widget.widgetEnabled !== false,
      productPageEnabled: widget.productPageEnabled !== false,
      quickAddLabel:
        typeof widget.quickAddLabel === "string" && widget.quickAddLabel
          ? widget.quickAddLabel
          : "Quick Add",
      subtitle:
        typeof widget.widgetSubtitle === "string" && widget.widgetSubtitle
          ? widget.widgetSubtitle
          : "Vortex selecciono sugerencias de alta afinidad y deja un fallback de cold start listo para convertir.",
      title:
        typeof widget.widgetTitle === "string" && widget.widgetTitle
          ? widget.widgetTitle
          : "Llevate algo que combine mejor con esta compra",
    };
  }

  function shouldRenderForContext(context, config) {
    if (!config.enabled) {
      return false;
    }

    if (context.page === "product") {
      return config.productPageEnabled;
    }

    if (context.page === "cart") {
      return config.cartPageEnabled;
    }

    return true;
  }

  function buildSignature(context, payload, widgetConfig) {
    var recommendationIds = Array.isArray(payload && payload.recommendations)
      ? payload.recommendations
          .map(function (item) {
            return item.productId;
          })
          .join(",")
      : "";

    return [
      context.page,
      context.productId,
      payload && payload.strategy ? payload.strategy : "unknown",
      recommendationIds,
      widgetConfig.title,
      widgetConfig.subtitle,
      widgetConfig.quickAddLabel,
      widgetConfig.accentColor,
      widgetConfig.backgroundColor,
      widgetConfig.borderRadius,
    ].join("::");
  }

  function mountWidget(container, context) {
    var mountPoint = context.anchor || document.body;

    if (!mountPoint) {
      document.body.appendChild(container);
      return;
    }

    if (context.page === "cart") {
      mountPoint.appendChild(container);
      return;
    }

    if (mountPoint.parentNode && mountPoint !== document.body) {
      mountPoint.parentNode.insertBefore(container, mountPoint.nextSibling);
      return;
    }

    document.body.appendChild(container);
  }

  function removeObsoleteWidgets(activeWidgetId) {
    ["vortex-widget-product", "vortex-widget-cart"].forEach(function (widgetId) {
      if (widgetId === activeWidgetId) {
        return;
      }

      var staleWidget = document.getElementById(widgetId);

      if (staleWidget) {
        staleWidget.remove();
      }
    });
  }

  function renderWidget(context, payload) {
    if (!context || !payload || !Array.isArray(payload.recommendations) || payload.recommendations.length === 0) {
      return;
    }

    var widgetConfig = getWidgetConfig(payload);

    if (!shouldRenderForContext(context, widgetConfig)) {
      var disabledWidget = document.getElementById(context.widgetId);

      if (disabledWidget) {
        disabledWidget.remove();
      }

      return;
    }

    ensureStyles();

    var signature = buildSignature(context, payload, widgetConfig);
    var existing = document.getElementById(context.widgetId);

    if (existing && existing.dataset.signature === signature) {
      return;
    }

    if (existing) {
      existing.remove();
    }

    var container = document.createElement("section");
    container.className = "vortex-widget";
    container.id = context.widgetId;
    container.dataset.signature = signature;
    container.style.background =
      "linear-gradient(180deg," + widgetConfig.backgroundColor + "," + widgetConfig.backgroundColor + ")";
    container.style.borderRadius = (widgetConfig.borderRadius + 4) + "px";

    container.innerHTML =
      '<div class="vortex-widget__eyebrow">' +
      prettyStrategy(payload.strategy) +
      "</div>" +
      '<h3 class="vortex-widget__title">' +
      widgetConfig.title +
      "</h3>" +
      '<p class="vortex-widget__copy">' +
      widgetConfig.subtitle +
      "</p>" +
      '<div class="vortex-widget__grid"></div>';

    var grid = container.querySelector(".vortex-widget__grid");

    payload.recommendations.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "vortex-widget__card";
      card.style.borderRadius = widgetConfig.borderRadius + "px";
      var imageUrl = item.imageUrl || "";
      var priceLabel = item.price ? formatMoney(item.price) : "Ver detalle";
      var productUrl = buildProductUrl(item);

      card.innerHTML =
        (imageUrl
          ? '<a href="' +
            productUrl +
            '"><img class="vortex-widget__image" loading="lazy" src="' +
            imageUrl +
            '" alt="' +
            (item.name || "Producto recomendado") +
            '"></a>'
          : '<div class="vortex-widget__image vortex-widget__image--placeholder"></div>') +
        '<div><a href="' +
        productUrl +
        '"><h4 class="vortex-widget__name">' +
        item.name +
        '</h4></a></div>' +
        '<div class="vortex-widget__meta"><span>' +
        priceLabel +
        "</span><span>" +
        prettyReason(item.reason) +
        "</span></div>" +
        '<button class="vortex-widget__button" type="button" style="background:' +
        widgetConfig.accentColor +
        ';">' +
        widgetConfig.quickAddLabel +
        "</button>";

      var button = card.querySelector(".vortex-widget__button");
      if (button) {
        button.addEventListener("click", function () {
          handleQuickAdd(item, button, widgetConfig);
        });
      }

      if (grid) {
        grid.appendChild(card);
      }
    });

    removeObsoleteWidgets(context.widgetId);
    mountWidget(container, context);
  }

  function fetchRecommendations(context) {
    var storeId = getStoreId();

    if (!storeId || !context) {
      return Promise.resolve(null);
    }

    var endpoint =
      apiOrigin + "/api/v1/recommendations?store_id=" + encodeURIComponent(storeId);

    if (context.productId) {
      endpoint += "&product_id=" + encodeURIComponent(context.productId);
    }

    return fetch(endpoint, {
      credentials: "omit",
      method: "GET",
      mode: "cors",
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        return response.json();
      })
      .catch(function () {
        return null;
      });
  }

  function boot() {
    bootTimer = null;

    var context = resolveContext();

    if (!context) {
      removeObsoleteWidgets("vortex-widget-none");
      return;
    }

    fetchRecommendations(context).then(function (payload) {
      renderWidget(context, payload);
    });
  }

  function scheduleBoot(delay) {
    if (bootTimer) {
      window.clearTimeout(bootTimer);
    }

    bootTimer = window.setTimeout(boot, typeof delay === "number" ? delay : 140);
  }

  function setupObservers() {
    if (observer || !document.body) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      var shouldReboot = mutations.some(function (mutation) {
        if (mutation.type === "attributes") {
          return true;
        }

        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
      });

      if (shouldReboot) {
        scheduleBoot(120);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-store", "style"],
      childList: true,
      subtree: true,
    });

    ["click", "touchstart", "keyup"].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        scheduleBoot(180);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        setupObservers();
        scheduleBoot(0);
      },
      { once: true },
    );
    return;
  }

  setupObservers();
  scheduleBoot(0);
})();
