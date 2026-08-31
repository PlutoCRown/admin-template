import styles from "./blocks.module.css";

export interface PriceCardProps {
  name: string;
  current: string;
  original: string;
  badge?: string;
}

export function PriceCard({ name, current, original, badge }: PriceCardProps) {
  return (
    <article className={styles.priceCard}>
      <div className={styles.priceHead}>
        <h3 className={styles.priceName}>{name}</h3>
        {badge ? <span className={styles.priceBadge}>{badge}</span> : null}
      </div>
      <div className={styles.priceRow}>
        <span className={styles.priceCurrent}>¥{current}</span>
        {original ? <span className={styles.priceOriginal}>¥{original}</span> : null}
      </div>
    </article>
  );
}
