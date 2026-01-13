"use client";

import { getCompanyDetail } from "@/utils/companies";
import {
  CompanyCountrySummary,
  CompanyDetailQuery,
  CompanyDetailResponse,
  CompanyPartnerSummary,
  CompanyPortSummary,
  CompanyProductSummary,
} from "@/utils/companies/types";
import { TradeRecord } from "@/utils/products/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export function accumulateCompanyDetail(
  pages: CompanyDetailResponse[]
): CompanyDetailResponse {
  const base = pages[0];

  const productMap = new Map<string, CompanyProductSummary>();
  const partnerMap = new Map<string, CompanyPartnerSummary>();
  const countryMap = new Map<string, CompanyCountrySummary>();
  const portMap = new Map<string, CompanyPortSummary>();

  let tradeCount = 0;
  let totalQuantity = 0;
  let totalWeight = 0;
  let totalValue = 0;

  const trades = [];

  for (const page of pages) {
    tradeCount += page.summary.tradeCount;
    totalQuantity += page.summary.totalQuantity ?? 0;
    totalWeight += page.summary.totalWeight ?? 0;
    totalValue += page.summary.totalValue ?? 0;

    trades.push(...page.trades);

    for (const p of page.products) {
      const key = `${p.goodsDesc}`;
      const acc = productMap.get(key) ?? {
        ...p,
        tradeCount: 0,
        hsCodes: [],
        totalQuantity: 0,
        totalWeight: 0,
        totalValue: 0,
      };

      acc.tradeCount += p.tradeCount;
      acc.totalQuantity! += p.totalQuantity ?? 0;
      acc.totalWeight! += p.totalWeight ?? 0;
      acc.totalValue! += p.totalValue ?? 0;
      acc.hsCodes = Array.from(new Set([...acc.hsCodes, ...p.hsCodes]));

      productMap.set(key, acc);
    }

    for (const p of page.partners) {
      const acc = partnerMap.get(p.companyName) ?? {
        ...p,
        tradeCount: 0,
        totalQuantity: 0,
        totalWeight: 0,
        totalValue: 0,
      };

      acc.tradeCount += p.tradeCount;
      acc.totalQuantity! += p.totalQuantity ?? 0;
      acc.totalWeight! += p.totalWeight ?? 0;
      acc.totalValue! += p.totalValue ?? 0;

      partnerMap.set(p.companyName, acc);
    }

    for (const c of page.countries) {
      const acc = countryMap.get(c.country) ?? {
        ...c,
        tradeCount: 0,
        totalQuantity: 0,
        totalWeight: 0,
        totalValue: 0,
      };

      acc.tradeCount += c.tradeCount;
      acc.totalQuantity! += c.totalQuantity ?? 0;
      acc.totalWeight! += c.totalWeight ?? 0;
      acc.totalValue! += c.totalValue ?? 0;

      countryMap.set(c.country, acc);
    }

    for (const p of page.ports) {
      const key = `${p.country}-${p.port}`;
      const acc = portMap.get(key) ?? {
        ...p,
        tradeCount: 0,
        totalQuantity: 0,
        totalWeight: 0,
        totalValue: 0,
      };

      acc.tradeCount += p.tradeCount;
      acc.totalQuantity! += p.totalQuantity ?? 0;
      acc.totalWeight! += p.totalWeight ?? 0;
      acc.totalValue! += p.totalValue ?? 0;

      portMap.set(key, acc);
    }
  }

  return {
    ...base,
    summary: {
      ...base.summary,
      tradeCount,
      totalQuantity,
      totalWeight,
      totalValue,
      products: productMap.size,
      partners: partnerMap.size,
      countries: countryMap.size,
      ports: portMap.size,
    },
    products: Array.from(productMap.values()),
    partners: Array.from(partnerMap.values()),
    countries: Array.from(countryMap.values()),
    ports: Array.from(portMap.values()),
    trades,
  };
}

export function useCompanyDetail(
  params: Omit<CompanyDetailQuery, "pageNo">,
  maxPages = 200,
  enabled = false
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
    queryKey: ["companyDetail", params],
    queryFn: ({ pageParam }) =>
      getCompanyDetail({ ...params, pageNo: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage) {
        const { pageNo, totalRows } = lastPage.pagination;
        const totalPages = Math.ceil(totalRows / pageSize);

        return pageNo < totalPages && pageNo < maxPages
          ? pageNo + 1
          : undefined;
      }
    },
    enabled: !!params.companyName && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  /* --------------------------------------- */
  /* Accumulate ALL pages deterministically  */
  /* --------------------------------------- */
  const accumulated = useMemo(() => {
    if (!data?.pages.length) return undefined;
    return accumulateCompanyDetail(data.pages.filter((p) => p !== undefined));
  }, [data?.pages]);

  /* --------------------------------------- */
  /* Auto-fetch next page                    */
  /* --------------------------------------- */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* --------------------------------------- */
  /* Derived values                          */
  /* --------------------------------------- */
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
