import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
	icons: {
		iconfont: 'mdi'
	},
	theme: {
    options: { customProperties: true },
		themes: {
			light: {
				primary: '#6270e1',
				secondary: '#313870',
				error: '#f44336',
				warning: '#ff9800',
				info: '#2196f3',
				success: '#8bc34a'
			}
		}
	}
})