import type { ComponentType } from "react";
import {
  ProFormCheckbox as AntProFormCheckbox,
  ProFormDigit as AntProFormDigit,
  ProFormRadio as AntProFormRadio,
  ProFormSelect as AntProFormSelect,
  ProFormText as AntProFormText,
  ProFormTextArea as AntProFormTextArea,
} from "@ant-design/pro-components";
import { chFormItemProps, type ChWidthProps } from "./ch";

type WidthProp = { width?: number | "xs" | "sm" | "md" | "lg" | "xl" };
type FormItemBag = {
  formItemProps?: object;
  fieldProps?: { style?: object };
  fieldConfig?: object;
};

type ChFieldProps<P> = Omit<P, "width"> & ChWidthProps;

function withChField<P extends WidthProp & FormItemBag>(
  Field: ComponentType<P>,
  defaultBlock = false,
) {
  function ChField(props: ChFieldProps<P>) {
    const {
      width,
      labelWidth,
      block = defaultBlock,
      formItemProps,
      fieldProps,
      fieldConfig,
      ...rest
    } = props;
    return (
      <Field
        {...(rest as P)}
        fieldConfig={{ ignoreWidth: true, ...fieldConfig }}
        formItemProps={chFormItemProps({ width, labelWidth, block }, formItemProps)}
        fieldProps={{
          ...fieldProps,
          style: {
            width: "100%",
            maxWidth: "100%",
            ...fieldProps?.style,
          },
        }}
      />
    );
  }
  ChField.displayName = `Ch(${Field.displayName || Field.name || "Field"})`;
  return ChField;
}

export const FormText = withChField(AntProFormText);
export const FormSelect = withChField(AntProFormSelect);
export const FormDigit = withChField(AntProFormDigit);
export const FormTextArea = withChField(AntProFormTextArea, true);
export const FormRadio = withChField(AntProFormRadio.Group);
export const FormCheckbox = withChField(AntProFormCheckbox.Group);
