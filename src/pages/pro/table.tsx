import { useRef } from "react";
import { getStaffListApi, type Staff } from "#api/pro/staff";
import { PageContainer } from "#components/page-container";
import { ProTable, type ProColumns, type ProTableAction } from "#components/pro-table";
import { CreateStaffButton } from "./create-staff-button";
import { departmentOptions, roleEnum, statusEnum } from "./staff-options";
import { StaffRowActions } from "./staff-row-actions";
import { StatusRenderer } from "./status-renderer";

async function requestStaffList(params: {
  current?: number;
  pageSize?: number;
  name?: string;
  department?: string;
  role?: Staff["role"];
  status?: Staff["status"];
}) {
  const result = await getStaffListApi({
    page: params.current,
    pageSize: params.pageSize,
    keyword: params.name,
    department: params.department,
    role: params.role,
    status: params.status,
  });
  return {
    data: result.list,
    success: true,
    total: result.total,
  };
}

export function ProTablePage() {
  const actionRef = useRef<ProTableAction<Staff>>(null);

  const columns: ProColumns<Staff>[] = [
    { title: "姓名", dataIndex: "name", fixed: "left" },
    { title: "邮箱", dataIndex: "email", copyable: true },
    {
      title: "部门",
      dataIndex: "department",
      filters: true,
      valueType: "select",
      fieldProps: { options: departmentOptions },
    },
    { title: "角色", dataIndex: "role", valueEnum: roleEnum },
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: statusEnum,
      render: (_, record) => <StatusRenderer record={record} actionRef={actionRef} />,
    },
    { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime", search: false },
    {
      title: "操作",
      valueType: "option",
      fixed: "right",
      render: (_, record) => <StaffRowActions record={record} actionRef={actionRef} />,
    },
  ];

  return (
    <PageContainer title="ProTable">
      <ProTable<Staff>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ labelWidth: "auto" }}
        headerTitle="员工列表"
        toolBarRender={() => [<CreateStaffButton key="create" actionRef={actionRef} />]}
        request={requestStaffList}
      />
    </PageContainer>
  );
}
