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
				:disabled="isDisabled"
				v-bind="attrs"
				v-on="on"
				:value="formattedTime"
				@click="showTimeMenu"
			/>
		</template>
		<template v-slot:default>
			<v-time-picker
				v-model="temporaryTime"
			>
				<v-spacer />
				<v-btn
					text
					@click="hideTimeMenu()"
				>
					Cancelar
				</v-btn>
				<v-btn
					class="primary white--text"
					@click="hideTimeMenu(true)"
				>
					Aceptar
				</v-btn>
			</v-time-picker>
		</template>
	</v-menu>
</template>

<script>
	import { mapState, mapActions } from 'vuex'

	export default {
		name: 'TimeInput',
		props: ['time', 'useCurrentTime'],
		data: () => ({
			time_: null,
			temporaryTime: null,
			lastGivenTime: null,
			timeMenu: false,
			timeListenerId: null
		}),
		model: {
			prop: 'time',
			event: 'change'
		},
		created: async function() {
			if ( this.time ) {
				this.time_ = this.lastGivenTime = this.time
			}
			if ( this.useCurrentTime ) {
				this.timeListenerId = await this.listenToTime(this.timeListenerId)
			}
		},
		watch: {
			useCurrentTime: async function(use) {
				if ( use ) {
					this.timeListenerId = await this.listenToTime(this.timeListenerId)
				} else {
					this.stopListeningToTime(this.timeListenerId)
					this.timeListenerId = null
					this.time_ = this.lastGivenTime
					this.$emit('change', this.lastGivenTime)
				}
			},
			currentDatetime(newValue, oldValue) {
				if ( this.useCurrentTime && newValue && ( !oldValue || newValue.formattedTime!==oldValue.formattedTime ) ) {
					this.$emit('change', newValue.datetime
						.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
					)
				}
			}
		},
		computed: {
			...mapState(['currentDatetime']),
			isDisabled() {
				return this.useCurrentTime
			},
			formattedTime() {
				if ( this.useCurrentTime ) {
					return this.currentDatetime.formattedTime
				} else {
					if ( this.time_ ) {
						const [ hours, minutes ] = this.time_.split(':')
						return new Date(0, 0, 0, hours, minutes)
							.toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit' })
					} else {
						return ''
					}
				}
			}
		},
		methods: {
			...mapActions(['listenToTime', 'stopListeningToTime']),
			showTimeMenu() {
				this.temporaryTime = this.time_ ||
					new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
				this.timeMenu = true
			},
			hideTimeMenu(save) {
				if ( save ) {
					this.time_ = this.lastGivenTime = this.temporaryTime
					this.$emit('change', this.temporaryTime)
				}
				this.timeMenu = false
			}
		},
		beforeDestroy() {
			this.stopListeningToTime(this.timeListenerId)
			this.timeListenerId = null
		}
	}
</script>
