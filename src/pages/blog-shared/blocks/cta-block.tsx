import styles from "./blocks.module.css";

const THEME_CLASS: Record<string, string> = {
  primary: styles.ctaPrimary,
  dark: styles.ctaDark,
};

export interface CtaBlockProps {
  label: string;
  hint: string;
  href: string;
  theme?: string;
  interactive?: boolean;
}

export function CtaBlock({
  label,
  hint,
  href,
  theme = "primary",
  interactive = false,
}: CtaBlockProps) {
  const themeClass = THEME_CLASS[theme] ?? styles.ctaPrimary;

  return (
    <section className={`${styles.cta} ${themeClass}`}>
      {interactive ? (
        <a className={styles.ctaButton} href={href}>
          {label}
        </a>
      ) : (
        <span className={styles.ctaButton}>{label}</span>
      )}
      {hint ? <p className={styles.ctaHint}>{hint}</p> : null}
    </section>
  );
}
