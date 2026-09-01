import { Fragment, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { SlashItem } from "./slash-items";
import styles from "./slash-menu.module.css";

export interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const BADGE: Record<string, string> = {
  heading1: "H1",
  heading2: "H2",
  heading3: "H3",
  bulletList: "•",
  orderedList: "1.",
  blockquote: "“",
  horizontalRule: "—",
};

function itemBadge(item: SlashItem) {
  if (item.group === "营销块") {
    return "块";
  }
  return BADGE[item.id] ?? "/";
}

function SlashMenuItem({
  item,
  index,
  selected,
  onHover,
  onSelect,
}: {
  item: SlashItem;
  index: number;
  selected: boolean;
  onHover: (index: number) => void;
  onSelect: (item: SlashItem) => void;
}) {
  return (
    <button
      type="button"
      data-index={index}
      className={selected ? `${styles.item} ${styles.itemSelected}` : styles.item}
      onMouseEnter={() => onHover(index)}
      onClick={() => onSelect(item)}
    >
      <span className={styles.badge}>{itemBadge(item)}</span>
      <span className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.description}>{item.description}</span>
      </span>
    </button>
  );
}

export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu(
  { items, command },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedIndexRef.current = 0;
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const selected = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, items]);

  const handleHover = (index: number) => {
    selectedIndexRef.current = index;
    setSelectedIndex(index);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowDown") {
        const next = items.length === 0 ? 0 : (selectedIndexRef.current + 1) % items.length;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
        return true;
      }
      if (event.key === "ArrowUp") {
        const next =
          items.length === 0 ? 0 : (selectedIndexRef.current - 1 + items.length) % items.length;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndexRef.current];
        if (item) {
          command(item);
        }
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className={styles.menu} ref={listRef}>
        <div className={styles.empty}>无匹配命令</div>
      </div>
    );
  }

  return (
    <div className={styles.menu} ref={listRef}>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {items[index - 1]?.group === item.group ? null : (
            <div className={styles.group}>{item.group}</div>
          )}
          <SlashMenuItem
            item={item}
            index={index}
            selected={index === selectedIndex}
            onHover={handleHover}
            onSelect={command}
          />
        </Fragment>
      ))}
    </div>
  );
});
