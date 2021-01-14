import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: '#ffc107',
				secondary: '#009688',
				accent: '#4caf50',
				error: '#f44336',
				warning: '#ff9800',
				info: '#2196f3',
				success: '#8bc34a'
			}
		}
	}
})