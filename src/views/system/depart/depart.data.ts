import { FormSchema } from '/@/components/Form';

// 部门基础表单
export function useBasicFormSchema() {
  const basicFormSchema: FormSchema[] = [
    {
      field: 'departName',
      label: 'institution name',
      component: 'Input',
      componentProps: {
        placeholder: '请输入机构/部门名称',
      },
      rules: [{ required: true, message: '机构名称不能为空' }],
    },
    {
      field: 'parentId',
      label: 'higher office',
      component: 'TreeSelect',
      componentProps: {
        treeData: [],
        placeholder: '无',
        dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
      },
    },
    {
      field: 'orgCode',
      label: 'institution code',
      component: 'Input',
      componentProps: {
        placeholder: '请输入机构编码',
      },
    },
    {
      field: 'orgCategory',
      label: 'organization type',
      component: 'RadioButtonGroup',
      componentProps: { options: [] },
    },
    {
      field: 'departOrder',
      label: 'Sequence',
      component: 'InputNumber',
      componentProps: {},
    },
    {
      field: 'mobile',
      label: 'Telephone',
      component: 'Input',
      componentProps: {
        placeholder: '请输入电话',
      },
    },
    {
      field: 'fax',
      label: 'Fax',
      component: 'Input',
      componentProps: {
        placeholder: '请输入传真',
      },
    },
    {
      field: 'address',
      label: 'Address',
      component: 'Input',
      componentProps: {
        placeholder: '请输入地址',
      },
    },
    {
      field: 'memo',
      label: 'Remark',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入备注',
      },
    },
  ];
  return { basicFormSchema };
}

// 机构类型选项
export const orgCategoryOptions = {
  // 一级部门
  root: [{ value: '1', label: '公司' }],
  // 子级部门
  child: [
    { value: '2', label: '部门' },
    { value: '3', label: '岗位' },
  ],
};
