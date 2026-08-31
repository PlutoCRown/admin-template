import { useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  ProTable as AntProTable,
  type ActionType,
  type ProColumns as AntProColumns,
  type ProTableProps as AntProTableProps,
} from "@ant-design/pro-components";
import "./pro-table.css";

export type { ActionType } from "@ant-design/pro-components";
export { TagSelect } from "./tag-select";
export type { TagSelectValue, TagSelectValueConfig, TagSelectValueEnum } from "./tag-select";

export type ProTableAction<T> = ActionType & {
  getDataSource: () => T[];
  setDataSource: (data: T[]) => void;
};

export type ProColumns<DataSource = unknown, ValueType = "text"> = Omit<
  AntProColumns<DataSource, ValueType>,
  "children"
> & {
  children?: ProColumns<DataSource>[];
  wrap?: boolean;
};

type ProTableProps<
  DataSource extends Record<string, any>,
  Params extends Record<string, any>,
  ValueType,
> = Omit<AntProTableProps<DataSource, Params, ValueType>, "columns"> & {
  columns?: ProColumns<DataSource, ValueType>[];
};

const PRO_TABLE_CLASS_NAME = "admin-pro-table";
const CELL_WRAP_CLASS_NAME = "admin-pro-table-cell-wrap";

function getTableClassName(className?: string) {
  return className ? `${PRO_TABLE_CLASS_NAME} ${className}` : PRO_TABLE_CLASS_NAME;
}

function appendClassName(origin: { className?: string } | undefined, className: string) {
  return {
    ...origin,
    className: origin?.className ? `${origin.className} ${className}` : className,
  };
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
    scroll,
    tableLayout,
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

  const renderColumn = (column: ProColumns<DataSource, any>): AntProColumns<DataSource, any> => {
    const { children, wrap, ...columnProps } = column;
    const renderedChildren = children?.map(renderColumn);
    if (wrap) {
      const { onCell, onHeaderCell } = columnProps;
      columnProps.onCell = (record, index) =>
        appendClassName(onCell?.(record, index), CELL_WRAP_CLASS_NAME);
      columnProps.onHeaderCell = (item) =>
        appendClassName(onHeaderCell?.(item), CELL_WRAP_CLASS_NAME);
    }
    return { ...columnProps, children: renderedChildren };
  };

  const renderedColumns = columns?.map(renderColumn);

  return (
    <AntProTable<DataSource, Params, ValueType>
      scroll={{ x: "max-content", y: "100%", ...scroll }}
      tableLayout={tableLayout ?? "auto"}
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
