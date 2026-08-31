import { type RefObject } from "react";
import { updateStaffApi, type Staff } from "#api/pro/staff";
import { TagSelect, type ProTableAction } from "#components/pro-table";
import { runOptimistic } from "#hooks/use-optimistic";
import { statusEnum } from "./staff-options";

interface StatusRendererProps {
  record: Staff;
  actionRef: RefObject<ProTableAction<Staff> | null>;
}

function handleStatusChange(status: Staff["status"], record: Staff) {
  return updateStaffApi(record.id, {
    name: record.name,
    email: record.email,
    phone: record.phone,
    department: record.department,
    role: record.role,
    status,
  });
}

export function StatusRenderer({ record, actionRef }: StatusRendererProps) {
  const handleChange = async (status: Staff["status"]) => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    await runOptimistic({
      snapshot,
      next: snapshot.map((item) => (item.id === record.id ? { ...item, status } : item)),
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        const updated = await handleStatusChange(status, record);
        action?.setDataSource(snapshot.map((item) => (item.id === record.id ? updated : item)));
      },
    });
  };

  return <TagSelect value={record.status} valueEnum={statusEnum} onChange={handleChange} />;
}
