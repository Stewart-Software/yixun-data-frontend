export interface ProductInsightQuery {
  goodsDesc?: string[];
  hsCode?: string[];

  dateStart: string;
  dateEnd: string;

  dataType?: "0" | "1" | "2";

  originCountryTc?: string[];
  destCountryTc?: string[];

  pageNo: number;
}

export interface ProductBuyerOrSupplier {
  companyName: string;
  country?: string;
  tradeCount: number;
  totalQuantity?: number;
  totalWeight?: number;
  totalValue?: number;
}

export interface ProductCountryOrPort {
  country: string;
  port?: string;
  tradeCount: number;
  totalQuantity?: number;
  totalWeight?: number;
  totalValue?: number;
}

export interface ProductItem {
  goodsDesc: string;
  hsCodes: string[];
  tradeCount: number;
  totalQuantity?: number;
  quantityUnit?: string;
  totalWeight?: number;
  weightUnit?: string;
  totalValue?: number;
  valueUnit?: string;
}

export interface ProductInsightResponse {
  /** Query context */
  product: {
    goodsDesc?: string[];
    hsCode?: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };

  /** Aggregated summary across all pages (or counts from searchTradeCounts) */
  summary: {
    tradeCount: number;

    totalQuantity?: number;
    quantityUnit?: string;

    totalWeight?: number;
    weightUnit?: string;

    totalValue?: number;
    valueUnit?: string;

    buyers: number;
    suppliers: number;
    countries: number;
    ports: number;
  };

  /** Aggregated lists for this page only */
  buyers: ProductBuyerOrSupplier[];
  suppliers: ProductBuyerOrSupplier[];
  countries: ProductCountryOrPort[];
  ports: ProductCountryOrPort[];
  trades: TradeRecord[];

  /** Pagination info controlled by frontend */
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRows: number;
  };
}

export interface TradeRecord {
  goodsDesc: string;
  hsCode: string;

  /** Quantity info */
  quantity: number;
  quantityUnit?: string;

  /** Weight info */
  weight?: number;
  weightUnit?: string;

  /** Value info */
  value?: number;
  valueUnit?: string;

  /** Countries / source info */
  originCountry?: string;
  destCountry?: string;
  expImp?: string;
  source?: string;

  /** Parties involved */
  shipper?: string;
  consignee?: string;

  /** Trade date and identifiers */
  date?: string;
  id?: string;
  rowkey?: string;
}
