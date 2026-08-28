import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import { Dropdown } from "antd";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { logoutApi } from "#api/auth";
import { pageContainerToken } from "#components/page-container";
import { menuRoute } from "#router/menu";
import { useUserStore } from "#stores/user";

function renderMenuItem(item: MenuDataItem, dom: ReactNode) {
  const hasChildren = Boolean(item.children?.length);
  if (!item.path || hasChildren) {
    return dom;
  }
  return <Link to={item.path}>{dom}</Link>;
}

function UserAvatar({ dom, onLogout }: { dom: ReactNode; onLogout: () => void }) {
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "退出登录",
            onClick: onLogout,
          },
        ],
      }}
    >
      {dom}
    </Dropdown>
  );
}

export function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearAuth = useUserStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 错误已由接口拦截器 Notification 提示
    }
    clearAuth();
    void navigate("/login", { replace: true });
  };

  return (
    <ProLayout
      title="Admin Template"
      layout="side"
      fixSiderbar
      location={location}
      route={menuRoute}
      logo={<UserOutlined />}
      menu={{ defaultOpenAll: true, autoClose: false }}
      menuItemRender={renderMenuItem}
      onMenuHeaderClick={() => navigate("/dashboard")}
      token={{
        pageContainer: pageContainerToken,
      }}
      avatarProps={{
        src: user?.avatar,
        title: user?.nickname,
        size: "small",
        render: (_props, dom) => (
          <UserAvatar
            dom={dom}
            onLogout={() => {
              void handleLogout();
            }}
          />
        ),
      }}
    >
      <Outlet />
    </ProLayout>
  );
}
