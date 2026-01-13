import translate from "@iamtraction/google-translate";

/**
 * Detects if a string contains Chinese characters
 */
function containsChinese(text: string): boolean {
  if (!text) return false;
  // Chinese character ranges in Unicode
  const chineseRegex =
    /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u;
  return chineseRegex.test(text);
}

/**
 * Translates text from any language to English using Google Translate
 * Only translates if the text is not already in English
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!text || typeof text !== "string") return text;

  // Skip translation if text is already in English (no Chinese characters)
  if (!containsChinese(text)) {
    return text;
  }

  try {
    const result = await translate(text, { to: "en" });
    return result.text;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Recursively translates all string values in an object or array
 * Handles nested objects and arrays
 */
export async function translateObject<T>(obj: T): Promise<T> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const translatedArray = await Promise.all(
      obj.map((item) => translateObject(item))
    );
    return translatedArray as T;
  }

  // Handle objects
  if (typeof obj === "object") {
    const translatedObj: any = {};
    const entries = Object.entries(obj);

    // Translate all values in parallel for better performance
    const translatedEntries = await Promise.all(
      entries.map(async ([key, value]) => {
        if (typeof value === "string") {
          return [key, await translateToEnglish(value)];
        } else if (typeof value === "object" && value !== null) {
          return [key, await translateObject(value)];
        } else {
          return [key, value];
        }
      })
    );

    // Reconstruct the object
    translatedEntries.forEach(([key, value]) => {
      translatedObj[key] = value;
    });

    return translatedObj as T;
  }

  // Handle primitives (strings, numbers, booleans, etc.)
  if (typeof obj === "string") {
    return (await translateToEnglish(obj)) as T;
  }

  return obj;
}
