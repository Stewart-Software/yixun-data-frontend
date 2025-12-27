"use client";

import { listCompanies } from "@/utils/companies";
import { listProducts } from "@/utils/products";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ProductFilters = {
  goodsDesc?: string[];
  hsCode?: string[];
  originCountryTc?: string[];
  destCountryTc?: string[];
  dataType?: "0" | "1" | "2";
  dateStart: string;
  dateEnd: string;
};

type CompanyFilters = {
  companyName: string;
  companyType: "1" | "2";
  goodsDesc?: string[];
  hsCode?: string[];
  dataType?: "0" | "1" | "2";
  dateStart: string;
  dateEnd: string;
};

export default function SearchPage() {
  const [searchType, setSearchType] = useState<"company" | "product">(
    "company"
  );

  const today = new Date();

  const [productFilters, setProductFilters] = useState<ProductFilters>({
    dateStart: "2000-01-01",
    dateEnd: `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`,
    goodsDesc: [],
    hsCode: [],
    originCountryTc: [],
    destCountryTc: [],
    dataType: "0",
  });

  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
    dateStart: "2024-01-01",
    dateEnd: `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`,
    companyName: "",
    companyType: "1",
    goodsDesc: [],
    hsCode: [],
    dataType: "0",
  });

  const [pageNo, setPageNo] = useState(1);

  // Only changes when "Apply" is pressed
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const handleApplyFilters = () => {
    setPageNo(1); // reset page
    setFetchTrigger((f) => f + 1); // trigger query
  };

  // Companies query - fetch only when Apply is pressed
  const {
    data: companiesData,
    isFetching: isFetchingCompanies,
    error: companiesError,
  } = useQuery({
    queryKey: ["companies", fetchTrigger, pageNo],
    queryFn: () => listCompanies({ ...companyFilters, pageNo }),
    enabled: searchType === "company" && fetchTrigger > 0,
    staleTime: 30_000,
  });

  // Products query - fetch only when Apply is pressed
  const {
    data: productsData,
    isFetching: isFetchingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products", fetchTrigger, pageNo],
    queryFn: () => listProducts({ ...productFilters, pageNo }),
    enabled: searchType === "product" && fetchTrigger > 0,
    staleTime: 30_000,
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Search</h1>

      {/* Search type toggle */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            searchType === "company" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSearchType("company")}
        >
          Companies
        </button>
        <button
          className={`px-4 py-2 rounded ${
            searchType === "product" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSearchType("product")}
        >
          Products
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {/* Common date range */}
        <input
          type="date"
          value={
            searchType === "company"
              ? companyFilters.dateStart
              : productFilters.dateStart
          }
          onChange={(e) =>
            searchType === "company"
              ? setCompanyFilters({
                  ...companyFilters,
                  dateStart: e.target.value,
                })
              : setProductFilters({
                  ...productFilters,
                  dateStart: e.target.value,
                })
          }
        />
        <input
          type="date"
          value={
            searchType === "company"
              ? companyFilters.dateEnd
              : productFilters.dateEnd
          }
          onChange={(e) =>
            searchType === "company"
              ? setCompanyFilters({
                  ...companyFilters,
                  dateEnd: e.target.value,
                })
              : setProductFilters({
                  ...productFilters,
                  dateEnd: e.target.value,
                })
          }
        />

        {searchType === "company" ? (
          <>
            <input
              type="text"
              placeholder="Company Name"
              value={companyFilters.companyName}
              onChange={(e) =>
                setCompanyFilters({
                  ...companyFilters,
                  companyName: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />
            <select
              value={companyFilters.companyType}
              onChange={(e) =>
                setCompanyFilters({
                  ...companyFilters,
                  companyType: e.target.value as "1" | "2",
                })
              }
              className="border px-2 py-1 rounded"
            >
              <option value="1">Buyer</option>
              <option value="2">Supplier</option>
            </select>
            <input
              type="text"
              placeholder="Goods Desc (comma separated)"
              value={companyFilters.goodsDesc?.join(",") || ""}
              onChange={(e) =>
                setCompanyFilters({
                  ...companyFilters,
                  goodsDesc: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="HS Code (comma separated)"
              value={companyFilters.hsCode?.join(",") || ""}
              onChange={(e) =>
                setCompanyFilters({
                  ...companyFilters,
                  hsCode: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Goods Desc (comma separated)"
              value={productFilters.goodsDesc?.join(",") || ""}
              onChange={(e) =>
                setProductFilters({
                  ...productFilters,
                  goodsDesc: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="HS Code (comma separated)"
              value={productFilters.hsCode?.join(",") || ""}
              onChange={(e) =>
                setProductFilters({
                  ...productFilters,
                  hsCode: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Origin Country (comma separated)"
              value={productFilters.originCountryTc?.join(",") || ""}
              onChange={(e) =>
                setProductFilters({
                  ...productFilters,
                  originCountryTc: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Destination Country (comma separated)"
              value={productFilters.destCountryTc?.join(",") || ""}
              onChange={(e) =>
                setProductFilters({
                  ...productFilters,
                  destCountryTc: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="border px-2 py-1 rounded"
            />
            <select
              value={productFilters.dataType}
              onChange={(e) =>
                setProductFilters({
                  ...productFilters,
                  dataType: e.target.value as "0" | "1" | "2",
                })
              }
              className="border px-2 py-1 rounded"
            >
              <option value="0">All</option>
              <option value="1">Import</option>
              <option value="2">Export</option>
            </select>
          </>
        )}
      </div>

      <button
        onClick={handleApplyFilters}
        className="bg-green-500 text-white px-4 py-1 rounded mb-4"
      >
        Apply
      </button>

      {/* Pagination */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPageNo((p) => Math.max(p - 1, 1))}
          disabled={pageNo === 1}
        >
          Previous
        </button>
        <span>Page {pageNo}</span>
        <button onClick={() => setPageNo((p) => p + 1)}>Next</button>
      </div>

      {/* Results */}
      <div>
        {searchType === "company" ? (
          <>
            {isFetchingCompanies && <p>Loading companies...</p>}
            {companiesError && <p>Error fetching companies</p>}
            {companiesData?.list?.map((c) => (
              <div key={c.companyName} className="border p-2 mb-2">
                <p>Name: {c.companyName}</p>
                <p>Type: {c.companyType}</p>
                <p>Trades: {c.tradeCount}</p>
                <p>Quantity: {c.totalQuantity ?? "N/A"}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            {isFetchingProducts && <p>Loading products...</p>}
            {productsError && <p>Error fetching products</p>}

            {productsData && (
              <>
                {/* ===== Summary ===== */}
                <div className="border p-3 mb-4 rounded bg-gray-50">
                  <h2 className="font-semibold mb-2">Summary</h2>
                  <p>Trades: {productsData.summary.tradeCount}</p>
                  <p>
                    Quantity: {productsData.summary.totalQuantity ?? "N/A"}{" "}
                    {productsData.summary.quantityUnit ?? ""}
                  </p>
                  <p>
                    Weight: {productsData.summary.totalWeight ?? "N/A"}{" "}
                    {productsData.summary.weightUnit ?? ""}
                  </p>
                  <p>
                    Value: {productsData.summary.totalValue ?? "N/A"}{" "}
                    {productsData.summary.valueUnit ?? ""}
                  </p>
                  <p>Buyers: {productsData.summary.buyers}</p>
                  <p>Suppliers: {productsData.summary.suppliers}</p>
                  <p>Countries: {productsData.summary.countries}</p>
                  <p>Ports: {productsData.summary.ports}</p>
                </div>

                {/* ===== Buyers ===== */}
                <h2 className="text-lg font-semibold mt-4">Top Buyers</h2>
                {productsData.buyers.map((b) => (
                  <div key={b.companyName} className="border p-2 mb-2">
                    <p>
                      <strong>{b.companyName}</strong>
                    </p>
                    <p>Country: {b.country ?? "N/A"}</p>
                    <p>Trades: {b.tradeCount}</p>
                    <p>Quantity: {b.totalQuantity ?? "N/A"}</p>
                  </div>
                ))}

                {/* ===== Suppliers ===== */}
                <h2 className="text-lg font-semibold mt-4">Top Suppliers</h2>
                {productsData.suppliers.map((s) => (
                  <div key={s.companyName} className="border p-2 mb-2">
                    <p>
                      <strong>{s.companyName}</strong>
                    </p>
                    <p>Country: {s.country ?? "N/A"}</p>
                    <p>Trades: {s.tradeCount}</p>
                    <p>Quantity: {s.totalQuantity ?? "N/A"}</p>
                  </div>
                ))}

                {/* ===== Countries ===== */}
                <h2 className="text-lg font-semibold mt-4">Countries</h2>
                {productsData.countries.map((c) => (
                  <div key={c.country} className="border p-2 mb-2">
                    <p>
                      <strong>{c.country}</strong>
                    </p>
                    <p>Trades: {c.tradeCount}</p>
                    <p>Quantity: {c.totalQuantity ?? "N/A"}</p>
                  </div>
                ))}

                {/* ===== Ports ===== */}
                <h2 className="text-lg font-semibold mt-4">Ports</h2>
                {productsData.ports.map((p) => (
                  <div
                    key={`${p.country}-${p.port}`}
                    className="border p-2 mb-2"
                  >
                    <p>
                      <strong>{p.port ?? "Unknown Port"}</strong>
                    </p>
                    <p>Country: {p.country}</p>
                    <p>Trades: {p.tradeCount}</p>
                  </div>
                ))}

                {/* ===== Trades (paged rows) ===== */}
                <h2 className="text-lg font-semibold mt-4">
                  Trades (this page)
                </h2>
                {productsData.trades.map((t, i) => (
                  <div key={i} className="border p-2 mb-2 text-sm">
                    <p>{t.date}</p>
                    <p>{t.goodsDesc}</p>
                    <p>HS: {t.hsCode}</p>
                    <p>Qty: {t.quantity}</p>
                    <p>Origin: {t.originCountry}</p>
                    <p>Dest: {t.destCountry}</p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
