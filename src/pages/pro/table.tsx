import { useRef } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { App, Button, Popconfirm, Space } from "antd";
import { getErrorMessage } from "#api/client";
import { createStaffApi, deleteStaffApi, getStaffListApi, updateStaffApi } from "#api/staff";
import type { Staff, StaffPayload } from "#api/types";

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
  active: { text: "启用", status: "Success" },
  disabled: { text: "停用", status: "Default" },
};

function CreateStaffButton({ onCreated }: { onCreated: () => void }) {
  const { message } = App.useApp();
  return (
    <ModalForm<StaffPayload>
      title="新建员工"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          新建
        </Button>
      }
      initialValues={{ role: "viewer", status: "active" }}
      modalProps={{ destroyOnHidden: true }}
      onFinish={async (values) => {
        try {
          await createStaffApi(values);
          message.success("已创建");
          onCreated();
          return true;
        } catch (error) {
          message.error(getErrorMessage(error));
          return false;
        }
      }}
    >
      <StaffFormFields />
    </ModalForm>
  );
}

function StaffFormFields() {
  return (
    <>
      <ProFormText name="name" label="姓名" rules={[{ required: true }]} />
      <ProFormText name="email" label="邮箱" rules={[{ required: true, type: "email" }]} />
      <ProFormText name="phone" label="手机号" rules={[{ required: true }]} />
      <ProFormSelect
        name="department"
        label="部门"
        options={departmentOptions}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="role"
        label="角色"
        valueEnum={{ admin: "管理员", editor: "编辑", viewer: "访客" }}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={{ active: "启用", disabled: "停用" }}
        rules={[{ required: true }]}
      />
    </>
  );
}

export function ProTablePage() {
  const actionRef = useRef<ActionType>(null);
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
    { title: "状态", dataIndex: "status", valueEnum: statusEnum },
    { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime", search: false },
    {
      title: "操作",
      valueType: "option",
      render: (_, record) => (
        <Space>
          <ModalForm<StaffPayload>
            title="编辑员工"
            trigger={<a>编辑</a>}
            initialValues={record}
            modalProps={{ destroyOnHidden: true }}
            onFinish={async (values) => {
              try {
                await updateStaffApi(record.id, values);
                message.success("已更新");
                void actionRef.current?.reload();
                return true;
              } catch (error) {
                message.error(getErrorMessage(error));
                return false;
              }
            }}
          >
            <StaffFormFields />
          </ModalForm>
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
              try {
                await deleteStaffApi(record.id);
                message.success("已删除");
                void actionRef.current?.reload();
              } catch (error) {
                message.error(getErrorMessage(error));
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
        toolBarRender={() => [
          <CreateStaffButton key="create" onCreated={() => actionRef.current?.reload()} />,
        ]}
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
