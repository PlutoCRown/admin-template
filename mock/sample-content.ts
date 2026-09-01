export const SAMPLE_CAMPAIGN_MDX = `# 夏日焕新季

会员日限定，精选单品直降。正文是普通 Markdown，营销块序列化成标签，前后台共用同一份字符串。

<HashTag tone="hot">Trending</HashTag>

<PromoBanner title="测试测试" subtitle="测试测试测试测试测试测试测试测试" cta="测试测试" href="#deals" theme="sunset"></PromoBanner>

## 倒计时还在走

下单前看一眼剩余时间，结束时间写在块属性里，前台只负责渲染。

<Countdown title="测试测试测试" end-at="2026-09-15T23:59:59+08:00"></Countdown>

## 今日爆款

- 测试测试测试测试测试测试测试
- 测试测试测试测试测试测试测试测试测试测试

<PriceCard name="测试测试" current="199" original="399" badge="爆款"></PriceCard>

<PriceCard name="测试测试" current="59" original="129" badge="新品"></PriceCard>

<CtaBlock label="测试测试测试" hint="测试测试测试测试 20" href="#more" theme="dark"></CtaBlock>
`;

export const SAMPLE_COUPON_MDX = `# 测试测试测试测试测试

测试测试测试测试测试测试测试测试测试测试测试

<HashTag tone="new">BackToSchool</HashTag>

<PromoBanner title="测试测试" subtitle="测试测试测试测试测试测试测试测试" cta="测试" href="#bundle" theme="ocean"></PromoBanner>

<Countdown title="测试测试测试" end-at="2026-09-01T23:59:59+08:00"></Countdown>

<CtaBlock label="测试测试测试" hint="测试测试测试测试测试测试" href="#coupon" theme="primary"></CtaBlock>
`;

export function resolvePostContent(content?: string) {
  return content?.trim() ? content : SAMPLE_CAMPAIGN_MDX;
}
