/*!
 *
 * Angle - Bootstrap Admin Template
 *
 * Version: 4.2.1
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueI18Next from '@panter/vue-i18next';

import './vendor.js'

import App from './App.vue'
import router from './router'
import store from './store'
import i18next from './i18n.js';

Vue.config.productionTip = false
// Vue.prototype.$serverURL = 'http://127.0.0.1:3005';
Vue.prototype.$serverURL = 'http://132.232.209.126:3005';

router.beforeEach((to, from, next) => {
  let metaInfo = to.meta;
  if(metaInfo.requireAuth){

    let token = store.getters.getToken
    let role = store.getters.getRole
    if(metaInfo.role == 'admin'){
      if(token && (role == 'teacher' || role == 'admin')) next();
      else next({path: '/teacher/login'});

    }else if(metaInfo.role == 'teacher'){

      if(token && role == 'teacher') next();
      else next({path: '/teacher/login'});

    }else if(metaInfo.role == 'both'){

      if(token && (role == 'student' || role == 'guest')) next();
      else next({path: '/login'});

    }else{

      if(token && role == 'student') next();
      else next({path: '/login'});

    }

  } else{
    next();
  }
})

Vue.use(BootstrapVue);
Vue.use(VueI18Next);

const i18n = new VueI18Next(i18next);

new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
