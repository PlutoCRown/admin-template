import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { App, Spin, Typography } from "antd";
import { Navigate, useNavigate } from "react-router";
import { loginApi } from "#api/auth";
import { getErrorMessage } from "#api/client";
import { useStoreHydration } from "#hooks/use-store-hydration";
import { DEMO_ACCOUNTS } from "#mocks/data";
import { useUserStore } from "#stores/user";

export function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const token = useUserStore((state) => state.token);
  const setAuth = useUserStore((state) => state.setAuth);
  const hydrated = useStoreHydration();

  if (!hydrated) {
    return (
      <div
        style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Spin />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoginForm
        title="Admin Template"
        subTitle="React 19 + Antd 6 的中后台模板"
        onFinish={async (values) => {
          try {
            const result = await loginApi({
              username: values.username,
              password: values.password,
            });
            setAuth(result.token, result.user);
            message.success(`欢迎回来，${result.user.nickname}`);
            void navigate("/dashboard", { replace: true });
          } catch (error) {
            message.error(getErrorMessage(error));
          }
        }}
      >
        <ProFormText
          name="username"
          fieldProps={{ size: "large", prefix: <UserOutlined /> }}
          placeholder="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{ size: "large", prefix: <LockOutlined /> }}
          placeholder="密码"
          rules={[{ required: true, message: "请输入密码" }]}
        />
        <Typography.Paragraph type="secondary">
          演示账号：
          {DEMO_ACCOUNTS.map((item) => `${item.username} / ${item.password}`).join("，")}
        </Typography.Paragraph>
      </LoginForm>
    </div>
  );
}
