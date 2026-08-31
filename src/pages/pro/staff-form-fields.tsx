import { FormSelect, FormText } from "#components/form";
import { departmentOptions } from "./staff-options";

export function StaffFormFields() {
  return (
    <>
      <FormText name="name" label="姓名" labelWidth={4} width={12} rules={[{ required: true }]} />
      <FormText
        name="email"
        label="邮箱"
        labelWidth={4}
        width={20}
        rules={[{ required: true, type: "email" }]}
      />
      <FormText
        name="phone"
        label="手机号"
        labelWidth={4}
        width={13}
        rules={[{ required: true }]}
      />
      <FormSelect
        name="department"
        label="部门"
        labelWidth={4}
        width={12}
        options={departmentOptions}
        rules={[{ required: true }]}
      />
      <FormSelect
        name="role"
        label="角色"
        labelWidth={4}
        width={10}
        valueEnum={{ admin: "管理员", editor: "编辑", viewer: "访客" }}
        rules={[{ required: true }]}
      />
      <FormSelect
        name="status"
        label="状态"
        labelWidth={4}
        width={10}
        valueEnum={{ active: "启用", disabled: "停用" }}
        rules={[{ required: true }]}
      />
    </>
  );
}
