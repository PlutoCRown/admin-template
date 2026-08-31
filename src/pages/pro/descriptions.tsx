import { ProDescriptions } from "@ant-design/pro-components";
import { Card } from "antd";
import { useSearchParams } from "react-router";
import { getArticleApi, getArticleListApi, type Article } from "#api/pro/articles";
import { PageContainer } from "#components/page-container";

async function requestArticle(id: string) {
  try {
    const data = await getArticleApi(id);
    return { success: true, data };
  } catch {
    const list = await getArticleListApi({ page: 1, pageSize: 1 });
    return { success: true, data: list.list[0] };
  }
}

export function ProDescriptionsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "art_1";

  return (
    <PageContainer title="ProDescriptions">
      <Card>
        <ProDescriptions<Article>
          column={2}
          title="内容详情"
          request={() => requestArticle(id)}
          columns={[
            { title: "标题", dataIndex: "title" },
            { title: "作者", dataIndex: "author" },
            {
              title: "状态",
              dataIndex: "status",
              valueEnum: {
                published: { text: "已发布", status: "Success" },
                draft: { text: "草稿", status: "Default" },
              },
            },
            { title: "浏览量", dataIndex: "views", valueType: "digit" },
            { title: "发布时间", dataIndex: "publishedAt", valueType: "dateTime" },
            {
              title: "标签",
              dataIndex: "tags",
              span: 2,
              render: (_, record) => record.tags.join(" / "),
            },
            { title: "封面", dataIndex: "cover", valueType: "image", span: 2 },
            { title: "摘要", dataIndex: "summary", span: 2 },
            { title: "正文", dataIndex: "content", span: 2 },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
