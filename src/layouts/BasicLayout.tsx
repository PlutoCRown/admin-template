import { useMemo, useState, type ReactNode } from "react";
import { UserOutlined } from "@ant-design/icons";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { pageContainerToken } from "#components/page-container";
import { SettingsModal } from "#pages/settings";
import { applyMenuPreferences, menuRoute } from "#router/menu";
import { useGlobalConfigStore } from "#stores/global-config";
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
  const order = useGlobalConfigStore((state) => state.menu.order);
  const hiddenPaths = useGlobalConfigStore((state) => state.menu.hiddenPaths);
  const customizedMenuRoute = useMemo(
    () => applyMenuPreferences(menuRoute, { order, hiddenPaths }),
    [hiddenPaths, order],
  );

  return (
    <>
      <ProLayout
        title="Admin Template"
        layout="side"
        fixSiderbar
        location={location}
        route={customizedMenuRoute}
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
