import { PageContainer, ProForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { App, Card } from "antd";
import { getErrorMessage } from "#api/client";
import { createStaffApi } from "#api/staff";
import type { StaffPayload } from "#api/types";

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
            } catch (error) {
              message.error(getErrorMessage(error));
              return false;
            }
          }}
        >
          <ProForm.Group>
            <ProFormText name="name" label="姓名" width="md" rules={[{ required: true }]} />
            <ProFormText
              name="email"
              label="邮箱"
              width="md"
              rules={[{ required: true, type: "email" }]}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="phone" label="手机号" width="md" rules={[{ required: true }]} />
            <ProFormSelect
              name="department"
              label="部门"
              width="md"
              options={["研发中心", "产品部", "设计部", "内容运营"]}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormSelect
              name="role"
              label="角色"
              width="md"
              valueEnum={{ admin: "管理员", editor: "编辑", viewer: "访客" }}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="status"
              label="状态"
              width="md"
              initialValue="active"
              valueEnum={{ active: "启用", disabled: "停用" }}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
}
