import { TradeRecord } from "../products/types";

export interface CompaniesQuery {
  /** pagination */
  pageNo: number;

  /** date range (required) */
  dateStart: string;
  dateEnd: string;

  /** company context (required for detail page) */
  companyName: string;

  /**
   * 1 = buyer detail page (maps to CONSIGNEE)
   * 2 = supplier detail page (maps to SHIPPER)
   */
  companyType: "1" | "2";

  /** trade direction */
  dataType?: "0" | "1" | "2"; // 0 = all, 1 = import, 2 = export

  /** optional filters */
  goodsDesc?: string[];
  hsCode?: string[];
}

export interface CompanySummary {
  companyName: string;
  companyType: string;

  tradeCount: number;
  totalQuantity?: number;

  hsCodes: string[];
  products: string[];

  originCountries: string[];
  destCountries: string[];

  firstTradeDate?: string;
  lastTradeDate?: string;
}

export interface CompaniesResponse {
  totalInPage: number;
  list: CompanySummary[];
  pageNo: number;
  pageSize: number;
}

// =====================
// Requests
// =====================

export interface CompanyDetailQuery {
  companyName: string;

  /** 1 = buyer (CONSIGNEE), 2 = supplier (SHIPPER) */
  companyType: "1" | "2";

  dateStart: string;
  dateEnd: string;

  /** optional narrowing */
  goodsDesc?: string[];
  hsCode?: string[];

  /** frontend-controlled pagination */
  pageNo: number;
}

// =====================
// Aggregated Response
// =====================

export interface CompanyDetailResponse {
  company: {
    name: string;
    role: "buyer" | "supplier";
    dateRange: {
      start: string;
      end: string;
    };
  };

  summary: {
    tradeCount: number;

    totalQuantity?: number;
    quantityUnit?: string;

    totalWeight?: number;
    weightUnit?: string;

    totalValue?: number;
    valueUnit?: string;

    products: number;
    partners: number;
    countries: number;
    ports: number;
  };

  products: CompanyProductSummary[];
  partners: CompanyPartnerSummary[];
  countries: CompanyCountrySummary[];
  ports: CompanyPortSummary[];

  /** raw trades for THIS PAGE ONLY */
  trades: TradeRecord[];

  pagination: {
    pageNo: number;
    pageSize: number;
    totalRows: number;
  };
}

// =====================
// Supporting Types
// =====================

export interface CompanyProductSummary {
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

export interface CompanyPartnerSummary {
  companyName: string;
  country?: string;

  tradeCount: number;

  totalQuantity?: number;
  totalWeight?: number;
  totalValue?: number;
}

export interface CompanyCountrySummary {
  country: string;

  tradeCount: number;

  totalQuantity?: number;
  totalWeight?: number;
  totalValue?: number;
}

export interface CompanyPortSummary {
  country: string;
  port: string;

  tradeCount: number;

  totalQuantity?: number;
  totalWeight?: number;
  totalValue?: number;
}

export interface CompanyEnrichmentResponse {
  companyName: string;
  entities: CompanyEnrichedEntity[];
}

export interface CompanyEnrichedEntity {
  // base (selectReferenceCheck)
  companyNameInternat: string;
  companyNameNative: string;
  companyRefId: string;
  website?: string;
  address?: string;
  businessCategory?: string;
  status: string;
  companyScale: string;

  // details (selectReferenceCheckDetails)
  details?: {
    registeredAddress?: string;
    revenue?: string;
    phone?: string;
    nAICSMainIndustryName?: string;
    nAICSMainInduryCode?: string;
    dateinc?: string;
    uSSICMainIndustryCode?: string;
    uSSICMainIndustryName?: string;
    nACECMainInduryCode?: string;
    nACECMainIndustryName?: string;
    email?: string;
  };
}
