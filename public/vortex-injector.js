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
      ".vortex-widget__button:hover{transform:translateY(-1px)}";
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

  function addItemToCart(item, button) {
    if (!item || !item.variantId) {
      window.location.href = buildProductUrl(item);
      return;
    }

    if (!window.LS || !window.LS.cart || typeof window.LS.cart.addItem !== "function") {
      window.location.href = buildProductUrl(item);
      return;
    }

    var originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Agregando...";

    Promise.resolve(window.LS.cart.addItem(item.variantId, 1))
      .then(function () {
        button.textContent = "Agregado";
        scheduleBoot(220);
        window.setTimeout(function () {
          button.disabled = false;
          button.textContent = originalText;
        }, 1200);
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
          addItemToCart(item, button);
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
