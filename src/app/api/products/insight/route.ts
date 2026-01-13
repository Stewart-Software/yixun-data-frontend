import { getStartUrl } from "@/utils/environment";
import { ProductInsightResponse } from "@/utils/products/types";
import { translateObject } from "@/utils/translation";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    const START_URL = getStartUrl();

    if (!START_URL) {
      throw new Error("START_URL is not defined in the environment.");
    }

    const options = {
      method: "POST",
      url: `${START_URL}/products/insight`,
      data: params,
    };

    const response = await axios.request(options);
    const translatedData = await translateObject(response.data);

    return NextResponse.json(translatedData as ProductInsightResponse);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
