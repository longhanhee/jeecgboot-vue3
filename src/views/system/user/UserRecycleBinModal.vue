<template>
  <BasicModal v-bind="$attrs" @register="registerModal" @title="t('system.user.useRecycleBin')" :showOkBtn="false" width="1000px" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--GroTable titlele title-->
      <template #tableTitle>
        <a-dropdown v-if="checkedKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                {{ t('system.user.batchDelete') }}
              </a-menu-item>
              <a-menu-item key="1" @click="batchHandleRevert">
                <Icon icon="ant-design:redo-outlined"></Icon>
                {{ t('system.user.batchRestore') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >{{ t('system.user.batchOperations') }}
            <Icon icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--Operating bar-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, toRaw, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { recycleColumns } from './user.data';
  import { getRecycleBinList, putRecycleBin, deleteRecycleBin } from './user.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const { createConfirm } = useMessage();
  // State Emits
  const emit = defineEmits(['success', 'register']);
  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal] = useModalInner(() => {
    checkedKeys.value = [];
  });
  //Register Table data
  const [registerTable, { reload }] = useTable({
    api: getRecycleBinList,
    columns: recycleColumns,
    rowKey: 'id',
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: false,
    pagination: true,
    tableSetting: { fullScreen: true },
    canResize: false,
    actionColumn: {
      width: 150,
      title: t('system.user.operate'),
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: undefined,
    },
  });
  /**
   * Select column configuration
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 50,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };
  /**
   * Choose an incident
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }
  /**
   * Restore event
   */
  async function handleRevert(record) {
    await putRecycleBin({ userIds: record.id }, reload);
    emit('success');
  }
  /**
   * Batch restoration event
   */
  function batchHandleRevert() {
    handleRevert({ id: toRaw(unref(checkedKeys)).join(',') });
  }
  /**
   * Delete incident
   */
  async function handleDelete(record) {
    await deleteRecycleBin({ userIds: record.id }, reload);
  }
  /**
   * Batch deletion event
   */
  function batchHandleDelete() {
    createConfirm({
      iconType: 'warning',
      title: t('common.delete'),
      content: t('system.user.warning.instantDeleteWarning'),
      onOk: () => handleDelete({ id: toRaw(unref(checkedKeys)).join(',') }),
      onCancel() {},
    });
  }
  //Get the operation bar event
  function getTableAction(record) {
    return [
      {
        label: t('common.retrieve'),
        icon: 'ant-design:redo-outlined',
        popConfirm: {
          title: t('system.user.confirmRestore'),
          confirm: handleRevert.bind(null, record),
        },
      },
      {
        label: t('system.user.removeCompletely'),
        icon: 'ant-design:scissor-outlined',
        popConfirm: {
          title: t('system.user.warning.instantDeleteWarning'),
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
</script>
