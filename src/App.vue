<template>
  <div id="app">
    <SupersetDashboard :dashboard-id="dashboardId" />
  </div>
</template>

<script>
import SupersetDashboard from './components/SupersetDashboard.vue';

export default {
  name: 'App',
  components: {
    SupersetDashboard
  },
  data() {
    return {
      dashboardId: '81f2499a-b35a-4457-b252-18057d3c1656' // 실제 대시보드 ID
    };
  }
};
</script>