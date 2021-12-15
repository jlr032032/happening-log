import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import errorDialog from '@/mixins/errorDialog'
import Default from '@/layouts/Default'
import Toolbar from '@/layouts/Toolbar'

Vue.mixin(errorDialog)
Vue.component('default-layout', Default)
Vue.component('toolbar-layout', Toolbar)

Vue.config.productionTip = false

new Vue({
	router,
	store,
	vuetify,
	render: function (h) { return h(App) }
}).$mount('#app')
