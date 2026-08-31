import { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import { BLOCK_DEFS } from "./registry";

export const mdxSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...BLOCK_DEFS.map((item) => item.htmlTag)],
  attributes: {
    ...defaultSchema.attributes,
    ...Object.fromEntries(
      BLOCK_DEFS.map((item) => [
        item.htmlTag,
        item.fields.filter((field) => !field.asChildren).map((field) => field.attr),
      ]),
    ),
  },
};
