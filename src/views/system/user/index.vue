<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'user:add'" @click="handleCreate">{{ t('common.new') }}</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">{{ t('common.export') }}</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">{{ t('common.import') }}</j-upload-button>
        <a-button type="primary" @click="handleSyncUser" preIcon="ant-design:sync-outlined">{{ t('system.user.synchronizationProcess') }}</a-button>
        <a-button type="primary" @click="openModal(true, {})" preIcon="ant-design:hdd-outlined">{{ t('system.user.recycleBin') }}</a-button>
        <JThirdAppButton biz-type="user" :selected-row-keys="selectedRowKeys" syncToApp syncToLocal @sync-finally="onSyncFinally" />
        <a-button type="primary" preIcon="ant-design:filter-outlined">{{ t('system.user.advancedSearch') }}</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                {{ t('common.delete') }}
              </a-menu-item>
              <a-menu-item key="2" @click="batchFrozen(2)">
                <Icon icon="ant-design:lock-outlined"></Icon>
                {{ t('common.lock') }}
              </a-menu-item>
              <a-menu-item key="3" @click="batchFrozen(1)">
                <Icon icon="ant-design:unlock-outlined"></Icon>
                {{ t('common.unlock') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >{{ t('system.user.batchOperations') }}
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--Operating bar-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--User drawer-->
    <UserDrawer @register="registerDrawer" @success="handleSuccess" />
    <!--change Password-->
    <PasswordModal @register="registerPasswordModal" @success="reload" />
    <!--User agent-->
    <UserAgentModal @register="registerAgentModal" @success="reload" />
    <!--Recovery station-->
    <UserRecycleBinModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" name="system-user" setup>
//ts语法
import { ref, computed, unref } from 'vue';
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import UserDrawer from './UserDrawer.vue';
import UserRecycleBinModal from './UserRecycleBinModal.vue';
import PasswordModal from './PasswordModal.vue';
import UserAgentModal from './UserAgentModal.vue';
import JThirdAppButton from '/@/components/jeecg/thirdApp/JThirdAppButton.vue';
import { useDrawer } from '/@/components/Drawer';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './user.data';
import { list, deleteUser, batchDeleteUser, getImportUrl, getExportUrl, frozenBatch, syncUser } from './user.api';
// import { usePermission } from '/@/hooks/web/usePermission'
// const { hasPermission } = usePermission();
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

const { createMessage, createConfirm } = useMessage();

const selectRows = ref([]);
//Register DRAWER
const [registerDrawer, { openDrawer }] = useDrawer();
//Recycling station MODEL
const [registerModal, { openModal }] = useModal();
//Password Model
const [registerPasswordModal, { openModal: openPasswordModal }] = useModal();
//Agent Model
const [registerAgentModal, { openModal: openAgentModal }] = useModal();

// List page public parameters and methods
const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
  designScope: 'user-list',
  tableProps: {
    title: t('system.user.userList'),
    api: list,
    columns: columns,
    size: 'small',
    formConfig: {
      labelWidth: 200,
      schemas: searchFormSchema,
    },
    actionColumn: {
      width: 120,
    },
    beforeFetch: (params) => {
      return Object.assign({ column: 'createTime', order: 'desc' }, params);
    },
  },
  exportConfig: {
    name: t('system.user.userList'),
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
  },
});

//Register Table data
const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * New incident
 */
function handleCreate() {
  openDrawer(true, {
    isUpdate: false,
    showFooter: true,
  });
}
/**
 * Editor
 */
async function handleEdit(record: Recordable) {
  openDrawer(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}
/**
 * Detail
 */
async function handleDetail(record: Recordable) {
  openDrawer(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}
/**
 * Delete incident
 */
async function handleDelete(record) {
  if ('admin' == record.username) {
    createMessage.warning(t('system.user.warning.adminWarning'));
    return;
  }
  await deleteUser({ id: record.id }, reload);
}
/**
 * Batch deletion event
 */
async function batchHandleDelete() {
  let hasAdmin = unref(selectRows).filter((item) => item.username == 'admin');
  if (unref(hasAdmin).length > 0) {
    createMessage.warning(t('system.user.warning.adminWarning'));
    return;
  }
  await batchDeleteUser({ ids: selectedRowKeys.value }, () => {
    selectedRowKeys.value = [];
    reload();
  });
}
/**
 * Successfully call back
 */
function handleSuccess() {
  reload();
}

/**
 * Open the modification password pop -up window
 */
function handleChangePassword(username) {
  openPasswordModal(true, { username });
}
/**
 * Open the agent pop -up window
 */
function handleAgentSettings(userName) {
  openAgentModal(true, { userName });
}
/**
 * Frozen
 */
async function handleFrozen(record, status) {
  if ('admin' == record.username) {
    createMessage.warning(t('system.user.warning.adminWarning'));
    return;
  }
  await frozenBatch({ ids: record.id, status: status }, reload);
}
/**
 * Batch frozen
 */
function batchFrozen(status) {
  let hasAdmin = unref(selectRows).filter((item) => item.username == 'admin');
  if (unref(hasAdmin).length > 0) {
    createMessage.warning(t('system.user.warning.adminWarning'));
    return;
  }
  createConfirm({
    iconType: 'warning',
    title: t('system.user.confirm'),
    content: t('system.user.to') + (status == 1 ? t('system.user.unlock') : t('system.user.lock')) + t('system.user.thisAccount'),
    onOk: async () => {
      await frozenBatch({ ids: unref(selectedRowKeys).join(','), status: status }, reload);
    },
  });
}

/**
 *Synchronous process
 */
function handleSyncUser() {
  syncUser();
}
/**
 *Synchronous nails and WeChat callback
 */
function onSyncFinally({ isToLocal }) {
  // Refresh the data when synchronized to local
  if (isToLocal) {
    reload();
  }
}

/**
 * Operating bar
 */
function getTableAction(record): ActionItem[] {
  return [
    {
      label: t('common.edit'),
      onClick: handleEdit.bind(null, record),
      // ifShow: () => hasPermission('user:edit'),
    },
  ];
}
/**
 * Drop -down operation bar
 */
function getDropDownAction(record): ActionItem[] {
  return [
    {
      label: t('common.detail'),
      onClick: handleDetail.bind(null, record),
    },
    {
      label: t('system.user.password'),
      onClick: handleChangePassword.bind(null, record.username),
    },
    {
      label: t('common.delete'),
      popConfirm: {
        title: t('system.user.warning.deleteWarning'),
        confirm: handleDelete.bind(null, record),
      },
    },
    {
      label: t('common.lock'),
      ifShow: record.status == 1,
      popConfirm: {
        title: t('system.user.warning.lockWarning'),
        confirm: handleFrozen.bind(null, record, 2),
      },
    },
    {
      label: t('common.unlock'),
      ifShow: record.status == 2,
      popConfirm: {
        title: t('system.user.warning.unlockWarning'),
        confirm: handleFrozen.bind(null, record, 1),
      },
    },
    {
      label: t('common.agent'),
      onClick: handleAgentSettings.bind(null, record.username),
    },
  ];
}
</script>

<style scoped></style>
