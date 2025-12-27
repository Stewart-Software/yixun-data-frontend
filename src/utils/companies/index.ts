import axios from "axios";
import { getAxiosErrorMessage } from "..";
import { getStartUrl } from "../environment";
import {
  CompaniesQuery,
  CompaniesResponse,
  CompanyDetailQuery,
  CompanyDetailResponse,
  CompanyEnrichmentResponse,
} from "./types";

export async function listCompanies(params: CompaniesQuery) {
  try {
    const START_URL = getStartUrl();

    if (!START_URL) {
      throw new Error("START_URL is not defined in the environment.");
    }

    //   if (!process.env.NEXT_PUBLIC_API_KEY) {
    //     throw new Error("API_KEY is not defined in the environment.");
    //   }

    //   axios.defaults.headers["X-API-KEY"] = process.env.NEXT_PUBLIC_API_KEY;

    const options = {
      method: "POST",
      url: `${START_URL}/companies/list`,
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
    const START_URL = getStartUrl();

    if (!START_URL) {
      throw new Error("START_URL is not defined in the environment.");
    }

    //   if (!process.env.NEXT_PUBLIC_API_KEY) {
    //     throw new Error("API_KEY is not defined in the environment.");
    //   }

    //   axios.defaults.headers["X-API-KEY"] = process.env.NEXT_PUBLIC_API_KEY;

    const options = {
      method: "POST",
      url: `${START_URL}/companies/detail`,
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
    const START_URL = getStartUrl();

    if (!START_URL) {
      throw new Error("START_URL is not defined in the environment.");
    }

    //   if (!process.env.NEXT_PUBLIC_API_KEY) {
    //     throw new Error("API_KEY is not defined in the environment.");
    //   }

    //   axios.defaults.headers["X-API-KEY"] = process.env.NEXT_PUBLIC_API_KEY;

    const options = {
      method: "POST",
      url: `${START_URL}/companies/enrichment`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as CompanyEnrichmentResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch company enrichment.");
  }
}
