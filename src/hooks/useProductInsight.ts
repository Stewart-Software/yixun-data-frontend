"use client";

import { listProducts } from "@/utils/products";
import {
  ProductInsightQuery,
  ProductInsightResponse,
  TradeRecord,
} from "@/utils/products/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

/* ---------------------------- */
/* Accumulate pages into one     */
/* ---------------------------- */
export function accumulateProductInsight(
  pages: ProductInsightResponse[]
): ProductInsightResponse {
  const base = pages[0];

  const buyersMap = new Map<string, (typeof base.buyers)[0]>();
  const suppliersMap = new Map<string, (typeof base.suppliers)[0]>();
  const countriesMap = new Map<string, (typeof base.countries)[0]>();
  const portsMap = new Map<string, (typeof base.ports)[0]>();

  let trades: TradeRecord[] = [];
  let tradeCount = 0;
  let totalQuantity = 0;
  let totalWeight = 0;
  let totalValue = 0;

  for (const page of pages) {
    tradeCount += page.summary.tradeCount;
    totalQuantity += page.summary.totalQuantity ?? 0;
    totalWeight += page.summary.totalWeight ?? 0;
    totalValue += page.summary.totalValue ?? 0;

    trades.push(...page.trades);

    page.buyers.forEach((b) => buyersMap.set(b.companyName, b));
    page.suppliers.forEach((s) => suppliersMap.set(s.companyName, s));
    page.countries.forEach((c) => countriesMap.set(c.country, c));
    page.ports.forEach((p) => portsMap.set(`${p.country}-${p.port}`, p));
  }

  return {
    product: base.product,
    summary: {
      tradeCount,
      totalQuantity,
      quantityUnit: base.summary.quantityUnit,
      totalWeight,
      weightUnit: base.summary.weightUnit,
      totalValue,
      valueUnit: base.summary.valueUnit,
      buyers: buyersMap.size,
      suppliers: suppliersMap.size,
      countries: countriesMap.size,
      ports: portsMap.size,
    },
    buyers: Array.from(buyersMap.values()),
    suppliers: Array.from(suppliersMap.values()),
    countries: Array.from(countriesMap.values()),
    ports: Array.from(portsMap.values()),
    trades,
    pagination: {
      pageNo: pages.length,
      pageSize: base.pagination.pageSize,
      totalRows: pages[pages.length - 1].pagination.totalRows,
    },
  };
}

/* ---------------------------- */
/* Hook                         */
/* ---------------------------- */
export function useProductInsight(
  params: Omit<ProductInsightQuery, "pageNo">,
  enabled: boolean = true,
  maxPages = 200
) {
  const pageSize = 200;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["productInsight", params],
    queryFn: ({ pageParam }) => listProducts({ ...params, pageNo: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const totalPages = Math.ceil(lastPage.pagination.totalRows / pageSize);
      return lastPage.pagination.pageNo < totalPages &&
        lastPage.pagination.pageNo < maxPages
        ? lastPage.pagination.pageNo + 1
        : undefined;
    },
    enabled: enabled && (!!params.goodsDesc?.length || !!params.hsCode?.length),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  /* ---------------------------- */
  /* Accumulate ALL pages         */
  /* ---------------------------- */
  const accumulated = useMemo(() => {
    if (!data?.pages?.length) return undefined;
    return accumulateProductInsight(data.pages.filter((p) => p !== undefined));
  }, [data?.pages]);

  /* ---------------------------- */
  /* Auto-fetch next page         */
  /* ---------------------------- */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ---------------------------- */
  /* Derived values               */
  /* ---------------------------- */
  const trades: TradeRecord[] = accumulated?.trades ?? [];

  const fetchedPages = data?.pages.length ?? 0;
  const lastPage = data?.pages.at(-1);
  const totalPages = lastPage
    ? Math.ceil(lastPage.pagination.totalRows / pageSize)
    : 0;

  const progress = { fetchedPages, totalPages };

  return {
    data: accumulated,
    trades,
    progress,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
  };
}
