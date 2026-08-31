export type FormBuilderFieldType = "text" | "textArea" | "digit" | "select" | "radio" | "checkbox";

export type FormBuilderLayout = "horizontal" | "vertical";

export interface FormBuilderSettings {
  layout: FormBuilderLayout;
  labelWidth: number;
  labelAlign: "left" | "right";
}

export interface FormBuilderField {
  id: string;
  name: string;
  label: string;
  type: FormBuilderFieldType;
  width: number;
  required: boolean;
  block: boolean;
  placeholder: string;
  options: string[];
}

interface FieldTypeDefinition {
  value: FormBuilderFieldType;
  label: string;
  componentName:
    | "FormText"
    | "FormTextArea"
    | "FormDigit"
    | "FormSelect"
    | "FormRadio"
    | "FormCheckbox";
  valueType: "string" | "number" | "array";
  defaultWidth: number;
  defaultBlock: boolean;
}

export const FIELD_TYPE_DEFINITIONS: FieldTypeDefinition[] = [
  {
    value: "text",
    label: "单行文本",
    componentName: "FormText",
    valueType: "string",
    defaultWidth: 12,
    defaultBlock: false,
  },
  {
    value: "textArea",
    label: "多行文本",
    componentName: "FormTextArea",
    valueType: "string",
    defaultWidth: 24,
    defaultBlock: true,
  },
  {
    value: "digit",
    label: "数字",
    componentName: "FormDigit",
    valueType: "number",
    defaultWidth: 8,
    defaultBlock: false,
  },
  {
    value: "select",
    label: "下拉选择",
    componentName: "FormSelect",
    valueType: "string",
    defaultWidth: 12,
    defaultBlock: false,
  },
  {
    value: "radio",
    label: "单选框",
    componentName: "FormRadio",
    valueType: "string",
    defaultWidth: 16,
    defaultBlock: false,
  },
  {
    value: "checkbox",
    label: "多选框",
    componentName: "FormCheckbox",
    valueType: "array",
    defaultWidth: 20,
    defaultBlock: false,
  },
];

export const FIELD_TYPE_OPTIONS = FIELD_TYPE_DEFINITIONS.map((definition) => ({
  value: definition.value,
  label: definition.label,
}));

const defaultSettings: FormBuilderSettings = {
  layout: "horizontal",
  labelWidth: 6,
  labelAlign: "right",
};

const defaultFields: FormBuilderField[] = [
  {
    id: "builder_name",
    name: "name",
    label: "姓名",
    type: "text",
    width: 10,
    required: true,
    block: false,
    placeholder: "请输入姓名",
    options: [],
  },
  {
    id: "builder_bio",
    name: "bio",
    label: "个人简介",
    type: "textArea",
    width: 24,
    required: false,
    block: true,
    placeholder: "请输入个人简介",
    options: [],
  },
  {
    id: "builder_age",
    name: "age",
    label: "年龄",
    type: "digit",
    width: 8,
    required: false,
    block: false,
    placeholder: "请输入年龄",
    options: [],
  },
  {
    id: "builder_department",
    name: "department",
    label: "部门",
    type: "select",
    width: 12,
    required: true,
    block: false,
    placeholder: "请选择部门",
    options: ["研发中心", "产品部", "设计部", "内容运营"],
  },
  {
    id: "builder_gender",
    name: "gender",
    label: "性别",
    type: "radio",
    width: 16,
    required: false,
    block: false,
    placeholder: "请选择性别",
    options: ["男", "女", "其他"],
  },
  {
    id: "builder_interests",
    name: "interests",
    label: "兴趣爱好",
    type: "checkbox",
    width: 20,
    required: false,
    block: false,
    placeholder: "请选择兴趣爱好",
    options: ["阅读", "旅行", "运动", "音乐"],
  },
];

let fieldSequence = defaultFields.length;

function getTypeDefinition(type: FormBuilderFieldType) {
  return FIELD_TYPE_DEFINITIONS.find((definition) => definition.value === type)!;
}

function hasOptions(type: FormBuilderFieldType) {
  return type === "select" || type === "radio" || type === "checkbox";
}

function cloneField(field: FormBuilderField): FormBuilderField {
  return { ...field, options: [...field.options] };
}

export function getDefaultFormBuilderSettings(): FormBuilderSettings {
  return { ...defaultSettings };
}

export function getDefaultFormBuilderFields() {
  return defaultFields.map(cloneField);
}

export function createFormBuilderField(type: FormBuilderFieldType = "text"): FormBuilderField {
  fieldSequence += 1;
  const definition = getTypeDefinition(type);
  return {
    id: `builder_field_${Date.now()}_${fieldSequence}`,
    name: `field${fieldSequence}`,
    label: `字段 ${fieldSequence}`,
    type,
    width: definition.defaultWidth,
    required: false,
    block: definition.defaultBlock,
    placeholder: hasOptions(type) ? "请选择" : "请输入",
    options: hasOptions(type) ? ["选项一", "选项二"] : [],
  };
}

export function applyFieldTypeDefaults(
  field: FormBuilderField,
  type: FormBuilderFieldType,
): Partial<FormBuilderField> {
  const definition = getTypeDefinition(type);
  return {
    type,
    width: definition.defaultWidth,
    block: definition.defaultBlock,
    placeholder: hasOptions(type) ? "请选择" : "请输入",
    options: hasOptions(type) && field.options.length === 0 ? ["选项一", "选项二"] : field.options,
  };
}

export function fieldTypeHasOptions(type: FormBuilderFieldType) {
  return hasOptions(type);
}

export function fieldTypeHasPlaceholder(type: FormBuilderFieldType) {
  return type !== "radio" && type !== "checkbox";
}

function getSafeName(field: FormBuilderField, index: number) {
  return field.name.trim() || `field${index + 1}`;
}

function getSafeLabel(field: FormBuilderField, index: number) {
  return field.label.trim() || `字段 ${index + 1}`;
}

function getTypeScriptPropertyName(name: string) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

function getOptionUnion(field: FormBuilderField) {
  return field.options.length > 0
    ? field.options.map((option) => JSON.stringify(option)).join(" | ")
    : "string";
}

function getFieldTypeScriptType(field: FormBuilderField) {
  if (field.type === "digit") {
    return "number";
  }
  if (field.type === "checkbox") {
    return `Array<${getOptionUnion(field)}>`;
  }
  if (field.type === "select" || field.type === "radio") {
    return getOptionUnion(field);
  }
  return "string";
}

function renderFieldCode(field: FormBuilderField, index: number) {
  const definition = getTypeDefinition(field.type);
  const props = [
    `name=${JSON.stringify(getSafeName(field, index))}`,
    `label=${JSON.stringify(getSafeLabel(field, index))}`,
  ];
  if (!field.block) {
    props.push(`width={${field.width}}`);
  }
  if (field.required) {
    props.push("rules={[{ required: true }]}");
  }
  if (field.block) {
    props.push("block");
  }
  if (field.placeholder.trim() && fieldTypeHasPlaceholder(field.type)) {
    props.push(`placeholder=${JSON.stringify(field.placeholder.trim())}`);
  }
  if (hasOptions(field.type)) {
    props.push(`options={${JSON.stringify(field.options)}}`);
  }

  const renderedProps = props.map((prop) => `        ${prop}`).join("\n");
  return `      <${definition.componentName}\n${renderedProps}\n      />`;
}

export function generateFormCode(fields: FormBuilderField[], settings: FormBuilderSettings) {
  const components = Array.from(
    new Set(fields.map((field) => getTypeDefinition(field.type).componentName)),
  );
  const imports = ["ProForm", ...components].join(", ");
  const renderedFields = fields.map(renderFieldCode).join("\n");
  const formProps: string[] = [];
  if (settings.layout === "vertical") {
    formProps.push('layout="vertical"');
  }
  if (settings.labelWidth > 0) {
    formProps.push(`labelWidth={${settings.labelWidth}}`);
  }
  if (settings.layout !== "vertical") {
    formProps.push(`labelAlign=${JSON.stringify(settings.labelAlign)}`);
  }
  formProps.push("onFinish={handleSubmit}");

  return `import { ${imports} } from "#components/form";

${generatePayloadType(fields)}

async function handleSubmit(values: GeneratedFormPayload) {
  console.log(values);
  return true;
}

export function GeneratedForm() {
  return (
    <ProForm<GeneratedFormPayload>
      ${formProps.join("\n      ")}
    >
${renderedFields || "      {/* 请先添加表单项 */}"}
    </ProForm>
  );
}
`;
}

export function generatePayloadType(fields: FormBuilderField[]) {
  const properties = fields.map((field, index) => {
    const name = getTypeScriptPropertyName(getSafeName(field, index));
    const optional = field.required ? "" : "?";
    return `  ${name}${optional}: ${getFieldTypeScriptType(field)};`;
  });
  return `export interface GeneratedFormPayload {\n${properties.join("\n")}\n}`;
}

export function generateFormSchema(fields: FormBuilderField[], settings: FormBuilderSettings) {
  return JSON.stringify(
    {
      settings,
      fields: fields.map(({ id: _id, ...field }) => field),
    },
    null,
    2,
  );
}

function getJsonSchemaProperty(field: FormBuilderField, index: number) {
  const base = { title: getSafeLabel(field, index) };
  if (field.type === "checkbox") {
    return {
      ...base,
      type: "array",
      items: {
        type: "string",
        ...(field.options.length > 0 ? { enum: field.options } : {}),
      },
    };
  }
  const definition = getTypeDefinition(field.type);
  return {
    ...base,
    type: definition.valueType,
    ...(hasOptions(field.type) && field.options.length > 0 ? { enum: field.options } : {}),
  };
}

export function generateJsonSchema(fields: FormBuilderField[]) {
  const required: string[] = [];
  const properties: Record<string, object> = {};
  fields.forEach((field, index) => {
    const name = getSafeName(field, index);
    if (field.required) {
      required.push(name);
    }
    properties[name] = getJsonSchemaProperty(field, index);
  });
  return JSON.stringify(
    {
      type: "object",
      required,
      properties,
      additionalProperties: false,
    },
    null,
    2,
  );
}

export function generateSamplePayload(fields: FormBuilderField[]) {
  const payload: Record<string, string | number | string[]> = {};
  fields.forEach((field, index) => {
    const name = getSafeName(field, index);
    if (field.type === "digit") {
      payload[name] = 18;
      return;
    }
    if (field.type === "checkbox") {
      payload[name] = field.options.slice(0, 2);
      return;
    }
    if (field.type === "select" || field.type === "radio") {
      payload[name] = field.options[0] ?? "";
      return;
    }
    payload[name] = field.type === "textArea" ? "这是一段示例描述" : "示例文本";
  });
  return JSON.stringify(payload, null, 2);
}
