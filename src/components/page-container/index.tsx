import {
  PageContainer as AntPageContainer,
  type PageContainerProps,
} from "@ant-design/pro-components";
import "./page-container.css";

export const pageContainerToken = {
  paddingInlinePageContainerContent: 16,
  paddingBlockPageContainerContent: 8,
};

export function PageContainer({ token, ...props }: PageContainerProps) {
  return (
    <AntPageContainer
      token={{
        ...pageContainerToken,
        ...token,
      }}
      {...props}
    />
  );
}
