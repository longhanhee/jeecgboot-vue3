<template>
  <!--Reference form-->
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--Slot: table title-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="addDepartRole">{{ t('system.depart.addDepartmentRole') }}</a-button>
      <template v-if="selectedRowKeys.length > 0">
        <a-divider type="vertical" />
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onDeleteDepartRoleBatch">
                <icon icon="ant-design:delete-outlined" />
                <span>{{ t('common.delete') }}</span>
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
  <!-- Add department pop -up window -->
  <DepartRoleModal :departId="departId" @register="registerFormModal" @success="onFormModalSuccess" />
  <DepartRoleAuthDrawer @register="registerAuthDrawer" />
</template>

<script lang="ts" setup>
  import { inject, ref, unref, watch, computed, onMounted } from 'vue';

  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';

  import DepartRoleModal from './DepartRoleModal.vue';
  import DepartRoleAuthDrawer from './DepartRoleAuthDrawer.vue';
  import { deleteBatchDepartRole, departRoleList } from '../depart.user.api';
  import { departRoleColumns, departRoleSearchFormSchema } from '../depart.user.data';
  import { ColEx } from '/@/components/Form/src/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const prefixCls = inject('prefixCls');
  const props = defineProps({
    data: { require: true, type: Object },
  });
  defineEmits(['register']);
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
      api: departRoleList,
      columns: departRoleColumns,
      canResize: false,
      formConfig: {
        schemas: departRoleSearchFormSchema,
        baseColProps: adaptiveColProps,
        labelAlign: 'left',
        labelCol: {
          xs: 24,
          sm: 24,
          md: 24,
          lg: 9,
          xl: 7,
          xxl: 6,
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
        params.deptId = departId.value;
      },
    },
  });

  // Register listtable
  const [registerTable, { reload, setProps, setLoading, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  // Register FORM Poppy Window
  const [registerFormModal, formModal] = useModal();
  // Registered authorized pop -up drawer
  const [registerAuthDrawer, authDrawer] = useDrawer();

  // Surveillance data changes, reload the data
  watch(
    () => props.data,
    () => reload()
  );
  onMounted(() => {
    reload();
  });

  // Empty choice
  function clearSelection() {
    selectedRowKeys.value = [];
  }

  // Add a departmental role
  function addDepartRole() {
    formModal.openModal(true, {
      isUpdate: false,
      record: {},
    });
  }

  // Edit Department
  function editDepartRole(record) {
    formModal.openModal(true, {
      isUpdate: true,
      record: record,
    });
  }

  // Authorized department role
  function permissionDepartRole(record) {
    authDrawer.openDrawer(true, { record });
  }

  // Batch delete department role
  async function deleteDepartRole(idList, confirm) {
    if (!departId.value) {
      createMessage.warning(t('system.depart.warning.departmentChoose'));
    } else {
      setLoading(true);
      let ids = unref(idList).join(',');
      try {
        await deleteBatchDepartRole({ ids }, confirm);
        return reload();
      } finally {
        setLoading(false);
      }
    }
    return Promise.reject();
  }

  // Batch deletion of departmental characters
  async function onDeleteDepartRoleBatch() {
    try {
      await deleteDepartRole(selectedRowKeys, true);
      // Clear the selection after the batch deletion is successful
      clearSelection();
    } catch (e) {}
  }

  // The recovery after the pop -up window is successful
  function onFormModalSuccess({ isUpdate, values }) {
    isUpdate ? updateTableDataRecord(values.id, values) : reload();
  }

  /**
   * Operating bar
   */
  function getTableAction(record): ActionItem[] {
    return [{ label: t('common.edit'), onClick: editDepartRole.bind(null, record) }];
  }

  /**
   * Drop -down operation bar
   */
  function getDropDownAction(record): ActionItem[] {
    return [
      { label: t('common.authorize'), onClick: permissionDepartRole.bind(null, record) },
      {
        label: t('common.delete'),
        color: 'error',
        popConfirm: {
          title: t('common.message.deleteWarning'),
          confirm: deleteDepartRole.bind(null, [record.id], false),
        },
      },
    ];
  }
</script>
