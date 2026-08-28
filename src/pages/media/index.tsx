import { App, Card, Typography } from "antd";
import { createProductApi } from "#api/products";
import type { ProductPayload } from "#api/types";
import { FormDigit, FormItem, FormSelect, FormText, FormTextArea, ProForm } from "#components/form";
import { PageContainer } from "#components/page-container";
import { SortableUpload } from "#components/sortable-upload";

export function MediaFormPage() {
  const { message } = App.useApp();

  return (
    <PageContainer title="上传 / 预览 / 拖拽排序">
      <Card>
        <Typography.Paragraph type="secondary">
          图册支持本地上传、点击图片预览、拖动排序。缩略图右上角圆形按钮可删除，拖动时保持原样式。
        </Typography.Paragraph>
        <ProForm<ProductPayload>
          onFinish={async (values) => {
            try {
              const product = await createProductApi(values);
              message.success(`已保存商品 ${product.name}，共 ${product.gallery.length} 张图`);
              return true;
            } catch {
              return false;
            }
          }}
        >
          <FormText
            name="name"
            label="商品名称"
            labelWidth={6}
            width={16}
            rules={[{ required: true }]}
          />
          <FormDigit
            name="price"
            label="价格"
            labelWidth={6}
            width={10}
            min={0}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <FormSelect
            name="category"
            label="类目"
            labelWidth={6}
            width={8}
            options={["服饰", "数码", "家居", "食品"]}
            rules={[{ required: true }]}
          />
          <FormTextArea name="description" label="描述" labelWidth={6} block />
          <FormItem
            name="gallery"
            label="商品图册"
            labelWidth={6}
            block
            extra="最多 8 张，拖动可调整顺序"
            rules={[{ required: true, type: "array", min: 1, message: "请至少上传一张图片" }]}
          >
            <SortableUpload max={8} />
          </FormItem>
        </ProForm>
      </Card>
    </PageContainer>
  );
}
