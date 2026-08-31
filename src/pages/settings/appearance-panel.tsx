import { Segmented } from "antd";
import { useGlobalConfigStore, type ThemeMode } from "#stores/global-config";
import styles from "./settings.module.css";

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "跟随系统", value: "system" },
];

export function AppearancePanel() {
  const mode = useGlobalConfigStore((state) => state.themeMode);
  const setMode = useGlobalConfigStore((state) => state.setThemeMode);

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>外观</h2>
      <p className={styles.panelDesc}>选择界面主题，可固定浅色/深色，或跟随系统偏好。</p>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>主题</div>
        <Segmented
          className={styles.themeControl}
          options={THEME_OPTIONS}
          value={mode}
          onChange={setMode}
        />
      </div>
    </div>
  );
}
