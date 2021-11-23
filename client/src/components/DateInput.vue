<template>
	<div class="d-flex">
		<div>
			<div class="d-flex flex-wrap">
				<div class="custom--date-input flex-grow-1">
					<v-menu
						offset-y
						max-width="290px"
						:close-on-content-click="false"
						v-model="showDateMenu"
					>
						<template v-slot:activator="{ attrs, on }">
							<v-text-field
								class="mr-2"
								dense
								readonly
								v-bind="attrs"
								v-on="on"
								:placeholder="placeholder"
								:disabled="isDisabled"
								:value="formattedDate"
								@click="setDateMenuValue"
							/>
						</template>
						<template v-slot:default>
							<v-date-picker
								scrollable
								reactive
								locale="es-MX"
								v-model="date.temporary"
							>
								<v-spacer />
								<v-btn
									text
									@click="closeDateMenu()"
								>
									Cancelar
								</v-btn>
								<v-btn
									color="primary"
									:disabled="false"
									@click="closeDateMenu(date.temporary)"
								>
									Aceptar
								</v-btn>
							</v-date-picker>
						</template>
					</v-menu>
				</div>

				<v-chip-group
					v-if="currentDateSelector"
					active-class="custom--filter-type-active-chip"
					mandatory
					:value="useCurrentDate"
					@change="setSelectedUseCurrentDate"
				>
					<v-chip
						class="custom--filter-type-chip"
						:value="true"
					>
						Actual
					</v-chip>
					<v-chip
						class="custom--filter-type-chip"
						:value="false"
					>
						Otra
					</v-chip>
				</v-chip-group>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import dateHelper from '@/helpers/date'

	export default {
		name: 'DateInput',
		props: {
			value: { type: Object, default: null },
			placeholder: { type: String, default: '' },
			disabled: { type: Boolean, default: false },
			currentDateSelector: { type: Boolean, default: true }
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data: () => ({
			useCurrentDate: null,
			showDateMenu: false,
			timeListeningId: null,
			date: {
				value: { utc: null, local: null },
				inner: null,
				temporary: null,
				lastNotCurrent: { value: null, inner: null }
			},
		}),
		created: async function() {
			this.useCurrentDate = this.currentDateSelector
			this.setReceivedDate(this.value)
		},
		beforeDestroy() {
			this.stopTimeListening(this.timeListeningId)
		},
		watch: {
			currentDateSelector(newValue) {
				newValue || ( this.useCurrentDate = false )
			},
			async useCurrentDate(newValue) {
				if ( newValue ) {
					console.log('DateInput: Starting time listening')
					this.timeListeningId = await this.startTimeListening()
				} else {
					let { date, date: { lastNotCurrent } } = this
					this.stopTimeListening(this.timeListeningId)
					this.timeListeningId = null
					date.value = lastNotCurrent.value
					date.inner = lastNotCurrent.inner
				}
			},
			currentDatetime(newValue) {
				if ( this.useCurrentDate ) {
					this.date.value = dateHelper.utcAndLocal(newValue)
				}
			},
			value(newValue) {
				newValue!==this.date.value && this.setReceivedDate(newValue)
			},
			'date.value': function (newValue, oldValue) {
				newValue!==oldValue && this.$emit('change', newValue)
			}
		},
		computed: {
			...mapState(['currentDatetime']),
			formattedDate() {
				const formatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
				let date = this.date.value && this.date.value.local
				date = date && new Date(date)
				return date ? date.toLocaleDateString('es-MX', formatOptions) : ''
			},
			isDisabled() {
				return this.disabled || this.useCurrentDate
			}
		},
		methods: {
			...mapActions(['startTimeListening', 'stopTimeListening']),
			setDateMenuValue() {
				this.date.temporary = this.date.inner
			},
			closeDateMenu(newDate) {
				if ( newDate ) {
					let { date, date: { lastNotCurrent } } = this
					date.inner = lastNotCurrent.inner = newDate
					newDate = new Date(newDate.replaceAll('-', '/'))
					date.value = lastNotCurrent.value = dateHelper.utcAndLocal(newDate)
				}
				this.showDateMenu = false
			},
			setSelectedUseCurrentDate(newValue) {
				this.useCurrentDate = this.currentDateSelector ? newValue : false
			},
			setReceivedDate(newDate) {
				let { date, useCurrentDate, date: { lastNotCurrent } } = this
				if ( newDate && newDate.local ) {
					newDate = new Date(newDate.local)
					const YY = newDate.getFullYear()
					const MM = dateHelper.pad(newDate.getMonth()+1, 2)
					const DD = dateHelper.pad(newDate.getDate(), 2)
					const inner = `${YY}-${MM}-${DD}`
					newDate = dateHelper.utcAndLocal(newDate)
					lastNotCurrent.value = newDate
					lastNotCurrent.inner = inner
					if ( !useCurrentDate ) {
						date.value = newDate
						date.inner = inner
					}
				} else {
					lastNotCurrent.value = lastNotCurrent.inner = null
					useCurrentDate || ( date.value = date.inner = null )
				}
			}
		}
	}
</script>

<style scoped>
	.custom--date-input {
		min-width: 190px;
	}
</style>
