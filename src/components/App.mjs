import Header from "./Header.mjs";
import Auth from "./Auth.mjs";

const parseCookie = (/** @type {string} */ str) =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((/** @type {{ [key: string]: string }} */acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

export default {
    name: 'App',
    inject: ['router'],
    components: { Header, Auth },
    template: `<div class="theme-light">
        <div class="page">
            <Header :showNav="hasAuth" />
            <main class="page-wrapper">
                <component v-if="hasAuth" :is="router.state.activeRoute" v-bind="router.state.routeParams" />
                <Auth v-else />
            </main>
        </div>
    </div>`,
    computed: {
        hasAuth() {
            try {
                const cookies = parseCookie(document.cookie);
                return '__Host-github-token' in cookies || 'token' in cookies;
            } catch {
                return false;
            }
        },
    },
}