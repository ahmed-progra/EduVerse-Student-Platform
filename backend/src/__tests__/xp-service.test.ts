import { describe, it, expect } from "vitest";
import { calculateLevel } from "../services/xp-service";

describe("calculateLevel", () => {
  it("returns 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns 1 for XP < 100", () => {
    expect(calculateLevel(50)).toBe(1);
  });

  it("returns 2 at exactly 100 XP", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("returns 3 at 400 XP", () => {
    expect(calculateLevel(400)).toBe(3);
  });

  it("returns 10 at 8100 XP", () => {
    expect(calculateLevel(8100)).toBe(10);
  });

  it("handles large values without overflow", () => {
    expect(calculateLevel(1_000_000)).toBe(101);
  });
});
