import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		errorDialog: {
			show: false,
			title: 'Aviso',
			message: 'No se puede procesar la acción en este momento.',
			acceptText: 'Cerrar'
		},
		labels: [],
		currentDatetime: {
			datetime: null,
			formattedDate: null,
			formattedTime: null
		}
	},
	mutations: {
		showErrorDialog(state, newErrorDialog) {
			const { title, message, acceptText } = newErrorDialog || {}
			state.errorDialog = {
				show: true,
				title: title || 'Aviso',
				message: message || 'No se puede procesar la acción en este momento.',
				acceptText: acceptText || 'Cerrar'
			}
		},
		hideErrorDialog(state) {
			state.errorDialog.show = false
		},
		setTime(state, newDatetime) {
			state.currentDatetime = newDatetime
		},
		setLabels(state, newLabels) {
			state.labels = newLabels
		}
	},
	actions: {
		linkParentLabels({ state }) {
			internals.linkParentLabels(state.labels, null)
		},
		listenToTime({ commit }, listenerId) {
			if ( internals.listeners.includes(listenerId) ) {
				return listenerId
			} else {
				if ( !internals.listeners.length ) {
					internals.updateTime(commit)
				}
				const newListenerId = Date.now()
				internals.listeners.push(newListenerId)
				return newListenerId
			}
		},
		stopListeningToTime({ commit }, listenerId) {
			const index = listenerId ? internals.listeners.indexOf(listenerId) : -1
			const isValidListener = index > -1
			if ( isValidListener ) {
				internals.listeners.splice(index, 1)
				if ( !internals.listeners.length ) {
					clearTimeout(internals.timeoutId)
					internals.timeoutId = null
					commit('setTime', {
						datetime: null,
						formattedDate: null,
						formattedTime: null
					})
				}
			}
		}
	},
	modules: {
	}
})

const internals = {
	timeoutId: null,
	listeners: [],
	linkParentLabels(labels, parentLabel) {
		for ( let label of labels ) {
			label.parentLabel = parentLabel
			if ( label.subLabels ) {
				this.linkParentLabels(label.subLabels, label)
			}
		}
	},
	updateTime(commit) {
		this.timeoutId = setTimeout( () => this.updateTime(commit), 1000-Date.now()%1000 )
		const now = new Date()
		const newTime = {
			datetime: now,
			formattedDate: now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
			formattedTime: now.
				toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
		}
		commit('setTime', newTime)
	}
}
