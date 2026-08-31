import { ProList } from "@ant-design/pro-components";
import { Tag } from "antd";
import { useNavigate } from "react-router";
import { getArticleListApi, type Article } from "#api/pro/articles";
import { PageContainer } from "#components/page-container";

function ArticleTags({ tags }: { tags: string[] }) {
  return tags.map((tag) => (
    <Tag key={tag} color="blue">
      {tag}
    </Tag>
  ));
}

async function requestArticleList(params: {
  current?: number;
  pageSize?: number;
  title?: string;
  status?: Article["status"];
}) {
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
}

export function ProListPage() {
  const navigate = useNavigate();

  const handleItem = (record: Article) => ({
    onClick: () => navigate(`/pro/descriptions?id=${record.id}`),
  });

  return (
    <PageContainer title="ProList">
      <ProList<Article>
        rowKey="id"
        headerTitle="内容列表"
        pagination={{ pageSize: 6 }}
        search={{ filterType: "light" }}
        toolbar={{ multipleLine: true }}
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
            render: (_, record) => <ArticleTags tags={record.tags} />,
          },
          content: {
            search: false,
            render: (_, record) => `作者 ${record.author} · ${record.views} 次浏览`,
          },
        }}
        onItem={handleItem}
        request={requestArticleList}
      />
    </PageContainer>
  );
}
