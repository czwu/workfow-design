import Vue from 'vue'
import App from './App.vue'
import ELEMENT from 'element-ui'
import '@/assets/theme/index.css'
import '@/assets/element_ui.scss'
import '@/assets/app.scss'
import './plugin/index'
import './utils/http'

Vue.config.productionTip = false;
Vue.use(ELEMENT, {
  size: 'mini'
});
new Vue({
  render: h => h(App)
}).$mount('#app');
