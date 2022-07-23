<template>
  <BasicModal :title="title" :width="800" v-bind="$attrs" @ok="handleOk" @register="registerModal">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { watch, computed, inject, ref, unref, onMounted } from 'vue';

  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { saveOrUpdateDepart } from '../depart.api';
  import { useBasicFormSchema, orgCategoryOptions } from '../depart.data';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();

  const emit = defineEmits(['success', 'register']);
  const props = defineProps({
    rootTreeData: { type: Array, default: () => [] },
  });
  const prefixCls = inject('prefixCls');
  // Is it currently an update mode
  const isUpdate = ref<boolean>(false);
  // Current pop -up data
  const model = ref<object>({});
  const title = computed(() => (isUpdate.value ? t('common.edit') : t('system.depart.newlyIncrease')));

  //Register
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: useBasicFormSchema().basicFormSchema,
    showActionButtonGroup: false,
  });

  // Register
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    isUpdate.value = unref(data?.isUpdate);
    // Is it currently a sub -level?
    let isChild = unref(data?.isChild);
    let categoryOptions = isChild ? orgCategoryOptions.child : orgCategoryOptions.root;
    // Hidden fields that do not need to be displayed
    updateSchema([
      {
        field: 'parentId',
        show: isChild,
        componentProps: {
          // If it is a sub -department, this field is disabled
          disabled: isChild,
          treeData: props.rootTreeData,
        },
      },
      {
        field: 'orgCode',
        show: false,
      },
      {
        field: 'orgCategory',
        componentProps: { options: categoryOptions },
      },
    ]);

    let record = unref(data?.record);
    if (typeof record !== 'object') {
      record = {};
    }
    // Fumer recognition
    record = Object.assign(
      {
        departOrder: 0,
        orgCategory: categoryOptions[0].value,
      },
      record
    );
    model.value = record;
    await setFieldsValue({ ...record });
  });

  // Submit incident
  async function handleOk() {
    try {
      setModalProps({ confirmLoading: true });
      let values = await validate();
      //submit Form
      await saveOrUpdateDepart(values, isUpdate.value);
      //Close the pop -up window
      closeModal();
      //refresh the list
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
