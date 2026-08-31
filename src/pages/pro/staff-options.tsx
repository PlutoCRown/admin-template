import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";

export const departmentOptions = [
  { label: "研发中心", value: "研发中心" },
  { label: "产品部", value: "产品部" },
  { label: "设计部", value: "设计部" },
  { label: "内容运营", value: "内容运营" },
];

export const roleEnum = {
  admin: { text: "管理员", status: "Error" },
  editor: { text: "编辑", status: "Processing" },
  viewer: { text: "访客", status: "Default" },
};

export const statusEnum = {
  active: { text: "启用", status: "Success", icon: <CheckCircleOutlined /> },
  disabled: { text: "停用", status: "Default", icon: <StopOutlined /> },
};
