"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductInsight } from "@/hooks/useProductInsight";
import { getDefaultDateRange } from "@/utils/constants";
import { convertToCSV, downloadCSV, formatDateForFilename } from "@/utils/csv";
import { ProductInsightQuery, TradeRecord } from "@/utils/products/types";
import { cleanGoodsDescription } from "@/utils/textCleaning";
import { Download, Loader2, Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductInsightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultDates = getDefaultDateRange();

  const [filters, setFilters] = useState<Omit<ProductInsightQuery, "pageNo">>({
    goodsDesc: [],
    hsCode: [],
    dateStart: defaultDates.start,
    dateEnd: defaultDates.end,
    dataType: "0",
    originCountryTc: undefined,
    destCountryTc: undefined,
  });

  const [hasSearched, setHasSearched] = useState(false);

  // Read URL params on mount and trigger search
  useEffect(() => {
    const goodsDescParam = searchParams.get("goodsDesc");

    if (goodsDescParam) {
      setFilters((prev) => ({
        ...prev,
        goodsDesc: goodsDescParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      setHasSearched(true);
    }
  }, [searchParams]);

  const {
    data,
    trades,
    progress,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useProductInsight(filters, hasSearched);

  const handleFilterChange = (
    newFilters: Partial<Omit<ProductInsightQuery, "pageNo">>
  ) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleExportCSV = () => {
    if (!data || trades.length === 0) return;

    let allCSV = "";

    // Summary Section
    const summary = [
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
      { Field: "Buyers", Value: data.summary.buyers },
      { Field: "Suppliers", Value: data.summary.suppliers },
      { Field: "Countries", Value: data.summary.countries },
      { Field: "Ports", Value: data.summary.ports },
    ];
    allCSV += "SUMMARY\n" + convertToCSV(summary) + "\n\n";

    // Buyers Section
    if (data.buyers.length > 0) {
      const buyers = data.buyers.map((b) => ({
        Company: b.companyName,
        Country: b.country || "-",
        "Trade Count": b.tradeCount,
        Quantity: b.totalQuantity || "-",
        Weight: b.totalWeight || "-",
        Value: b.totalValue || "-",
      }));
      allCSV += "TOP BUYERS\n" + convertToCSV(buyers) + "\n\n";
    }

    // Suppliers Section
    if (data.suppliers.length > 0) {
      const suppliers = data.suppliers.map((s) => ({
        Company: s.companyName,
        Country: s.country || "-",
        "Trade Count": s.tradeCount,
        Quantity: s.totalQuantity || "-",
        Weight: s.totalWeight || "-",
        Value: s.totalValue || "-",
      }));
      allCSV += "TOP SUPPLIERS\n" + convertToCSV(suppliers) + "\n\n";
    }

    // Countries Section
    if (data.countries.length > 0) {
      const countries = data.countries.map((c) => ({
        Country: c.country,
        "Trade Count": c.tradeCount,
        Quantity: c.totalQuantity || "-",
        Weight: c.totalWeight || "-",
        Value: c.totalValue || "-",
      }));
      allCSV += "COUNTRIES\n" + convertToCSV(countries) + "\n\n";
    }

    // Ports Section
    if (data.ports.length > 0) {
      const ports = data.ports.map((p) => ({
        Port: p.port || "Unknown",
        Country: p.country,
        "Trade Count": p.tradeCount,
        Quantity: p.totalQuantity || "-",
        Weight: p.totalWeight || "-",
        Value: p.totalValue || "-",
      }));
      allCSV += "PORTS\n" + convertToCSV(ports) + "\n\n";
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

    const productName = filters.goodsDesc?.[0] || "product";
    const filename = `product-${productName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}-complete-${formatDateForFilename()}.csv`;
    downloadCSV(allCSV, filename);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Product Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                type="text"
                placeholder="Enter product name"
                value={filters.goodsDesc?.[0] || ""}
                onChange={(e) =>
                  handleFilterChange({ goodsDesc: [e.target.value] })
                }
              />
            </div>
            <div>
              <Label htmlFor="date-start">Start Date</Label>
              <Input
                id="date-start"
                type="date"
                value={filters.dateStart}
                onChange={(e) =>
                  handleFilterChange({ dateStart: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="date-end">End Date</Label>
              <Input
                id="date-end"
                type="date"
                value={filters.dateEnd}
                onChange={(e) =>
                  handleFilterChange({ dateEnd: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => {
                setHasSearched(true);
                refetch();
              }}
              className="cursor-pointer"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={trades.length === 0}
              variant="outline"
              className="cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV ({trades.length} trades)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(isFetchingNextPage || isFetching) && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-gray-600">
                {isFetchingNextPage
                  ? `Fetching results… ${progress.fetchedPages} / ${progress.totalPages}`
                  : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Summary */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Product Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Product Description</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.product.goodsDesc?.join(", ")}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">HS Codes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.product.hsCode?.join(", ")}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.product.dateRange.start} — {data.product.dateRange.end}
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
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalWeight || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalValue || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Buyers</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.buyers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.summary.suppliers}
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

      {/* Buyers Table */}
      {data?.buyers.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Trade Count</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.buyers.map((b) => (
                  <TableRow
                    key={b.companyName}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      router.push(
                        `/companies?name=${encodeURIComponent(
                          b.companyName
                        )}&type=1`
                      )
                    }
                  >
                    <TableCell className="text-blue-600 hover:underline">
                      {b.companyName}
                    </TableCell>
                    <TableCell>{b.country}</TableCell>
                    <TableCell>{b.tradeCount}</TableCell>
                    <TableCell>{b.totalQuantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Suppliers Table */}
      {data?.suppliers.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Trade Count</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.suppliers.map((s) => (
                  <TableRow
                    key={s.companyName}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      router.push(
                        `/companies?name=${encodeURIComponent(
                          s.companyName
                        )}&type=2`
                      )
                    }
                  >
                    <TableCell className="text-blue-600 hover:underline">
                      {s.companyName}
                    </TableCell>
                    <TableCell>{s.country}</TableCell>
                    <TableCell>{s.tradeCount}</TableCell>
                    <TableCell>{s.totalQuantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Raw Trades */}
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
                  <TableHead>Product</TableHead>
                  <TableHead>HS Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t: TradeRecord, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{cleanGoodsDescription(t.goodsDesc)}</TableCell>
                    <TableCell>{t.hsCode}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{t.source}</TableCell>
                    <TableCell>{t.destCountry}</TableCell>
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
