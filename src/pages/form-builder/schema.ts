export type FormBuilderFieldType =
  | "text"
  | "textArea"
  | "digit"
  | "select"
  | "radio"
  | "checkbox"
  | "time"
  | "date"
  | "dateTime"
  | "cascader"
  | "treeSelect"
  | "switch"
  | "segmented"
  | "money"
  | "textList";

export type FormBuilderLayout = "horizontal" | "vertical";

export interface FormBuilderSettings {
  layout: FormBuilderLayout;
  labelWidth: number;
  labelAlign: "left" | "right";
  /** 水平布局时是否显示 label 后的冒号；垂直布局无效 */
  colon: boolean;
}

export interface FormBuilderField {
  id: string;
  name: string;
  label: string;
  type: FormBuilderFieldType;
  /** 不支持宽度的类型（radio/checkbox/switch/segmented）保持 undefined */
  width?: number;
  required: boolean;
  block: boolean;
  /** antd 支持 allowClear 的类型可配；不支持的类型保持 undefined */
  allowClear?: boolean;
  /** textList：是否显示新增按钮，默认 true */
  creator?: boolean;
  /** textList：是否可拖拽排序，默认 true */
  sortable?: boolean;
  /** textList：是否显示删除按钮，默认 true */
  removable?: boolean;
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
    | "FormCheckbox"
    | "FormTime"
    | "FormDate"
    | "FormDateTime"
    | "FormCascader"
    | "FormTreeSelect"
    | "FormSwitch"
    | "FormSegmented"
    | "FormMoney"
    | "FormTextList";
  valueType: "string" | "number" | "array" | "boolean";
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
  {
    value: "time",
    label: "时间",
    componentName: "FormTime",
    valueType: "string",
    defaultWidth: 12,
    defaultBlock: false,
  },
  {
    value: "date",
    label: "日期",
    componentName: "FormDate",
    valueType: "string",
    defaultWidth: 12,
    defaultBlock: false,
  },
  {
    value: "dateTime",
    label: "日期时间",
    componentName: "FormDateTime",
    valueType: "string",
    defaultWidth: 20,
    defaultBlock: false,
  },
  {
    value: "cascader",
    label: "级联选择",
    componentName: "FormCascader",
    valueType: "array",
    defaultWidth: 14,
    defaultBlock: false,
  },
  {
    value: "treeSelect",
    label: "树选择",
    componentName: "FormTreeSelect",
    valueType: "string",
    defaultWidth: 14,
    defaultBlock: false,
  },
  {
    value: "switch",
    label: "开关",
    componentName: "FormSwitch",
    valueType: "boolean",
    defaultWidth: 8,
    defaultBlock: false,
  },
  {
    value: "segmented",
    label: "分段选择",
    componentName: "FormSegmented",
    valueType: "string",
    defaultWidth: 16,
    defaultBlock: false,
  },
  {
    value: "money",
    label: "金额",
    componentName: "FormMoney",
    valueType: "number",
    defaultWidth: 12,
    defaultBlock: false,
  },
  {
    value: "textList",
    label: "文本列表",
    componentName: "FormTextList",
    valueType: "array",
    defaultWidth: 24,
    defaultBlock: true,
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
  colon: false,
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
    placeholder: "整数",
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
    required: false,
    block: false,
    placeholder: "请选择兴趣爱好",
    options: ["阅读", "旅行", "运动", "音乐"],
  },
  {
    id: "builder_tags",
    name: "tags",
    label: "标签",
    type: "textList",
    width: 24,
    required: false,
    block: true,
    placeholder: "请输入标签",
    options: [],
    creator: true,
    sortable: true,
    removable: true,
  },
  {
    id: "builder_start_time",
    name: "startTime",
    label: "开始时间",
    type: "time",
    width: 12,
    required: false,
    block: false,
    placeholder: "请选择开始时间",
    options: [],
  },
  {
    id: "builder_join_date",
    name: "joinDate",
    label: "入职日期",
    type: "date",
    width: 12,
    required: false,
    block: false,
    placeholder: "请选择入职日期",
    options: [],
  },
  {
    id: "builder_meeting_at",
    name: "meetingAt",
    label: "会议时间",
    type: "dateTime",
    width: 20,
    required: false,
    block: false,
    placeholder: "请选择会议时间",
    options: [],
  },
  {
    id: "builder_region",
    name: "region",
    label: "所属地区",
    type: "cascader",
    width: 14,
    required: false,
    block: false,
    placeholder: "请选择所属地区",
    options: ["华东", "华南", "华北"],
  },
  {
    id: "builder_org",
    name: "org",
    label: "组织架构",
    type: "treeSelect",
    width: 14,
    required: false,
    block: false,
    placeholder: "请选择组织架构",
    options: ["研发中心", "产品部", "设计部"],
  },
  {
    id: "builder_enabled",
    name: "enabled",
    label: "是否启用",
    type: "switch",
    required: false,
    block: false,
    placeholder: "",
    options: [],
  },
  {
    id: "builder_status",
    name: "taskStatus",
    label: "任务状态",
    type: "segmented",
    required: false,
    block: false,
    placeholder: "",
    options: ["待处理", "进行中", "已完成"],
  },
  {
    id: "builder_budget",
    name: "budget",
    label: "预算金额",
    type: "money",
    width: 12,
    required: false,
    block: false,
    placeholder: "请输入预算金额",
    options: [],
  },
];

let fieldSequence = defaultFields.length;

function getTypeDefinition(type: FormBuilderFieldType) {
  return FIELD_TYPE_DEFINITIONS.find((definition) => definition.value === type)!;
}

const OPTION_FIELD_TYPES = new Set<FormBuilderFieldType>([
  "select",
  "radio",
  "checkbox",
  "cascader",
  "treeSelect",
  "segmented",
]);

const PLACEHOLDER_HIDDEN_TYPES = new Set<FormBuilderFieldType>([
  "radio",
  "checkbox",
  "switch",
  "segmented",
]);

/** antd 无 allowClear 的控件：Radio / Checkbox / Switch / Segmented / TextList */
const ALLOW_CLEAR_HIDDEN_TYPES = new Set<FormBuilderFieldType>([
  ...PLACEHOLDER_HIDDEN_TYPES,
  "textList",
]);

const WIDTH_HIDDEN_TYPES = new Set<FormBuilderFieldType>([
  "radio",
  "checkbox",
  "switch",
  "segmented",
]);

const SELECT_LIKE_TYPES = new Set<FormBuilderFieldType>([
  ...OPTION_FIELD_TYPES,
  "time",
  "date",
  "dateTime",
]);

function hasOptions(type: FormBuilderFieldType) {
  return OPTION_FIELD_TYPES.has(type);
}

function getDefaultPlaceholder(type: FormBuilderFieldType) {
  if (PLACEHOLDER_HIDDEN_TYPES.has(type)) {
    return "";
  }
  return SELECT_LIKE_TYPES.has(type) ? "请选择" : "请输入";
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

function getDefaultWidth(type: FormBuilderFieldType): number | undefined {
  if (WIDTH_HIDDEN_TYPES.has(type)) {
    return undefined;
  }
  return getTypeDefinition(type).defaultWidth;
}

function getDefaultAllowClear(type: FormBuilderFieldType): boolean | undefined {
  if (ALLOW_CLEAR_HIDDEN_TYPES.has(type)) {
    return undefined;
  }
  return true;
}

function getDefaultListControl(type: FormBuilderFieldType): boolean | undefined {
  if (type !== "textList") {
    return undefined;
  }
  return true;
}

export function createFormBuilderField(type: FormBuilderFieldType = "text"): FormBuilderField {
  fieldSequence += 1;
  const definition = getTypeDefinition(type);
  return {
    id: `builder_field_${Date.now()}_${fieldSequence}`,
    name: `field${fieldSequence}`,
    label: `字段 ${fieldSequence}`,
    type,
    width: getDefaultWidth(type),
    required: false,
    block: definition.defaultBlock,
    allowClear: getDefaultAllowClear(type),
    creator: getDefaultListControl(type),
    sortable: getDefaultListControl(type),
    removable: getDefaultListControl(type),
    placeholder: getDefaultPlaceholder(type),
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
    width: getDefaultWidth(type),
    block: definition.defaultBlock,
    allowClear: getDefaultAllowClear(type),
    creator: getDefaultListControl(type),
    sortable: getDefaultListControl(type),
    removable: getDefaultListControl(type),
    placeholder: getDefaultPlaceholder(type),
    options: hasOptions(type) && field.options.length === 0 ? ["选项一", "选项二"] : field.options,
  };
}

export function fieldTypeHasOptions(type: FormBuilderFieldType) {
  return hasOptions(type);
}

export function fieldTypeHasPlaceholder(type: FormBuilderFieldType) {
  return !PLACEHOLDER_HIDDEN_TYPES.has(type);
}

export function fieldTypeHasAllowClear(type: FormBuilderFieldType) {
  return !ALLOW_CLEAR_HIDDEN_TYPES.has(type);
}

export function fieldTypeHasListControls(type: FormBuilderFieldType) {
  return type === "textList";
}

export function fieldTypeHasWidth(type: FormBuilderFieldType) {
  return !WIDTH_HIDDEN_TYPES.has(type);
}

/** 支持清空的类型默认 true（兼容旧数据未写 allowClear） */
export function getFieldAllowClear(field: FormBuilderField) {
  if (!fieldTypeHasAllowClear(field.type)) {
    return false;
  }
  return field.allowClear ?? true;
}

export function getFieldCreator(field: FormBuilderField) {
  if (!fieldTypeHasListControls(field.type)) {
    return false;
  }
  return field.creator ?? true;
}

export function getFieldSortable(field: FormBuilderField) {
  if (!fieldTypeHasListControls(field.type)) {
    return false;
  }
  return field.sortable ?? true;
}

export function getFieldRemovable(field: FormBuilderField) {
  if (!fieldTypeHasListControls(field.type)) {
    return false;
  }
  return field.removable ?? true;
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
  if (field.type === "digit" || field.type === "money") {
    return "number";
  }
  if (field.type === "switch") {
    return "boolean";
  }
  if (field.type === "textList") {
    return "string[]";
  }
  if (field.type === "checkbox" || field.type === "cascader") {
    return `Array<${getOptionUnion(field)}>`;
  }
  if (
    field.type === "select" ||
    field.type === "radio" ||
    field.type === "treeSelect" ||
    field.type === "segmented"
  ) {
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
  if (!field.block && field.width != null) {
    props.push(`width={${field.width}}`);
  }
  if (field.required) {
    props.push(
      field.type === "textList"
        ? 'rules={[{ required: true, type: "array", min: 1 }]}'
        : "rules={[{ required: true }]}",
    );
  }
  if (field.block) {
    props.push("block");
  }
  if (field.placeholder.trim() && fieldTypeHasPlaceholder(field.type)) {
    props.push(`placeholder=${JSON.stringify(field.placeholder.trim())}`);
  }
  if (fieldTypeHasAllowClear(field.type)) {
    props.push(`fieldProps={{ allowClear: ${getFieldAllowClear(field)} }}`);
  }
  if (hasOptions(field.type)) {
    props.push(`options={${JSON.stringify(field.options)}}`);
  }
  if (fieldTypeHasListControls(field.type)) {
    if (!getFieldSortable(field)) {
      props.push("sortable={false}");
    }
    if (!getFieldCreator(field)) {
      props.push("creator={false}");
    }
    if (!getFieldRemovable(field)) {
      props.push("removable={false}");
    }
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
    formProps.push(`colon={${settings.colon}}`);
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
      fields: fields.map(
        ({ id: _id, width, allowClear, creator, sortable, removable, ...field }) => ({
          ...field,
          ...(fieldTypeHasWidth(field.type) && width != null ? { width } : {}),
          ...(fieldTypeHasAllowClear(field.type) ? { allowClear: allowClear ?? true } : {}),
          ...(fieldTypeHasListControls(field.type)
            ? {
                creator: creator ?? true,
                sortable: sortable ?? true,
                removable: removable ?? true,
              }
            : {}),
        }),
      ),
    },
    null,
    2,
  );
}

function getJsonSchemaProperty(field: FormBuilderField, index: number) {
  const base = { title: getSafeLabel(field, index) };
  if (field.type === "textList") {
    return { ...base, type: "array", items: { type: "string" } };
  }
  if (field.type === "checkbox" || field.type === "cascader") {
    return {
      ...base,
      type: "array",
      items: {
        type: "string",
        ...(field.options.length > 0 ? { enum: field.options } : {}),
      },
    };
  }
  if (field.type === "date") {
    return { ...base, type: "string", format: "date" };
  }
  if (field.type === "time") {
    return { ...base, type: "string", format: "time" };
  }
  if (field.type === "dateTime") {
    return { ...base, type: "string", format: "date-time" };
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
  const payload: Record<string, string | number | boolean | string[]> = {};
  fields.forEach((field, index) => {
    const name = getSafeName(field, index);
    if (field.type === "digit") {
      payload[name] = 18;
      return;
    }
    if (field.type === "money") {
      payload[name] = 1280;
      return;
    }
    if (field.type === "switch") {
      payload[name] = true;
      return;
    }
    if (field.type === "checkbox") {
      payload[name] = field.options.slice(0, 2);
      return;
    }
    if (field.type === "textList") {
      payload[name] = ["示例一", "示例二"];
      return;
    }
    if (field.type === "cascader") {
      payload[name] = field.options[0] ? [field.options[0]] : [];
      return;
    }
    if (field.type === "date") {
      payload[name] = "2026-08-31";
      return;
    }
    if (field.type === "time") {
      payload[name] = "11:00:00";
      return;
    }
    if (field.type === "dateTime") {
      payload[name] = "2026-08-31 11:00:00";
      return;
    }
    if (
      field.type === "select" ||
      field.type === "radio" ||
      field.type === "treeSelect" ||
      field.type === "segmented"
    ) {
      payload[name] = field.options[0] ?? "";
      return;
    }
    payload[name] = field.type === "textArea" ? "这是一段示例描述" : "示例文本";
  });
  return JSON.stringify(payload, null, 2);
}
