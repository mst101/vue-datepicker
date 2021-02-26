import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import storeConfig from './store'

Vue.use(Vuex)
Vue.config.productionTip = false
Vue.config.devtools = false

const store = new Vuex.Store(storeConfig)

/* eslint-disable no-new */
new Vue({
  render: (h) => h(App),
  store,
}).$mount('#app')
