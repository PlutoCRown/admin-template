import { Link } from "react-router";
import { PageContainer } from "#components/page-container";
import { BreakpointComparison } from "./breakpoint-comparison";
import { InlineFormComparison } from "./inline-form-comparison";
import styles from "./introduction.module.css";
import { WidthComparison } from "./width-comparison";

export function IntroductionPage() {
  return (
    <PageContainer title={false}>
      <main className={styles.document}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>ADMIN TEMPLATE · 现代中后台起点</p>
          <h1>少写样式，把精力留给真正的业务</h1>
          <p className={styles.lead}>
            这是一个面向现代中后台的 React 模板：用好 Pro Components，并补齐 Ant Design
            在表单宽度、内容对齐和复杂表格体验上的短板。它既适合作为新项目的起点，也方便后端同学用
            vibecoding 直接搭管理端，而不被历史前端债务拖住。
          </p>
        </header>

        <section className={styles.documentSection}>
          <h2>为什么还要做一个后台模板？</h2>
          <p>
            因为“能用”不等于“顺手”。传统断点很难回答一个字段究竟该多宽，相似控件的宽度语义各不相同；
            很多项目只用了 ProTable，却错过 ProForm、ProList、SchemaForm 和
            ProDescriptions；表格也仍被当成 只读的
            Excel，而不是可以直接编辑、格式化和完成任务的工作界面。
          </p>
          <p>
            这个模板提供现代依赖、鉴权骨架、主题和菜单设置、可排序上传、表单生成器，以及我们真正会在业务里
            反复使用的 Form / ProTable
            封装。目标很朴素：给新项目一块干净底板，让业务侧少写样式、多写数据与交互。
          </p>
        </section>

        <section className={styles.documentSection}>
          <p className={styles.sectionIndex}>01 · BETTER FORM FIELDS</p>
          <h2>第一个优势：字段宽度终于是一种业务语义</h2>
          <p>
            Ant Design Pro 的 <code>ProFormField</code> 很强，但不同 valueType
            最终会落到不同的组件和 DOM
            层。页面为了“看起来一样宽”，常常要知道每个控件应该把样式传给哪一层。
            我们把这部分知识收进字段组件，用 <code>width</code>、<code>labelWidth</code> 和
            <code> block</code> 表达意图。
          </p>
          <WidthComparison />
        </section>

        <section className={styles.documentSection}>
          <p className={styles.sectionIndex}>02 · CONTENT-AWARE ALIGNMENT</p>
          <h2>对齐不该只依赖一套停在 xxl 的网格</h2>
          <p>
            Ant Design 的网格在 375px—1080px 之间提供了丰富断点，但从常见桌面屏到
            2K、4K，仍然沿用同一套 xs / sm / md / lg / xl / xxl 体系。固定 span
            擅长切列数，却不知道“ID 很短、地址很长”这种内容事实，
            于是该短的输入框被拉得很长，该长的输入框反而被压在一格里。
          </p>
          <p>
            我们让 label 和 field 都按字符宽控制，再由 flex
            自然换行。字段宽度跟内容走，容器宽度只决定这一行能放下多少项。
          </p>
          <BreakpointComparison />

          <h3 className={styles.inlineHeading}>行内表单也应该真正居中</h3>
          <p>
            默认 <code>Form.Item</code> 的底部外边距混进 flex 布局后，控件的视觉中心会偏离同排按钮。
            久而久之，很多人直接绕开 Form 单写 Input，也顺手丢掉了回车提交和统一校验。我们的表单用
            row-gap / column-gap 管间距，item 自身不再带底部负担。
          </p>
          <InlineFormComparison />
        </section>

        <section className={styles.documentSection}>
          <p className={styles.sectionIndex}>03 · MODERN INTERACTION</p>
          <h2>现代用户体验，不只是给旧页面换一层皮</h2>
          <p>
            模板在合适的地方渐进使用超椭圆圆角，统一调过滚动条、间距和暗色主题；这些细节不抢内容，却让长时间使用的后台更轻、更稳。
            更重要的是，交互能力被放进可复用组件，而不是散落在每个业务页的临时 CSS 里。
          </p>
          <div className={styles.featureGrid}>
            <article>
              <h3>更丰富的 ProTable</h3>
              <p>
                提供表内编辑、状态快速切换、图片单元格、日期与大数字格式化，以及统一的搜索表单。后台表格不该只是
                Excel 的廉价复刻，它应该让用户在上下文里直接完成工作。
              </p>
              <Link to="/pro/table">查看 ProTable 示例 →</Link>
            </article>
            <article>
              <h3>能导出的表单生成器</h3>
              <p>
                拖拽字段、调整 label 与宽度、实时预览，并导出 TSX、类型和 JSON Schema。它既是
                demo，也是理解组件 API 的活文档。
              </p>
              <Link to="/form-builder">打开表单生成器 →</Link>
            </article>
            <article>
              <h3>开箱即用的横切能力</h3>
              <p>
                鉴权、主题、可排序菜单、上传排序和静态 Mock 已经接好。新项目可以删掉 demo
                pages，保留一套干净、可继续生长的基础设施。
              </p>
              <Link to="/media">查看可排序上传 →</Link>
            </article>
          </div>
        </section>

        <footer className={styles.documentFooter}>
          <p>这不是一套必须照抄的设计系统，而是一组经过业务痛点筛选的默认答案。</p>
        </footer>
      </main>
    </PageContainer>
  );
}
