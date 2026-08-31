import { useState, type ReactNode } from "react";
import { UserOutlined } from "@ant-design/icons";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { SettingsModal } from "#components/settings-modal";
import { pageContainerToken } from "#components/page-container";
import { menuRoute } from "#router/menu";
import { UserAccountBar } from "./user-account-bar";

function renderMenuItem(item: MenuDataItem, dom: ReactNode) {
  const hasChildren = Boolean(item.children?.length);
  if (!item.path || hasChildren) {
    return dom;
  }
  return <Link to={item.path}>{dom}</Link>;
}

export function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
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
          render: (_props, _dom, layoutProps) => (
            <UserAccountBar
              collapsed={Boolean(layoutProps?.collapsed)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ),
        }}
      >
        <Outlet />
      </ProLayout>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
