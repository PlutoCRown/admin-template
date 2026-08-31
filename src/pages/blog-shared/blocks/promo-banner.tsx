import styles from "./blocks.module.css";

const THEME_CLASS: Record<string, string> = {
  sunset: styles.promoSunset,
  ocean: styles.promoOcean,
  forest: styles.promoForest,
};

export interface PromoBannerProps {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  theme?: string;
  interactive?: boolean;
}

export function PromoBanner({
  title,
  subtitle,
  cta,
  href,
  theme = "sunset",
  interactive = false,
}: PromoBannerProps) {
  const themeClass = THEME_CLASS[theme] ?? styles.promoSunset;
  const ctaClassName = styles.promoCta;

  return (
    <section className={`${styles.promo} ${themeClass}`}>
      <h2 className={styles.promoTitle}>{title}</h2>
      <p className={styles.promoSubtitle}>{subtitle}</p>
      {interactive ? (
        <a className={ctaClassName} href={href}>
          {cta}
        </a>
      ) : (
        <span className={ctaClassName}>{cta}</span>
      )}
    </section>
  );
}
