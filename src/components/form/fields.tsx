import type { ComponentType } from "react";
import {
  ProFormCascader as AntProFormCascader,
  ProFormCheckbox as AntProFormCheckbox,
  ProFormDatePicker as AntProFormDatePicker,
  ProFormDateTimePicker as AntProFormDateTimePicker,
  ProFormDigit as AntProFormDigit,
  ProFormMoney as AntProFormMoney,
  ProFormRadio as AntProFormRadio,
  ProFormSegmented as AntProFormSegmented,
  ProFormSelect as AntProFormSelect,
  ProFormSwitch as AntProFormSwitch,
  ProFormText as AntProFormText,
  ProFormTextArea as AntProFormTextArea,
  ProFormTimePicker as AntProFormTimePicker,
  ProFormTreeSelect as AntProFormTreeSelect,
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
  fillWidth = true,
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
          style: fillWidth
            ? {
                width: "100%",
                maxWidth: "100%",
                ...fieldProps?.style,
              }
            : fieldProps?.style,
        }}
      />
    );
  }
  ChField.displayName = `Ch(${Field.displayName || Field.name || "Field"})`;
  return ChField;
}

function withOptionsField<P extends WidthProp & FormItemBag>(
  Field: ComponentType<P>,
  optionsKey: "options" | "treeData" = "options",
  defaultBlock = false,
) {
  const ChField = withChField(Field, defaultBlock);
  function OptionsField(props: ChFieldProps<P> & { options?: unknown[] }) {
    const { options, fieldProps, ...rest } = props;
    return (
      <ChField
        {...(rest as ChFieldProps<P>)}
        fieldProps={{
          ...(options != null ? { [optionsKey]: options } : {}),
          ...fieldProps,
        }}
      />
    );
  }
  OptionsField.displayName = `ChOptions(${Field.displayName || Field.name || "Field"})`;
  return OptionsField;
}

export const FormText = withChField(AntProFormText);
export const FormSelect = withChField(AntProFormSelect);
export const FormDigit = withChField(AntProFormDigit);
export const FormTextArea = withChField(AntProFormTextArea, true);
export const FormRadio = withChField(AntProFormRadio.Group);
export const FormCheckbox = withChField(AntProFormCheckbox.Group);
export const FormTime = withChField(AntProFormTimePicker);
export const FormDate = withChField(AntProFormDatePicker);
export const FormDateTime = withChField(AntProFormDateTimePicker);
export const FormCascader = withOptionsField(AntProFormCascader);
export const FormTreeSelect = withOptionsField(AntProFormTreeSelect, "treeData");
export const FormSwitch = withChField(AntProFormSwitch, false, false);
export const FormSegmented = withOptionsField(AntProFormSegmented);
export const FormMoney = withChField(AntProFormMoney);
