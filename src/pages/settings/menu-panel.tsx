import { RedoOutlined } from "@ant-design/icons";
import { App, Button, Popconfirm, Typography } from "antd";
import { menuRoute } from "#router/menu";
import { useGlobalConfigStore } from "#stores/global-config";
import { MenuEditor } from "./menu-editor";
import menuStyles from "./menu-editor.module.css";
import styles from "./settings.module.css";

export function MenuPanel() {
  const { message } = App.useApp();
  const order = useGlobalConfigStore((state) => state.menu.order);
  const hiddenPaths = useGlobalConfigStore((state) => state.menu.hiddenPaths);
  const reset = useGlobalConfigStore((state) => state.resetMenu);

  const handleReset = () => {
    reset();
    message.success("侧边菜单已恢复默认");
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>侧边菜单</h2>
          <p className={styles.panelDesc}>
            拖动把手调整同级菜单顺序，使用开关控制是否显示。修改会立即生效并保存在当前浏览器。
          </p>
        </div>
        <Popconfirm
          title="恢复默认菜单？"
          description="所有显示状态和排序都会恢复为初始设置。"
          okText="恢复默认"
          cancelText="取消"
          onConfirm={handleReset}
        >
          <Button icon={<RedoOutlined />}>重置</Button>
        </Popconfirm>
      </div>
      <div className={`${styles.section} ${menuStyles.section}`}>
        <div className={menuStyles.listHeading}>
          <span>菜单项</span>
          <span>显示</span>
        </div>
        <MenuEditor root={menuRoute} order={order} hiddenPaths={hiddenPaths} />
        <Typography.Text type="secondary" className={menuStyles.tip}>
          关闭菜单组会隐藏整组；再次打开时，组内菜单原有的排序与显示设置仍会保留。
        </Typography.Text>
      </div>
    </div>
  );
}
