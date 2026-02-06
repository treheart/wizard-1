import { Path } from "./types";
import { getQuestionsForPath } from "./quiz-data";

/**
 * Encode answers to a compact string of indices (e.g., "1102111")
 * Each digit represents the index of the selected option (0, 1, or 2)
 */
export function encodeAnswers(
  path: Path,
  answers: Record<string, string>
): string {
  const questions = getQuestionsForPath(path);
  return questions
    .map((q) => {
      const selectedValue = answers[q.id];
      const optionIndex = q.options.findIndex((o) => o.value === selectedValue);
      return optionIndex >= 0 ? optionIndex.toString() : "0";
    })
    .join("");
}

/**
 * Decode a compact string back to answers object
 * e.g., "1102111" -> { Q1B: "contractors", Q2B: "revenue", ... }
 */
export function decodeAnswers(
  path: Path,
  encoded: string
): Record<string, string> {
  const questions = getQuestionsForPath(path);
  const answers: Record<string, string> = {};

  for (let i = 0; i < questions.length && i < encoded.length; i++) {
    const optionIndex = parseInt(encoded[i], 10);
    const question = questions[i];
    if (!isNaN(optionIndex) && question.options[optionIndex]) {
      answers[question.id] = question.options[optionIndex].value;
    }
  }

  return answers;
}

/**
 * Encode all quiz data into a single URL-safe string
 * Format: name.path.answerIndices.email (email optional)
 * Uses base64url encoding (alphanumeric + hyphen/underscore only)
 */
export function encodeQuizData(
  name: string,
  path: Path,
  answers: Record<string, string>,
  email?: string
): string {
  const answerIndices = encodeAnswers(path, answers);
  const data = [name, path, answerIndices, email || ""].join(".");
  // Encode UTF-8 string to base64url (handles non-ASCII characters)
  const utf8Bytes = new TextEncoder().encode(data);
  const binaryString = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binaryString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a single URL-safe string back to all quiz data
 */
export function decodeQuizData(encoded: string): {
  name: string;
  path: Path;
  answers: Record<string, string>;
  email: string;
} {
  // Handle empty/missing id
  if (!encoded) {
    return {
      name: "Friend",
      path: "A",
      answers: {},
      email: "",
    };
  }

  // Restore base64 from base64url
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }

  // Decode base64 to UTF-8 string (handles non-ASCII characters)
  try {
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    const data = new TextDecoder().decode(utf8Bytes);
    const parts = data.split(".");
    const name = parts[0];
    const pathRaw = parts[1];
    const answerIndices = parts[2];
    const email = parts.slice(3).join(".") || "";

    // Validate path is one of the allowed values
    const validPaths: Path[] = ["A", "B", "C"];
    const path: Path = validPaths.includes(pathRaw as Path) ? (pathRaw as Path) : "A";

    const answers = decodeAnswers(path, answerIndices || "");

    return {
      name: name || "Friend",
      path,
      answers,
      email: email || "",
    };
  } catch (error) {
    console.error("Failed to decode quiz data:", error);
    return {
      name: "Friend",
      path: "A" as Path,
      answers: {},
      email: "",
    };
  }
}
