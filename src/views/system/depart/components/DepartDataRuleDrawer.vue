<template>
  <BasicDrawer :title="`${t('system.depart.dataRule')}/${t('system.depart.buttonPermissionConfig')}`" :width="365" @close="onClose" @register="registerDrawer">
    <a-spin :spinning="loading">
      <a-tabs defaultActiveKey="1">
        <a-tab-pane :tab="t('system.depart.dataRule')" key="1">
          <a-checkbox-group v-model:value="dataRuleChecked" v-if="dataRuleList.length > 0">
            <a-row>
              <a-col :span="24" v-for="(item, index) in dataRuleList" :key="'dr' + index">
                <a-checkbox :value="item.id">{{ item.ruleName }}</a-checkbox>
              </a-col>
              <a-col :span="24">
                <div style="width: 100%; margin-top: 15px">
                  <a-button type="primary" :loading="loading" :size="'small'" preIcon="ant-design:save-filled" @click="saveDataRuleForRole">
                    <span>{{ t('system.depart.clickToSave') }}</span>
                  </a-button>
                </div>
              </a-col>
            </a-row>
          </a-checkbox-group>
          <a-empty v-else :description="t('system.depart.noConfig')" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';

  import { queryDepartDataRule, saveDepartDataRule } from '../depart.api';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();

  defineEmits(['register']);
  const loading = ref<boolean>(false);
  const departId = ref('');
  const functionId = ref('');
  const dataRuleList = ref<Array<any>>([]);
  const dataRuleChecked = ref<Array<any>>([]);

  // Register drawer component
  const [registerDrawer, { closeDrawer }] = useDrawerInner((data) => {
    departId.value = unref(data.departId);
    functionId.value = unref(data.functionId);
    loadData();
  });

  async function loadData() {
    try {
      loading.value = true;
      const { datarule, drChecked } = await queryDepartDataRule(functionId, departId);
      dataRuleList.value = datarule;
      if (drChecked) {
        dataRuleChecked.value = drChecked.split(',');
      }
    } finally {
      loading.value = false;
    }
  }

  function saveDataRuleForRole() {
    let params = {
      departId: departId.value,
      permissionId: functionId.value,
      dataRuleIds: dataRuleChecked.value.join(','),
    };
    saveDepartDataRule(params);
  }

  function onClose() {
    doReset();
  }

  function doReset() {
    functionId.value = '';
    dataRuleList.value = [];
    dataRuleChecked.value = [];
  }
</script>
