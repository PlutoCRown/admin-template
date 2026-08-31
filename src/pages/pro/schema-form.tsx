import { BetaSchemaForm, type ProFormColumnsType } from "@ant-design/pro-components";
import { App, Card } from "antd";
import { createStaffApi, type StaffPayload } from "#api/pro/staff";
import { chFormItemProps } from "#components/form";
import { PageContainer } from "#components/page-container";

const labelWidth = 4;

const columns: ProFormColumnsType<StaffPayload>[] = [
  {
    title: "姓名",
    dataIndex: "name",
    formItemProps: {
      ...chFormItemProps({ labelWidth, width: 8 }),
      rules: [{ required: true, message: "请输入姓名" }],
    },
  },
  {
    title: "邮箱",
    dataIndex: "email",
    valueType: "text",
    formItemProps: {
      ...chFormItemProps({ labelWidth, width: 20 }),
      rules: [{ required: true, type: "email", message: "请输入邮箱" }],
    },
  },
  {
    title: "手机号",
    dataIndex: "phone",
    formItemProps: {
      ...chFormItemProps({ labelWidth, width: 13 }),
      rules: [{ required: true }],
    },
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
    formItemProps: {
      ...chFormItemProps({ labelWidth, width: 12 }),
      rules: [{ required: true }],
    },
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
    formItemProps: {
      ...chFormItemProps({ labelWidth, width: 16 }),
      rules: [{ required: true }],
    },
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
    formItemProps: chFormItemProps({ labelWidth, width: 8 }),
  },
];

export function SchemaFormPage() {
  const { message } = App.useApp();

  const handleFinish = async (values: StaffPayload) => {
    try {
      await createStaffApi(values);
      message.success("已通过 Schema 创建员工");
      return true;
    } catch {
      return false;
    }
  };

  return (
    <PageContainer title="SchemaForm">
      <Card>
        <BetaSchemaForm<StaffPayload>
          layoutType="Form"
          layout="horizontal"
          grid={false}
          labelCol={{ flex: "0 0 auto" }}
          wrapperCol={{ flex: "none" }}
          className="ch-form"
          columns={columns}
          onFinish={handleFinish}
        />
      </Card>
    </PageContainer>
  );
}
