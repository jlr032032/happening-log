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
		]
	},
	mutations: {
	},
	actions: {
		linkParentLabels({ state }) {
			internal.linkParentLabels(state.labels, null)
		}
	},
	modules: {
	}
})

const internal = {
	linkParentLabels(labels, parentLabel) {
		for ( let label of labels ) {
			label.parentLabel = parentLabel
			if ( label.nestedLabels ) {
				this.linkParentLabels(label.nestedLabels, label)
			}
		}
	}
}
