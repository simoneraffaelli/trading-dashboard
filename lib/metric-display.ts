import type { Metrics, ProfitFactorState } from "./types";

type ProfitFactorFields = Pick<
  Metrics,
  "profit_factor" | "profit_factor_display" | "profit_factor_state"
>;

export interface ProfitFactorCardValue {
  numericValue: number | null;
  textValue: string | null;
  state: ProfitFactorState | null;
}

export function getProfitFactorCardValue(
  metrics?: ProfitFactorFields
): ProfitFactorCardValue {
  if (!metrics) {
    return {
      numericValue: null,
      textValue: null,
      state: null,
    };
  }

  if (
    metrics.profit_factor_state === "finite" &&
    metrics.profit_factor !== null
  ) {
    return {
      numericValue: metrics.profit_factor,
      textValue: null,
      state: metrics.profit_factor_state,
    };
  }

  return {
    numericValue: null,
    textValue: metrics.profit_factor_display,
    state: metrics.profit_factor_state,
  };
}