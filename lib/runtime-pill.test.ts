import { describe, expect, it } from "vitest";

import { resolveRuntimePill } from "./runtime-pill";

describe("resolveRuntimePill", () => {
  it("returns OFFLINE when the heartbeat query fails", () => {
    expect(
      resolveRuntimePill({
        heartbeatError: true,
        runtimeQueryError: false,
      })
    ).toEqual({
      label: "OFFLINE",
      tone: "offline",
      animate: true,
    });
  });

  it("returns STOPPED when the runtime service is stopped", () => {
    expect(
      resolveRuntimePill({
        heartbeatError: false,
        runtimeStatus: "stopped",
        runtimeMode: "live",
        runtimeQueryError: false,
      })
    ).toEqual({
      label: "STOPPED",
      tone: "stopped",
      animate: false,
    });
  });

  it("returns LIVE when the runtime service is running in live mode", () => {
    expect(
      resolveRuntimePill({
        heartbeatError: false,
        runtimeStatus: "running",
        runtimeMode: "live",
        runtimeQueryError: false,
      })
    ).toEqual({
      label: "LIVE",
      tone: "live",
      animate: true,
    });
  });

  it("returns PAPER when the runtime service is running in paper mode", () => {
    expect(
      resolveRuntimePill({
        heartbeatError: false,
        runtimeStatus: "running",
        runtimeMode: "paper",
        runtimeQueryError: false,
      })
    ).toEqual({
      label: "PAPER",
      tone: "paper",
      animate: true,
    });
  });

  it("returns UNKNOWN when the runtime query fails while the API is reachable", () => {
    expect(
      resolveRuntimePill({
        heartbeatError: false,
        runtimeQueryError: true,
      })
    ).toEqual({
      label: "UNKNOWN",
      tone: "unknown",
      animate: false,
    });
  });
});