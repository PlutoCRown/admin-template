import { useState, isValidElement, type ReactNode } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Dropdown, Tag, type DropdownProps, type MenuProps, type TagProps } from "antd";

export type TagSelectValue = string | number | boolean;

export interface TagSelectValueConfig {
  text: ReactNode;
  status?: string;
  color?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export type TagSelectValueEnum =
  | Map<TagSelectValue, TagSelectValueConfig | ReactNode>
  | Record<string, TagSelectValueConfig | ReactNode>;

interface TagSelectOption {
  value: TagSelectValue;
  label: ReactNode;
  color?: TagProps["color"];
  disabled?: boolean;
  icon?: ReactNode;
}

interface TagSelectProps<Value extends TagSelectValue = TagSelectValue> {
  value: Value;
  valueEnum?: TagSelectValueEnum;
  disabled?: boolean;
  onChange: (value: Value) => Promise<void>;
}

const DROPDOWN_TRIGGER: NonNullable<DropdownProps["trigger"]> = ["click"];

const statusColors: Record<string, TagProps["color"]> = {
  Default: "default",
  Error: "error",
  Processing: "processing",
  Success: "success",
  Warning: "warning",
};

function isValueConfig(value: TagSelectValueConfig | ReactNode): value is TagSelectValueConfig {
  return Boolean(value && typeof value === "object" && !isValidElement(value) && "text" in value);
}

function normalizeObjectKey(key: string, currentValue: TagSelectValue): TagSelectValue {
  if (typeof currentValue === "number") {
    return Number(key);
  }
  if (typeof currentValue === "boolean") {
    return key === "true";
  }
  return key;
}

function getOption(
  value: TagSelectValue,
  config: TagSelectValueConfig | ReactNode,
): TagSelectOption {
  if (!isValueConfig(config)) {
    return { value, label: config };
  }
  return {
    value,
    label: config.text,
    color: config.color ?? (config.status ? statusColors[config.status] : undefined),
    disabled: config.disabled,
    icon: config.icon,
  };
}

function getOptions(valueEnum: TagSelectValueEnum | undefined, currentValue: TagSelectValue) {
  if (!valueEnum) {
    return [];
  }
  if (valueEnum instanceof Map) {
    return Array.from(valueEnum, ([value, config]) => getOption(value, config));
  }
  return Object.entries(valueEnum).map(([value, config]) =>
    getOption(normalizeObjectKey(value, currentValue), config),
  );
}

function isSameValue(left: TagSelectValue, right: TagSelectValue) {
  return Object.is(left, right);
}

function getMenuItem(option: TagSelectOption, index: number) {
  return {
    key: String(index),
    label: (
      <Tag
        color={option.color}
        icon={option.icon}
        className="admin-pro-table-tag-select-menu-value"
      >
        {option.label}
      </Tag>
    ),
    disabled: option.disabled,
  };
}

export function TagSelect<Value extends TagSelectValue = TagSelectValue>({
  value,
  valueEnum,
  disabled = false,
  onChange,
}: TagSelectProps<Value>) {
  const [loading, setLoading] = useState(false);
  const options = getOptions(valueEnum, value);
  const selectedIndex = options.findIndex((option) => isSameValue(option.value, value));
  const selectedOption = options[selectedIndex];
  const items: MenuProps["items"] = options.map(getMenuItem);

  const handleMenuClick: NonNullable<MenuProps["onClick"]> = async ({ key }) => {
    const option = options[Number(key)];
    if (!option || loading || isSameValue(option.value, value)) {
      return;
    }
    setLoading(true);
    try {
      await onChange(option.value as Value);
    } catch {
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const menu: MenuProps = {
    items,
    selectedKeys: selectedIndex >= 0 ? [String(selectedIndex)] : [],
    onClick: handleMenuClick,
  };

  return (
    <Dropdown menu={menu} trigger={DROPDOWN_TRIGGER} disabled={disabled || loading}>
      <button
        type="button"
        className="admin-pro-table-tag-select-trigger"
        disabled={disabled || loading}
      >
        <Tag
          color={selectedOption?.color}
          icon={loading ? <LoadingOutlined spin /> : selectedOption?.icon}
          className="admin-pro-table-tag-select-value"
        >
          {selectedOption?.label ?? String(value)}
        </Tag>
      </button>
    </Dropdown>
  );
}
