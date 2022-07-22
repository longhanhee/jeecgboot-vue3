<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" type="flex" :gutter="10">
    <a-col :xl="12" :lg="24" :md="24" style="margin-bottom: 10px">
      <DepartLeftTree ref="leftTree" @select="onTreeSelect" @rootTreeData="onRootTreeData" />
    </a-col>
    <a-col :xl="12" :lg="24" :md="24" style="margin-bottom: 10px">
      <div style="height: 100%; background-color: white">
        <a-tabs v-show="departData != null" defaultActiveKey="base-info">
          <a-tab-pane tab="Basic Information" key="base-info" forceRender style="position: relative">
            <div style="padding: 20px">
              <DepartFormTab :data="departData" :rootTreeData="rootTreeData" @success="onSuccess" />
            </div>
          </a-tab-pane>
          <a-tab-pane tab="Department Authority" key="role-info">
            <div style="padding: 0 20px 20px">
              <DepartRuleTab :data="departData" />
            </div>
          </a-tab-pane>
        </a-tabs>
        <div v-show="departData == null" style="padding-top: 40px">
          <a-empty description="{{t('system.depart.noSelectionDepartment')}}" />
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup name="system-depart">
import { provide, ref } from 'vue';
import { useDesign } from '/@/hooks/web/useDesign';
import DepartLeftTree from './components/DepartLeftTree.vue';
import DepartFormTab from './components/DepartFormTab.vue';
import DepartRuleTab from './components/DepartRuleTab.vue';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const { prefixCls } = useDesign('depart-manage');
provide('prefixCls', prefixCls);

// Define a Ref variable to the sub -component
const leftTree = ref();

// The current department information selected
const departData = ref({});
const rootTreeData = ref<any[]>([]);

// Triggered after choosing the left tree
function onTreeSelect(data) {
  departData.value = data;
}

// Roottreedata trigger
function onRootTreeData(data) {
  rootTreeData.value = data;
}

function onSuccess() {
  leftTree.value.loadRootTreeData();
}
</script>

<style lang="less">
@import './index.less';
</style>
