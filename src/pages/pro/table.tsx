import { useRef, type RefObject } from "react";
import { CheckCircleOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { App, Button, Popconfirm, Space } from "antd";
import { createStaffApi, deleteStaffApi, getStaffListApi, updateStaffApi } from "#api/staff";
import type { Staff, StaffPayload } from "#api/types";
import { FormSelect, FormText } from "#components/form";
import { PageContainer } from "#components/page-container";
import {
  ProTable,
  tagSelectRenderer,
  type ProColumns,
  type ProTableAction,
} from "#components/pro-table";
import { runOptimistic } from "#hooks/use-optimistic";

const departmentOptions = [
  { label: "研发中心", value: "研发中心" },
  { label: "产品部", value: "产品部" },
  { label: "设计部", value: "设计部" },
  { label: "内容运营", value: "内容运营" },
];

const roleEnum = {
  admin: { text: "管理员", status: "Error" },
  editor: { text: "编辑", status: "Processing" },
  viewer: { text: "访客", status: "Default" },
};

const statusEnum = {
  active: { text: "启用", status: "Success", icon: <CheckCircleOutlined /> },
  disabled: { text: "停用", status: "Default", icon: <StopOutlined /> },
};

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

const statusRenderer = tagSelectRenderer<Staff, Staff["status"]>({
  onChange: handleStatusChange,
});

function StaffFormFields() {
  return (
    <>
      <FormText name="name" label="姓名" labelWidth={4} width={12} rules={[{ required: true }]} />
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
        options={departmentOptions}
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
        width={10}
        valueEnum={{ active: "启用", disabled: "停用" }}
        rules={[{ required: true }]}
      />
    </>
  );
}

function CreateStaffButton({ actionRef }: { actionRef: RefObject<ProTableAction<Staff> | null> }) {
  const { message } = App.useApp();
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
      onFinish={async (values) => {
        const action = actionRef.current;
        const snapshot = action?.getDataSource() ?? [];
        const tempId = `tmp_${Date.now()}`;
        const temp: Staff = {
          ...values,
          id: tempId,
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
      }}
    >
      <StaffFormFields />
    </ModalForm>
  );
}

export function ProTablePage() {
  const actionRef = useRef<ProTableAction<Staff>>(null);
  const { message } = App.useApp();

  const columns: ProColumns<Staff>[] = [
    { title: "姓名", dataIndex: "name" },
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
      renderer: statusRenderer,
    },
    { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime", search: false },
    {
      title: "操作",
      valueType: "option",
      render: (_, record) => (
        <Space>
          <ModalForm<StaffPayload>
            title="编辑员工"
            layout="horizontal"
            grid={false}
            className="ch-form"
            trigger={<a>编辑</a>}
            initialValues={record}
            modalProps={{ destroyOnHidden: true }}
            onFinish={async (values) => {
              const action = actionRef.current;
              const snapshot = action?.getDataSource() ?? [];
              const ok = await runOptimistic({
                snapshot,
                next: snapshot.map((item) =>
                  item.id === record.id ? { ...item, ...values } : item,
                ),
                commit: (rows) => action?.setDataSource(rows),
                request: async () => {
                  const updated = await updateStaffApi(record.id, values);
                  action?.setDataSource(
                    snapshot.map((item) => (item.id === record.id ? updated : item)),
                  );
                },
              });
              if (ok) {
                message.success("已更新");
              }
              return ok;
            }}
          >
            <StaffFormFields />
          </ModalForm>
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
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
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
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
        request={async (params) => {
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
        }}
      />
    </PageContainer>
  );
}
