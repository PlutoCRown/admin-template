import { CheckOutlined } from "@ant-design/icons";
import { Button, Input, Popover, Space } from "antd";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import "./text-edit-popover.css";

export interface TextEditPopoverProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  children: ReactNode;
  onSave: (value: string) => void | boolean | Promise<void | boolean>;
}

interface TextEditPopoverPanelProps {
  value: string;
  placeholder?: string;
  saving: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function selectInputValue(event: FocusEvent<HTMLInputElement>) {
  event.target.select();
}

function preventButtonFocus(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

function TextEditPopoverPanel({
  value,
  placeholder,
  saving,
  onChange,
  onConfirm,
  onCancel,
}: TextEditPopoverPanelProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (saving || (next instanceof Node && event.currentTarget.contains(next))) {
      return;
    }
    onCancel();
  }

  return (
    <div className="ch-text-edit-popover-panel" onBlur={handleBlur}>
      <Space.Compact>
        <Input
          autoFocus
          value={value}
          placeholder={placeholder}
          disabled={saving}
          onChange={handleChange}
          onPressEnter={onConfirm}
          onKeyDown={handleKeyDown}
          onFocus={selectInputValue}
        />
        <Button
          type="primary"
          icon={<CheckOutlined />}
          loading={saving}
          htmlType="button"
          aria-label="确定"
          onMouseDown={preventButtonFocus}
          onClick={onConfirm}
        />
      </Space.Compact>
    </div>
  );
}

export function TextEditPopover({
  value,
  placeholder,
  disabled = false,
  children,
  onSave,
}: TextEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const savingLock = useRef(false);

  function handleOpenChange(nextOpen: boolean) {
    if (savingLock.current) {
      return;
    }
    if (nextOpen) {
      setDraft(value);
    }
    setOpen(nextOpen);
  }

  function handleCancel() {
    if (savingLock.current) {
      return;
    }
    setOpen(false);
  }

  async function handleConfirm() {
    if (savingLock.current) {
      return;
    }
    if (draft === value) {
      setOpen(false);
      return;
    }
    savingLock.current = true;
    setSaving(true);
    let shouldClose = false;
    try {
      const result = await onSave(draft);
      shouldClose = result !== false;
    } catch {
      shouldClose = false;
    }
    savingLock.current = false;
    setSaving(false);
    if (shouldClose) {
      setOpen(false);
    }
  }

  return (
    <Popover
      trigger="click"
      open={disabled ? false : open}
      destroyOnHidden
      classNames={{ root: "ch-text-edit-popover" }}
      styles={{ container: { padding: 8 } }}
      content={
        <TextEditPopoverPanel
          value={draft}
          placeholder={placeholder}
          saving={saving}
          onChange={setDraft}
          onConfirm={() => {
            void handleConfirm();
          }}
          onCancel={handleCancel}
        />
      }
      onOpenChange={handleOpenChange}
    >
      <button type="button" className="ch-text-edit-popover-trigger" disabled={disabled}>
        {children}
      </button>
    </Popover>
  );
}
