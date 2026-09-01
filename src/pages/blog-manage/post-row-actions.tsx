import { type RefObject } from "react";
import { App, Popconfirm, Space } from "antd";
import { Link } from "react-router";
import { deleteBlogPostApi, type BlogPost } from "#api/blog/posts";
import { type ProTableAction } from "#components/pro-table";
import { runOptimistic } from "#hooks/use-optimistic";
import { withBasePath } from "#utils/base-path";

interface PostRowActionsProps {
  record: BlogPost;
  actionRef: RefObject<ProTableAction<BlogPost> | null>;
}

export function PostRowActions({ record, actionRef }: PostRowActionsProps) {
  const { message } = App.useApp();

  const handleDelete = async () => {
    const action = actionRef.current;
    const snapshot = action?.getDataSource() ?? [];
    const ok = await runOptimistic({
      snapshot,
      next: snapshot.filter((item) => item.id !== record.id),
      commit: (rows) => action?.setDataSource(rows),
      request: async () => {
        await deleteBlogPostApi(record.id);
      },
    });
    if (ok) {
      message.success("已删除");
    }
  };

  return (
    <Space>
      <Link to={`/blog-manage/edit/${record.id}`}>编辑</Link>
      <a href={withBasePath(`/blog/${record.id}`)} target="_blank" rel="noreferrer">
        前台
      </a>
      <Popconfirm title="确认删除？" onConfirm={() => void handleDelete()}>
        <a>删除</a>
      </Popconfirm>
    </Space>
  );
}
