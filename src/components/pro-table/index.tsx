import { useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  ProTable as AntProTable,
  type ActionType,
  type ProColumns as AntProColumns,
  type ProTableProps as AntProTableProps,
} from "@ant-design/pro-components";
import { useGlobalConfigStore } from "#stores/global-config";
import { getRendererType, renderFormattedValue, type ProColumnRenderer } from "./format-renderer";
import { SearchForm, type ProColumnSearch, type ProTableSearch } from "./search-form";
import "./pro-table.css";

export type { ActionType } from "@ant-design/pro-components";
export { TagSelect } from "./tag-select";
export type { TagSelectValue, TagSelectValueConfig, TagSelectValueEnum } from "./tag-select";
export type { ProColumnRenderer, ProColumnImageOptions } from "./format-renderer";
export type { ProColumnSearch, ProTableSearch } from "./search-form";

export type ProTableAction<T> = ActionType & {
  getDataSource: () => T[];
  setDataSource: (data: T[]) => void;
};

export type ProColumns<DataSource = unknown, ValueType = "text"> = Omit<
  AntProColumns<DataSource, ValueType>,
  "children" | "search"
> & {
  children?: ProColumns<DataSource>[];
  wrap?: boolean;
  renderer?: ProColumnRenderer;
  search?: boolean | ProColumnSearch;
};

type ProTableProps<
  DataSource extends Record<string, any>,
  Params extends Record<string, any>,
  ValueType,
> = Omit<AntProTableProps<DataSource, Params, ValueType>, "columns" | "search"> & {
  columns?: ProColumns<DataSource, ValueType>[];
  search?: false | ProTableSearch;
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

function getRecordValue(record: Record<string, any>, dataIndex: unknown) {
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce<unknown>((current, key) => {
      if (
        !current ||
        typeof current !== "object" ||
        (typeof key !== "string" && typeof key !== "number")
      ) {
        return undefined;
      }
      return (current as Record<string, unknown>)[key];
    }, record);
  }
  if (typeof dataIndex !== "string" && typeof dataIndex !== "number") {
    return undefined;
  }
  return record[dataIndex];
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
    search,
    params,
    formRef,
    form,
    size,
    dateFormatter,
    beforeSearchSubmit,
    onSubmit,
    onLoadingChange,
    ...rest
  } = props;
  const [searching, setSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, any>>(
    () => form?.initialValues ?? {},
  );
  const largeNumberFormat = useGlobalConfigStore((state) => state.dataDisplay.largeNumberFormat);
  const dateFormat = useGlobalConfigStore((state) => state.dataDisplay.dateFormat);
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
    ? async (requestParams, sort, filter) => {
        const result = await request(requestParams, sort, filter);
        overlayRef.current = undefined;
        rowsRef.current = result.data ?? [];
        setOverlay(undefined);
        return result;
      }
    : undefined;

  const renderColumn = (column: ProColumns<DataSource, any>): AntProColumns<DataSource, any> => {
    const { children, wrap, renderer, search: _search, ...columnProps } = column;
    const renderedChildren = children?.map(renderColumn);
    if (wrap) {
      const { onCell, onHeaderCell } = columnProps;
      columnProps.onCell = (record, index) =>
        appendClassName(onCell?.(record, index), CELL_WRAP_CLASS_NAME);
      columnProps.onHeaderCell = (item) =>
        appendClassName(onHeaderCell?.(item), CELL_WRAP_CLASS_NAME);
    }
    if (renderer && !columnProps.render) {
      const rendererType = getRendererType(renderer);
      if (rendererType === "largeNumber") {
        columnProps.align = columnProps.align ?? "right";
      }
      if (rendererType === "image") {
        columnProps.align = columnProps.align ?? "center";
      }
      columnProps.render = (_dom, record) =>
        renderFormattedValue(getRecordValue(record, column.dataIndex), renderer, {
          largeNumber: largeNumberFormat,
          dateTime: dateFormat,
        });
    }
    return { ...columnProps, children: renderedChildren };
  };

  const renderedColumns = columns?.map(renderColumn);

  function handleSearch(values: Record<string, any>) {
    const next = beforeSearchSubmit ? beforeSearchSubmit(values as Params) : values;
    innerRef.current?.setPageInfo?.({ current: 1 });
    setSearchParams(next);
    onSubmit?.(next);
  }

  function handleLoadingChange(
    status: Parameters<
      NonNullable<AntProTableProps<DataSource, Params, ValueType>["onLoadingChange"]>
    >[0],
  ) {
    setSearching(
      typeof status === "object" && status ? status.spinning !== false : Boolean(status),
    );
    onLoadingChange?.(status);
  }

  return (
    <div className="admin-pro-table-shell">
      {search !== false ? (
        <SearchForm
          columns={columns ?? []}
          search={search ?? {}}
          loading={searching}
          formRef={formRef}
          form={form}
          size={size}
          dateFormatter={dateFormatter}
          onSearch={handleSearch}
        />
      ) : null}
      <AntProTable<DataSource, Params, ValueType>
        scroll={{ x: "max-content", y: "100%", ...scroll }}
        tableLayout={tableLayout ?? "auto"}
        {...rest}
        search={false}
        params={{ ...params, ...searchParams } as Params}
        size={size}
        dateFormatter={dateFormatter}
        actionRef={innerRef}
        bordered={bordered}
        options={options ?? false}
        dataSource={overlay ?? dataSource}
        columns={renderedColumns}
        rowKey={rowKey}
        tableClassName={getTableClassName(tableClassName)}
        onDataSourceChange={handleDataSourceChange}
        onLoadingChange={handleLoadingChange}
        request={handleRequest}
      />
    </div>
  );
}
