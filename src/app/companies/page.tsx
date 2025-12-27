"use client";

import { useCompanyDetail } from "@/hooks/useCompanyDetail";
import { useCompanyEnrichment } from "@/hooks/useCompanyEnrichment";
import { CompanyDetailQuery } from "@/utils/companies/types";
import { useState } from "react";

export default function CompanyDetailPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<"1" | "2">("1"); // 1 = buyer, 2 = supplier
  const [dateStart, setDateStart] = useState("2000-01-01");
  const [dateEnd, setDateEnd] = useState(
    `${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${new Date().getDate()}`
  );
  const [goodsDesc, setGoodsDesc] = useState<string[]>([]);
  const [hsCode, setHsCode] = useState<string[]>([]);

  const queryParams: Omit<CompanyDetailQuery, "pageNo"> = {
    companyName,
    companyType,
    dateStart,
    dateEnd,
    goodsDesc,
    hsCode,
  };

  const {
    data,
    trades,
    progress,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
  } = useCompanyDetail(queryParams);

  const {
    enrichment,
    loading: enrichmentLoading,
    error: enrichmentError,
    fetchEnrichment,
  } = useCompanyEnrichment(companyName);

  const handleApply = () => {
    refetch();
    fetchEnrichment();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Company Detail</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <select
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value as "1" | "2")}
          className="border px-2 py-1 rounded"
        >
          <option value="1">Buyer</option>
          <option value="2">Supplier</option>
        </select>

        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Goods Desc (comma separated)"
          value={goodsDesc.join(",")}
          onChange={(e) =>
            setGoodsDesc(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="HS Code (comma separated)"
          value={hsCode.join(",")}
          onChange={(e) =>
            setHsCode(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="border px-2 py-1 rounded"
        />
      </div>

      <button
        onClick={handleApply}
        className="bg-green-500 text-white px-4 py-1 rounded mb-4"
      >
        Apply Filters
      </button>

      {/* Progress Indicator */}
      <div className="mb-4">
        {progress.fetchedPages > 0 && (
          <p>
            Fetched pages: {progress.fetchedPages} / {progress.totalPages}
          </p>
        )}
        {isFetchingNextPage && <p>Fetching next page...</p>}
      </div>

      {enrichmentLoading && <p>Loading contact enrichment...</p>}
      {enrichmentError && <p className="text-red-500">{enrichmentError}</p>}

      {enrichment?.entities.length ? (
        <div className="mb-4 border p-2 rounded">
          <h2 className="font-bold">Contact Enrichment</h2>
          {enrichment.entities.map((e) => (
            <div key={e.companyRefId} className="border-t pt-2 mt-2">
              <p>
                <strong>Company:</strong> {e.companyNameInternat}
              </p>
              <p>
                <strong>Native Name:</strong> {e.companyNameNative}
              </p>
              <p>
                <strong>Website:</strong> {e.website ?? "-"}
              </p>
              <p>
                <strong>Address:</strong> {e.address ?? "-"}
              </p>
              <p>
                <strong>Business Category:</strong> {e.businessCategory ?? "-"}
              </p>
              <p>
                <strong>Status:</strong> {e.status}
              </p>
              <p>
                <strong>Scale:</strong> {e.companyScale}
              </p>

              {e.details && (
                <>
                  <p>
                    <strong>Registered Address:</strong>{" "}
                    {e.details.registeredAddress ?? "-"}
                  </p>
                  <p>
                    <strong>Revenue:</strong> {e.details.revenue ?? "-"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {e.details.phone ?? "-"}
                  </p>
                  <p>
                    <strong>Email:</strong> {e.details.email ?? "-"}
                  </p>
                  <p>
                    <strong>Main NAICS:</strong>{" "}
                    {e.details.nAICSMainIndustryName ?? "-"}
                  </p>
                  <p>
                    <strong>Date Incorporated:</strong>{" "}
                    {e.details.dateinc ?? "-"}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-4">Failed to load company data</p>
      )}

      {/* Summary */}
      {data && (
        <div className="mb-4 border p-2 rounded">
          <h2 className="font-bold">Summary</h2>
          <p>Company: {data.company.name}</p>
          <p>Role: {data.company.role}</p>
          <p>
            Date Range: {data.company.dateRange.start} →{" "}
            {data.company.dateRange.end}
          </p>
          <p>Trades: {data.summary.tradeCount}</p>
          {data.summary.totalQuantity && (
            <p>
              Total Quantity: {data.summary.totalQuantity}{" "}
              {data.summary.quantityUnit}
            </p>
          )}
          {data.summary.totalWeight && (
            <p>
              Total Weight: {data.summary.totalWeight} {data.summary.weightUnit}
            </p>
          )}
          {data.summary.totalValue && (
            <p>
              Total Value: {data.summary.totalValue} {data.summary.valueUnit}
            </p>
          )}
          <p>Products: {data.summary.products}</p>
          <p>Partners: {data.summary.partners}</p>
          <p>Countries: {data.summary.countries}</p>
          <p>Ports: {data.summary.ports}</p>
        </div>
      )}

      {/* Products */}
      {data?.products.length ? (
        <div className="mb-4 border p-2 rounded">
          <h2 className="font-bold">Products</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Goods</th>
                <th className="border px-2 py-1">HS Codes</th>
                <th className="border px-2 py-1">Trades</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.goodsDesc}>
                  <td className="border px-2 py-1">{p.goodsDesc}</td>
                  <td className="border px-2 py-1">{p.hsCodes.join(", ")}</td>
                  <td className="border px-2 py-1">{p.tradeCount}</td>
                  <td className="border px-2 py-1">
                    {p.totalQuantity ?? "-"} {p.quantityUnit ?? ""}
                  </td>
                  <td className="border px-2 py-1">
                    {p.totalWeight ?? "-"} {p.weightUnit ?? ""}
                  </td>
                  <td className="border px-2 py-1">
                    {p.totalValue ?? "-"} {p.valueUnit ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Partners */}
      {data?.partners.length ? (
        <div className="mb-4 border p-2 rounded">
          <h2 className="font-bold">Trading Partners</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Company</th>
                <th className="border px-2 py-1">Country</th>
                <th className="border px-2 py-1">Trades</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.partners.map((p) => (
                <tr key={p.companyName}>
                  <td className="border px-2 py-1">{p.companyName}</td>
                  <td className="border px-2 py-1">{p.country ?? "-"}</td>
                  <td className="border px-2 py-1">{p.tradeCount}</td>
                  <td className="border px-2 py-1">{p.totalQuantity ?? "-"}</td>
                  <td className="border px-2 py-1">{p.totalWeight ?? "-"}</td>
                  <td className="border px-2 py-1">{p.totalValue ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Raw trades */}
      {trades.length ? (
        <div className="mb-4 border p-2 rounded">
          <h2 className="font-bold">Raw Trades</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Goods</th>
                <th className="border px-2 py-1">HS Code</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Value</th>
                <th className="border px-2 py-1">Origin</th>
                <th className="border px-2 py-1">Destination</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, idx) => (
                <tr key={t.id ?? idx}>
                  <td className="border px-2 py-1">{t.date ?? "-"}</td>
                  <td className="border px-2 py-1">{t.goodsDesc}</td>
                  <td className="border px-2 py-1">{t.hsCode}</td>
                  <td className="border px-2 py-1">
                    {t.quantity ?? "-"} {t.quantityUnit ?? ""}
                  </td>
                  <td className="border px-2 py-1">
                    {t.weight ?? "-"} {t.weightUnit ?? ""}
                  </td>
                  <td className="border px-2 py-1">
                    {t.value ?? "-"} {t.valueUnit ?? ""}
                  </td>
                  <td className="border px-2 py-1">{t.originCountry ?? "-"}</td>
                  <td className="border px-2 py-1">{t.destCountry ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
