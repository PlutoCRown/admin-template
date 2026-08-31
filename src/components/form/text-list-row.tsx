import { type ChangeEvent, type ReactNode } from "react";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";

export interface TextListRowProps {
  value: string;
  dragHandle?: ReactNode;
  placeholder?: string;
  removable: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function TextListRow({
  value,
  dragHandle,
  placeholder,
  removable,
  disabled,
  onChange,
  onRemove,
}: TextListRowProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="ch-text-list-item">
      {dragHandle}
      <Input value={value} disabled={disabled} placeholder={placeholder} onChange={handleChange} />
      {removable ? (
        <Button
          type="text"
          icon={<MinusCircleOutlined />}
          disabled={disabled}
          aria-label={`删除 ${value || "该项"}`}
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}
