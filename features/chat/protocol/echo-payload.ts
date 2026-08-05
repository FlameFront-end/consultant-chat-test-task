import { MAX_MESSAGE_LENGTH } from "@/features/chat/model/message-policy";
import type { MessagePayload } from "@/features/chat/model/types";
import { isCanonicalIsoTimestamp } from "@/lib/validation/is-canonical-iso-timestamp";

export type InvalidEchoReason =
  | "unsupported-data"
  | "invalid-json"
  | "invalid-payload";

export type ParseEchoPayloadResult =
  | { readonly isValid: true; readonly payload: MessagePayload }
  | { readonly isValid: false; readonly reason: InvalidEchoReason };

export function parseEchoPayload(rawPayload: unknown): ParseEchoPayloadResult {
  if (typeof rawPayload !== "string") {
    return { isValid: false, reason: "unsupported-data" };
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch {
    return { isValid: false, reason: "invalid-json" };
  }

  if (!isMessagePayload(parsedPayload)) {
    return { isValid: false, reason: "invalid-payload" };
  }

  return { isValid: true, payload: parsedPayload };
}

function isMessagePayload(value: unknown): value is MessagePayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.trim().length > 0 &&
    typeof candidate.text === "string" &&
    candidate.text.length > 0 &&
    candidate.text.length <= MAX_MESSAGE_LENGTH &&
    isCanonicalIsoTimestamp(candidate.createdAt)
  );
}
