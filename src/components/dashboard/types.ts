export const ESTRATEGIAS = [
  {
    descripcion: "Motor hibrido con senales semanticas y fallback automatico a best sellers.",
    etiqueta: "IA Inteligente",
    valor: "ia-inteligente",
  },
  {
    descripcion: "Prioriza pares historicos y combinaciones de alta intencion de compra.",
    etiqueta: "Comprados Juntos Frecuentemente",
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

export type PersistedWidgetConfig = {
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  cartPageEnabled: boolean;
  hideOutOfStock: boolean;
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
    subtitulo: string;
    textoCta: string;
    titulo: string;
  };
  filtros: {
    ocultarSinStock: boolean;
    soloConImagen: boolean;
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
      subtitulo: config.widgetSubtitle,
      textoCta: config.quickAddLabel,
      titulo: config.widgetTitle,
    },
    filtros: {
      ocultarSinStock: config.hideOutOfStock,
      soloConImagen: config.requireImage,
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
    hideOutOfStock: config.filtros.ocultarSinStock,
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
