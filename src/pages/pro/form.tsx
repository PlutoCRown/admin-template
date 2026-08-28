import { App, Card } from "antd";
import { createStaffApi } from "#api/staff";
import type { StaffPayload } from "#api/types";
import { FormSelect, FormText, ProForm } from "#components/form";
import { PageContainer } from "#components/page-container";

export function ProFormPage() {
  const { message } = App.useApp();

  return (
    <PageContainer title="ProForm">
      <Card>
        <ProForm<StaffPayload>
          submitter={{ searchConfig: { submitText: "提交" } }}
          onFinish={async (values) => {
            try {
              await createStaffApi(values);
              message.success("员工已创建");
              return true;
            } catch {
              return false;
            }
          }}
        >
          <FormText
            name="name"
            label="姓名"
            labelWidth={4}
            width={8}
            rules={[{ required: true }]}
          />
          <FormText
            name="email"
            label="邮箱"
            labelWidth={4}
            width={20}
            rules={[{ required: true, type: "email" }]}
          />
          <FormText
            name="phone"
            label="手机号"
            labelWidth={4}
            width={13}
            rules={[{ required: true }]}
          />
          <FormSelect
            name="department"
            label="部门"
            labelWidth={4}
            width={12}
            options={["研发中心", "产品部", "设计部", "内容运营"]}
            rules={[{ required: true }]}
          />
          <FormSelect
            name="role"
            label="角色"
            labelWidth={4}
            width={10}
            valueEnum={{ admin: "管理员", editor: "编辑", viewer: "访客" }}
            rules={[{ required: true }]}
          />
          <FormSelect
            name="status"
            label="状态"
            labelWidth={4}
            width={8}
            initialValue="active"
            valueEnum={{ active: "启用", disabled: "停用" }}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
}
