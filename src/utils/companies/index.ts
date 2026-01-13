import axios from "axios";
import { getAxiosErrorMessage } from "..";
import {
  CompaniesQuery,
  CompaniesResponse,
  CompanyDetailQuery,
  CompanyDetailResponse,
  CompanyEnrichmentResponse,
} from "./types";

export async function listCompanies(params: CompaniesQuery) {
  try {
    const options = {
      method: "POST",
      url: `/api/companies/list`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as CompaniesResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch companies.");
  }
}

export async function getCompanyDetail(params: CompanyDetailQuery) {
  try {
    const options = {
      method: "POST",
      url: `/api/companies/detail`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as CompanyDetailResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch companies.");
  }
}

export async function getCompanyEnrichment(params: { companyName: string }) {
  try {
    const options = {
      method: "POST",
      url: `/api/companies/enrichment`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as CompanyEnrichmentResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch company enrichment.");
    throw error; // This won't be reached, but TypeScript needs it
  }
}
