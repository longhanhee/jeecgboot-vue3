<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :width="800" @title="t('system.user.register')" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formAgentSchema } from './user.data';
  import { getUserAgent, saveOrUpdateAgent } from './user.api';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  // State Emits
  const emit = defineEmits(['success', 'register']);
  //Form configuration
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formAgentSchema,
    showActionButtonGroup: false,
  });
  //Form assignment
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //Reset form
    await resetFields();
    setModalProps({ confirmLoading: false });
    //Query obtaining form data
    const res = await getUserAgent({ userName: data.userName });
    data = res.result ? res.result : data;
    //Form assignment
    await setFieldsValue({ ...data });
  });
  //Form submission event
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //submit Form
      await saveOrUpdateAgent(values);
      //Close the pop -up window
      closeModal();
      //refresh the list
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
