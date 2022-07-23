import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getAllRolesList, getAllTenantList } from './user.api';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: t('system.user.username'),
    dataIndex: 'username',
    width: 120,
  },
  {
    title: t('system.user.realname'),
    dataIndex: 'realname',
    width: 100,
  },
  {
    title: t('system.user.avatar'),
    dataIndex: 'avatar',
    width: 120,
    customRender: render.renderAvatar,
  },
  {
    title: t('system.user.gender'),
    dataIndex: 'sex',
    width: 80,
    sorter: true,
    customRender: ({ text }) => {
      return render.renderDict(text, 'sex');
    },
  },
  {
    title: t('system.user.birthday'),
    dataIndex: 'birthday',
    width: 100,
  },
  {
    title: t('system.user.phonenumber'),
    dataIndex: 'phone',
    width: 100,
  },
  {
    title: t('system.user.department'),
    width: 150,
    dataIndex: 'orgCodeTxt',
  },
  {
    title: t('system.user.responsibleDepartment'),
    width: 150,
    dataIndex: 'departIds_dictText',
  },
  {
    title: t('system.user.state'),
    dataIndex: 'status_dictText',
    width: 80,
  },
];

export const recycleColumns: BasicColumn[] = [
  {
    title: t('system.user.username'),
    dataIndex: 'username',
    width: 100,
  },
  {
    title: t('system.user.realname'),
    dataIndex: 'realname',
    width: 100,
  },
  {
    title: t('system.user.avatar'),
    dataIndex: 'avatar',
    width: 80,
    customRender: render.renderAvatar,
  },
  {
    title: t('system.user.gender'),
    dataIndex: 'sex',
    width: 80,
    sorter: true,
    customRender: ({ text }) => {
      return render.renderDict(text, 'sex');
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: t('system.user.username'),
    field: 'username',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    label: t('system.user.gender'),
    field: 'sex',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'sex',
      placeholder: t('system.user.genderSelect'),
      stringToNumber: true,
    },
    colProps: { span: 6 },
  },
  {
    label: t('system.user.realname'),
    field: 'realname',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: t('system.user.phonenumber'),
    field: 'phone',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: t('system.user.status'),
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'user_status',
      placeholder: t('system.user.statusSelect'),
      stringToNumber: true,
    },
    colProps: { span: 6 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: t('system.user.username'),
    field: 'username',
    component: 'Input',
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_user', 'username', model, schema, true),
  },
  {
    label: t('system.user.password'),
    field: 'password',
    component: 'StrengthMeter',
    rules: [
      {
        required: true,
        message: t('system.user.passwordPlaceholder'),
      },
    ],
  },
  {
    label: t('system.user.confirmPassword'),
    field: 'confirmPassword',
    component: 'InputPassword',
    dynamicRules: ({ values }) => rules.confirmPassword(values, true),
  },
  {
    label: t('system.user.realname'),
    field: 'realname',
    required: true,
    component: 'Input',
  },
  {
    label: t('system.user.jobNumber'),
    field: 'workNo',
    required: true,
    component: 'Input',
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_user', 'work_no', model, schema, true),
  },
  {
    label: t('system.user.jobTitle'),
    field: 'post',
    required: false,
    component: 'JSelectPosition',
    componentProps: {
      rowKey: 'code',
      labelKey: 'name',
    },
  },
  {
    label: t('system.user.role'),
    field: 'selectedroles',
    component: 'ApiSelect',
    componentProps: {
      mode: 'multiple',
      api: getAllRolesList,
      labelField: 'roleName',
      valueField: 'id',
    },
  },
  {
    label: t('system.user.department'),
    field: 'selecteddeparts',
    component: 'JSelectDept',
    componentProps: ({ formActionType, formModel }) => {
      return {
        sync: false,
        checkStrictly: true,
        defaultExpandLevel: 2,

        onSelect: (options, values) => {
          const { updateSchema } = formActionType;
          //After the departments are modified
          updateSchema([
            {
              field: 'departIds',
              componentProps: { options },
            },
          ]);
          //After the departments are revised, the responsible department data is updated
          formModel.departIds && (formModel.departIds = formModel.departIds.filter((item) => values.value.indexOf(item) > -1));
        },
      };
    },
  },
  {
    label: t('system.user.tenant'),
    field: 'relTenantIds',
    component: 'ApiSelect',
    componentProps: {
      mode: 'multiple',
      api: getAllTenantList,
      numberToString: true,
      labelField: 'name',
      valueField: 'id',
    },
  },
  {
    label: t('system.user.identity'),
    field: 'userIdentity',
    component: 'RadioGroup',
    defaultValue: 1,
    componentProps: ({ formModel }) => {
      return {
        options: [
          { label: t('system.user.generalUser'), value: 1, key: '1' },
          { label: t('system.user.superior'), value: 2, key: '2' },
        ],
        onChange: () => {
          formModel.userIdentity == 1 && (formModel.departIds = []);
        },
      };
    },
  },
  {
    label: t('system.user.responsibleDepartment'),
    field: 'departIds',
    component: 'Select',
    componentProps: {
      mode: 'multiple',
    },
    ifShow: ({ values }) => values.userIdentity == 2,
  },
  {
    label: t('system.user.avatar'),
    field: 'avatar',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 1,
    },
  },
  {
    label: t('system.user.birthday'),
    field: 'birthday',
    component: 'DatePicker',
  },
  {
    label: t('system.user.gender'),
    field: 'sex',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'sex',
      placeholder: t('system.user.genderSelect'),
      stringToNumber: true,
    },
  },
  {
    label: t('system.user.email'),
    field: 'email',
    component: 'Input',
    rules: rules.rule('email', false),
  },
  {
    label: t('system.user.phonenumber'),
    field: 'phone',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ ...rules.duplicateCheckRule('sys_user', 'phone', model, schema, true)[0] }, { pattern: /^1[3|4|5|7|8|9][0-9]\d{8}$/, message: '手机号码格式有误' }];
    },
  },
  {
    label: t('system.user.landline'),
    field: 'telephone',
    component: 'Input',
    rules: [{ pattern: /^0\d{2,3}-[1-9]\d{6,7}$/, message: t('system.user.landlineError') }],
  },
  {
    label: t('system.user.workflowEngine'),
    field: 'activitiSync',
    defaultValue: 1,
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'activiti_sync',
      type: 'radio',
      stringToNumber: true,
    },
  },
];

export const formPasswordSchema: FormSchema[] = [
  {
    label: t('system.user.username'),
    field: 'username',
    component: 'Input',
    componentProps: { readOnly: true },
  },
  {
    label: t('system.user.password'),
    field: 'password',
    component: 'StrengthMeter',
    componentProps: {
      placeholder: t('system.user.passwordPlaceholder'),
    },
    rules: [
      {
        required: true,
        message: t('system.user.passwordPlaceholder'),
      },
    ],
  },
  {
    label: t('system.user.confirmPassword'),
    field: 'confirmPassword',
    component: 'InputPassword',
    dynamicRules: ({ values }) => rules.confirmPassword(values, true),
  },
];

export const formAgentSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'userName',
    label: t('system.user.username'),
    component: 'Input',
    componentProps: {
      readOnly: true,
      allowClear: false,
    },
  },
  {
    field: 'agentUserName',
    label: t('system.user.delegateUsername'),
    required: true,
    component: 'JSelectUser',
    componentProps: {
      rowKey: 'username',
      labelKey: 'realname',
      maxSelectCount: 10,
    },
  },
  {
    field: 'startTime',
    label: t('system.user.startTime'),
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: t('system.user.startTimePlaceholder'),
    },
  },
  {
    field: 'endTime',
    label: t('system.user.endTime'),
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: t('system.user.endTimePlaceholder'),
    },
  },
  {
    field: 'status',
    label: t('system.user.status'),
    component: 'JDictSelectTag',
    defaultValue: '1',
    componentProps: {
      dictCode: 'valid_status',
      type: 'radioButton',
    },
  },
];
