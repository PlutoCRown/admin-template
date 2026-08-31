import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";

export const proseExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
];
