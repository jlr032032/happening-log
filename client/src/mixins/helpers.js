import requester from '@/helpers/requester'

const internal = {
	contrastingColors: {
		default: { true: 'white', false: 'black' },
		text: { true: 'white--text', false: 'black--text' },
		darkTheme: { true: true, false: false }
	}
}

export default {
	methods: {
		contrastingColor(color, isFor) {
			let colorBrightness, ratioForBlack
			color = color.replace('#', '')
			const r = parseInt(color.slice(0, 2), 16)
			const g = parseInt(color.slice(2, 4), 16)
			const b = parseInt(color.slice(4, 6), 16)
			colorBrightness = ratioForBlack = 0.299*r + 0.587*g + 0.114*b
			const ratioForWhite = 255 - colorBrightness
			const difference = ratioForWhite - ratioForBlack
			return internal.contrastingColors[ isFor||'default' ][ difference>=0 ]
		},
		includesLabel(soughtLabel, labels) {
			if ( Array.isArray(labels) ) {
				for ( let label of labels ) {
					if ( soughtLabel===label || ( label.subLabels && this.includesLabel(soughtLabel, label.subLabels) ) ) {
						return true
					}
				}
			}
		},
		async fetchLabels() {
			this.$store.commit('setLabels', [])
			const response = await requester.get('/labels')
			switch ( response && response.status ) {
				case 200:
					this.$store.commit('setLabels', response.data)
					this.$store.dispatch('linkParentLabels')
					return { success: true }
				default:
					return { success: false }
			}
		},
		async fetchHappening(id) {
			const happeningId = id
			const response = await requester.get(`/happenings/${happeningId}`)
			if ( response && response.status===200 ) {
				this.$store.commit('setHappening', response.data)
				return { success: true, data: response.data, status: 200 }
			}
			return { success: false, data: response.data, status: response.status }
		},
	}
}
