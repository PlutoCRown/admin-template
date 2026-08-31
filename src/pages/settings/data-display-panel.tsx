import { Segmented } from "antd";
import {
  useGlobalConfigStore,
  type DateFormat,
  type LargeNumberFormat,
} from "#stores/global-config";
import styles from "./settings.module.css";

const LARGE_NUMBER_OPTIONS: { label: string; value: LargeNumberFormat }[] = [
  { label: "不格式化", value: "none" },
  { label: "英文习惯", value: "western" },
  { label: "中文习惯", value: "chinese" },
];

const DATE_OPTIONS: { label: string; value: DateFormat }[] = [
  { label: "不格式化", value: "none" },
  { label: "隐藏时间", value: "date" },
  { label: "相对时间", value: "relative" },
];

export function DataDisplayPanel() {
  const largeNumberFormat = useGlobalConfigStore((state) => state.dataDisplay.largeNumberFormat);
  const dateFormat = useGlobalConfigStore((state) => state.dataDisplay.dateFormat);
  const setLargeNumberFormat = useGlobalConfigStore((state) => state.setLargeNumberFormat);
  const setDateFormat = useGlobalConfigStore((state) => state.setDateFormat);

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>数据显示</h2>
      <p className={styles.panelDesc}>控制表格大数与日期的默认展示方式。</p>
      <div className={styles.section}>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.sectionLabel}>大数格式化</div>
            <div className={styles.settingDesc}>
              英文习惯使用 K / M / B / T，中文习惯使用万 / 亿 / 万亿。
            </div>
          </div>
          <Segmented<LargeNumberFormat>
            aria-label="大数格式化"
            options={LARGE_NUMBER_OPTIONS}
            value={largeNumberFormat}
            onChange={setLargeNumberFormat}
          />
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.sectionLabel}>日期格式化</div>
            <div className={styles.settingDesc}>
              可保留原始值、仅显示日期，或显示为“3 小时前”等相对时间。
            </div>
          </div>
          <Segmented<DateFormat>
            aria-label="日期格式化"
            options={DATE_OPTIONS}
            value={dateFormat}
            onChange={setDateFormat}
          />
        </div>
      </div>
    </div>
  );
}
