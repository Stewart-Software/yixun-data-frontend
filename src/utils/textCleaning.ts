/**
 * Removes HTML tags and cleans up text
 */
export function stripHTMLTags(text: string): string {
  if (!text) return text;
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Cleans up goods descriptions by removing HTML, extra whitespace, and duplicates
 */
export function cleanGoodsDescription(description: string): string {
  if (!description) return description;

  // Remove HTML tags
  let cleaned = stripHTMLTags(description);

  // Replace multiple spaces/newlines with single space
  cleaned = cleaned.replace(/\s+/g, " ");

  // Remove common shipping marks and metadata sections
  cleaned = cleaned.replace(/SHIPPING MARKS[\s\S]*/gi, "");
  cleaned = cleaned.replace(/@@TEL[\s\S]*?FOB SHIPMENT/gi, "");
  cleaned = cleaned.replace(/TEL[\s\-\s]*FAX[\s\-\s]*FOB SHIPMENT/gi, "");
  cleaned = cleaned.replace(
    /THIS SHIPMENT CONTAINS NO SOLID WOOD PACKING MATERIAL[S]?\.?/gi,
    ""
  );
  cleaned = cleaned.replace(/FREIGHT COLLECT/gi, "");

  // Remove repetitive PO/DPCI/TCIN patterns
  cleaned = cleaned.replace(
    /P\.O\.?\s*#\s*[\d\-]*\s*DPCI\s*#?\s*[\d\-]*\s*TCIN\s*#?\s*[\d\-]*/gi,
    ""
  );
  cleaned = cleaned.replace(
    /INVOICE\s+[A-Z0-9\-]+\s+QUANTITY\s+\d+\s+PCS\s+CARTONS?\s+\d*\s*CTNS?/gi,
    ""
  );
  cleaned = cleaned.replace(/PO\s+[A-Z0-9\/\-\s]+VCP\/SSP\s*\/[\d\s\-]*/gi, "");
  cleaned = cleaned.replace(/DPCI\s*[\d\-]+\s*PO\s+[A-Z0-9\/\-\s]+/gi, "");

  // Remove multiple HS CODE references
  cleaned = cleaned.replace(/HS CODE:?\s*[:\.\d\s]*/gi, "HS CODE ");

  // Remove excessive hyphens and slashes
  cleaned = cleaned.replace(/[\-\/]{3,}/g, " ");

  // Replace multiple spaces again after removals
  cleaned = cleaned.replace(/\s+/g, " ");

  // Extract unique product names/descriptions before the first HS CODE or PO reference
  // Split into sentences and take unique ones
  const sentences = cleaned.split(/(?:HS CODE|P\.O\.|CARTONS?|CTNS)/i);
  const uniqueProducts = new Set<string>();

  for (const sentence of sentences.slice(0, 10)) {
    // Only look at first 10 segments
    const trimmed = sentence.trim();
    if (trimmed.length > 10 && trimmed.length < 200) {
      // Extract product description (typically at the start)
      const productMatch = trimmed.match(
        /^([A-Z0-9\s\-\(\)\/]+(?:CASE|DRESS|TOP|SKIRT|PHONE|PROTECTOR|CHARM|BAG|BELT|HAT|SHOES|SANDALS|HEELS|WRISTLET|AIRPOD)[A-Z0-9\s\-\(\)\/]*)/i
      );
      if (productMatch) {
        uniqueProducts.add(productMatch[1].trim());
      }
    }
  }

  // If we extracted unique products, use those; otherwise fall back to truncated original
  if (uniqueProducts.size > 0) {
    cleaned = Array.from(uniqueProducts).join("; ");
  } else {
    // Just take the first reasonable portion of text
    cleaned = cleaned.substring(0, 500);
  }

  // Final cleanup
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[;\-\s]+$/, "");

  return cleaned || description.substring(0, 200); // Fallback to truncated original
}

/**
 * Applies text cleaning to all string fields in an object recursively
 */
export function cleanTextInObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanTextInObject(item)) as T;
  }

  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        // Apply cleaning to string fields that might contain goods descriptions
        if (
          key.toLowerCase().includes("goods") ||
          key.toLowerCase().includes("desc") ||
          key.toLowerCase().includes("description")
        ) {
          cleaned[key] = cleanGoodsDescription(value);
        } else {
          cleaned[key] = value;
        }
      } else if (typeof value === "object" && value !== null) {
        cleaned[key] = cleanTextInObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned as T;
  }

  return obj;
}
