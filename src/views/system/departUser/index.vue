<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10">
    <a-col :xl="6" :lg="8" :md="10" :sm="24" style="flex: 1">
      <a-card :bordered="false" style="height: 100%">
        <DepartTree @select="onTreeSelect" />
      </a-card>
    </a-col>
    <a-col :xl="18" :lg="16" :md="14" :sm="24" style="flex: 1">
      <a-card :bordered="false" style="height: 100%">
        <a-tabs defaultActiveKey="user-info">
          <a-tab-pane :tab="t('common.basicInfo')" key="base-info" forceRender>
            <DepartBaseInfoTab :data="departData" />
          </a-tab-pane>
          <a-tab-pane :tab="t('common.userInfo')" key="user-info">
            <DepartUserInfoTab :data="departData" />
          </a-tab-pane>
          <a-tab-pane :tab="t('comon.roleInfo')" key="role-info">
            <DepartRoleInfoTab :data="departData" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup name="system-depart-user">
  import { provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';

  import DepartTree from './components/DepartTree.vue';
  import DepartBaseInfoTab from './components/DepartBaseInfoTab.vue';
  import DepartUserInfoTab from './components/DepartUserInfoTab.vue';
  import DepartRoleInfoTab from './components/DepartRoleInfoTab.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const { prefixCls } = useDesign('depart-user');
  provide('prefixCls', prefixCls);

  // The current department information selected
  let departData = ref({});

  // Triggered after choosing the left tree
  function onTreeSelect(data) {
    departData.value = data;
  }
</script>

<style lang="less">
  @import './index.less';
</style>
