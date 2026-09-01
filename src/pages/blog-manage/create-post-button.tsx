import { type RefObject } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { App, Button } from "antd";
import { useNavigate } from "react-router";
import { createBlogPostApi, type BlogPost, type BlogPostPayload } from "#api/blog/posts";
import { FormSelect, FormText } from "#components/form";
import { type ProTableAction } from "#components/pro-table";
import { writeBlogPostCache } from "#pages/blog-shared/post-loader";

interface CreatePostButtonProps {
  actionRef: RefObject<ProTableAction<BlogPost> | null>;
}

export function CreatePostButton({ actionRef }: CreatePostButtonProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const handleFinish = async (values: Pick<BlogPostPayload, "title" | "status">) => {
    const created = await createBlogPostApi({
      title: values.title,
      status: values.status,
      summary: "新建活动页",
    });
    writeBlogPostCache(created);
    message.success("已创建，进入编辑");
    void actionRef.current?.reload();
    void navigate(`/blog-manage/edit/${created.id}`);
    return true;
  };

  return (
    <ModalForm<Pick<BlogPostPayload, "title" | "status">>
      title="新建活动页"
      layout="horizontal"
      grid={false}
      className="ch-form"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          新建
        </Button>
      }
      initialValues={{ status: "draft" }}
      modalProps={{ destroyOnHidden: true }}
      onFinish={handleFinish}
    >
      <FormText name="title" label="标题" labelWidth={4} width={20} rules={[{ required: true }]} />
      <FormSelect
        name="status"
        label="状态"
        labelWidth={4}
        width={10}
        valueEnum={{ draft: "草稿", published: "已发布" }}
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
}
