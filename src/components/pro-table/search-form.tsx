import { DownOutlined, SearchOutlined, UpOutlined } from "@ant-design/icons";
import type {
  ProColumns as AntProColumns,
  ProTableProps as AntProTableProps,
} from "@ant-design/pro-components";
import { Button } from "antd";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  FormDate,
  FormDateTime,
  FormDigit,
  FormMoney,
  FormSelect,
  FormSwitch,
  FormText,
  FormTime,
  ProForm,
} from "#components/form";
import "./search-form.css";

const SEARCH_FIELD_WIDTH = 8;
const TEXT_SEARCH_DELAY = 500;
const SKIP_VALUE_TYPES = new Set(["option", "index", "indexBorder", "divider", "dependency"]);
const INSTANT_SEARCH_TYPES = new Set([
  "select",
  "checkbox",
  "radio",
  "switch",
  "date",
  "dateTime",
  "dateRange",
  "time",
  "cascader",
  "treeSelect",
  "segmented",
]);

export type ProColumnSearch = {
  transform?: (value: any, namePath: string[], allValues: any) => any;
  /** 搜索控件宽度，单位为方块字符（1em） */
  width?: number;
  /** 搜索标签宽度，单位为方块字符（1em）。不传则跟表单默认 */
  labelWidth?: number;
};

export type ProTableSearch = {
  /** 标签宽度，单位为方块字符。不传或 `"auto"` 时按文字撑开 */
  labelWidth?: number | "auto";
  /** 搜索控件默认宽度，单位为方块字符。列上 `search.width` 优先 */
  fieldWidth?: number;
  /** 允许折叠多出行的搜索项；表单项保持挂载，用 CSS 高度过渡 */
  collapsible?: boolean;
  /** 初始是否折叠，仅 `collapsible` 时有效，默认 true */
  defaultCollapsed?: boolean;
  className?: string;
};

type SearchColumn = Omit<AntProColumns<any, any>, "search" | "children"> & {
  search?: boolean | ProColumnSearch;
  children?: SearchColumn[];
};

type SearchFormProps = {
  columns: SearchColumn[];
  search: ProTableSearch;
  loading?: boolean;
  formRef?: AntProTableProps<any, any>["formRef"];
  form?: AntProTableProps<any, any>["form"];
  size?: AntProTableProps<any, any>["size"];
  dateFormatter?: AntProTableProps<any, any>["dateFormatter"];
  onSearch: (values: Record<string, any>) => void;
};

function getColumnName(column: SearchColumn) {
  return column.dataIndex ?? column.key;
}

function getColumnKey(column: SearchColumn, index: number) {
  const name = getColumnName(column);
  if (Array.isArray(name)) {
    return name.join(".");
  }
  if (name != null) {
    return String(name);
  }
  return String(index);
}

function getColumnLabel(column: SearchColumn): ReactNode {
  const { title } = column;
  if (typeof title === "function") {
    return undefined;
  }
  return title;
}

function getColumnFieldProps(column: SearchColumn) {
  const fieldProps = column.fieldProps;
  if (fieldProps && typeof fieldProps === "object" && !Array.isArray(fieldProps)) {
    return fieldProps as Record<string, unknown>;
  }
  return {};
}

function getValueType(column: SearchColumn) {
  const valueType = column.valueType;
  if (typeof valueType === "string") {
    return valueType;
  }
  if (valueType && typeof valueType === "object" && "type" in valueType) {
    return String((valueType as { type: string }).type);
  }
  return "text";
}

function isSearchableColumn(column: SearchColumn) {
  if (column.search === false) {
    return false;
  }
  if (SKIP_VALUE_TYPES.has(getValueType(column))) {
    return false;
  }
  return getColumnName(column) != null;
}

function omitEmptySearchValues(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    }),
  );
}

function applySearchTransforms(values: Record<string, any>, columns: SearchColumn[]) {
  const result = { ...values };
  for (const column of columns) {
    const search = column.search;
    if (!search || typeof search !== "object" || !search.transform) {
      continue;
    }
    const name = getColumnName(column);
    if (typeof name !== "string" && typeof name !== "number") {
      continue;
    }
    const transformed = search.transform(result[name], [String(name)], result);
    delete result[name];
    if (transformed && typeof transformed === "object" && !Array.isArray(transformed)) {
      Object.assign(result, transformed);
    } else if (transformed !== undefined) {
      result[name] = transformed;
    }
  }
  return result;
}

function toSearchParams(values: Record<string, any>, columns: SearchColumn[]) {
  return applySearchTransforms(omitEmptySearchValues(values), columns);
}

function isInstantSearchField(column: SearchColumn) {
  if (column.valueEnum) {
    return true;
  }
  return INSTANT_SEARCH_TYPES.has(getValueType(column));
}

function getSearchDelay(changedValues: Record<string, unknown>, columns: SearchColumn[]) {
  const instant = Object.keys(changedValues).every((key) => {
    const column = columns.find((item) => String(getColumnName(item)) === key);
    return column ? isInstantSearchField(column) : false;
  });
  return instant ? 0 : TEXT_SEARCH_DELAY;
}

function getSearchConfig(column: SearchColumn) {
  const search = column.search;
  if (search && typeof search === "object") {
    return search;
  }
  return undefined;
}

function getSearchWidth(column: SearchColumn, defaultWidth: number) {
  return getSearchConfig(column)?.width ?? defaultWidth;
}

function getSearchLabelWidth(column: SearchColumn) {
  return getSearchConfig(column)?.labelWidth;
}

function getRowHeight(size: SearchFormProps["size"]) {
  if (size === "small") {
    return 24;
  }
  if (size === "large") {
    return 40;
  }
  return 32;
}

function SearchField({ column, defaultWidth }: { column: SearchColumn; defaultWidth: number }) {
  const valueType = getValueType(column);
  const valueEnum =
    column.valueEnum && typeof column.valueEnum === "object" ? column.valueEnum : undefined;
  const common = {
    name: getColumnName(column),
    label: getColumnLabel(column),
    width: getSearchWidth(column, defaultWidth),
    labelWidth: getSearchLabelWidth(column),
    initialValue: column.initialValue,
    fieldProps: { allowClear: true, ...getColumnFieldProps(column) },
  };

  if (valueEnum || valueType === "select") {
    return <FormSelect {...common} valueEnum={valueEnum} />;
  }
  if (valueType === "digit") {
    return <FormDigit {...common} />;
  }
  if (valueType === "money") {
    return <FormMoney {...common} />;
  }
  if (valueType === "date") {
    return <FormDate {...common} />;
  }
  if (valueType === "dateTime") {
    return <FormDateTime {...common} />;
  }
  if (valueType === "time") {
    return <FormTime {...common} />;
  }
  if (valueType === "switch") {
    return <FormSwitch {...common} />;
  }
  return <FormText {...common} />;
}

function SearchActions({
  collapsed,
  showCollapse,
  showSearch,
  loading,
  onToggle,
}: {
  collapsed: boolean;
  showCollapse: boolean;
  showSearch: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="admin-pro-table-search-actions">
      {showSearch ? (
        <Button
          type="primary"
          htmlType="submit"
          icon={<SearchOutlined />}
          loading={loading}
          aria-label="查询"
        />
      ) : null}
      {showCollapse ? (
        <Button
          htmlType="button"
          shape="circle"
          icon={collapsed ? <DownOutlined /> : <UpOutlined />}
          loading={collapsed && loading}
          aria-label={collapsed ? "展开" : "收起"}
          onClick={onToggle}
        />
      ) : null}
    </div>
  );
}

export function SearchForm({
  columns,
  search,
  loading = false,
  formRef,
  form,
  size,
  dateFormatter,
  onSearch,
}: SearchFormProps) {
  const collapsible = Boolean(search.collapsible);
  const [collapsed, setCollapsed] = useState(search.defaultCollapsed ?? true);
  const [fieldsEl, setFieldsEl] = useState<HTMLDivElement | null>(null);
  const [fieldsHeight, setFieldsHeight] = useState<number>();
  const searchTimerRef = useRef(0);
  const lastQueryRef = useRef("");

  const searchColumns = columns.filter(isSearchableColumn);

  useLayoutEffect(() => {
    if (!fieldsEl) {
      return () => {};
    }
    const update = () => setFieldsHeight(fieldsEl.scrollHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(fieldsEl);
    return () => observer.disconnect();
  }, [fieldsEl]);

  useEffect(() => {
    return () => {
      window.clearTimeout(searchTimerRef.current);
    };
  }, []);

  if (searchColumns.length === 0) {
    return null;
  }

  const labelWidth = search.labelWidth === "auto" ? undefined : search.labelWidth;
  const overflowing = (fieldsHeight ?? 0) > getRowHeight(size) + 8;
  const showCollapse = collapsible && overflowing;
  const showSearch = !showCollapse || !collapsed;
  const defaultFieldWidth = search.fieldWidth ?? SEARCH_FIELD_WIDTH;
  const fields = searchColumns.map((column, index) => (
    <SearchField
      key={getColumnKey(column, index)}
      column={column}
      defaultWidth={defaultFieldWidth}
    />
  ));

  function emitSearch(values: Record<string, any>, force = false) {
    const next = toSearchParams(values, searchColumns);
    const query = JSON.stringify(next);
    if (!force && query === lastQueryRef.current) {
      return;
    }
    lastQueryRef.current = query;
    onSearch(next);
  }

  function scheduleSearch(values: Record<string, any>, delay: number) {
    window.clearTimeout(searchTimerRef.current);
    if (delay <= 0) {
      emitSearch(values);
      return;
    }
    searchTimerRef.current = window.setTimeout(() => {
      emitSearch(values);
    }, delay);
  }

  function toggleCollapsed() {
    setCollapsed((value) => !value);
  }

  function handleValuesChange(changedValues: Record<string, any>, allValues: Record<string, any>) {
    scheduleSearch(allValues, getSearchDelay(changedValues, searchColumns));
  }

  function handleFinish(values: Record<string, any>) {
    window.clearTimeout(searchTimerRef.current);
    emitSearch(values, true);
  }

  const fieldsStyle =
    fieldsHeight != null
      ? ({ "--admin-pro-table-search-fields-height": `${fieldsHeight}px` } as CSSProperties)
      : undefined;

  return (
    <div className={["admin-pro-table-search-wrap", search.className].filter(Boolean).join(" ")}>
      <ProForm
        {...form}
        formRef={formRef}
        size={size}
        dateFormatter={dateFormatter}
        labelWidth={labelWidth}
        submitter={false}
        className={["admin-pro-table-search", form?.className].filter(Boolean).join(" ")}
        style={{ height: "auto", overflow: "visible", ...form?.style }}
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}
      >
        <div
          className={[
            "admin-pro-table-search-fields",
            collapsed && collapsible ? "is-collapsed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={fieldsStyle}
        >
          <div className="admin-pro-table-search-fields-inner" ref={setFieldsEl}>
            {fields}
          </div>
        </div>
        <SearchActions
          collapsed={collapsed}
          showCollapse={showCollapse}
          showSearch={showSearch}
          loading={loading}
          onToggle={toggleCollapsed}
        />
      </ProForm>
    </div>
  );
}
