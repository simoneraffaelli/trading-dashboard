"use client";

import { useEffect, useRef, useMemo } from "react";
import { createChart, type IChartApi, type ISeriesApi, type SeriesType, ColorType, LineStyle, AreaSeries, type UTCTimestamp } from "lightweight-charts";
import { useEquityCurve } from "@/lib/hooks";

export default function EquityChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const { data } = useEquityCurve();

  const stats = useMemo(() => {
    if (!data?.curve?.length) return null;
    const values = data.curve.map((p) => p.cumulative_pnl);
    const peak = Math.max(...values);
    const lowest = Math.min(...values);
    const last = values[values.length - 1];
    const first = values[0];
    const periodReturn = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : last > 0 ? 100 : 0;
    return { peak, lowest, periodReturn };
  }, [data]);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: "rgba(0, 212, 255, 0.3)", style: LineStyle.Dashed },
        horzLine: { color: "rgba(0, 212, 255, 0.3)", style: LineStyle.Dashed },
      },
      handleScroll: false,
      handleScale: false,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#00d4ff",
      topColor: "rgba(0, 212, 255, 0.20)",
      bottomColor: "rgba(0, 212, 255, 0.01)",
      lineWidth: 2,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#00d4ff",
      crosshairMarkerBackgroundColor: "#07070a",
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data without recreating the chart
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !data?.curve) return;
    const seriesData = data.curve.map((p) => ({
      time: Math.floor(new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
      value: p.cumulative_pnl,
    }));
    seriesRef.current.setData(seriesData);
    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <div>
          <p className="label">Performance Chart</p>
          <h2 className="mt-0.5 text-base font-bold text-white">
            Growth Trajectory
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pt-2 sm:px-4 sm:pt-4">
        <div ref={containerRef} className="h-[260px] w-full sm:h-[320px]" />
      </div>

      {/* Bottom stats row */}
      {stats && (
        <div className="grid grid-cols-3 border-t border-white/[0.06]">
          <div className="border-r border-white/[0.06] px-5 py-3 sm:px-6">
            <p className="label">Peak</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-white">
              ${stats.peak.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="border-r border-white/[0.06] px-5 py-3 sm:px-6">
            <p className="label">Lowest</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-white">
              ${stats.lowest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="px-5 py-3 text-right sm:px-6">
            <p className="label">Period Return</p>
            <p
              className={`mt-0.5 font-mono text-sm font-bold ${
                stats.periodReturn >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {stats.periodReturn >= 0 ? "+" : ""}
              {stats.periodReturn.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
