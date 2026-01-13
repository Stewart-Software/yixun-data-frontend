import axios from "axios";
import { getAxiosErrorMessage } from "..";
import { ProductInsightQuery, ProductInsightResponse } from "./types";

export async function listProducts(params: ProductInsightQuery) {
  try {
    const options = {
      method: "POST",
      url: `/api/products/insight`,
      data: params,
    };

    const response = await axios.request(options);
    return response.data as ProductInsightResponse;
  } catch (error) {
    getAxiosErrorMessage(error, "Failed to fetch companies.");
  }
}
