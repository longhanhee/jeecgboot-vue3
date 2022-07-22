import { Ref } from 'vue';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { findTree } from '/@/utils/common/compUtils';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
// User information columns
export const userInfoColumns: BasicColumn[] = [
  {
    title: t('system.user.username'),
    dataIndex: 'username',
    width: 150,
  },
  {
    title: t('system.user.realname'),
    dataIndex: 'realname',
    width: 180,
  },
  {
    title: t('system.user.department'),
    dataIndex: 'orgCode',
    width: 200,
  },
  {
    title: t('system.user.gender'),
    dataIndex: 'sex_dictText',
    width: 80,
  },
  {
    title: t('system.user.phonenumber'),
    dataIndex: 'phone',
    width: 120,
  },
];

// User information query condition form
export const userInfoSearchFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: t('system.user.username'),
    component: 'Input',
  },
];

// Departmental character Columns
export const departRoleColumns: BasicColumn[] = [
  {
    title: t('system.depart.departmentRoleName'),
    dataIndex: 'roleName',
    width: 100,
  },
  {
    title: t('system.depart.departmentRoleCode'),
    dataIndex: 'roleCode',
    width: 100,
  },
  {
    title: t('system.user.department'),
    dataIndex: 'departId_dictText',
    width: 100,
  },
  {
    title: t('system.depart.memo'),
    dataIndex: 'description',
    width: 100,
  },
];

// Department of Department Character Query Condition Form
export const departRoleSearchFormSchema: FormSchema[] = [
  {
    field: 'roleName',
    label: t('system.depart.departmentRoleName'),
    component: 'Input',
  },
];

// Department role pop -up window form form
export const departRoleModalFormSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'roleName',
    label: t('system.depart.departmentRoleName'),
    component: 'Input',
    rules: [
      { required: true, message: t('system.depart.warning.departmentWarning') },
      { min: 2, max: 30, message: t('system.depart.warning.departmentSuggest'), trigger: 'blur' },
    ],
  },
  {
    field: 'roleCode',
    label: t('system.depart.departmentRoleCode'),
    component: 'Input',
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
    dynamicRules: ({ model }) => {
      return [
        { required: true, message: t('system.depart.warning.departmetnCodeWaring') },
        { min: 0, max: 64, message: t('system.depart.warning.departmentCodeSuggest'), trigger: 'blur' },
        {
          validator: (_, value) => {
            if (/[\u4E00-\u9FA5]/g.test(value)) {
              return Promise.reject(t('system.depart.warning.departmentCodeTypingError'));
            }
            return new Promise((resolve, reject) => {
              let params = {
                tableName: 'sys_depart_role',
                fieldName: 'role_code',
                fieldVal: value,
                dataId: model.id,
              };
              duplicateCheck(params)
                .then((res) => {
                  res.success ? resolve() : reject(res.message || t('common.message.verificationFailed'));
                })
                .catch((err) => {
                  reject(err.message || t('common.message.verificationFailed'));
                });
            });
          },
        },
      ];
    },
  },
  {
    field: 'description',
    label: t('common.description'),
    component: 'Input',
    rules: [{ min: 0, max: 126, message: t('common.message.descriptionMaxlength'), trigger: 'blur' }],
  },
];

// Basic information form
export function useBaseInfoForm(treeData: Ref<any[]>) {
  const descItems: DescItem[] = [
    {
      field: 'departName',
      label: t('system.depart.departmentName'),
    },
    {
      field: 'parentId',
      label: t('system.depart.higherOffice'),
      render(val) {
        if (val) {
          let data = findTree(treeData.value, (item) => item.key == val);
          return data?.title ?? val;
        }
        return val;
      },
    },
    {
      field: 'orgCode',
      label: t('system.depart.organizeCode'),
    },
    {
      field: 'orgCategory',
      label: t('system.depart.organizationType'),
      render(val) {
        if (val === '1') {
          return t('common.company');
        } else if (val === '2') {
          return t('common.department');
        } else if (val === '3') {
          return t('common.post');
        }
        return val;
      },
    },
    {
      field: 'departOrder',
      label: t('common.sort'),
    },

    {
      field: 'mobile',
      label: t('system.user.phonenumber'),
    },
    {
      field: 'address',
      label: t('system.user.address'),
    },
    {
      field: 'memo',
      label: t('common.description'),
    },
  ];

  return { descItems };
}
