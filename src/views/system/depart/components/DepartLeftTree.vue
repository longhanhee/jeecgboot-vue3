<template>
  <a-card :bordered="false" style="height: 100%">
    <div class="j-table-operator" style="width: 100%">
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="onAddDepart">{{ t('system.depart.newlyIncrease') }}</a-button>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="onAddChildDepart()">{{ t('system.depart.addLowerLevel') }}</a-button>
      <a-upload name="file" :showUploadList="false" :customRequest="onImportXls">
        <a-button type="primary" preIcon="ant-design:import-outlined">{{ t('common.import') }}</a-button>
      </a-upload>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">{{ t('common.export') }}</a-button>
      <a-button type="primary" preIcon="ant-design:sync-outlined">{{ t('system.depart.synchronousNail') }}</a-button>
      <a-button type="primary" preIcon="ant-design:sync-outlined">{{ t('system.depart.synchronousEnterpriseMicro') }}</a-button>
      <template v-if="checkedKeys.length > 0">
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onDeleteBatch">
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
    </div>
    <a-alert type="info" show-icon class="alert" style="margin-bottom: 8px">
      <template #message>
        <template v-if="checkedKeys.length > 0">
          <span>{{ t('common.selected') }} {{ checkedKeys.length }} {{ t('common.records') }}</span>
          <a-divider type="vertical" />
          <a @click="checkedKeys = []">{{ t('common.empty') }}</a>
        </template>
        <template v-else>
          <span>{{ t('common.noData') }}</span>
        </template>
      </template>
    </a-alert>
    <a-spin :spinning="loading">
      <a-input-search :placeholder="t('system.depart.searchDepartment')" style="margin-bottom: 10px" @search="onSearch" />
      <!--Organizational tree-->
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          checkable
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :checkStrictly="checkStrictly"
          :load-data="loadChildrenTreeData"
          :checkedKeys="checkedKeys"
          v-model:expandedKeys="expandedKeys"
          @check="onCheck"
          @select="onSelect"
        >
          <template #title="{ key: treeKey, title, dataRef }">
            <a-dropdown :trigger="['contextmenu']">
              <Popconfirm
                :visible="visibleTreeKey === treeKey"
                :title="t('system.depart.warning.deleteWarning')"
                :ok-text="t('common.confirm')"
                :cancel-text="t('common.cancel')"
                placement="rightTop"
                @confirm="onDelete(dataRef)"
                @visibleChange="onVisibleChange"
              >
                <span>{{ title }}</span>
              </Popconfirm>

              <template #overlay>
                <a-menu @click="">
                  <a-menu-item key="1" @click="onAddChildDepart(dataRef)">{{ t('system.depart.addSublevel') }}</a-menu-item>
                  <a-menu-item key="2" @click="visibleTreeKey = treeKey">
                    <span style="color: red">{{ t('common.delete') }}</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </template>
      <a-empty v-else :description="t('common.noData')" />
    </a-spin>
    <DepartFormModal :rootTreeData="treeData" @register="registerModal" @success="loadRootTreeData" />
  </a-card>
</template>

<script lang="ts" setup>
  import { inject, nextTick, ref, unref, defineExpose } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { Api, deleteBatchDepart, queryDepartTreeSync } from '../depart.api';
  import { searchByKeywords } from '/@/views/system/departUser/depart.user.api';
  import DepartFormModal from '/@/views/system/depart/components/DepartFormModal.vue';
  import { Popconfirm } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const prefixCls = inject('prefixCls');
  const emit = defineEmits(['select', 'rootTreeData']);
  const { createMessage } = useMessage();
  const { handleImportXls, handleExportXls } = useMethods();

  const loading = ref<boolean>(false);
  // Department Tree List Data
  const treeData = ref<any[]>([]);
  // The current item selected
  const checkedKeys = ref<any[]>([]);
  // The current item
  const expandedKeys = ref<any[]>([]);
  // The current item selected
  const selectedKeys = ref<any[]>([]);
  // Tree component reloadmponent reload
  const treeReloading = ref<boolean>(false);
  // Whether the tree father and son are related
  const checkStrictly = ref<boolean>(true);
  // The current selected department
  const currentDepart = ref<any>(null);
  // Control confirmation The deletion prompt box is displayed
  const visibleTreeKey = ref<any>(null);
  // search for the keyword
  const searchKeyword = ref('');

  // register modal
  const [registerModal, { openModal }] = useModal();

  // Load the top department information
  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      const result = await queryDepartTreeSync();
      if (Array.isArray(result)) {
        treeData.value = result;
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          let item = treeData.value[0];
          if (item) {
            // Select the first one by default
            setSelectedKey(item.id, item);
          }
        } else {
          emit('select', currentDepart.value);
        }
      }
      emit('rootTreeData', treeData.value);
    } finally {
      loading.value = false;
    }
  }

  loadRootTreeData();

  // Loading sub -department information
  async function loadChildrenTreeData(treeNode) {
    try {
      const result = await queryDepartTreeSync({
        pid: treeNode.dataRef.id,
      });
      if (result.length == 0) {
        treeNode.dataRef.isLeaf = true;
      } else {
        treeNode.dataRef.children = result;
        if (expandedKeys.value.length > 0) {
          // Determine whether the child -level sub -level has the current item
          let subKeys: any[] = [];
          for (let key of expandedKeys.value) {
            if (result.findIndex((item) => item.id === key) !== -1) {
              subKeys.push(key);
            }
          }
          if (subKeys.length > 0) {
            expandedKeys.value = [...expandedKeys.value];
          }
        }
      }
      treeData.value = [...treeData.value];
      emit('rootTreeData', treeData.value);
    } catch (e) {
      console.error(e);
    }
    return Promise.resolve();
  }

  // Open the parent node automatically, only one level
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // Select the first one by default
      setSelectedKey(item.id, item);
      reloadTree();
    } else {
      emit('select', null);
    }
  }

  // Re -load tree components to prevent the data from default
  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }

  /**
   * Set the current selected line
   */
  function setSelectedKey(key: string, data?: object) {
    selectedKeys.value = [key];
    if (data) {
      currentDepart.value = data;
      emit('select', data);
    }
  }

  // Add first -level department
  function onAddDepart() {
    openModal(true, { isUpdate: false, isChild: false });
  }

  // Add sub -level department
  function onAddChildDepart(data = currentDepart.value) {
    if (data == null) {
      createMessage.warning(t('system.depart.warning.departmentChoose'));
      return;
    }
    const record = { parentId: data.id };
    openModal(true, { isUpdate: false, isChild: true, record });
  }

  // Search event
  async function onSearch(value: string) {
    if (value) {
      try {
        loading.value = true;
        treeData.value = [];
        let result = await searchByKeywords({ keyWord: value });
        if (Array.isArray(result)) {
          treeData.value = result;
        }
        autoExpandParentNode();
      } finally {
        loading.value = false;
      }
    } else {
      loadRootTreeData();
    }
    searchKeyword.value = value;
  }

  // Tree re -selection box selection event
  function onCheck(e) {
    if (Array.isArray(e)) {
      checkedKeys.value = e;
    } else {
      checkedKeys.value = e.checked;
    }
  }

  // Tree selection event
  function onSelect(selKeys, event) {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0].props);
    } else {
      // This can prevent users from canceling the choice
      setSelectedKey(selectedKeys.value[0]);
    }
  }

  /**
   * Delete department according to IDS
   * @param idListRef array
   * @param confirm Whether to display the confirmation prompt box
   */
  async function doDeleteDepart(idListRef, confirm = true) {
    const idList = unref(idListRef);
    if (idList.length > 0) {
      try {
        loading.value = true;
        await deleteBatchDepart({ ids: idList.join(',') }, confirm);
        await loadRootTreeData();
      } finally {
        loading.value = false;
      }
    }
  }

  // Delete a single department
  async function onDelete(data) {
    if (data) {
      onVisibleChange(false);
      doDeleteDepart([data.id], false);
    }
  }

  // Batch deletion department
  async function onDeleteBatch() {
    try {
      await doDeleteDepart(checkedKeys);
      checkedKeys.value = [];
    } finally {
    }
  }

  function onVisibleChange(visible) {
    if (!visible) {
      visibleTreeKey.value = null;
    }
  }

  function onImportXls(d) {
    handleImportXls(d, Api.importExcelUrl, () => {
      loadRootTreeData();
    });
  }

  function onExportXls() {
    handleExportXls(t('system.depart.departInformation'), Api.exportXlsUrl);
  }

  defineExpose({
    loadRootTreeData,
  });
</script>
