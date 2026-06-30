import { describe, it, expect, afterEach } from "vitest";
import { clampText, parseRetryDelayMs, isConfigured } from "../services/ai-service";

describe("clampText", () => {
  it("returns text unchanged when under max", () => {
    expect(clampText("hello", 10)).toBe("hello");
  });

  it("truncates with suffix when over max", () => {
    const result = clampText("hello world", 8);
    expect(result).toBe("hello wo\n…[content truncated for length]");
  });

  it("handles empty string", () => {
    expect(clampText("", 10)).toBe("");
  });
});

describe("parseRetryDelayMs", () => {
  it("extracts retry delay from error details", () => {
    const data = { error: { details: [{ retryDelay: "12s" }] } };
    expect(parseRetryDelayMs(data as any)).toBe(12000);
  });

  it("returns null for no error", () => {
    expect(parseRetryDelayMs({ candidates: [] })).toBe(null);
  });

  it("caps at 15s", () => {
    const data = { error: { details: [{ retryDelay: "30s" }] } };
    expect(parseRetryDelayMs(data as any)).toBe(15000);
  });

  it("handles empty details", () => {
    const data = { error: { details: [] } };
    expect(parseRetryDelayMs(data as any)).toBe(null);
  });
});

describe("isConfigured", () => {
  const KEY = process.env.GOOGLE_AI_API_KEY;

  afterEach(() => {
    process.env.GOOGLE_AI_API_KEY = KEY;
  });

  it("returns false when key is missing", () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect(isConfigured()).toBe(false);
  });

  it("returns false for short key", () => {
    process.env.GOOGLE_AI_API_KEY = "short";
    expect(isConfigured()).toBe(false);
  });

  it("returns true for valid key", () => {
    process.env.GOOGLE_AI_API_KEY = "a".repeat(20);
    expect(isConfigured()).toBe(true);
  });
});
