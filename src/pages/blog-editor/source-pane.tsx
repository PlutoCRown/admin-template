import { Switch } from "antd";
import styles from "./blog-editor.module.css";

interface SourcePaneProps {
  source: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onChange: (value: string) => void;
}

export function SourcePane({ source, editing, onEditingChange, onChange }: SourcePaneProps) {
  return (
    <div className={styles.sourcePane}>
      <div className={styles.sourceBar}>
        <span>源码编辑</span>
        <Switch size="small" checked={editing} aria-label="源码编辑" onChange={onEditingChange} />
      </div>
      {editing ? (
        <textarea
          className={styles.sourceInput}
          value={source}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <pre className={styles.source}>
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}
