import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { App, Card, Typography } from "antd";
import { getErrorMessage } from "#api/client";
import { createProductApi } from "#api/products";
import type { ProductPayload } from "#api/types";
import { SortableUpload } from "#components/sortable-upload";

export function MediaFormPage() {
  const { message } = App.useApp();

  return (
    <PageContainer title="上传 / 预览 / 拖拽排序">
      <Card>
        <Typography.Paragraph type="secondary">
          图册支持本地上传、点击预览、拖动排序，拖拽时会使用自定义
          DragOverlay，而不是直接抬起原卡片。
        </Typography.Paragraph>
        <ProForm<ProductPayload>
          onFinish={async (values) => {
            try {
              const product = await createProductApi(values);
              message.success(`已保存商品 ${product.name}，共 ${product.gallery.length} 张图`);
              return true;
            } catch (error) {
              message.error(getErrorMessage(error));
              return false;
            }
          }}
        >
          <ProForm.Group>
            <ProFormText name="name" label="商品名称" width="md" rules={[{ required: true }]} />
            <ProFormDigit
              name="price"
              label="价格"
              width="sm"
              min={0}
              fieldProps={{ precision: 2 }}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="category"
              label="类目"
              width="sm"
              options={["服饰", "数码", "家居", "食品"]}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
          <ProFormTextArea name="description" label="描述" />
          <ProForm.Item
            name="gallery"
            label="商品图册"
            extra="最多 8 张，拖动可调整顺序"
            rules={[{ required: true, type: "array", min: 1, message: "请至少上传一张图片" }]}
          >
            <SortableUpload max={8} />
          </ProForm.Item>
        </ProForm>
      </Card>
    </PageContainer>
  );
}
