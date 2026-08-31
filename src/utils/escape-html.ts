/** 通过 DOM 将文本安全转义为 HTML 实体。 */
export function escapeHtml(value: string) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
