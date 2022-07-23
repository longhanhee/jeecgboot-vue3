<template>
  <!--Reference form-->
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--Slot: table title-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="selectAddUser">{{ t('system.depart.addExistingUsers') }}</a-button>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="createUser">{{ t('system.depart.newUser') }}</a-button>
      <template v-if="selectedRowKeys.length > 0">
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onUnlinkDepartUserBatch">
                <icon icon="bx:bx-unlink" />
                <span>{{ t('common.unlink') }}</span>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <span>{{ t('common.batchOperation') }} </span>
            <icon icon="akar-icons:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>
    </template>
    <!-- Slot: operation button in the line -->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <UserDrawer @register="registerDrawer" @success="onUserDrawerSuccess" />
  <DepartRoleUserAuthDrawer @register="registerUserAuthDrawer" />
  <UserSelectModal rowKey="id" @register="registerSelUserModal" @getSelectResult="onSelectUserOk" />
</template>

<script lang="ts" setup>
  import { computed, inject, ref, unref, watch } from 'vue';
  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';

  import UserDrawer from '/@/views/system/user/UserDrawer.vue';
  import UserSelectModal from '/@/components/Form/src/jeecg/components/modal/UserSelectModal.vue';
  import DepartRoleUserAuthDrawer from './DepartRoleUserAuthDrawer.vue';
  import { departUserList, linkDepartUserBatch, unlinkDepartUserBatch } from '../depart.user.api';
  import { userInfoColumns, userInfoSearchFormSchema } from '../depart.user.data';
  import { ColEx } from '/@/components/Form/src/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const prefixCls = inject('prefixCls');
  const props = defineProps({
    data: { require: true, type: Object },
  });
  // The currently selected department ID may be empty, which means that there is no selection of the department
  const departId = computed(() => props.data?.id);

  // Adaptive configuration
  const adaptiveColProps: Partial<ColEx> = {
    xs: 24, // <576px
    sm: 24, // ≥576px
    md: 24, // ≥768px
    lg: 12, // ≥992px
    xl: 12, // ≥1200px
    xxl: 8, // ≥1600px
  };
  // List page public parameters and methods
  const { tableContext, createMessage } = useListPage({
    tableProps: {
      api: departUserList,
      columns: userInfoColumns,
      canResize: false,
      formConfig: {
        schemas: userInfoSearchFormSchema,
        baseColProps: adaptiveColProps,
        labelAlign: 'left',
        labelCol: {
          xs: 24,
          sm: 24,
          md: 24,
          lg: 9,
          xl: 7,
          xxl: 5,
        },
        wrapperCol: {},
        // Operation button configuration
        actionColOptions: {
          ...adaptiveColProps,
          style: { textAlign: 'left' },
        },
      },
      // Process the parameter before the request
      beforeFetch(params) {
        params.depId = departId.value;
      },
    },
  });

  // Register listtable
  const [registerTable, { reload, setProps, setLoading, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  watch(
    () => props.data,
    () => reload()
  );
  //Register DRAWER
  const [registerDrawer, { openDrawer, setDrawerProps }] = useDrawer();
  const [registerUserAuthDrawer, userAuthDrawer] = useDrawer();
  // Registered users choose MODAL
  const [registerSelUserModal, selUserModal] = useModal();

  // Empty choice
  function clearSelection() {
    selectedRowKeys.value = [];
  }

  // Check the role of the department
  function showDepartRole(record) {
    userAuthDrawer.openDrawer(true, { userId: record.id, departId });
  }

  // Create users
  function createUser() {
    if (!departId.value) {
      createMessage.warning(t('system.depart.warning.departmentChoose'));
    } else {
      openDrawer(true, {
        isUpdate: false,
        departDisabled: true,
        // Initialization responsible department
        nextDepartOptions: { value: props.data?.key, label: props.data?.title },
        record: {
          activitiSync: 1,
          userIdentity: 1,
          selecteddeparts: departId.value,
        },
      });
    }
  }

  // View user details
  function showUserDetail(record) {
    openDrawer(true, {
      record,
      isUpdate: true,
      departDisabled: true,
      showFooter: false,
    });
  }

  // Edit user information
  function editUserInfo(record) {
    openDrawer(true, { isUpdate: true, record, departDisabled: true });
  }

  // Choose to add existing users
  function selectAddUser() {
    selUserModal.openModal();
  }

  // Cancellation of the relationship between related departments and users in batches
  async function unlinkDepartUser(idList, confirm) {
    if (!departId.value) {
      createMessage.warning(t('system.depart.warning.departmentChoose'));
    } else {
      setLoading(true);
      let userIds = unref(idList).join(',');
      try {
        await unlinkDepartUserBatch({ depId: departId.value, userIds }, confirm);
        return reload();
      } finally {
        setLoading(false);
      }
    }
    return Promise.reject();
  }

  // Cancellation of related incidents in batches
  async function onUnlinkDepartUserBatch() {
    try {
      await unlinkDepartUser(selectedRowKeys, true);
      // Clear the selection after the batch deletion is successful
      clearSelection();
    } catch (e) {}
  }

  // Select users successfully
  async function onSelectUserOk(options, userIdList) {
    if (userIdList.length > 0) {
      try {
        setLoading(true);
        await linkDepartUserBatch(departId.value, userIdList);
        reload();
      } finally {
        setLoading(false);
      }
    }
  }

  /**
   * User drawer form successfully call back
   */
  function onUserDrawerSuccess({ isUpdate, values }) {
    isUpdate ? updateTableDataRecord(values.id, values) : reload();
  }

  /**
   * Operating bar
   */
  function getTableAction(record): ActionItem[] {
    return [{ label: t('common.edit'), onClick: editUserInfo.bind(null, record) }];
  }

  /**
   * Drop -down operation bar
   */
  function getDropDownAction(record): ActionItem[] {
    return [
      { label: t('system.depart.departmentRole'), onClick: showDepartRole.bind(null, record) },
      { label: t('system.depart.userDetails'), onClick: showUserDetail.bind(null, record) },
      {
        label: t('common.unlink'),
        color: 'error',
        popConfirm: {
          title: t('system.depart.warning.unlinkWarning'),
          confirm: unlinkDepartUser.bind(null, [record.id], false),
        },
      },
    ];
  }
</script>
