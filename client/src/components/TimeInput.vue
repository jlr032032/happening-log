<template>
	<v-menu
		offset-y
		max-width="290px"
		:close-on-content-click="false"
		v-model="timeMenu"
	>
		<template v-slot:activator="{ attrs, on }">
			<v-text-field
				dense
				readonly
				v-bind="attrs"
				v-on="on"
				:placeholder="placeholder"
				:disabled="disabled"
				:value="formattedTime"
			/>
		</template>
		<template v-slot:default>
			<v-time-picker
				v-model="time.temporary"
			>
				<v-spacer />
				<v-btn
					text
					@click="closeTimeMenu()"
				>
					Cancelar
				</v-btn>
				<v-btn
					color="primary"
					:disabled="isAcceptDisabled"
					@click="closeTimeMenu(time.temporary)"
				>
					Aceptar
				</v-btn>
			</v-time-picker>
		</template>
	</v-menu>
</template>

<script>
	export default {
		name: 'TimeInput',
		props: {
			value: { type: Object },
			placeholder: { type: String, default: '' },
			disabled: { type: Boolean, default: false }
		},
		data: () => ({
			timeMenu: false,
			time: {
				temporary: null,
				inner: '',
				outer: { hours: null, minutes: null, seconds: null }
			}
		}),
		model: {
			prop: 'value',
			event: 'change'
		},
		created: async function() {
			this.value && this.setValue(this.value)
		},
		watch: {
			value(newTime) {
				this.setValue(newTime)
			}
		},
		computed: {
			formattedTime() {
				const time = this.time
				if ( time.inner ) {
					const { hours, minutes, seconds } = time.outer
					const formatOptions = { hour12: true, hour: '2-digit', minute: '2-digit' }
					return new Date(0, 0, 0, hours, minutes, seconds)
						.toLocaleTimeString('es-MX', formatOptions)
						.replace(/^0/, '')
				}
				return ''
			},
			isAcceptDisabled() {
				return !this.time.temporary
			}
		},
		methods: {
			closeTimeMenu(newTime) {
				if ( newTime ) {
					this.time.inner = newTime
					const [ hours, minutes ] = newTime.split(':').map( part => Number(part) )
					this.time.outer = { hours, minutes, seconds: 0 }
					this.$emit('change', this.time.outer)
				}
				this.timeMenu = false
			},
			setValue(value) {
				let time = this.time
				const { hours: HH, minutes: MM, seconds: SS } = value || {}
				const validValue = [HH, MM, SS].reduce( (accum, item) => accum && typeof item === 'number', true )
				if ( validValue ) {
					const formatted = `${HH}:${MM}`
					time.outer = value
					time.inner = formatted
					time.temporary = formatted
				} else {
					time.temporary = null
					time.inner = null,
					time.outer = { utc: null, local: null }
				}
			}
		}
	}
</script>
