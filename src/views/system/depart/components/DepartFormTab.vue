<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" />
    <div class="j-box-bottom-button offset-20" style="margin-top: 30px">
      <div class="j-box-bottom-button-float">
        <a-button preIcon="ant-design:sync-outlined" @click="onReset">{{ t('common.reset') }}</a-button>
        <a-button type="primary" preIcon="ant-design:save-filled" @click="onSubmit">{{ t('common.keep') }}</a-button>
      </div>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import { watch, computed, inject, ref, unref, onMounted } from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdateDepart } from '../depart.api';
import { useBasicFormSchema, orgCategoryOptions } from '../depart.data';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const emit = defineEmits(['success']);
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  rootTreeData: { type: Array, default: () => [] },
});
const prefixCls = inject('prefixCls');
const loading = ref<boolean>(false);
// Is it currently an update mode
const isUpdate = ref<boolean>(true);
// Current pop -up data
const model = ref<object>({});

//Register
const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  schemas: useBasicFormSchema().basicFormSchema,
  showActionButtonGroup: false,
});

const categoryOptions = computed(() => {
  if (!!props?.data?.parentId) {
    return orgCategoryOptions.child;
  } else {
    return orgCategoryOptions.root;
  }
});

onMounted(() => {
  // Disabled field
  updateSchema([
    { field: 'parentId', componentProps: { disabled: true } },
    { field: 'orgCode', componentProps: { disabled: true } },
  ]);
  // data Change, fill in the form
  watch(
    () => props.data,
    async () => {
      let record = unref(props.data);
      if (typeof record !== 'object') {
        record = {};
      }
      model.value = record;
      await resetFields();
      await setFieldsValue({ ...record });
    },
    { deep: true, immediate: true }
  );
  //Update the parent department option
  watch(
    () => props.rootTreeData,
    async () => {
      updateSchema([
        {
          field: 'parentId',
          componentProps: { treeData: props.rootTreeData },
        },
      ]);
    },
    { deep: true, immediate: true }
  );
  // Monitor and change orgCategory options
  watch(
    categoryOptions,
    async () => {
      updateSchema([
        {
          field: 'orgCategory',
          componentProps: { options: categoryOptions.value },
        },
      ]);
    },
    { immediate: true }
  );
});

// Reset form
async function onReset() {
  await resetFields();
  await setFieldsValue({ ...model.value });
}

// Submit incident
async function onSubmit() {
  try {
    loading.value = true;
    let values = await validate();
    values = Object.assign({}, model.value, values);
    //submit Form
    await saveOrUpdateDepart(values, isUpdate.value);
    //refresh the list
    emit('success');
    Object.assign(model.value, values);
  } finally {
    loading.value = false;
  }
}
</script>
