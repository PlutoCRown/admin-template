import { Button, Result } from "antd";
import { useNavigate } from "react-router";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate("/dashboard")}>
          回到工作台
        </Button>
      }
    />
  );
}
