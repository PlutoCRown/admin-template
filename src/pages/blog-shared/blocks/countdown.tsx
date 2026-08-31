import { useEffect, useState } from "react";
import styles from "./blocks.module.css";

export interface CountdownProps {
  title: string;
  endAt: string;
}

const UNITS = [
  { key: "days", label: "天", ms: 86_400_000 },
  { key: "hours", label: "时", ms: 3_600_000 },
  { key: "minutes", label: "分", ms: 60_000 },
  { key: "seconds", label: "秒", ms: 1000 },
] as const;

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function splitRemain(remain: number) {
  let rest = Math.max(0, remain);
  return UNITS.map((unit) => {
    const value = Math.floor(rest / unit.ms);
    rest -= value * unit.ms;
    return { ...unit, value };
  });
}

export function Countdown({ title, endAt }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const end = Date.parse(endAt);
  const remain = Number.isFinite(end) ? end - now : 0;
  const parts = splitRemain(remain);

  return (
    <section className={styles.countdown}>
      <p className={styles.countdownTitle}>{title}</p>
      <div className={styles.countdownRow}>
        {parts.map((part) => (
          <div key={part.key} className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{pad(part.value)}</span>
            <span className={styles.countdownLabel}>{part.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
