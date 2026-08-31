import dayjs from "dayjs";
import type { BlogPost } from "../src/api/blog/types";
import type { UserProfile } from "../src/api/login/types";
import type { MediaFile, Product } from "../src/api/media/types";
import type { Article, Staff } from "../src/api/pro/types";
import { SAMPLE_CAMPAIGN_MDX, SAMPLE_COUPON_MDX } from "../src/pages/blog-shared/sample-content";

export const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", label: "管理员" },
  { username: "editor", password: "editor123", label: "编辑" },
] as const;

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function svgCover(seed: string, title: string, from: string, to: string): string {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="${seed}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#${seed})" />
      <text x="50%" y="50%" fill="white" font-size="36" font-family="sans-serif" text-anchor="middle" dy=".3em">${title}</text>
    </svg>
  `);
}

function svgAvatar(seed: string, title: string, from: string, to: string): string {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="${seed}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" fill="url(#${seed})" />
      <text x="64" y="64" fill="white" font-size="64" font-weight="600" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${title}</text>
    </svg>
  `);
}

export function getStaffAvatar(id: number, name: string) {
  const palettes = [
    ["#1677ff", "#69b1ff"],
    ["#13c2c2", "#5cdbd3"],
    ["#722ed1", "#b37feb"],
    ["#eb2f96", "#ff85c0"],
  ] as const;
  const [from, to] = palettes[id % palettes.length] ?? palettes[0];
  return svgAvatar(`staff-${id}`, name.slice(0, 1), from, to);
}

export const users: UserProfile[] = [
  {
    id: "u_admin",
    username: "admin",
    nickname: "林知夏",
    avatar: svgAvatar("admin", "夏", "#1677ff", "#69b1ff"),
    email: "admin@example.com",
    phone: "13800000001",
    title: "平台管理员",
    department: "研发中心",
    roles: ["admin"],
    permissions: ["*"],
  },
  {
    id: "u_editor",
    username: "editor",
    nickname: "顾清和",
    avatar: svgAvatar("editor", "顾", "#13c2c2", "#36cfc9"),
    email: "editor@example.com",
    phone: "13800000002",
    title: "内容编辑",
    department: "内容运营",
    roles: ["editor"],
    permissions: ["article:read", "article:write"],
  },
];

export const passwords: Record<string, string> = {
  admin: "admin123",
  editor: "editor123",
};

export const staff: Staff[] = Array.from({ length: 28 }, (_, index) => {
  const id = index + 1;
  const departments = ["研发中心", "产品部", "设计部", "内容运营"] as const;
  const roles = ["admin", "editor", "viewer"] as const;
  const names = ["陈予安", "苏晚晴", "周景行", "叶知秋", "沈慕白", "梁小满", "韩听澜", "许南风"];
  const salaries = [
    8600, 12800, 36000, 128000, 360000, 1_280_000, 12_800_000, 180_000_000, 1_280_000_000_000,
  ];
  const name = `${names[id % names.length]}${id}`;
  return {
    id: `staff_${id}`,
    name,
    avatar: getStaffAvatar(id, name),
    email: `user${id}@example.com`,
    phone: `138${String(10000000 + id).slice(-8)}`,
    department: departments[id % departments.length],
    role: roles[id % roles.length],
    status: id % 7 === 0 ? "disabled" : "active",
    salary: salaries[id % salaries.length] ?? 12000,
    createdAt: dayjs().subtract(id, "day").hour(9).minute(30).second(0).toISOString(),
  };
});

export const articles: Article[] = [
  {
    id: "art_1",
    title: "后台模板的最小可行结构",
    summary: "登录、布局、列表和表单通常就构成了中后台的主干。",
    cover: svgCover("art1", "Layout", "#1677ff", "#722ed1"),
    author: "林知夏",
    tags: ["架构", "中后台"],
    views: 1280,
    status: "published",
    publishedAt: dayjs().subtract(2, "day").toISOString(),
    content: "把鉴权、布局和 CRUD 页面拆开后，后续加业务模块会轻松很多。",
  },
  {
    id: "art_2",
    title: "为什么用 fetch 包一层 axios 风格 API",
    summary: "拦截器、超时和统一错误处理几乎是每个管理端都会重复写的部分。",
    cover: svgCover("art2", "Fetch", "#13c2c2", "#1677ff"),
    author: "顾清和",
    tags: ["HTTP", "工程化"],
    views: 860,
    status: "published",
    publishedAt: dayjs().subtract(5, "day").toISOString(),
    content: "保持 axios 的使用习惯，可以降低迁移成本和心智负担。",
  },
  {
    id: "art_3",
    title: "ProComponents 在 React 19 里的用法",
    summary: "ProTable、ProForm、ProList 和 SchemaForm 覆盖了大部分后台页面。",
    cover: svgCover("art3", "Pro", "#fa8c16", "#fa541c"),
    author: "林知夏",
    tags: ["Antd", "Pro"],
    views: 2330,
    status: "published",
    publishedAt: dayjs().subtract(8, "day").toISOString(),
    content: "用约定好的 columns / schema 来描述页面，比手写大量表单字段更稳。",
  },
  {
    id: "art_4",
    title: "图片上传后的排序体验",
    summary: "预览、拖拽和自定义覆盖层会直接影响运营同学的效率。",
    cover: svgCover("art4", "Dnd", "#eb2f96", "#722ed1"),
    author: "顾清和",
    tags: ["交互", "上传"],
    views: 540,
    status: "draft",
    publishedAt: dayjs().subtract(12, "day").toISOString(),
    content: "缩略图右上角圆形关闭，拖动时保持原样式。",
  },
];

export const products: Product[] = [];

export const posts: BlogPost[] = [
  {
    id: "post_1",
    title: "夏日焕新季",
    summary: "会员日限定，精选单品直降。正文是普通 Markdown，营销块序列化成标签。",
    content: SAMPLE_CAMPAIGN_MDX,
    status: "published",
    updatedAt: dayjs().subtract(1, "hour").toISOString(),
  },
  {
    id: "post_2",
    title: "开学季补给站",
    summary: "文具和数码配件组合购，适合一次备齐。",
    content: SAMPLE_COUPON_MDX,
    status: "draft",
    updatedAt: dayjs().subtract(1, "day").toISOString(),
  },
];

export async function fileToMedia(file: File, uid: string): Promise<MediaFile> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return {
    uid,
    name: file.name,
    url: `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`,
    size: file.size,
    type: file.type,
  };
}
