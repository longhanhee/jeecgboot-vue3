<template>
  <BasicDrawer
    :title="t('system.depart.departmentRoleConfig')"
    :width="650"
    :loading="loading"
    showFooter
    :okText="t('common.saveAndClose')"
    @ok="onSubmit(true)"
    @close="onClose"
    @register="registerDrawer"
  >
    <div>
      <a-spin :spinning="loading">
        <template v-if="treeData.length > 0">
          <BasicTree
            :title="t('system.depart.ownedDepartment')"
            toolbar
            checkable
            :treeData="treeData"
            :checkedKeys="checkedKeys"
            :selectedKeys="selectedKeys"
            :expandedKeys="expandedKeys"
            :checkStrictly="checkStrictly"
            :clickRowToExpand="false"
            @check="onCheck"
            @expand="onExpand"
            @select="onSelect"
          >
            <template #title="{ slotTitle, ruleFlag }">
              <span>{{ slotTitle }}</span>
              <Icon v-if="ruleFlag" icon="ant-design:align-left-outlined" style="margin-left: 5px; color: red" />
            </template>
          </BasicTree>
        </template>
        <a-empty v-else :description="t('system.depart.warning.unableConfig')" />
      </a-spin>
    </div>

    <template #centerFooter>
      <a-button type="primary" :loading="loading" ghost @click="onSubmit(false)">{{ t('common.save') }}</a-button>
    </template>
  </BasicDrawer>
  <DepartRoleDataRuleDrawer @register="registerDataRuleDrawer" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import { BasicTree } from '/@/components/Tree/index';
  import { BasicDrawer, useDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';

  import DepartRoleDataRuleDrawer from './DepartRoleDataRuleDrawer.vue';
  import { queryTreeListForDeptRole, queryDeptRolePermission, saveDeptRolePermission } from '../depart.user.api';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();

  defineEmits(['register']);
  const { createMessage } = useMessage();
  const loading = ref(false);
  const departId = ref('');
  const roleId = ref('');
  const treeData = ref<Array<any>>([]);
  const checkedKeys = ref<Array<any>>([]);
  const lastCheckedKeys = ref<Array<any>>([]);
  const expandedKeys = ref<Array<any>>([]);
  const selectedKeys = ref<Array<any>>([]);
  const allTreeKeys = ref<Array<any>>([]);
  const checkStrictly = ref(true);

  // Register drawer component
  const [registerDrawer, { closeDrawer }] = useDrawerInner((data) => {
    roleId.value = data.record.id;
    departId.value = data.record.departId;
    loadData();
  });
  // Registration data rule authorized pop -up drawer
  const [registerDataRuleDrawer, dataRuleDrawer] = useDrawer();

  async function loadData() {
    try {
      loading.value = true;
      // User role authorization function, query menu permission tree
      const { ids, treeList } = await queryTreeListForDeptRole({ departId: departId.value });
      if (ids.length > 0) {
        allTreeKeys.value = ids;
        expandedKeys.value = ids;
        treeData.value = treeList;
        // Query role authorization
        checkedKeys.value = await queryDeptRolePermission({ roleId: roleId.value });
        lastCheckedKeys.value = [checkedKeys.value];
      } else {
        reset();
      }
    } finally {
      loading.value = false;
    }
  }

  // Reset page
  function reset() {
    treeData.value = [];
    expandedKeys.value = [];
    checkedKeys.value = [];
    lastCheckedKeys.value = [];
    loading.value = false;
  }

  // Tree check the check box event
  function onCheck(event) {
    if (checkStrictly.value) {
      checkedKeys.value = event.checked;
    } else {
      checkedKeys.value = event;
    }
  }

  // Tree unfolding event
  function onExpand($expandedKeys) {
    expandedKeys.value = $expandedKeys;
  }

  // TREE selection event
  function onSelect($selectedKeys, { selectedNodes }) {
    if (selectedNodes[0]?.props?.ruleFlag) {
      let functionId = $selectedKeys[0];
      dataRuleDrawer.openDrawer(true, { roleId, departId, functionId });
    }
    selectedKeys.value = [];
  }

  function doClose() {
    reset();
    closeDrawer();
  }

  function onClose() {
    reset();
  }

  async function onSubmit(exit) {
    try {
      loading.value = true;
      let params = {
        roleId: roleId.value,
        permissionIds: checkedKeys.value.join(','),
        lastpermissionIds: lastCheckedKeys.value.join(','),
      };
      await saveDeptRolePermission(params);
      if (exit) {
        doClose();
      }
    } finally {
      loading.value = false;
      if (!exit) {
        loadData();
      }
    }
  }
</script>
