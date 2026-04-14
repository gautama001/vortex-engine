export type LocalizedText = Record<string, string>;

export type TiendaNubeCategoryReference =
  | number
  | {
      handle?: LocalizedText;
      id: number;
      name?: LocalizedText;
    };

export type TiendaNubeProductImage = {
  alt?: string | null;
  id: number;
  position?: number | null;
  product_id?: number;
  src: string;
};

export type TiendaNubeProductVariant = {
  id: number;
  image_id?: number | null;
  price?: number | string | null;
  product_id?: number;
  promotional_price?: number | string | null;
  sku?: string | null;
  stock?: number | null;
  stock_management?: boolean;
};

export type TiendaNubeProduct = {
  categories?: TiendaNubeCategoryReference[];
  created_at?: string;
  description?: LocalizedText;
  handle?: LocalizedText;
  id: number;
  images?: TiendaNubeProductImage[];
  name: LocalizedText;
  published?: boolean;
  requires_shipping?: boolean;
  tags?: string | string[] | null;
  updated_at?: string;
  variants?: TiendaNubeProductVariant[];
};

export type TiendaNubeOauthTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
  user_id: number | string;
};

export type TiendaNubeStore = {
  domains?: string[];
  main_currency?: string;
  name?: LocalizedText;
  original_domain?: string;
};

export type TiendaNubeScriptAssociation = {
  id: number;
  is_auto_install: boolean;
  name: string;
  params?: Record<string, unknown>;
  status: string;
};

export type TiendaNubeWebhookPayload = {
  event: string;
  id?: number | string;
  status?: string;
  store_id: number | string;
};

type TiendaNubeApiErrorBody = {
  code?: number;
  description?: string;
  message?: string;
  [key: string]: unknown;
};

export class TiendaNubeApiError extends Error {
  body?: TiendaNubeApiErrorBody;
  status: number;

  constructor(message: string, status: number, body?: TiendaNubeApiErrorBody) {
    super(message);
    this.name = "TiendaNubeApiError";
    this.body = body;
    this.status = status;
  }
}
