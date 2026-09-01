import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { App, Spin, Typography } from "antd";
import { Navigate, useNavigate } from "react-router";
import { loginApi, type LoginPayload } from "#api/login";
import { useStoreHydration } from "#hooks/use-store-hydration";
import { DEMO_ACCOUNTS } from "#constants/demo";
import { useUserStore } from "#stores/user";
import styles from "./login.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const token = useUserStore((state) => state.token);
  const setAuth = useUserStore((state) => state.setAuth);
  const hydrated = useStoreHydration();

  const handleFinish = async (values: LoginPayload) => {
    try {
      const result = await loginApi({
        username: values.username,
        password: values.password,
      });
      setAuth(result.token, result.user);
      message.success(`欢迎回来，${result.user.nickname}`);
      void navigate("/introduction", { replace: true });
      return true;
    } catch {
      return false;
    }
  };

  if (!hydrated) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/introduction" replace />;
  }

  return (
    <div className={styles.page}>
      <LoginForm
        title="Admin Template"
        subTitle="React 19 + Antd 6 的中后台模板"
        onFinish={handleFinish}
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
