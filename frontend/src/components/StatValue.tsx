import { useEffect, useRef, useState } from "react";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
}

export function StatValue({ value, decimals = 0, suffix = "" }: Props) {
  const animated = useCountUp(value);
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={flash ? "stat-flash" : undefined}>
      {animated.toFixed(decimals)}
      {suffix}
    </span>
  );
}
