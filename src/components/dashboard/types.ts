export const ESTRATEGIAS = [
  {
    descripcion: "Motor hibrido con senales semanticas y fallback automatico a best sellers.",
    etiqueta: "IA Engine",
    valor: "ia-inteligente",
  },
  {
    descripcion: "Prioriza pares historicos y combinaciones de alta intencion de compra.",
    etiqueta: "Comprados juntos frecuentemente (FBT)",
    valor: "comprados-juntos",
  },
  {
    descripcion: "Permite fijar una logica editorial y evolucionar hacia seleccion curada.",
    etiqueta: "Seleccion Manual",
    valor: "seleccion-manual",
  },
] as const;

export const METRICAS = {
  aumentoTicket: "Aumento del Ticket Promedio",
  asistenciaConversion: "Asistencia de Conversion",
  clicsWidget: "Clics en el Widget",
  impresiones: "Impresiones",
} as const;

export const VISTAPREVIA = {
  auditor: "Auditor en vivo",
  contenedor: "Previsualizacion aislada",
  estado: "Storefront en tiempo real",
  titulo: "Vista previa",
} as const;

export const VENTAS_ATRIBUIDAS = "Ventas atribuidas";

export const REGLAS_DE_INVENTARIO = {
  exigirImagen: "Solo recomendar productos con imagen",
  ocultarSinStock: "Ocultar productos sin stock",
} as const;

export type StrategyValue = (typeof ESTRATEGIAS)[number]["valor"];

export const FONT_FAMILY_OPTIONS = [
  {
    etiqueta: "Plex Sans",
    valor: "plex-sans",
  },
  {
    etiqueta: "UI Sans",
    valor: "ui-sans",
  },
  {
    etiqueta: "Editorial Serif",
    valor: "editorial-serif",
  },
] as const;

export const DISCOUNT_PERCENTAGE_OPTIONS = [0, 10, 20, 30, 40, 50] as const;

export type DiscountPercentageValue =
  (typeof DISCOUNT_PERCENTAGE_OPTIONS)[number];

export type FontFamilyValue = (typeof FONT_FAMILY_OPTIONS)[number]["valor"];

export type PersistedWidgetConfig = {
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  cartPageEnabled: boolean;
  discountPercentage: DiscountPercentageValue;
  fontColor: string;
  fontFamily: FontFamilyValue;
  hideOutOfStock: boolean;
  manualRecommendationProductIds: number[];
  productPageEnabled: boolean;
  quickAddLabel: string;
  recommendationAlgorithm: StrategyValue;
  recommendationLimit: number;
  requireImage: boolean;
  widgetEnabled: boolean;
  widgetSubtitle: string;
  widgetTitle: string;
};

export type MerchantWidgetConfig = PersistedWidgetConfig;

export type WidgetConfig = {
  algoritmo: StrategyValue;
  estetica: {
    accentColor: string;
    backgroundColor: string;
    borderRadius: number;
    discountPercentage: DiscountPercentageValue;
    fontColor: string;
    fontFamily: FontFamilyValue;
    subtitulo: string;
    textoCta: string;
    titulo: string;
  };
  filtros: {
    ocultarSinStock: boolean;
    soloConImagen: boolean;
  };
  manuales: {
    productIds: number[];
  };
  posicionamiento: {
    limiteRecomendaciones: number;
    mostrarEnCarrito: boolean;
    mostrarEnProducto: boolean;
    widgetActivo: boolean;
  };
};

export type MerchantPreviewProduct = {
  createdAt: string | null;
  handle: string | null;
  id: number;
  imageUrl: string | null;
  name: string;
  price: number | null;
};

export type MerchantStorefrontContext = {
  currencyCode: string | null;
  name: string;
  primaryDomain: string | null;
};

export type AnalyticsSnapshot = {
  attributedSales: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  impressions: number;
  periodLabel: string;
};

export const widgetConfigFromPersisted = (config: PersistedWidgetConfig): WidgetConfig => {
  return {
    algoritmo: config.recommendationAlgorithm,
    estetica: {
      accentColor: config.accentColor,
      backgroundColor: config.backgroundColor,
      borderRadius: config.borderRadius,
      discountPercentage: config.discountPercentage,
      fontColor: config.fontColor,
      fontFamily: config.fontFamily,
      subtitulo: config.widgetSubtitle,
      textoCta: config.quickAddLabel,
      titulo: config.widgetTitle,
    },
    filtros: {
      ocultarSinStock: config.hideOutOfStock,
      soloConImagen: config.requireImage,
    },
    manuales: {
      productIds: config.manualRecommendationProductIds,
    },
    posicionamiento: {
      limiteRecomendaciones: config.recommendationLimit,
      mostrarEnCarrito: config.cartPageEnabled,
      mostrarEnProducto: config.productPageEnabled,
      widgetActivo: config.widgetEnabled,
    },
  };
};

export const widgetConfigToPersisted = (config: WidgetConfig): PersistedWidgetConfig => {
  return {
    accentColor: config.estetica.accentColor,
    backgroundColor: config.estetica.backgroundColor,
    borderRadius: config.estetica.borderRadius,
    cartPageEnabled: config.posicionamiento.mostrarEnCarrito,
    discountPercentage: config.estetica.discountPercentage,
    fontColor: config.estetica.fontColor,
    fontFamily: config.estetica.fontFamily,
    hideOutOfStock: config.filtros.ocultarSinStock,
    manualRecommendationProductIds: config.manuales.productIds,
    productPageEnabled: config.posicionamiento.mostrarEnProducto,
    quickAddLabel: config.estetica.textoCta,
    recommendationAlgorithm: config.algoritmo,
    recommendationLimit: config.posicionamiento.limiteRecomendaciones,
    requireImage: config.filtros.soloConImagen,
    widgetEnabled: config.posicionamiento.widgetActivo,
    widgetSubtitle: config.estetica.subtitulo,
    widgetTitle: config.estetica.titulo,
  };
};
