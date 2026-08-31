import { useEffect, useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { escapeHtml } from "#utils/escape-html";
import { highlightCode } from "./highlight";
import styles from "./code-block.module.css";

interface CodeBlockProps {
  value: string;
  language: string;
}

export function CodeBlock({ value, language }: CodeBlockProps) {
  const { message } = App.useApp();
  const [copying, setCopying] = useState(false);
  const [highlightState, setHighlightState] = useState<{
    source: string;
    language: string;
    html: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void highlightCode(value, language).then((html) => {
      if (!cancelled) {
        setHighlightState({ source: value, language, html });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language, value]);

  const highlighted =
    highlightState?.source === value && highlightState.language === language
      ? highlightState.html
      : escapeHtml(value);

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(value);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动选择代码");
    }
    setCopying(false);
  };

  return (
    <div className={styles.block}>
      <div className={styles.toolbar}>
        <span>{language}</span>
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          loading={copying}
          onClick={handleCopy}
        >
          复制
        </Button>
      </div>
      <pre>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
