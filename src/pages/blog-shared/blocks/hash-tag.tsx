import styles from "./blocks.module.css";

const TONE_CLASS: Record<string, string> = {
  hot: styles.hashTagHot,
  new: styles.hashTagNew,
  limited: styles.hashTagLimited,
};

export interface HashTagProps {
  label: string;
  tone?: string;
}

export function HashTag({ label, tone = "hot" }: HashTagProps) {
  const toneClass = TONE_CLASS[tone] ?? styles.hashTagHot;
  return <span className={`${styles.hashTag} ${toneClass}`}>#{label}</span>;
}
