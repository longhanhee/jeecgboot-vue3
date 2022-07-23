<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="getTitle" :width="adaptiveWidth" @ok="handleSubmit" :showFooter="showFooter" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { defineComponent, ref, computed, unref, useAttrs } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './user.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { saveOrUpdateUser, getUserRoles, getUserDepartList } from './user.api';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  // State Emits
  const emit = defineEmits(['success', 'register']);
  const attrs = useAttrs();
  const isUpdate = ref(true);
  const rowId = ref('');
  const departOptions = ref([]);
  //Form configuration
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
  const showFooter = ref(true);
  //Form assignment
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    showFooter.value = data?.showFooter ?? true;
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      //Considiatric information definition into an array
      if (data.record.relTenantIds && !Array.isArray(data.record.relTenantIds)) {
        data.record.relTenantIds = data.record.relTenantIds.split(',');
      } else {
        //【issues/I56c5i] User Management is lost in two consecutive editors to the tenant configuration
        //data.record.relTenantIds = [];
      }

      //Check the role/Assignment/try catch Processing, otherwise there is a problem with the editor
      try {
        const userRoles = await getUserRoles({ userid: data.record.id });
        if (userRoles && userRoles.length > 0) {
          data.record.selectedroles = userRoles;
        }
      } catch (error) {}

      //Check the department/Assignment
      const userDepart = await getUserDepartList({ userId: data.record.id });
      if (userDepart && userDepart.length > 0) {
        data.record.selecteddeparts = userDepart;
        let selectDepartKeys = Array.from(userDepart, ({ key }) => key);
        data.record.selecteddeparts = selectDepartKeys.join(',');
        departOptions.value = userDepart.map((item) => {
          return { label: item.title, value: item.key };
        });
      }
      //Responsible department/assignment
      data.record.departIds && !Array.isArray(data.record.departIds) && (data.record.departIds = data.record.departIds.split(','));
      //update-begin---author:zyf   Date:20211210  for: Avoid the short value display abnormality------------
      data.record.departIds = data.record.departIds == '' ? [] : data.record.departIds;
      //update-begin---author:zyf   Date:20211210  for: Avoid the short value display abnormality------------
    }
    //Treatment oIt has something to do with the surface watchser list situation(It has something to do with the surface watch)
    data.selectedroles && (await setFieldsValue({ selectedroles: data.selectedroles }));
    //Edit Hidden password/corner list Hidden character information/My department hides the department's department
    updateSchema([
      {
        field: 'password',
        show: !unref(isUpdate),
      },
      {
        field: 'confirmPassword',
        ifShow: !unref(isUpdate),
      },
      {
        field: 'selectedroles',
        show: !data.isRole,
      },
      {
        field: 'departIds',
        componentProps: { options: departOptions },
      },
      {
        field: 'selecteddeparts',
        show: !data?.departDisabled ?? false,
      },
    ]);
    // No matter the new or editor, you can set the form value
    if (typeof data.record === 'object') {
      setFieldsValue({
        ...data.record,
      });
    }
    // Disable the entire form when hiding the bottom
    //update-begin-author:taoyan date:2022-5-24 for: VUEN-1117 【ISSUE】 0523 Week open source problem
    setProps({ disabled: !showFooter.value });
    //update-end-author:taoyan date:2022-5-24 for: VUEN-1117 【ISSUE】 0523 Week open source problem
  });
  //Get the title
  const getTitle = computed(() => (!unref(isUpdate) ? t('system.user.newUser') : t('system.user.editUser')));
  const { adaptiveWidth } = useDrawerAdaptiveWidth();

  //Submit incident
  async function handleSubmit() {
    try {
      let values = await validate();
      setDrawerProps({ confirmLoading: true });
      values.userIdentity === 1 && (values.departIds = '');
      //submit Form
      await saveOrUpdateUser(values, unref(isUpdate));
      //Close the pop -up window
      closeDrawer();
      //refresh the list
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
