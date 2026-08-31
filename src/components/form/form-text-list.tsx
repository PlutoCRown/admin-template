import { ProForm as AntProForm, type ProFormItemProps } from "@ant-design/pro-components";
import { chFormItemProps, type ChWidthProps } from "./ch";
import { TextList, type TextListProps } from "./text-list";

export type FormTextListProps = Omit<ProFormItemProps, "placeholder"> &
  ChWidthProps &
  Omit<TextListProps, "value" | "onChange">;

export function FormTextList({
  width,
  labelWidth,
  block = true,
  placeholder,
  sortable,
  creator,
  creatorText,
  creatorValue,
  removable,
  disabled,
  className,
  style,
  ...rest
}: FormTextListProps) {
  const ch = chFormItemProps({ width, labelWidth, block }, { className, style });
  return (
    <AntProForm.Item {...rest} {...ch}>
      <TextList
        placeholder={placeholder}
        sortable={sortable}
        creator={creator}
        creatorText={creatorText}
        creatorValue={creatorValue}
        removable={removable}
        disabled={disabled}
      />
    </AntProForm.Item>
  );
}
