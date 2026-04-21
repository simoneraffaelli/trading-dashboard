"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, type IChartApi, type ISeriesApi, type SeriesType, ColorType, LineStyle, AreaSeries, type UTCTimestamp } from "lightweight-charts";
import { Scan } from "lucide-react";
import { useEquityCurve } from "@/lib/hooks";

interface VisibleStats {
  peak: number;
  lowest: number;
}

export default function EquityChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const seriesDataRef = useRef<{ time: UTCTimestamp; value: number }[]>([]);
  const { data } = useEquityCurve();
  const [stats, setStats] = useState<VisibleStats | null>(null);

  const computeVisibleStats = useCallback(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    const allData = seriesDataRef.current;
    if (!chart || !series || !allData.length) return;

    const logicalRange = chart.timeScale().getVisibleLogicalRange();
    if (!logicalRange) return;

    const from = Math.max(0, Math.floor(logicalRange.from));
    const to = Math.min(allData.length - 1, Math.ceil(logicalRange.to));
    const visible = allData.slice(from, to + 1);
    if (!visible.length) return;

    const values = visible.map((p) => p.value);
    setStats({
      peak: Math.max(...values),
      lowest: Math.min(...values),
    });
  }, []);

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
      handleScroll: true,
      handleScale: true,
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

    chart.timeScale().subscribeVisibleLogicalRangeChange(computeVisibleStats);

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
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(computeVisibleStats);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [computeVisibleStats]);

  // Update data without recreating the chart
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !data?.curve) return;
    const mapped = data.curve.map((p) => ({
      time: Math.floor(new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
      value: p.cumulative_pnl,
    }));
    // lightweight-charts requires strictly ascending, unique timestamps
    // Bump duplicates by +1s each so all data points are preserved
    mapped.sort((a, b) => a.time - b.time);
    for (let i = 1; i < mapped.length; i++) {
      if (mapped[i].time <= mapped[i - 1].time) {
        mapped[i].time = (mapped[i - 1].time + 1) as UTCTimestamp;
      }
    }
    seriesDataRef.current = mapped;
    seriesRef.current.setData(mapped);
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
        <button
          onClick={() => {
            chartRef.current?.timeScale().fitContent();
            chartRef.current?.priceScale("right").applyOptions({ autoScale: true });
          }}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          title="Fit to view"
        >
          <Scan className="h-4 w-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="px-2 pt-2 sm:px-4 sm:pt-4">
        <div ref={containerRef} className="h-[260px] w-full sm:h-[320px]" />
      </div>

      {/* Bottom stats row */}
      {stats && (
        <div className="grid grid-cols-2 border-t border-white/[0.06]">
          <div className="border-r border-white/[0.06] px-5 py-3 sm:px-6">
            <p className="label">Peak</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-white">
              ${stats.peak.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="px-5 py-3 sm:px-6">
            <p className="label">Lowest</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-white">
              ${stats.lowest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
