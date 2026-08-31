import { Segmented } from "antd";
import { useGlobalConfigStore, type ThemeMode } from "#stores/global-config";

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "跟随系统", value: "system" },
];

export function AppearancePanel() {
  const mode = useGlobalConfigStore((state) => state.themeMode);
  const setMode = useGlobalConfigStore((state) => state.setThemeMode);

  return (
    <div className="settings-modal-panel">
      <h2 className="settings-modal-panel-title">外观</h2>
      <p className="settings-modal-panel-desc">选择界面主题，可固定浅色/深色，或跟随系统偏好。</p>
      <div className="settings-modal-section">
        <div className="settings-modal-section-label">主题</div>
        <Segmented
          options={THEME_OPTIONS}
          value={mode}
          onChange={(value) => setMode(value)}
          style={{ alignSelf: "flex-start" }}
        />
      </div>
    </div>
  );
}
