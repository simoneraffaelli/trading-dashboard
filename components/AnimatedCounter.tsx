"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  colorize?: boolean; // green for positive, red for negative
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  className = "",
  colorize = false,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));
  const [text, setText] = useState(value.toFixed(decimals));
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      spring.set(value);
      prevValue.current = value;
    }
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [display]);

  // Initial set
  useEffect(() => {
    spring.set(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colorClass = colorize
    ? value > 0
      ? "text-emerald-400"
      : value < 0
        ? "text-red-400"
        : "text-slate-300"
    : "";

  return (
    <motion.span
      className={`font-mono tabular-nums tracking-tight ${colorClass} ${className}`}
    >
      {prefix}
      {text}
      {suffix}
    </motion.span>
  );
}
