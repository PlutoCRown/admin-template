import { useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  ProTable as AntProTable,
  type ActionType,
  type ProColumns as AntProColumns,
  type ProTableProps as AntProTableProps,
} from "@ant-design/pro-components";
import { TagSelect, type TagSelectValue, type TagSelectValueEnum } from "./tag-select";
import "./pro-table.css";

export type { ActionType } from "@ant-design/pro-components";
export type { TagSelectValue, TagSelectValueConfig, TagSelectValueEnum } from "./tag-select";

export type ProTableAction<T> = ActionType & {
  getDataSource: () => T[];
  setDataSource: (data: T[]) => void;
};

export interface TagSelectRenderer<DataSource, Value extends TagSelectValue = TagSelectValue> {
  type: "tagSelect";
  onChange: (value: Value, nextRecord: DataSource) => Promise<DataSource | void>;
  onSuccess?: (record: DataSource) => void;
  onError?: (error: unknown, record: DataSource) => void;
  disabled?: boolean | ((record: DataSource) => boolean);
}

type ProTableValueEnum<DataSource> =
  | TagSelectValueEnum
  | ((record: DataSource) => TagSelectValueEnum);

export type ProColumns<DataSource = unknown, ValueType = "text"> = Omit<
  AntProColumns<DataSource, ValueType>,
  "children" | "valueEnum"
> & {
  valueEnum?: ProTableValueEnum<DataSource>;
  renderer?: TagSelectRenderer<DataSource, any>;
  children?: ProColumns<DataSource>[];
};

type ProTableProps<
  DataSource extends Record<string, any>,
  Params extends Record<string, any>,
  ValueType,
> = Omit<AntProTableProps<DataSource, Params, ValueType>, "columns"> & {
  columns?: ProColumns<DataSource, ValueType>[];
};

const PRO_TABLE_CLASS_NAME = "admin-pro-table";

function getTableClassName(className?: string) {
  return className ? `${PRO_TABLE_CLASS_NAME} ${className}` : PRO_TABLE_CLASS_NAME;
}

export function tagSelectRenderer<DataSource, Value extends TagSelectValue>(
  options: Omit<TagSelectRenderer<DataSource, Value>, "type">,
): TagSelectRenderer<DataSource, Value> {
  return { type: "tagSelect", ...options };
}

function getDataIndexPath(dataIndex: unknown) {
  if (Array.isArray(dataIndex)) {
    return dataIndex;
  }
  return dataIndex === undefined || dataIndex === null ? [] : [dataIndex];
}

function getRecordValue(record: Record<string, any>, dataIndex: unknown): unknown {
  return getDataIndexPath(dataIndex).reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<PropertyKey, unknown>)[key as PropertyKey];
  }, record);
}

function setRecordValue<DataSource extends Record<string, any>>(
  record: DataSource,
  dataIndex: unknown,
  value: TagSelectValue,
): DataSource {
  const path = getDataIndexPath(dataIndex);
  if (path.length === 0) {
    return record;
  }

  const nextRecord = { ...record };
  let source: Record<PropertyKey, any> = record;
  let target: Record<PropertyKey, any> = nextRecord;

  path.forEach((key, index) => {
    const property = key as PropertyKey;
    if (index === path.length - 1) {
      target[property] = value;
      return;
    }
    const sourceChild = source[property];
    const targetChild = Array.isArray(sourceChild) ? [...sourceChild] : { ...sourceChild };
    target[property] = targetChild;
    source = sourceChild ?? {};
    target = targetChild;
  });

  return nextRecord;
}

function getRowIdentity<DataSource extends Record<string, any>>(
  record: DataSource,
  index: number,
  rowKey: AntProTableProps<DataSource, any, any>["rowKey"],
) {
  if (typeof rowKey === "function") {
    return rowKey(record, index);
  }
  if (rowKey !== undefined) {
    return record[rowKey as keyof DataSource];
  }
  return undefined;
}

export function ProTable<
  DataSource extends Record<string, any>,
  Params extends Record<string, any> = Record<string, any>,
  ValueType = "text",
>(props: ProTableProps<DataSource, Params, ValueType>) {
  const {
    actionRef,
    options,
    bordered = true,
    request,
    onDataSourceChange,
    dataSource,
    tableClassName,
    columns,
    rowKey,
    ...rest
  } = props;
  const innerRef = useRef<ActionType | undefined>(undefined);
  const rowsRef = useRef<DataSource[]>(Array.isArray(dataSource) ? dataSource : []);
  const overlayRef = useRef<DataSource[] | undefined>(undefined);
  const overlayingRef = useRef(false);
  const [overlay, setOverlay] = useState<DataSource[] | undefined>();

  const setCurrentDataSource = (next: DataSource[]) => {
    overlayingRef.current = true;
    overlayRef.current = next;
    rowsRef.current = next;
    setOverlay(next);
  };

  useImperativeHandle(
    actionRef as Ref<ProTableAction<DataSource> | undefined>,
    () =>
      new Proxy({} as ProTableAction<DataSource>, {
        get(_target, prop) {
          if (prop === "getDataSource") {
            return () => overlayRef.current ?? rowsRef.current;
          }
          if (prop === "setDataSource") {
            return setCurrentDataSource;
          }
          const current = innerRef.current;
          if (!current) {
            return undefined;
          }
          const value = current[prop as keyof ActionType];
          return typeof value === "function" ? value.bind(current) : value;
        },
      }),
  );

  const handleDataSourceChange: NonNullable<typeof onDataSourceChange> = (next) => {
    if (overlayingRef.current) {
      overlayingRef.current = false;
      onDataSourceChange?.(next);
      return;
    }
    rowsRef.current = next ?? [];
    if (overlayRef.current) {
      overlayRef.current = undefined;
      setOverlay(undefined);
    }
    onDataSourceChange?.(next);
  };

  const handleRequest: typeof request = request
    ? async (params, sort, filter) => {
        const result = await request(params, sort, filter);
        overlayRef.current = undefined;
        rowsRef.current = result.data ?? [];
        setOverlay(undefined);
        return result;
      }
    : undefined;

  const handleTagSelectChange = async (
    nextValue: TagSelectValue,
    record: DataSource,
    rowIndex: number,
    dataIndex: unknown,
    renderer: TagSelectRenderer<DataSource>,
  ) => {
    const currentRows = overlayRef.current ?? rowsRef.current;
    const previousValue = getRecordValue(record, dataIndex) as TagSelectValue;
    const nextRecord = setRecordValue(record, dataIndex, nextValue);
    const identity = getRowIdentity(record, rowIndex, rowKey);
    const isTarget = (item: DataSource, index: number) =>
      identity === undefined
        ? item === record || index === rowIndex
        : Object.is(getRowIdentity(item, index, rowKey), identity);

    setCurrentDataSource(
      currentRows.map((item, index) => (isTarget(item, index) ? nextRecord : item)),
    );

    let savedRecord: DataSource | void;
    try {
      savedRecord = await renderer.onChange(nextValue, nextRecord);
    } catch (error) {
      const latestRows = overlayRef.current ?? rowsRef.current;
      setCurrentDataSource(
        latestRows.map((item, index) => {
          if (!isTarget(item, index) || !Object.is(getRecordValue(item, dataIndex), nextValue)) {
            return item;
          }
          return setRecordValue(item, dataIndex, previousValue);
        }),
      );
      renderer.onError?.(error, record);
      return;
    }

    if (savedRecord) {
      const latestRows = overlayRef.current ?? rowsRef.current;
      setCurrentDataSource(
        latestRows.map((item, index) => (isTarget(item, index) ? savedRecord : item)),
      );
    }
    renderer.onSuccess?.(savedRecord ?? nextRecord);
  };

  const renderColumn = (column: ProColumns<DataSource, any>): AntProColumns<DataSource, any> => {
    const { renderer, children, ...columnProps } = column;
    const renderedChildren = children?.map(renderColumn);
    if (!renderer || renderer.type !== "tagSelect") {
      return { ...columnProps, children: renderedChildren };
    }

    const renderTagSelect: NonNullable<AntProColumns<DataSource, any>["render"]> = (
      dom,
      record,
      rowIndex,
    ) => {
      const currentValue = getRecordValue(record, column.dataIndex);
      if (
        typeof currentValue !== "string" &&
        typeof currentValue !== "number" &&
        typeof currentValue !== "boolean"
      ) {
        return dom;
      }
      const valueEnum =
        typeof column.valueEnum === "function" ? column.valueEnum(record) : column.valueEnum;
      const handleChange = (nextValue: TagSelectValue) =>
        handleTagSelectChange(nextValue, record, rowIndex, column.dataIndex, renderer);
      const disabled =
        typeof renderer.disabled === "function" ? renderer.disabled(record) : renderer.disabled;
      return (
        <TagSelect
          value={currentValue}
          valueEnum={valueEnum}
          disabled={disabled}
          onChange={handleChange}
        />
      );
    };

    return { ...columnProps, children: renderedChildren, render: renderTagSelect };
  };

  const renderedColumns = columns?.map(renderColumn);

  return (
    <AntProTable<DataSource, Params, ValueType>
      scroll={{ x: "100%", y: "100%" }}
      {...rest}
      actionRef={innerRef}
      bordered={bordered}
      options={options ?? false}
      dataSource={overlay ?? dataSource}
      columns={renderedColumns}
      rowKey={rowKey}
      tableClassName={getTableClassName(tableClassName)}
      onDataSourceChange={handleDataSourceChange}
      request={handleRequest}
    />
  );
}
