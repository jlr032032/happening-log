import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		labels: [
			{ id: '1', name: 'Etiqueta 1 con un nombre extenso', color: '#1b5e20', nestedLabels: [
				{ id: '1.1', name: 'Etiqueta 1.1', color: '#4caf50', nestedLabels: [
					{ id: '1.1.1', name: 'Etiqueta 1.1.1', color: '#2196f3' },
					{ id: '1.1.2', name: 'Etiqueta 1.1.2', color: '#fff176' }
				]},
				{ id: '1.2', name: 'Etiqueta 1.2', color: '#689f38' }
			]},
			{ id: '2', name: 'Etiqueta 2', color: '#e1f5fe' },
			{ id: '3', name: 'Etiqueta 3', color: '#e8eaf6' },
			{ id: '4', name: 'Etiqueta 4', color: '#80cbc4', nestedLabels: [
				{ id: '4.1', name: 'Etiqueta 4.1', color: '#2196f3' },
				{ id: '4.2', name: 'Etiqueta 4.2', color: '#fff176' },
				{ id: '4.3', name: 'Etiqueta 4.3', color: '#455a64' }
			]},
			{ id: '5', name: 'Etiqueta 5', color: '#2e7d32' },
			{ id: '6', name: 'Etiqueta 6', color: '#ff8a65' },
			{ id: '7', name: 'Etiqueta 7', color: '#000000' }
		],
		currentDatetime: {
			datetime: null,
			formattedDate: null,
			formattedTime: null
		}
	},
	mutations: {
		setTime(state, newDatetime) {
			state.currentDatetime = newDatetime
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
			if ( label.nestedLabels ) {
				this.linkParentLabels(label.nestedLabels, label)
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
