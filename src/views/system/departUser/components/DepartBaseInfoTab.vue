<template>
  <Description @register="registerDesc" />
</template>

<script lang="ts" setup>
  import { ref, inject, onMounted, watch } from 'vue';
  import { queryIdTree } from '../depart.user.api';
  import { useBaseInfoForm } from '../depart.user.data';
  import { Description, useDescription } from '/@/components/Description/index';

  const prefixCls = inject('prefixCls');
  const props = defineProps({
    data: { require: true, type: Object },
  });
  const treeData = ref([]);
  const { descItems } = useBaseInfoForm(treeData);

  const [registerDesc, { setDescProps }] = useDescription({
    data: props.data,
    schema: descItems,
    column: 1,
    labelStyle: {
      width: '180px',
    },
  });

  function setData(data) {
    setDescProps({ data });
  }

  onMounted(() => {
    watch(
      () => props.data,
      () => setData(props.data),
      { immediate: true }
    );
  });
  // Treedata of the Parentid component dynamic inquiries
  queryIdTree().then((data) => (treeData.value = data));
</script>
