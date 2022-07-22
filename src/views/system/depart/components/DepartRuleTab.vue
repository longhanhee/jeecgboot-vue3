<template>
  <a-spin :spinning="loading">
    <template v-if="treeData.length > 0">
      <BasicTree
        ref="basicTree"
        class="depart-rule-tree"
        checkable
        :treeData="treeData"
        :checkedKeys="checkedKeys"
        :selectedKeys="selectedKeys"
        :expandedKeys="expandedKeys"
        :checkStrictly="checkStrictly"
        style="height: 500px; overflow: auto"
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

    <div class="j-box-bottom-button offset-20" style="margin-top: 30px">
      <div class="j-box-bottom-button-float">
        <a-dropdown :trigger="['click']" placement="topCenter">
          <template #overlay>
            <a-menu>
              <a-menu-item key="3" @click="toggleCheckALL(true)">{{ t('common.all') }}</a-menu-item>
              <a-menu-item key="4" @click="toggleCheckALL(false)">{{ t('common.cancel') }}</a-menu-item>
              <a-menu-item key="5" @click="toggleExpandAll(true)">{{ t('common.expandAll') }}</a-menu-item>
              <a-menu-item key="6" @click="toggleExpandAll(false)">{{ t('common.collapseAll') }}</a-menu-item>
            </a-menu>
          </template>
          <a-button style="float: left">
            {{ t('system.depart.treeOperation') }}
            <Icon icon="ant-design:up-outlined" />
          </a-button>
        </a-dropdown>
        <a-button type="primary" preIcon="ant-design:save-filled" @click="onSubmit">{{ t('common.save') }}</a-button>
      </div>
    </div>
  </a-spin>
  <DepartDataRuleDrawer @register="registerDataRuleDrawer" />
</template>

<script lang="ts" setup>
  import { watch, computed, inject, ref, nextTick } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTree } from '/@/components/Tree/index';
  import DepartDataRuleDrawer from './DepartDataRuleDrawer.vue';
  import { queryRoleTreeList, queryDepartPermission, saveDepartPermission } from '../depart.api';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
  });
  // The currently selected department ID may be empty, which means that there is no selection of the department
  const departId = computed(() => props.data?.id);

  const prefixCls = inject('prefixCls');
  const basicTree = ref();
  const loading = ref<boolean>(false);
  const treeData = ref<any[]>([]);
  const expandedKeys = ref<Array<any>>([]);
  const selectedKeys = ref<Array<any>>([]);
  const checkedKeys = ref<Array<any>>([]);
  const lastCheckedKeys = ref<Array<any>>([]);
  const checkStrictly = ref(true);

  // Registration data rule authorized pop -up drawer
  const [registerDataRuleDrawer, dataRuleDrawer] = useDrawer();

  // onCreated
  loadData();
  watch(departId, () => loadDepartPermission(), { immediate: true });

  async function loadData() {
    try {
      loading.value = true;
      let { treeList } = await queryRoleTreeList();
      treeData.value = treeList;
      await nextTick();
      toggleExpandAll(true);
    } finally {
      loading.value = false;
    }
  }

  async function loadDepartPermission() {
    if (departId.value) {
      try {
        loading.value = true;
        let keys = await queryDepartPermission({ departId: departId.value });
        checkedKeys.value = keys;
        lastCheckedKeys.value = [...keys];
      } finally {
        loading.value = false;
      }
    }
  }

  async function onSubmit() {
    try {
      loading.value = true;
      await saveDepartPermission({
        departId: departId.value,
        permissionIds: checkedKeys.value.join(','),
        lastpermissionIds: lastCheckedKeys.value.join(','),
      });
      await loadData();
      await loadDepartPermission();
    } finally {
      loading.value = false;
    }
  }

  // Tree check the check box event
  function onCheck(event) {
    if (!Array.isArray(event)) {
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
      dataRuleDrawer.openDrawer(true, { departId, functionId });
    }
    selectedKeys.value = [];
  }

  // Switch the father -son relationship
  async function toggleCheckStrictly(flag) {
    checkStrictly.value = flag;
    await nextTick();
    checkedKeys.value = basicTree.value.getCheckedKeys();
  }

  // Switch to put away
  async function toggleExpandAll(flag) {
    basicTree.value.expandAll(flag);
    await nextTick();
    expandedKeys.value = basicTree.value.getExpandedKeys();
  }

  // Switch all the selection
  async function toggleCheckALL(flag) {
    basicTree.value.checkAll(flag);
    await nextTick();
    checkedKeys.value = basicTree.value.getCheckedKeys();
  }
</script>

<style lang="less" scoped>
  // 【VUEN-188] The problem of not sensitive to the scroll bar
  .depart-rule-tree ::v-deep(.scrollbar__bar) {
    pointer-events: none;
  }
</style>
