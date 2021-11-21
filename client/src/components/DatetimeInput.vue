<template>
	<div>
		<div class="d-flex">
			<div>
				<div class="d-flex flex-wrap">

					<div class="mr-2 flex-grow-1 custom--date-input">
						<date-input
							placeholder="Fecha"
							:disabled="useCurrentDatetime"
							:value = date.value
							@change="setSelectedDate"
						/>
					</div>

					<div class="mr-2 custom--time-input">
						<time-input
							placeholder="Hora"
							:disabled="useCurrentDatetime"
							:value = time.value
							@change="setSelectedTime"
						/>
					</div>

					<v-chip-group
						v-if="!updateMode"
						active-class="custom--filter-type-active-chip"
						mandatory
						:value="useCurrentDatetime"
						@change="setSelectedUseCurrentDatetime"
					>
						<v-chip
							class="custom--filter-type-chip"
							:value="true"
						>
							Actuales
						</v-chip>
						<v-chip
							class="custom--filter-type-chip"
							:value="false"
						>
							Otras
						</v-chip>
					</v-chip-group>

				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import dateHelper from '@/helpers/date'
	export default {
		name: 'DatetimeInput',
		components: {
			DateInput: () => import('@/components/DateInput'),
			TimeInput: () => import('@/components/TimeInput')
		},
		props: {
			value: { type: Object },
			updateMode: { type: Boolean, default: false }
		},
		data: () => ({
			useCurrentDatetime: true,
			timeListeningId: null,
			time: {
				value: null,
				lastNotCurrent: null
			},
			date: {
				value: { utc: null, local: null },
				lastNotCurrent: { utc: null, local: null }
			}
		}),
		created: async function() {
			this.timeListeningId = await this.startTimeListening()
		},
		beforeDestroy() {
			this.stopTimeListening(this.timeListeningId)
		},
		watch: {
			updateMode(value) {
				this.useCurrentDatetime = !value
			},
			value(value) {
				if ( value!==this.datetime ) {
					if ( value && value.utc ) {
						const { date, time } = this.getDateAndTime(value.utc)
						this.date.lastNotCurrent = date
						this.time.lastNotCurrent = time
						if ( !this.useCurrentDatetime ) {
							this.date.value = date
							this.time.value = time
						}
					} else {
						const nullDate = { utc: null, local: null }
						this.date.lastNotCurrent = nullDate
						this.time.lastNotCurrent = null
						if ( !this.useCurrentDatetime ) {
							this.date.value = nullDate
							this.time.value = null
						}
					}
				}
			},
			currentDatetime(value) {
				if ( this.useCurrentDatetime ) {
					const { date, time } = this.getDateAndTime(value)
					this.date.value = date
					this.time.value = time
				}
			},
			async useCurrentDatetime(value) {
				if ( value ) {
					this.timeListeningId = await this.startTimeListening()
				} else {
					this.stopTimeListening(this.timeListeningId)
					this.timeListeningId = null
					this.date.value = this.date.lastNotCurrent
					this.time.value = this.time.lastNotCurrent
				}
			},
			datetime(latest, previous) {
				latest!==previous && this.$emit('change', latest)
			}
		},
		computed: {
			...mapState(['currentDatetime']),
			datetime() {
				const date = this.date.value
				const time = this.time.value
				let datetime = null
				if ( time && date && date.utc ) {
					datetime = new Date(date.utc)
					const { hours, minutes, seconds } = time
					datetime.setHours(hours)
					datetime.setMinutes(minutes)
					datetime.setSeconds(seconds)
					datetime = dateHelper.utcAndLocal(datetime)
				}
				return datetime
			}
		},
		methods: {
			...mapActions(['startTimeListening', 'stopTimeListening']),
			getDateAndTime(datetime) {
				let date = new Date(datetime)
				const hours = date.getHours()
				const minutes = date.getMinutes()
				const seconds = date.getSeconds()
				const time = { hours, minutes, seconds }
				date.setHours(0)
				date.setMinutes(0)
				date.setSeconds(0)
				date = dateHelper.utcAndLocal(date)
				return { date, time }
			},
			setSelectedDate(value) {
				const { useCurrentDatetime, date } = this
				useCurrentDatetime || ( date.value = date.lastNotCurrent = value )
			},
			setSelectedTime(value) {
				const { useCurrentDatetime, time } = this
				useCurrentDatetime || ( time.value = time.lastNotCurrent = value )
			},
			setSelectedUseCurrentDatetime(use) {
				this.useCurrentDatetime = this.updateMode ? false : use
			}
		}
	}
</script>

<style scoped>
	.custom--date-input {
		min-width: 190px;
	}
	.custom--time-input {
		width: 85px;
	}
</style>
