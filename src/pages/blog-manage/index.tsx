import { useRef } from "react";
import { getBlogPostListApi, type BlogPost } from "#api/blog/posts";
import { PageContainer } from "#components/page-container";
import { ProTable, type ProColumns, type ProTableAction } from "#components/pro-table";
import { CreatePostButton } from "./create-post-button";
import { PostRowActions } from "./post-row-actions";

async function requestPostList(params: {
  current?: number;
  pageSize?: number;
  title?: string;
  status?: BlogPost["status"];
}) {
  const result = await getBlogPostListApi({
    page: params.current,
    pageSize: params.pageSize,
    keyword: params.title,
    status: params.status,
  });
  return {
    data: result.list,
    success: true,
    total: result.total,
  };
}

export function BlogManagePage() {
  const actionRef = useRef<ProTableAction<BlogPost>>(null);

  const columns: ProColumns<BlogPost>[] = [
    { title: "标题", dataIndex: "title", width: 280 },
    { title: "摘要", dataIndex: "summary", search: false, ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      valueEnum: {
        published: { text: "已发布", status: "Success" },
        draft: { text: "草稿", status: "Default" },
      },
    },
    { title: "更新时间", dataIndex: "updatedAt", renderer: "dateTime", search: false, width: 180 },
    {
      title: "操作",
      valueType: "option",
      width: 160,
      render: (_, record) => <PostRowActions record={record} actionRef={actionRef} />,
    },
  ];

  return (
    <PageContainer title="活动页管理" subTitle="Mock 只存 MDX 纯字符串，编辑器与前台各自渲染">
      <ProTable<BlogPost>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ collapsible: true }}
        headerTitle="活动列表"
        toolBarRender={() => [<CreatePostButton key="create" actionRef={actionRef} />]}
        request={requestPostList}
      />
    </PageContainer>
  );
}
