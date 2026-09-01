import styles from "./introduction.module.css";

interface ExpandableCodeProps {
  code: string;
  title?: string;
}

export function ExpandableCode({ code, title = "展开查看代码" }: ExpandableCodeProps) {
  return (
    <details className={styles.codeDetails}>
      <summary>{title}</summary>
      <pre>
        <code>{code}</code>
      </pre>
    </details>
  );
}
