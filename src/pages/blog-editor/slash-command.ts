import { Extension, ReactRenderer, type Editor } from "@tiptap/react";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import { filterSlashItems, type SlashItem } from "./slash-items";
import { SlashMenu, type SlashMenuHandle, type SlashMenuProps } from "./slash-menu";
import styles from "./slash-menu.module.css";

function renderSlashMenu() {
  let component: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;
  let unmount: (() => void) | null = null;

  return {
    onStart(props: SuggestionProps<SlashItem, SlashItem>) {
      component = new ReactRenderer(SlashMenu, {
        editor: props.editor,
        props: {
          items: props.items,
          command: props.command,
        },
        className: styles.popup,
      });
      unmount = props.mount(component.element);
    },
    onUpdate(props: SuggestionProps<SlashItem, SlashItem>) {
      component?.updateProps({
        items: props.items,
        command: props.command,
      });
    },
    onKeyDown(props: SuggestionKeyDownProps) {
      if (props.event.key === "Escape") {
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },
    onExit() {
      unmount?.();
      component?.destroy();
      unmount = null;
      component = null;
    },
  };
}

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        allow: ({ editor }: { editor: Editor }) => {
          return editor.state.selection.$from.parent.type.name !== "codeBlock";
        },
        items: ({ query }: { query: string }) => filterSlashItems(query),
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: { from: number; to: number };
          props: SlashItem;
        }) => {
          props.command({ editor, range });
        },
        render: renderSlashMenu,
        placement: "bottom-start" as const,
        offset: { mainAxis: 8, crossAxis: 0 },
        floatingUi: { strategy: "fixed" as const },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
