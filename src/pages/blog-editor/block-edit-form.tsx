import dayjs, { type Dayjs } from "dayjs";
import { FormDateTime, FormSelect, FormText, FormTextArea, ProForm } from "#components/form";
import type { BlockAttrMap, BlockDef, BlockFieldDef } from "#pages/blog-shared/types";

interface BlockEditFormProps {
  def: BlockDef;
  attrs: BlockAttrMap;
  onSave: (attrs: BlockAttrMap) => void;
}

type FormValues = Record<string, string | Dayjs | undefined>;

function toFormValues(def: BlockDef, attrs: BlockAttrMap): FormValues {
  return Object.fromEntries(
    def.fields.map((field) => {
      const raw = attrs[field.key] ?? def.defaults[field.key] ?? "";
      if (field.type === "datetime" && raw) {
        const parsed = dayjs(raw);
        return [field.key, parsed.isValid() ? parsed : raw];
      }
      return [field.key, raw];
    }),
  );
}

function toAttrs(def: BlockDef, values: FormValues): BlockAttrMap {
  return Object.fromEntries(
    def.fields.map((field) => {
      const value = values[field.key];
      if (dayjs.isDayjs(value)) {
        return [field.key, value.format("YYYY-MM-DDTHH:mm:ssZ")];
      }
      return [field.key, typeof value === "string" ? value : ""];
    }),
  );
}

function FieldControl({ field }: { field: BlockFieldDef }) {
  if (field.type === "textarea") {
    return <FormTextArea name={field.key} label={field.label} labelWidth={5} block />;
  }
  if (field.type === "select") {
    return (
      <FormSelect
        name={field.key}
        label={field.label}
        labelWidth={5}
        width={16}
        options={field.options}
      />
    );
  }
  if (field.type === "datetime") {
    return (
      <FormDateTime
        name={field.key}
        label={field.label}
        labelWidth={5}
        width={18}
        fieldProps={{ showTime: true, format: "YYYY-MM-DD HH:mm" }}
      />
    );
  }
  return <FormText name={field.key} label={field.label} labelWidth={5} width={18} />;
}

export function BlockEditForm({ def, attrs, onSave }: BlockEditFormProps) {
  return (
    <ProForm<FormValues>
      submitter={{ searchConfig: { submitText: "保存" }, resetButtonProps: false }}
      initialValues={toFormValues(def, attrs)}
      onFinish={async (values) => {
        onSave(toAttrs(def, values));
        return true;
      }}
    >
      {def.fields.map((field) => (
        <FieldControl key={field.key} field={field} />
      ))}
    </ProForm>
  );
}
