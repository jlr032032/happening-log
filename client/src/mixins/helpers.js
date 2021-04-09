const contrastingColors = {
	default: { true: 'white', false: 'black' },
	text: { true: 'white--text', false: 'black--text' },
	darkTheme: { true: true, false: false }
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
			return contrastingColors[ isFor||'default' ][ difference>=0 ]
		},
		includesLabel(soughtLabel, labels) {
			if ( Array.isArray(labels) ) {
				for ( let label of labels ) {
					if ( soughtLabel===label || ( label.nestedLabels && this.includesLabel(soughtLabel, label.nestedLabels) ) ) {
						return true
					}
				}
			}
		}
	}
}
