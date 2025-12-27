import { getCompanyEnrichment } from "@/utils/companies";
import { CompanyEnrichmentResponse } from "@/utils/companies/types";
import { useState } from "react";

export function useCompanyEnrichment(companyName: string) {
  const [enrichment, setEnrichment] = useState<
    CompanyEnrichmentResponse | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrichment = async () => {
    if (!companyName) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getCompanyEnrichment({ companyName });
      setEnrichment(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch company enrichment");
    } finally {
      setLoading(false);
    }
  };

  return { enrichment, loading, error, fetchEnrichment };
}
