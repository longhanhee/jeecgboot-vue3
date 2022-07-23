<template>
  <div class="bg-white m-4 mr-0 overflow-hidden">
    <a-spin :spinning="loading">
      <template v-if="userIdentity === '2'">
        <!--Organizational tree-->
        <BasicTree
          v-if="!treeReloading"
          :title="t('system.depart.departmentList')"
          toolbar
          search
          showLine
          :checkStrictly="true"
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          @select="onSelect"
          @expand="onExpand"
          @search="onSearch"
        />
      </template>
      <a-empty v-else :description="t('system.depart.noPermission')" />
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { inject, nextTick, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTree } from '/@/components/Tree';
  import { queryMyDepartTreeList, searchByKeywords } from '../depart.user.api';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const prefixCls = inject('prefixCls');
  const emit = defineEmits(['select']);
  const { createMessage } = useMessage();

  let loading = ref<boolean>(false);
  // Department Tree List Data
  let treeData = ref<any[]>([]);
  // The current item
  let expandedKeys = ref<any[]>([]);
  // The current item selected
  let selectedKeys = ref<any[]>([]);
  // Whether to automatically start the parent level
  let autoExpandParent = ref<boolean>(true);
  // user ID
  let userIdentity = ref<string>('2');
  // Tree component reload
  let treeReloading = ref<boolean>(false);

  // Loading department information
  function loadDepartTreeData() {
    loading.value = true;
    treeData.value = [];
    queryMyDepartTreeList()
      .then((res) => {
        if (res.success) {
          if (Array.isArray(res.result)) {
            treeData.value = res.result;
            userIdentity.value = res.message;
            autoExpandParentNode();
          }
        } else {
          createMessage.warning(res.message);
        }
      })
      .finally(() => (loading.value = false));
  }

  loadDepartTreeData();

  // Open the parent node automatically, only one level
  function autoExpandParentNode() {
    let keys: Array<any> = [];
    treeData.value.forEach((item, index) => {
      if (item.children && item.children.length > 0) {
        keys.push(item.key);
      }
      if (index === 0) {
        // Select the first one by default
        setSelectedKey(item.id, item);
      }
    });
    if (keys.length > 0) {
      reloadTree();
      expandedKeys.value = keys;
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
      emit('select', data);
    }
  }

  // Search event
  function onSearch(value: string) {
    if (value) {
      loading.value = true;
      searchByKeywords({ keyWord: value, myDeptSearch: '1' })
        .then((result) => {
          if (Array.isArray(result)) {
            treeData.value = result;
          } else {
            createMessage.warning(t('system.depart.warning.noInquiryWarning'));
            treeData.value = [];
          }
        })
        .finally(() => (loading.value = false));
    } else {
      loadDepartTreeData();
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

  // Tree unfolding incident
  function onExpand(keys) {
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  }
</script>
