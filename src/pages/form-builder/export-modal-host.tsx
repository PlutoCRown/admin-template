import { useFormBuilderStore } from "#stores/form-builder";
import { ExportModal } from "./export-modal";

export function ExportModalHost() {
  const exportOpen = useFormBuilderStore((state) => state.exportOpen);
  const fields = useFormBuilderStore((state) => state.fields);
  const settings = useFormBuilderStore((state) => state.settings);
  const setExportOpen = useFormBuilderStore((state) => state.setExportOpen);

  const handleClose = () => {
    setExportOpen(false);
  };

  if (!exportOpen) {
    return null;
  }

  return <ExportModal open fields={fields} settings={settings} onClose={handleClose} />;
}
