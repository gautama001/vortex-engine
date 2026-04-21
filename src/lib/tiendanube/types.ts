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

export type TiendaNubeProductAttribute = LocalizedText;

export type TiendaNubeProductVariant = {
  id: number;
  image_id?: number | null;
  price?: number | string | null;
  product_id?: number;
  promotional_price?: number | string | null;
  sku?: string | null;
  stock?: number | null;
  stock_management?: boolean;
  values?: LocalizedText[];
  visible?: boolean | null;
};

export type TiendaNubeProduct = {
  attributes?: TiendaNubeProductAttribute[];
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

export type TiendaNubeOrderAttribute = {
  key?: string | null;
  name?: string | null;
  value?: string | null;
};

export type TiendaNubeOrderProduct = {
  id?: number | string | null;
  name?: string | null;
  price?: number | string | null;
  product_id?: number | string | null;
  quantity?: number | string | null;
  variant_id?: number | string | null;
};

export type TiendaNubeOrder = {
  attributes?: TiendaNubeOrderAttribute[];
  created_at?: string | null;
  currency?: string | null;
  id: number | string;
  note?: string | null;
  owner_note?: string | null;
  paid_at?: string | null;
  payment_status?: string | null;
  products?: TiendaNubeOrderProduct[];
  total?: number | string | null;
  total_paid_by_customer?: number | string | null;
  total_paid_by_customer_including_fees?: number | string | null;
  updated_at?: string | null;
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

export type TiendaNubeCouponStatus = "active" | "expired" | "paused";

export type TiendaNubeCoupon = {
  applies_to?: "all" | "products" | "shipping";
  code?: string;
  created_at?: string | null;
  id: number | string;
  percentage?: number | null;
  status?: TiendaNubeCouponStatus | string;
  type?: "absolute" | "percentage" | string;
  updated_at?: string | null;
  value?: number | string | null;
};

export type TiendaNubeCouponCreatePayload = {
  applies_to?: "all" | "products" | "shipping";
  code: string;
  end_date?: string | null;
  min_price?: number | null;
  percentage?: number | null;
  start_date?: string | null;
  type: "absolute" | "percentage";
  value?: number | null;
};

export type TiendaNubeDiscountTarget =
  | {
      product_ids: Array<number | string>;
      type: "products";
    }
  | {
      type: "shipping";
    };

export type TiendaNubeDiscountTrigger =
  | {
      product_ids: Array<number | string>;
      type: "products";
    }
  | {
      min_price: number;
      type: "cart_total";
    };

export type TiendaNubeDiscountBenefit = {
  percentage?: number | null;
  type: "percentage";
  value?: number | null;
};

export type TiendaNubeDiscount = {
  benefit?: TiendaNubeDiscountBenefit;
  created_at?: string | null;
  id: number | string;
  name?: string | null;
  priority?: number | null;
  status?: "active" | "paused" | string;
  target?: TiendaNubeDiscountTarget;
  trigger?: TiendaNubeDiscountTrigger;
  updated_at?: string | null;
};

export type TiendaNubeDiscountCreatePayload = {
  benefit: TiendaNubeDiscountBenefit;
  end_date?: string | null;
  name: string;
  priority?: number;
  start_date?: string | null;
  status?: "active" | "paused";
  target: TiendaNubeDiscountTarget;
  trigger: TiendaNubeDiscountTrigger;
};

export type TiendaNubePromotionTier = "cross_items" | "line_item";

export type TiendaNubePromotionAllocationType = "cross_items" | "line_item";

export type TiendaNubePromotionStatus = "active" | "paused" | string;

export type TiendaNubePromotion = {
  active?: boolean | null;
  allocation_type?: TiendaNubePromotionAllocationType;
  combines_with_other_discounts?: boolean | null;
  created_at?: string | null;
  execution_tier?: TiendaNubePromotionTier;
  id: number | string;
  name?: string | null;
  status?: TiendaNubePromotionStatus;
  updated_at?: string | null;
};

export type TiendaNubePromotionCreatePayload = {
  allocation_type: TiendaNubePromotionAllocationType;
  combines_with_other_discounts: boolean;
  execution_tier: TiendaNubePromotionTier;
  name: string;
  status?: TiendaNubePromotionStatus;
};

export type TiendaNubeDiscountCallback = {
  url: string;
};

export type TiendaNubeDiscountCallbackPayload = {
  url: string;
};

export type TiendaNubeCartPromotionState = {
  id: string;
  line_items?: string[];
};

export type TiendaNubeDiscountCallbackLineItem = {
  compare_at_price?: number | string | null;
  id: number | string;
  price?: number | string | null;
  product_id?: number | string | null;
  quantity?: number | string | null;
  variant_id?: number | string | null;
  variant_values?: string[];
};

export type TiendaNubeDiscountCallbackPayloadBody = {
  cart_id: number | string;
  currency: string;
  execution_tier: TiendaNubePromotionTier;
  language?: string | null;
  products?: TiendaNubeDiscountCallbackLineItem[];
  promotions?: TiendaNubeCartPromotionState[];
  store_id: number | string;
};

export type TiendaNubeDiscountCommand =
  | {
      command: "create_or_update_discount";
      specs: {
        currency: string;
        display_text: Record<string, string>;
        line_items: Array<{
          discount_specs: {
            amount: string;
            type: "fixed";
          };
          line_item: string;
        }>;
        promotion_id: string;
      };
    }
  | {
      command: "remove_discount";
      specs:
        | {
            line_items: string[];
            promotion_id: string;
            scope: "line_item";
          }
        | {
            promotion_ids: string[];
            scope: "cart";
          };
    };

export type TiendaNubeDiscountCallbackResponse = {
  commands: TiendaNubeDiscountCommand[];
};

export type TiendaNubeChargeStatus = "accepted" | "cancelled" | "pending" | string;

export type TiendaNubeCharge = {
  amount?: number | string | null;
  created_at?: string | null;
  currency?: string | null;
  description?: string | null;
  id: number | string;
  name?: string | null;
  status?: TiendaNubeChargeStatus;
  test?: boolean | null;
  updated_at?: string | null;
};

export type TiendaNubeChargeCreatePayload = {
  amount: number;
  description: string;
  name: string;
  return_url?: string;
  test?: boolean;
};

export type TiendaNubeSubscriptionInterval = "monthly" | "yearly";

export type TiendaNubeSubscription = {
  amount?: number | string | null;
  created_at?: string | null;
  currency?: string | null;
  id: number | string;
  interval?: TiendaNubeSubscriptionInterval | string;
  name?: string | null;
  status?: "active" | "cancelled" | "paused" | string;
  test?: boolean | null;
  updated_at?: string | null;
};

export type TiendaNubeSubscriptionCreatePayload = {
  amount: number;
  description: string;
  interval?: TiendaNubeSubscriptionInterval;
  name: string;
  return_url?: string;
  test?: boolean;
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
