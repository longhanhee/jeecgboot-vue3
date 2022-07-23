<template>
  <BasicModal :title="title" :width="800" v-bind="$attrs" @ok="handleOk" @register="registerModal">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, inject, ref, unref } from 'vue';

  import { BasicForm, useForm } from '/@/components/Form/index';
  // noinspection ES6UnusedImports
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { saveOrUpdateDepartRole } from '../depart.user.api';
  import { departRoleModalFormSchema } from '../depart.user.data';

  const emit = defineEmits(['success', 'register']);
  const props = defineProps({
    // Current department ID
    departId: { require: true, type: String },
  });
  const prefixCls = inject('prefixCls');
  // Is it currently an update mode
  const isUpdate = ref<boolean>(true);
  // Current pop -up data
  const model = ref<object>({});
  const title = computed(() => (isUpdate.value ? '编辑' : '新增'));

  //Register
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: departRoleModalFormSchema,
    showActionButtonGroup: false,
  });

  // Register
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    isUpdate.value = unref(data?.isUpdate);
    // No matter the new or editor, you can set the form value
    let record = unref(data?.record);
    if (typeof record === 'object') {
      model.value = record;
      await setFieldsValue({ ...record });
    }
  });

  //Submit incident
  async function handleOk() {
    try {
      setModalProps({ confirmLoading: true });
      let values = await validate();
      values.departId = unref(props.departId);
      //submit Form
      await saveOrUpdateDepartRole(values, isUpdate.value);
      //Close the pop -up window
      closeModal();
      //refresh the list
      emit('success', { isUpdate: unref(isUpdate), values });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
