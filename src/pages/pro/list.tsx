import { ProList } from "@ant-design/pro-components";
import { Tag } from "antd";
import { useNavigate } from "react-router";
import { getArticleListApi } from "#api/articles";
import type { Article } from "#api/types";
import { PageContainer } from "#components/page-container";

export function ProListPage() {
  const navigate = useNavigate();

  return (
    <PageContainer title="ProList">
      <ProList<Article>
        rowKey="id"
        headerTitle="内容列表"
        pagination={{ pageSize: 6 }}
        search={{ filterType: "light" }}
        metas={{
          title: { dataIndex: "title", title: "标题" },
          avatar: { dataIndex: "cover", search: false },
          description: { dataIndex: "summary", search: false },
          subTitle: {
            dataIndex: "status",
            valueType: "select",
            valueEnum: {
              published: { text: "已发布", status: "Success" },
              draft: { text: "草稿", status: "Default" },
            },
            render: (_, record) =>
              record.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              )),
          },
          content: {
            search: false,
            render: (_, record) => `作者 ${record.author} · ${record.views} 次浏览`,
          },
        }}
        onItem={(record) => ({
          onClick: () => navigate(`/pro/descriptions?id=${record.id}`),
        })}
        request={async (params) => {
          const result = await getArticleListApi({
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
        }}
      />
    </PageContainer>
  );
}
