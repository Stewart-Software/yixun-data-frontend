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
import { listCompanies } from "@/utils/companies";
import { getDefaultDateRange } from "@/utils/constants";
import { listProducts } from "@/utils/products";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [searchType, setSearchType] = useState<"company" | "product">(
    "company"
  );

  const defaultDates = getDefaultDateRange();

  const [productFilters, setProductFilters] = useState<ProductFilters>({
    dateStart: defaultDates.start,
    dateEnd: defaultDates.end,
    goodsDesc: [],
    hsCode: [],
    originCountryTc: [],
    destCountryTc: [],
    dataType: "0",
  });

  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
    dateStart: defaultDates.start,
    dateEnd: defaultDates.end,
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-600 mt-1">
          Search for companies or products in global trade data
        </p>
      </div>

      {/* Search type toggle */}
      <div className="flex gap-2">
        <Button
          variant={searchType === "company" ? "default" : "outline"}
          onClick={() => setSearchType("company")}
          className="cursor-pointer"
        >
          Companies
        </Button>
        <Button
          variant={searchType === "product" ? "default" : "outline"}
          onClick={() => setSearchType("product")}
          className="cursor-pointer"
        >
          Products
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common date range */}
            <div className="space-y-2">
              <Label htmlFor="dateStart">Start Date</Label>
              <Input
                id="dateStart"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEnd">End Date</Label>
              <Input
                id="dateEnd"
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
            </div>

            {searchType === "company" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter company name"
                    value={companyFilters.companyName}
                    onChange={(e) =>
                      setCompanyFilters({
                        ...companyFilters,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select
                    value={companyFilters.companyType}
                    onValueChange={(value: "1" | "2") =>
                      setCompanyFilters({
                        ...companyFilters,
                        companyType: value,
                      })
                    }
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
                  <Label htmlFor="companyGoods">Goods Description</Label>
                  <Input
                    id="companyGoods"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyHsCode">HS Code</Label>
                  <Input
                    id="companyHsCode"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="productGoods">Goods Description</Label>
                  <Input
                    id="productGoods"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productHsCode">HS Code</Label>
                  <Input
                    id="productHsCode"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Input
                    id="originCountry"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destCountry">Destination Country</Label>
                  <Input
                    id="destCountry"
                    type="text"
                    placeholder="Comma separated"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select
                    value={productFilters.dataType}
                    onValueChange={(value: "0" | "1" | "2") =>
                      setProductFilters({
                        ...productFilters,
                        dataType: value,
                      })
                    }
                  >
                    <SelectTrigger id="dataType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All</SelectItem>
                      <SelectItem value="1">Import</SelectItem>
                      <SelectItem value="2">Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={handleApplyFilters}
            className="cursor-pointer w-full md:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Pagination */}
      {fetchTrigger > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((p) => Math.max(p - 1, 1))}
              disabled={pageNo === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pageNo}
              {searchType === "company" && companiesData && (
                <span className="text-gray-500">
                  {" "}
                  ({companiesData.totalInPage} results)
                </span>
              )}
              {searchType === "product" && productsData && (
                <span className="text-gray-500">
                  {" "}
                  ({productsData.trades.length} results)
                </span>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((p) => p + 1)}
              disabled={
                searchType === "company"
                  ? companiesData
                    ? companiesData.totalInPage < companiesData.pageSize
                    : false
                  : productsData
                  ? productsData.pagination.pageNo *
                      productsData.pagination.pageSize >=
                    productsData.pagination.totalRows
                  : false
              }
              className="cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {searchType === "company" ? (
          <>
            {isFetchingCompanies && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-600">
                    Loading companies...
                  </p>
                </CardContent>
              </Card>
            )}
            {companiesError && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-red-600">
                    Error fetching companies
                  </p>
                </CardContent>
              </Card>
            )}
            {companiesData?.list?.map((c) => (
              <Card
                key={c.companyName}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  const params = new URLSearchParams({
                    name: c.companyName,
                    type: c.companyType,
                  });
                  router.push(`/companies?${params.toString()}`);
                }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{c.companyName}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        <span className="text-gray-900">
                          {c.companyType === "1" ? "Buyer" : "Supplier"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Trades:</span>{" "}
                        <span className="text-gray-900">{c.tradeCount}</span>
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        <span className="text-gray-900">
                          {c.totalQuantity ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {isFetchingProducts && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-600">
                    Loading products...
                  </p>
                </CardContent>
              </Card>
            )}
            {productsError && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-red-600">
                    Error fetching products
                  </p>
                </CardContent>
              </Card>
            )}

            {productsData && (
              <div className="space-y-6">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Trades</p>
                        <p className="text-2xl font-bold">
                          {productsData.summary.tradeCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="text-2xl font-bold">
                          {productsData.summary.totalQuantity ?? "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {productsData.summary.quantityUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="text-2xl font-bold">
                          {productsData.summary.totalWeight ?? "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {productsData.summary.weightUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Value</p>
                        <p className="text-2xl font-bold">
                          {productsData.summary.totalValue ?? "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {productsData.summary.valueUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Buyers</p>
                        <p className="text-xl font-bold">
                          {productsData.summary.buyers}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Suppliers</p>
                        <p className="text-xl font-bold">
                          {productsData.summary.suppliers}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Countries</p>
                        <p className="text-xl font-bold">
                          {productsData.summary.countries}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ports</p>
                        <p className="text-xl font-bold">
                          {productsData.summary.ports}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (
                          productFilters.goodsDesc &&
                          productFilters.goodsDesc.length > 0
                        ) {
                          params.set(
                            "goodsDesc",
                            productFilters.goodsDesc.join(",")
                          );
                        }
                        router.push(`/products?${params.toString()}`);
                      }}
                      className="cursor-pointer mt-4"
                    >
                      View on Products Page
                    </Button>
                  </CardContent>
                </Card>

                {/* Buyers */}
                {productsData.buyers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Buyers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {productsData.buyers.map((b) => (
                        <div
                          key={b.companyName}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            const params = new URLSearchParams({
                              name: b.companyName,
                              type: "1",
                            });
                            router.push(`/companies?${params.toString()}`);
                          }}
                        >
                          <p className="font-semibold text-lg">
                            {b.companyName}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Country:</span>{" "}
                              {b.country ?? "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Trades:</span>{" "}
                              {b.tradeCount}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>{" "}
                              {b.totalQuantity ?? "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Suppliers */}
                {productsData.suppliers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Suppliers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {productsData.suppliers.map((s) => (
                        <div
                          key={s.companyName}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            const params = new URLSearchParams({
                              name: s.companyName,
                              type: "2",
                            });
                            router.push(`/companies?${params.toString()}`);
                          }}
                        >
                          <p className="font-semibold text-lg">
                            {s.companyName}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Country:</span>{" "}
                              {s.country ?? "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Trades:</span>{" "}
                              {s.tradeCount}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>{" "}
                              {s.totalQuantity ?? "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Countries */}
                {productsData.countries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Countries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productsData.countries.map((c) => (
                          <div key={c.country} className="p-3 border rounded">
                            <p className="font-semibold">{c.country}</p>
                            <p className="text-sm text-gray-600">
                              Trades: {c.tradeCount} | Qty:{" "}
                              {c.totalQuantity ?? "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ports */}
                {productsData.ports.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productsData.ports.map((p) => (
                          <div
                            key={`${p.country}-${p.port}`}
                            className="p-3 border rounded"
                          >
                            <p className="font-semibold">
                              {p.port ?? "Unknown Port"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {p.country} | Trades: {p.tradeCount}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trades */}
                {productsData.trades.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Trades (this page)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {productsData.trades.map((t, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded text-sm space-y-1"
                        >
                          <p className="font-medium">{t.goodsDesc}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                            <div>Date: {t.date}</div>
                            <div>HS: {t.hsCode}</div>
                            <div>Qty: {t.quantity}</div>
                            <div>Origin: {t.originCountry}</div>
                            <div>Dest: {t.destCountry}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
