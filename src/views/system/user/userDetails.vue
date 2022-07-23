<template>
  <Description @register="register" class="mt-4" />
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Description, DescItem, useDescription } from '/@/components/Description/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const mockData = {
    username: 'test',
    nickName: 'VB',
    age: '123',
    phone: '15695909xxx',
    email: '190848757@qq.com',
    addr: 'Xiamen Siming District',
    sex: 'male',
    certy: '3504256199xxxxxxxxx',
    tag: 'orange',
  };
  const schema: DescItem[] = [
    {
      field: 'username',
      label: t('system.user.username'),
    },
    {
      field: 'nickName',
      label: t('system.user.nickname'),
      render: (curVal, data) => {
        return `${data.username}-${curVal}`;
      },
    },
    {
      field: 'phone',
      label: t('system.user.phonenumber'),
    },
    {
      field: 'email',
      label: t('system.user.email'),
    },
    {
      field: 'addr',
      label: t('system.user.address'),
    },
  ];
  export default defineComponent({
    components: { Description },
    setup() {
      const [register] = useDescription({
        title: 'useDescription',
        data: mockData,
        schema: schema,
      });
      return { mockData, schema, register };
    },
  });
</script>
