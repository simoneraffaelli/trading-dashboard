import { describe, expect, it } from "vitest";

import { getProfitFactorCardValue } from "./metric-display";

describe("getProfitFactorCardValue", () => {
  it("returns a numeric value for finite profit factor states", () => {
    expect(
      getProfitFactorCardValue({
        profit_factor: 2.5,
        profit_factor_display: "2.5",
        profit_factor_state: "finite",
      })
    ).toEqual({
      numericValue: 2.5,
      textValue: null,
      state: "finite",
    });
  });

  it("returns the upstream infinity display for unbounded profit factor states", () => {
    expect(
      getProfitFactorCardValue({
        profit_factor: null,
        profit_factor_display: "∞",
        profit_factor_state: "unbounded",
      })
    ).toEqual({
      numericValue: null,
      textValue: "∞",
      state: "unbounded",
    });
  });

  it("returns the upstream fallback display for unavailable profit factor states", () => {
    expect(
      getProfitFactorCardValue({
        profit_factor: null,
        profit_factor_display: "N/A",
        profit_factor_state: "unavailable",
      })
    ).toEqual({
      numericValue: null,
      textValue: "N/A",
      state: "unavailable",
    });
  });
});