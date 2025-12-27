"use client";

import { useProductInsight } from "@/hooks/useProductInsight";
import { ProductInsightQuery, TradeRecord } from "@/utils/products/types";
import { useState } from "react";

export default function ProductInsightPage() {
  const [filters, setFilters] = useState<Omit<ProductInsightQuery, "pageNo">>({
    goodsDesc: ["perfume"], // default search
    hsCode: [],
    dateStart: "2000-01-01",
    dateEnd: "2025-12-31",
    dataType: "0",
    originCountryTc: undefined,
    destCountryTc: undefined,
  });

  const {
    data,
    trades,
    progress,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useProductInsight(filters);

  const handleFilterChange = (
    newFilters: Partial<Omit<ProductInsightQuery, "pageNo">>
  ) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="p-4 space-y-6">
      {/* ----- Filters ----- */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Product name"
          value={filters.goodsDesc?.[0] || ""}
          onChange={(e) => handleFilterChange({ goodsDesc: [e.target.value] })}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={filters.dateStart}
          onChange={(e) => handleFilterChange({ dateStart: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={filters.dateEnd}
          onChange={(e) => handleFilterChange({ dateEnd: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() => refetch()}
          className="border px-2 py-1 rounded bg-blue-500 text-white"
        >
          Search
        </button>
      </div>

      {/* ----- Progress ----- */}
      {isFetchingNextPage || isFetching ? (
        <div>
          Fetching results… {progress.fetchedPages} / {progress.totalPages}
          {/* <Spinner className="ml-2" /> */}
        </div>
      ) : null}

      {/* ----- Product Summary ----- */}
      {data ? (
        <div className="border p-4 rounded space-y-2">
          <h2 className="text-lg font-bold">Product Overview</h2>
          <div>Goods: {data.product.goodsDesc?.join(", ")}</div>
          <div>HS Codes: {data.product.hsCode?.join(", ")}</div>
          <div>
            Date range: {data.product.dateRange.start} —{" "}
            {data.product.dateRange.end}
          </div>
          <div>Trade Count: {data.summary.tradeCount}</div>
          <div>Total Quantity: {data.summary.totalQuantity}</div>
          <div>Total Weight: {data.summary.totalWeight}</div>
          <div>Total Value: {data.summary.totalValue}</div>
          <div>Buyers: {data.summary.buyers}</div>
          <div>Suppliers: {data.summary.suppliers}</div>
          <div>Countries: {data.summary.countries}</div>
          <div>Ports: {data.summary.ports}</div>
        </div>
      ) : null}

      {/* ----- Buyers Table ----- */}
      {data?.buyers.length ? (
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold">Top Buyers</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Buyer</th>
                <th className="border px-2 py-1">Country</th>
                <th className="border px-2 py-1">Trade Count</th>
                <th className="border px-2 py-1">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.buyers.map((b) => (
                <tr key={b.companyName}>
                  <td className="border px-2 py-1">{b.companyName}</td>
                  <td className="border px-2 py-1">{b.country}</td>
                  <td className="border px-2 py-1">{b.tradeCount}</td>
                  <td className="border px-2 py-1">{b.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* ----- Suppliers Table ----- */}
      {data?.suppliers.length ? (
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold">Top Suppliers</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">Country</th>
                <th className="border px-2 py-1">Trade Count</th>
                <th className="border px-2 py-1">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((s) => (
                <tr key={s.companyName}>
                  <td className="border px-2 py-1">{s.companyName}</td>
                  <td className="border px-2 py-1">{s.country}</td>
                  <td className="border px-2 py-1">{s.tradeCount}</td>
                  <td className="border px-2 py-1">{s.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* ----- Raw Trades ----- */}
      {trades.length ? (
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold">Raw Trades</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">HS Code</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Port</th>
                <th className="border px-2 py-1">Country</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t: TradeRecord, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{t.date}</td>
                  <td className="border px-2 py-1">{t.goodsDesc}</td>
                  <td className="border px-2 py-1">{t.hsCode}</td>
                  <td className="border px-2 py-1">{t.quantity}</td>
                  <td className="border px-2 py-1">{t.source}</td>
                  <td className="border px-2 py-1">{t.destCountry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* ----- Load More Button (optional) ----- */}
      {/* {hasNextPage && !isFetchingNextPage ? (
        <button onClick={() => fetchNextPage()} className="border px-2 py-1 rounded bg-blue-500 text-white">
          Load More
        </button>
      ) : null} */}
    </div>
  );
}
