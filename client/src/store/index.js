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
		signedIn: null,
		labels: [],
		records: [],
		happening: null,
		currentDatetime: null
	},
	getters: {
		signedIn: (state) => state.signedIn
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
		},
		setRecords(state, newRecords) {
			state.records = newRecords
		},
		replaceRecord(state, record) {
			const index = state.records.findIndex( ({ id }) => record.id===id )
			index>-1 && state.records.splice(index, 1, record)
		},
		removeRecord(state, recordId) {
			const index = state.records.findIndex( ({ id }) => recordId===id )
			index>-1 && state.records.splice(index, 1)
		},
		setHappening(state, newHappening) {
			state.happening = newHappening
		},
		setSignedIn(state, value) {
			state.signedIn = value
		}
	},
	actions: {
		linkParentLabels({ state }) {
			internals.linkParentLabels(state.labels, null)
		},
		startTimeListening({ commit }, listenerId) {
			let now = new Date()
			now.setMilliseconds(0)
			commit('setTime', now)
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
		stopTimeListening({ commit }, listenerId) {
			const index = listenerId ? internals.listeners.indexOf(listenerId) : -1
			const isValidListener = index > -1
			if ( isValidListener ) {
				internals.listeners.splice(index, 1)
				if ( !internals.listeners.length ) {
					clearTimeout(internals.timeoutId)
					internals.timeoutId = null
					commit('setTime',  null)
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
		let now = new Date()
		now.setMilliseconds(0)
		commit('setTime', now)
	}
}
