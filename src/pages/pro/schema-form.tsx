import { BetaSchemaForm, PageContainer, type ProFormColumnsType } from "@ant-design/pro-components";
import { App, Card } from "antd";
import { getErrorMessage } from "#api/client";
import { createStaffApi } from "#api/staff";
import type { StaffPayload } from "#api/types";

const columns: ProFormColumnsType<StaffPayload>[] = [
  {
    title: "姓名",
    dataIndex: "name",
    formItemProps: { rules: [{ required: true, message: "请输入姓名" }] },
  },
  {
    title: "邮箱",
    dataIndex: "email",
    valueType: "text",
    formItemProps: { rules: [{ required: true, type: "email", message: "请输入邮箱" }] },
  },
  {
    title: "手机号",
    dataIndex: "phone",
    formItemProps: { rules: [{ required: true }] },
  },
  {
    title: "部门",
    dataIndex: "department",
    valueType: "select",
    valueEnum: {
      研发中心: "研发中心",
      产品部: "产品部",
      设计部: "设计部",
      内容运营: "内容运营",
    },
    formItemProps: { rules: [{ required: true }] },
  },
  {
    title: "角色",
    dataIndex: "role",
    valueType: "radio",
    valueEnum: {
      admin: "管理员",
      editor: "编辑",
      viewer: "访客",
    },
    formItemProps: { rules: [{ required: true }] },
  },
  {
    title: "状态",
    dataIndex: "status",
    valueType: "select",
    initialValue: "active",
    valueEnum: {
      active: "启用",
      disabled: "停用",
    },
  },
];

export function SchemaFormPage() {
  const { message } = App.useApp();

  return (
    <PageContainer title="SchemaForm">
      <Card>
        <BetaSchemaForm<StaffPayload>
          layoutType="Form"
          columns={columns}
          onFinish={async (values) => {
            try {
              await createStaffApi(values);
              message.success("已通过 Schema 创建员工");
              return true;
            } catch (error) {
              message.error(getErrorMessage(error));
              return false;
            }
          }}
        />
      </Card>
    </PageContainer>
  );
}
