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
      dashboardId: `${process.env.VUE_APP_DASHBOARD_ID}` // 실제 대시보드 ID
    };
  }
};
</script>