import { type RefObject } from "react";
import { updateStaffApi, type Staff } from "#api/pro/staff";
import { type ProTableAction } from "#components/pro-table";
import { TextEditPopover } from "#components/text-edit-popover";
import { runOptimistic } from "#hooks/use-optimistic";
import { EditOutlined } from "@ant-design/icons";

interface NameEditorProps {
  record: Staff;
  actionRef: RefObject<ProTableAction<Staff> | null>;
}

function saveStaffName(record: Staff, name: string) {
  return updateStaffApi(record.id, {
    name,
    email: record.email,
    phone: record.phone,
    department: record.department,
    role: record.role,
    status: record.status,
  });
}

export function NameEditor({ record, actionRef }: NameEditorProps) {
  const handleSave = async (name: string) => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    return runOptimistic({
      snapshot,
      next: snapshot.map((item) => (item.id === record.id ? { ...item, name } : item)),
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        const updated = await saveStaffName(record, name);
        action?.setDataSource(snapshot.map((item) => (item.id === record.id ? updated : item)));
      },
    });
  };

  return (
    <TextEditPopover value={record.name} placeholder="姓名" onSave={handleSave}>
      {record.name} <EditOutlined />
    </TextEditPopover>
  );
}
