<template>
    <div ref="dashboardContainer" class="dashboard-container"></div>
</template>

<script>
import { embedDashboard } from '@superset-ui/embedded-sdk';
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
    name: 'SupersetDashboard',
    props: {
        dashboardId: {
            type: String,
            required: true
        }
    },
    async mounted() {
        await this.embedSupersetDashboard();
    },
    methods: {
        // 로그인 정보 이용하여 Access Token을 가져옴
        async fetchAccessToken() {
            try {
                const response = await axios.post(
                    `${process.env.VUE_APP_SUPERSET_DOMAIN}/api/v1/security/login`,
                    {
                        username: `${process.env.VUE_APP_SUPERSET_PUBLIC_ID}`, // user ID
                        password: `${process.env.VUE_APP_SUPERSET_PUBLIC_PW}`,
                        provider: "db" , // ldap, oauth, oidc 가능
                        refresh: true
                    }
                );
                Cookies.set('accessToken', response.data.access_token, { expires: 1 }); // 7일 동안 유효
                // return response.data.access_token;
            } catch (error) {
                console.error('Admin token error:', error);
                throw error;
            }
        },
        
        // CSRF 토큰 가져오기
        async getCsrfToken(accessToken) {
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_SUPERSET_DOMAIN}/api/v1/security/csrf_token/`,
                    { 
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,  // 뷰어 토큰 추가
                        },
                        withCredentials: true
                    }
                );
                Cookies.set('csrfToken', response.data.result, { expires: 1 }); // 7일 동안 유효
                // return response.data.result;
            } catch (error) {
                console.error('CSRF token error:', error);
                throw error;
            }
        },

        async fetchGuestTokenFromBackend() {
            try {
                // 1. 뷰어 토큰 획득
                await this.fetchAccessToken();
                const accessToken = Cookies.get('accessToken');

                // 2. CSRF 토큰 획득
                await this.getCsrfToken(accessToken);
                const csrfToken = Cookies.get('csrfToken');

                // 3. Guest Token 요청
                const response = await axios.post(
                    `${process.env.VUE_APP_SUPERSET_DOMAIN}/api/v1/security/guest_token/`,
                    {
                        user: {
                            username: `${process.env.VUE_APP_SUPERSET_PUBLIC_ID}`, // 뷰어 사용자 ID
                        },
                        resources: [{ type: "dashboard", id: this.dashboardId }],
                        rls: []
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,  // 뷰어 토큰 추가
                            'X-CSRF-Token': `${csrfToken}`    // CSRF 토큰 추가
                        },
                        withCredentials: true
                    }
                );
                return response.data.token;
            } catch (error) {
                console.error('Guest token error:', error);
                throw error;
            }
        },

        async embedSupersetDashboard() {
            try {
                embedDashboard({
                    id: this.dashboardId,
                    supersetDomain: `${process.env.VUE_APP_SUPERSET_DOMAIN}`,
                    mountPoint: this.$refs.dashboardContainer,
                    fetchGuestToken: () => this.fetchGuestTokenFromBackend(),
                    width: "100%",
                    height: "800px", // 원하는 높이 지정
                    dashboardUiConfig: {
                        hideTitle: true,
                        filters: {
                            expanded: true,
                            visible: true // 필터 표시 여부 추가
                        },
                        urlParams: {
                            standalone: 'true' // 독립 실행 모드
                        },
                    },
                    iframeSandboxExtras: [
                        'allow-same-origin',
                        'allow-scripts',
                        'allow-popups',
                        'allow-top-navigation'
                    ]
                    
                });
            } catch (error) {
                console.error('Embedding error:', error);
            }
        }
    }
};
</script>

<style>
/* 컨테이너 스타일 */
.dashboard-container {
  width: 100%; 
  height: 800px;
  border: 1px solid #ddd;
  overflow: hidden;
  position: relative;
}

/* iframe이 생성된 후 자동으로 적용되는 스타일 */
.dashboard-container iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}
</style>