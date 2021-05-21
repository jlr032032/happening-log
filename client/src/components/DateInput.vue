<template>
	<v-menu
		offset-y
		max-width="290px"
		:close-on-content-click="false"
		v-model="dateMenu"
	>
		<template v-slot:activator="{ attrs, on }">
			<v-text-field
				dense
				readonly
				v-bind="attrs"
				v-on="on"
				:disabled="isDisabled"
				:value="formattedDate"
				@click="showDateMenu"
			/>
		</template>
		<template v-slot:default>
			<v-date-picker
				scrollable
				reactive
				locale="es-MX"
				v-model="temporaryDate"
			>
				<v-spacer></v-spacer>
				<v-btn
					text
					@click="hideDateMenu()"
				>
					Cancelar
				</v-btn>
				<v-btn
					color="primary"
					:disabled="isAcceptDisabled"
					@click="hideDateMenu(true)"
				>
					Aceptar
				</v-btn>
			</v-date-picker>
		</template>
	</v-menu>
</template>

<script>
	import { mapState, mapActions } from 'vuex'

	export default {
		name: 'DateInput',
		props: {
			date: { type: String, default: null },
			useCurrentDate: { type: Boolean, default: false }
		},
		model: {
			prop: 'date',
			event: 'change'
		},
		data: () => ({
			date_: null,
			temporaryDate: null,
			lastGivenDate: null,
			dateMenu: false,
			timeListenerId: null
		}),
		created: async function() {
			if ( this.date ) {
				this.date_ = this.lastGivenDate = new Date(this.date)
			}
			if ( this.useCurrentDate ) {
				this.timeListenerId = await this.listenToTime(this.timeListenerId)
			}
		},
		watch: {
			date(newDate) {
				this.date_ = newDate ? new Date(newDate) : null
			},
			useCurrentDate: async function(use) {
				if ( use ) {
					this.timeListenerId = await this.listenToTime(this.timeListenerId)
				} else {
					this.stopListeningToTime(this.timeListenerId)
					this.timeListenerId = null
					this.date_ = this.lastGivenDate
					this.$emit('change', this.lastGivenDate ? this.lastGivenDate.toJSON() : null)
				}
			},
			currentDatetime(newValue, oldValue) {
				if ( this.useCurrentDate && newValue && ( !oldValue || newValue.formattedTime!==oldValue.formattedTime ) ) {
					this.$emit('change', newValue.datetime.toJSON())
				}
			}
		},
		computed: {
			...mapState(['currentDatetime']),
			isDisabled() {
				return this.useCurrentDate
			},
			isAcceptDisabled() {
				return !this.temporaryDate
			},
			formattedDate() {
				if ( this.useCurrentDate ) {
					return this.currentDatetime ? this.currentDatetime.formattedDate : ''
				}
				if ( this.date_ ) {
					return this.date_.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
				}
				return ''
			}
		},
		methods: {
			...mapActions(['listenToTime', 'stopListeningToTime']),
			showDateMenu() {
				this.temporaryDate = this.date_ ? this.date_.toJSON().slice(0, 10) : null
				this.dateMenu = true
			},
			hideDateMenu(save) {
				if ( save ) {
					const newDate = new Date(this.temporaryDate.replaceAll('-', '/'))
					this.date_ = this.lastGivenDate = newDate
					this.$emit('change', newDate.toJSON())
				}
				this.dateMenu = false
			}
		},
		beforeDestroy() {
			this.stopListeningToTime(this.timeListenerId)
			this.timeListenerId = null
		}
	}
</script>
