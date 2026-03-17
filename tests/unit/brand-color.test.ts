import { describe, expect, it } from "vitest";
import { brandColorVars, hexDarken, isValidHex } from "@/lib/brand-color";

describe("brand-color utilities", () => {
  it("validates hex values in #RRGGBB format", () => {
    expect(isValidHex("#A1B2C3")).toBe(true);
    expect(isValidHex("#a1b2c3")).toBe(true);
    expect(isValidHex("#ABC")).toBe(false);
    expect(isValidHex("ABCDEF")).toBe(false);
    expect(isValidHex("#GGHHII")).toBe(false);
  });

  it("darkens a valid color by ratio", () => {
    expect(hexDarken("#FFFFFF", 0.2)).toBe("#CCCCCC");
    expect(hexDarken("#000000", 0.2)).toBe("#000000");
  });

  it("falls back safely when color is invalid", () => {
    expect(hexDarken("not-a-hex", 0)).toBe("#D4956A");
  });

  it("builds CSS variables with fallback behavior", () => {
    const css = brandColorVars("#123456");
    expect(css).toContain("--color-primary: #123456;");
    expect(css).toContain("--color-primary-dark:");
    expect(css).toContain("--color-primary-glow: #12345626;");

    const fallbackCss = brandColorVars("oops");
    expect(fallbackCss).toContain("--color-primary: #D4956A;");
  });
});
