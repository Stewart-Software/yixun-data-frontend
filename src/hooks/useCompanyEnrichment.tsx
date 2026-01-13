"use client";

import { getCompanyEnrichment } from "@/utils/companies";
import { CompanyEnrichmentResponse } from "@/utils/companies/types";
import { useQuery } from "@tanstack/react-query";

export function useCompanyEnrichment(
  companyName: string,
  enabled: boolean = false
) {
  const { data, isLoading, error, refetch } =
    useQuery<CompanyEnrichmentResponse>({
      queryKey: ["companyEnrichment", companyName],
      queryFn: () => getCompanyEnrichment({ companyName }),
      enabled: enabled && !!companyName,
      staleTime: 30 * 60 * 1000, // 30 minutes - enrichment data changes rarely
      retry: 1, // Only retry once for enrichment
    });

  return {
    enrichment: data,
    loading: isLoading,
    error: error ? String(error) : null,
    fetchEnrichment: refetch,
  };
}
