export const SAMPLE_CAMPAIGN_MDX = `# 夏日焕新季

会员日限定，精选单品直降。正文是普通 Markdown，营销块序列化成标签，前后台共用同一份字符串。

<HashTag tone="hot">Trending</HashTag>

<PromoBanner title="全场低至 5 折" subtitle="指定品类满 299 减 80，活动仅限 72 小时" cta="立即抢购" href="#deals" theme="sunset"></PromoBanner>

## 倒计时还在走

下单前看一眼剩余时间，结束时间写在块属性里，前台只负责渲染。

<Countdown title="会员日结束还剩" end-at="2026-09-15T23:59:59+08:00"></Countdown>

## 今日爆款

- 云感面料，防晒指数实测达标
- 折叠伞重量低于 180g，通勤可随身

<PriceCard name="云感防晒衣" current="199" original="399" badge="爆款"></PriceCard>

<PriceCard name="轻量折叠伞" current="59" original="129" badge="新品"></PriceCard>

<CtaBlock label="查看全部优惠" hint="登录会员再减 20" href="#more" theme="dark"></CtaBlock>
`;

export const SAMPLE_COUPON_MDX = `# 开学季补给站

文具和数码配件组合购，适合一次备齐。

<HashTag tone="new">BackToSchool</HashTag>

<PromoBanner title="满 199 减 40" subtitle="书包 / 键盘 / 台灯同场，可叠加新人券" cta="去凑单" href="#bundle" theme="ocean"></PromoBanner>

<Countdown title="开学特惠截止" end-at="2026-09-01T23:59:59+08:00"></Countdown>

<CtaBlock label="领取优惠券" hint="每账号限领一次" href="#coupon" theme="primary"></CtaBlock>
`;
