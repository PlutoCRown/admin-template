import { type RefObject } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { App, Button } from "antd";
import { createStaffApi, type Staff, type StaffPayload } from "#api/pro/staff";
import { type ProTableAction } from "#components/pro-table";
import { runOptimistic } from "#hooks/use-optimistic";
import { StaffFormFields } from "./staff-form-fields";

interface CreateStaffButtonProps {
  actionRef: RefObject<ProTableAction<Staff> | null>;
}

export function CreateStaffButton({ actionRef }: CreateStaffButtonProps) {
  const { message } = App.useApp();

  const handleFinish = async (values: StaffPayload) => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    const temp: Staff = {
      ...values,
      id: `tmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const ok = await runOptimistic({
      snapshot,
      next: [temp, ...snapshot],
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        const created = await createStaffApi(values);
        action?.setDataSource([created, ...snapshot]);
      },
    });
    if (ok) {
      message.success("已创建");
    }
    return ok;
  };

  return (
    <ModalForm<StaffPayload>
      title="新建员工"
      layout="horizontal"
      grid={false}
      className="ch-form"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          新建
        </Button>
      }
      initialValues={{ role: "viewer", status: "active" }}
      modalProps={{ destroyOnHidden: true }}
      onFinish={handleFinish}
    >
      <StaffFormFields />
    </ModalForm>
  );
}
