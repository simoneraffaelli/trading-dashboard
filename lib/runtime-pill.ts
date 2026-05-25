import type { RuntimeMode, RuntimeStatusState } from "./types";

export type RuntimePillTone =
  | "live"
  | "paper"
  | "stopped"
  | "offline"
  | "unknown";

export interface ResolveRuntimePillInput {
  heartbeatError: boolean;
  runtimeStatus?: RuntimeStatusState;
  runtimeMode?: RuntimeMode;
  runtimeQueryError: boolean;
}

export interface RuntimePillState {
  label: "LIVE" | "PAPER" | "STOPPED" | "OFFLINE" | "UNKNOWN";
  tone: RuntimePillTone;
  animate: boolean;
}

const UNKNOWN_PILL: RuntimePillState = {
  label: "UNKNOWN",
  tone: "unknown",
  animate: false,
};

export function resolveRuntimePill({
  heartbeatError,
  runtimeStatus,
  runtimeMode,
  runtimeQueryError,
}: ResolveRuntimePillInput): RuntimePillState {
  if (heartbeatError) {
    return {
      label: "OFFLINE",
      tone: "offline",
      animate: true,
    };
  }

  if (runtimeQueryError) {
    return UNKNOWN_PILL;
  }

  if (runtimeStatus === "running") {
    if (runtimeMode === "live") {
      return {
        label: "LIVE",
        tone: "live",
        animate: true,
      };
    }

    if (runtimeMode === "paper") {
      return {
        label: "PAPER",
        tone: "paper",
        animate: true,
      };
    }

    return UNKNOWN_PILL;
  }

  if (runtimeStatus === "stopped") {
    return {
      label: "STOPPED",
      tone: "stopped",
      animate: true,
    };
  }

  return UNKNOWN_PILL;
}