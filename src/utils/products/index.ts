import axios from "axios";
import { getAxiosErrorMessage } from "..";
import { getStartUrl } from "../environment";
import { ProductInsightQuery, ProductInsightResponse } from "./types";

export async function listProducts(params: ProductInsightQuery) {
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
      url: `${START_URL}/products/insight`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as ProductInsightResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch companies.");
  }
}
