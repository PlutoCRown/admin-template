import { type RefObject } from "react";
import { ModalForm } from "@ant-design/pro-components";
import { App, Popconfirm, Space } from "antd";
import { deleteStaffApi, updateStaffApi, type Staff, type StaffPayload } from "#api/pro/staff";
import { type ProTableAction } from "#components/pro-table";
import { runOptimistic } from "#hooks/use-optimistic";
import { StaffFormFields } from "./staff-form-fields";

interface StaffRowActionsProps {
  record: Staff;
  actionRef: RefObject<ProTableAction<Staff> | null>;
}

export function StaffRowActions({ record, actionRef }: StaffRowActionsProps) {
  const { message } = App.useApp();

  const handleUpdate = async (values: StaffPayload) => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    const ok = await runOptimistic({
      snapshot,
      next: snapshot.map((item) => (item.id === record.id ? { ...item, ...values } : item)),
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        const updated = await updateStaffApi(record.id, values);
        action?.setDataSource(snapshot.map((item) => (item.id === record.id ? updated : item)));
      },
    });
    if (ok) {
      message.success("已更新");
    }
    return ok;
  };

  const handleDelete = async () => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    const ok = await runOptimistic({
      snapshot,
      next: snapshot.filter((item) => item.id !== record.id),
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        await deleteStaffApi(record.id);
      },
    });
    if (ok) {
      message.success("已删除");
    }
  };

  return (
    <Space>
      <ModalForm<StaffPayload>
        title="编辑员工"
        layout="horizontal"
        grid={false}
        className="ch-form"
        trigger={<a>编辑</a>}
        initialValues={record}
        modalProps={{ destroyOnHidden: true }}
        onFinish={handleUpdate}
      >
        <StaffFormFields />
      </ModalForm>
      <Popconfirm title="确认删除？" onConfirm={handleDelete}>
        <a>删除</a>
      </Popconfirm>
    </Space>
  );
}
