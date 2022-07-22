import { FormSchema } from '/@/components/Form';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

// Department Basic Form
export function useBasicFormSchema() {
  const basicFormSchema: FormSchema[] = [
    {
      field: 'departName',
      label: t('system.depart.departmentName'),
      component: 'Input',
      componentProps: {
        placeholder: t('system.depart.departmentNamePlaceholder'),
      },
      rules: [{ required: true, message: t('system.depart.warning.departmentWarning') }],
    },
    {
      field: 'parentId',
      label: t('system.depart.higherOffice'),
      component: 'TreeSelect',
      componentProps: {
        treeData: [],
        placeholder: '',
        dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
      },
    },
    {
      field: 'orgCode',
      label: t('system.depart.organizeCode'),
      component: 'Input',
      componentProps: {
        placeholder: t('system.depart.organizeCodePlaceholder'),
      },
    },
    {
      field: 'orgCategory',
      label: t('system.depart.organizationType'),
      component: 'RadioButtonGroup',
      componentProps: { options: [] },
    },
    {
      field: 'departOrder',
      label: t('system.depart.sequence'),
      component: 'InputNumber',
      componentProps: {},
    },
    {
      field: 'mobile',
      label: t('system.depart.phonenumber'),
      component: 'Input',
      componentProps: {
        placeholder: t('system.depart.phonenumberPlaceholder'),
      },
    },
    {
      field: 'fax',
      label: t('system.depart.fax'),
      component: 'Input',
      componentProps: {
        placeholder: t('system.depart.faxPlaceholder'),
      },
    },
    {
      field: 'address',
      label: t('system.depart.address'),
      component: 'Input',
      componentProps: {
        placeholder: t('system.depart.addressPlaceholder'),
      },
    },
    {
      field: 'memo',
      label: t('system.depart.memo'),
      component: 'InputTextArea',
      componentProps: {
        placeholder: t('system.depart.memoPlaceholder'),
      },
    },
  ];
  return { basicFormSchema };
}

// Institutional options
export const orgCategoryOptions = {
  // First-level department
  root: [{ value: '1', label: t('common.company') }],
  // Sub-sector
  child: [
    { value: '2', label: t('common.department') },
    { value: '3', label: t('common.post') },
  ],
};
