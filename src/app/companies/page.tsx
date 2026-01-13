"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanyDetail } from "@/hooks/useCompanyDetail";
import { useCompanyEnrichment } from "@/hooks/useCompanyEnrichment";
import { CompanyDetailQuery } from "@/utils/companies/types";
import { getDefaultDateRange } from "@/utils/constants";
import { convertToCSV, downloadCSV, formatDateForFilename } from "@/utils/csv";
import { cleanGoodsDescription } from "@/utils/textCleaning";
import { Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyDetailPage() {
  const searchParams = useSearchParams();
  const defaultDates = getDefaultDateRange();

  // Initialize state from URL params immediately
  const nameParam = searchParams.get("name");
  const typeParam = searchParams.get("type");

  // Normalize type parameter to "1" or "2"
  const normalizedType = (): "1" | "2" => {
    if (!typeParam) return "1";
    // Handle "1", "2", "Buyer", "Supplier", etc.
    if (typeParam === "2" || typeParam.toLowerCase().includes("supplier")) {
      return "2";
    }
    return "1";
  };

  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<"1" | "2">("1");
  const [dateStart, setDateStart] = useState(defaultDates.start);
  const [dateEnd, setDateEnd] = useState(defaultDates.end);
  const [goodsDesc, setGoodsDesc] = useState<string[]>([]);
  const [hsCode, setHsCode] = useState<string[]>([]);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  // Sync state with URL params on mount and when params change
  useEffect(() => {
    if (nameParam && nameParam !== companyName) {
      setCompanyName(nameParam);
      setCompanyType(normalizedType());
      setHasAutoFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameParam, typeParam]);

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
  } = useCompanyDetail(queryParams, 200, hasAutoFetched);

  const {
    enrichment,
    loading: enrichmentLoading,
    error: enrichmentError,
    fetchEnrichment,
  } = useCompanyEnrichment(companyName, hasAutoFetched);

  const handleApply = () => {
    setHasAutoFetched(true); // Enable enrichment query
    refetch();
  };

  const handleExportCSV = () => {
    if (!data || trades.length === 0) return;

    let allCSV = "";

    // Summary Section
    const summary = [
      { Field: "Company Name", Value: data.company.name },
      { Field: "Role", Value: data.company.role },
      {
        Field: "Date Range",
        Value: `${data.company.dateRange.start} to ${data.company.dateRange.end}`,
      },
      { Field: "Trade Count", Value: data.summary.tradeCount },
      {
        Field: "Total Quantity",
        Value: `${data.summary.totalQuantity || "-"} ${
          data.summary.quantityUnit || ""
        }`,
      },
      {
        Field: "Total Weight",
        Value: `${data.summary.totalWeight || "-"} ${
          data.summary.weightUnit || ""
        }`,
      },
      {
        Field: "Total Value",
        Value: `${data.summary.totalValue || "-"} ${
          data.summary.valueUnit || ""
        }`,
      },
      { Field: "Products", Value: data.summary.products },
      { Field: "Partners", Value: data.summary.partners },
      { Field: "Countries", Value: data.summary.countries },
      { Field: "Ports", Value: data.summary.ports },
    ];
    allCSV += "SUMMARY\n" + convertToCSV(summary) + "\n\n";

    // Contact Enrichment Section
    if (enrichment?.entities && enrichment.entities.length > 0) {
      const enrichmentData = enrichment.entities.map((e) => ({
        "Company Name (International)": e.companyNameInternat,
        "Company Name (Native)": e.companyNameNative,
        "Company Ref ID": e.companyRefId,
        Website: e.website || "-",
        Address: e.address || "-",
        "Business Category": e.businessCategory || "-",
        Status: e.status,
        "Company Scale": e.companyScale,
        "Registered Address": e.details?.registeredAddress || "-",
        Revenue: e.details?.revenue || "-",
        Phone: e.details?.phone || "-",
        Email: e.details?.email || "-",
        "NAICS Main Industry": e.details?.nAICSMainIndustryName || "-",
        "NAICS Code": e.details?.nAICSMainInduryCode || "-",
        "USSIC Code": e.details?.uSSICMainIndustryCode || "-",
        "USSIC Industry": e.details?.uSSICMainIndustryName || "-",
        "NACEC Code": e.details?.nACECMainInduryCode || "-",
        "NACEC Industry": e.details?.nACECMainIndustryName || "-",
        "Date Incorporated": e.details?.dateinc || "-",
      }));
      allCSV += "CONTACT ENRICHMENT\n" + convertToCSV(enrichmentData) + "\n\n";
    }

    // Products Section
    if (data.products.length > 0) {
      const products = data.products.map((p) => ({
        Goods: cleanGoodsDescription(p.goodsDesc),
        "HS Codes": p.hsCodes.join("; "),
        "Trade Count": p.tradeCount,
        Quantity: `${p.totalQuantity || "-"} ${p.quantityUnit || ""}`,
        Weight: `${p.totalWeight || "-"} ${p.weightUnit || ""}`,
        Value: `${p.totalValue || "-"} ${p.valueUnit || ""}`,
      }));
      allCSV += "PRODUCTS\n" + convertToCSV(products) + "\n\n";
    }

    // Partners Section
    if (data.partners.length > 0) {
      const partners = data.partners.map((p) => ({
        Company: p.companyName,
        Country: p.country || "-",
        "Trade Count": p.tradeCount,
        Quantity: p.totalQuantity || "-",
        Weight: p.totalWeight || "-",
        Value: p.totalValue || "-",
      }));
      allCSV += "TRADING PARTNERS\n" + convertToCSV(partners) + "\n\n";
    }

    // Raw Trades Section
    const tradesForCSV = trades.map((t) => ({
      Date: t.date || "-",
      "Goods Description": cleanGoodsDescription(t.goodsDesc),
      "HS Code": t.hsCode,
      Quantity: t.quantity || "-",
      "Quantity Unit": t.quantityUnit || "-",
      Weight: t.weight || "-",
      "Weight Unit": t.weightUnit || "-",
      Value: t.value || "-",
      "Value Unit": t.valueUnit || "-",
      "Origin Country": t.originCountry || "-",
      "Destination Country": t.destCountry || "-",
    }));
    allCSV += "RAW TRADES\n" + convertToCSV(tradesForCSV);

    const filename = `company-${companyName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}-complete-${formatDateForFilename()}.csv`;
    downloadCSV(allCSV, filename);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Details</h1>
        <p className="text-gray-600 mt-1">
          View detailed trade information for a specific company
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select
                value={companyType}
                onValueChange={(value: "1" | "2") => setCompanyType(value)}
              >
                <SelectTrigger id="companyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Buyer</SelectItem>
                  <SelectItem value="2">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateStart">Start Date</Label>
              <Input
                id="dateStart"
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEnd">End Date</Label>
              <Input
                id="dateEnd"
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goodsDesc">Goods Description</Label>
              <Input
                id="goodsDesc"
                type="text"
                placeholder="Comma separated"
                value={goodsDesc.join(",")}
                onChange={(e) =>
                  setGoodsDesc(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hsCode">HS Code</Label>
              <Input
                id="hsCode"
                type="text"
                placeholder="Comma separated"
                value={hsCode.join(",")}
                onChange={(e) =>
                  setHsCode(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="cursor-pointer">
              Apply Filters
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={trades.length === 0}
              variant="outline"
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV ({trades.length} trades)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {(isFetching || isFetchingNextPage) && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-gray-600">
                {isFetchingNextPage
                  ? `Fetching pages: ${progress.fetchedPages} / ${progress.totalPages}`
                  : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {enrichmentLoading && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-gray-600">Loading contact enrichment...</p>
            </div>
          </CardContent>
        </Card>
      )}
      {enrichmentError && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">{enrichmentError}</p>
          </CardContent>
        </Card>
      )}

      {enrichment?.entities.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Contact Enrichment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {enrichment.entities.map((e) => (
              <div
                key={e.companyRefId}
                className="border-t first:border-t-0 pt-4 first:pt-0 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Company (International)
                    </p>
                    <p className="text-gray-900">{e.companyNameInternat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Native Name
                    </p>
                    <p className="text-gray-900">{e.companyNameNative}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Website</p>
                    <p className="text-gray-900">{e.website ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">{e.address ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Business Category
                    </p>
                    <p className="text-gray-900">{e.businessCategory ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-gray-900">{e.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Company Scale
                    </p>
                    <p className="text-gray-900">{e.companyScale}</p>
                  </div>
                </div>

                {e.details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Registered Address
                      </p>
                      <p className="text-gray-900">
                        {e.details.registeredAddress ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Revenue
                      </p>
                      <p className="text-gray-900">
                        {e.details.revenue ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{e.details.phone ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{e.details.email ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        NAICS Industry
                      </p>
                      <p className="text-gray-900">
                        {e.details.nAICSMainIndustryName ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Date Incorporated
                      </p>
                      <p className="text-gray-900">
                        {e.details.dateinc ?? "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">
              Failed to load company data
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.company.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.company.role}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.company.dateRange.start} — {data.company.dateRange.end}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trade Count</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.tradeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalQuantity || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {data.summary.quantityUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalWeight || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {data.summary.weightUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalValue || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {data.summary.valueUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.products}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Partners</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.partners}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.countries}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ports</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.ports}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      {data?.products.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goods</TableHead>
                  <TableHead>HS Codes</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.map((p) => (
                  <TableRow key={p.goodsDesc} className="hover:bg-gray-50">
                    <TableCell>{cleanGoodsDescription(p.goodsDesc)}</TableCell>
                    <TableCell>{p.hsCodes.join(", ")}</TableCell>
                    <TableCell>{p.tradeCount}</TableCell>
                    <TableCell>
                      {p.totalQuantity ?? "-"} {p.quantityUnit ?? ""}
                    </TableCell>
                    <TableCell>
                      {p.totalWeight ?? "-"} {p.weightUnit ?? ""}
                    </TableCell>
                    <TableCell>
                      {p.totalValue ?? "-"} {p.valueUnit ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Partners */}
      {data?.partners.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Trading Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.partners.map((p) => (
                  <TableRow key={p.companyName} className="hover:bg-gray-50">
                    <TableCell>{p.companyName}</TableCell>
                    <TableCell>{p.country ?? "-"}</TableCell>
                    <TableCell>{p.tradeCount}</TableCell>
                    <TableCell>{p.totalQuantity ?? "-"}</TableCell>
                    <TableCell>{p.totalWeight ?? "-"}</TableCell>
                    <TableCell>{p.totalValue ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Raw trades */}
      {trades.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Raw Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Goods</TableHead>
                  <TableHead>HS Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t, idx) => (
                  <TableRow key={t.id ?? idx} className="hover:bg-gray-50">
                    <TableCell>{t.date ?? "-"}</TableCell>
                    <TableCell>{cleanGoodsDescription(t.goodsDesc)}</TableCell>
                    <TableCell>{t.hsCode}</TableCell>
                    <TableCell>
                      {t.quantity ?? "-"} {t.quantityUnit ?? ""}
                    </TableCell>
                    <TableCell>
                      {t.weight ?? "-"} {t.weightUnit ?? ""}
                    </TableCell>
                    <TableCell>
                      {t.value ?? "-"} {t.valueUnit ?? ""}
                    </TableCell>
                    <TableCell>{t.originCountry ?? "-"}</TableCell>
                    <TableCell>{t.destCountry ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
