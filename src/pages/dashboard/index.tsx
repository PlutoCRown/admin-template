import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTimePicker,
} from "@ant-design/pro-components";
import { Descriptions, Form, Input, Select, Space, Tag, TimePicker, Typography } from "antd";
import { PageContainer } from "#components/page-container";
import { useUserStore } from "#stores/user";
import styles from "./dashboard.module.css";

const stack = [
  ["构建", "Rsbuild 2"],
  ["运行时", "Bun"],
  ["UI", "Ant Design 6"],
  ["状态", "Zustand + Immer"],
];

export function DashboardPage() {
  const user = useUserStore((state) => state.user);

  return (
    <PageContainer title="工作台">
      <Space orientation="vertical" size="large" className={styles.stack}>
        <ProCard title="当前用户">
          <Descriptions column={2}>
            <Descriptions.Item label="姓名">{user?.nickname}</Descriptions.Item>
            <Descriptions.Item label="账号">{user?.username}</Descriptions.Item>
            <Descriptions.Item label="部门">{user?.department}</Descriptions.Item>
            <Descriptions.Item label="职位">{user?.title}</Descriptions.Item>
            <Descriptions.Item label="角色">
              {user?.roles.map((role) => (
                <Tag key={role}>{role}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          </Descriptions>
        </ProCard>
        <ProCard title="技术栈">
          <Space wrap>
            {stack.map(([label, value]) => (
              <Tag key={label}>
                {label} · {value}
              </Tag>
            ))}
          </Space>
          <Typography.Paragraph className={styles.hint} type="secondary">
            左侧菜单里可以依次查看
            ProTable、ProForm、ProList、SchemaForm、ProDescriptions，以及带拖拽排序的上传表单。
          </Typography.Paragraph>
        </ProCard>
        <ProForm submitter={false}>
          <ProFormText name="name" label="姓名" />
          <ProFormSelect
            name="role"
            label="角色"
            options={[
              { label: "管理员", value: "admin" },
              { label: "用户", value: "user" },
            ]}
          />
          <ProFormTextArea name="description" label="描述" />
          <ProFormTimePicker name="time" label="时间" />
        </ProForm>
      </Space>
    </PageContainer>
  );
}
