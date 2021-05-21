<template>
	<div>
		<v-dialog
			:value="recordHandlerDialog"
			@input="hideRecordHandlerDialog()"
		>
			<v-card>
				<v-card-title class="flex-column align-start pb-0">
					<h2 class="custom--title-4 primary--text">{{ title }}</h2>
					<h3 class="custom--title-1 primary--text">{{ happening_.name }}</h3>
				</v-card-title>
				<v-card-text class="mt-4">
					<div v-if="hasFields">
						<h4 class="custom--title-4 primary--text"> Características </h4>
						<v-row
							v-for="(field, index) of happening_.fields"
							:key="index"
							dense
							class="align-center"
						>
							<v-col cols="6">
								<label>{{ field.name }}:</label>
							</v-col>
							<v-col cols="6">
								<dynamic-input
									:type="field.type"
									:value="getFieldValue(field.id)"
									@input="setFieldValue(field.id, $event)"
								/>
							</v-col>
						</v-row>
					</div>
					<div class="mt-2">
						<div
							v-if="!updateMode"
							class="d-flex align-center justify-space-between"
						>
							<label class="primary--text"> Fecha y hora: </label>
							<v-chip-group
								active-class="custom--filter-type-active-chip"
								mandatory
								v-model="datetimeSource"
							>
								<v-chip
									class="custom--filter-type-chip"
									value="current"
								>
									Actuales
								</v-chip>
								<v-chip
									class="custom--filter-type-chip"
									value="other"
								>
									Otras
								</v-chip>
							</v-chip-group>
						</div>
						<v-row
							dense
							class="align-center"
						>
							<v-col cols="6">
								<label> Fecha: </label>
							</v-col>
							<v-col cols="6">
								<date-input
									:useCurrentDate="useCurrentDatetime"
									v-model="record_.date"
								/>
							</v-col>
						</v-row>
						<v-row
							dense
							class="align-center"
						>
							<v-col cols="6">
								<label> Hora: </label>
							</v-col>
							<v-col cols="6">
								<time-input
									:useCurrentTime="useCurrentDatetime"
									v-model="record_.time"
								/>
							</v-col>
						</v-row>
					</div>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						text
						@click="hideRecordHandlerDialog()"
					>
						Cancelar
					</v-btn>
					<v-btn
						color="primary"
						:disabled="disableAccept"
						@click="hideRecordHandlerDialog(true)"
					>
						{{ acceptText }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	export default {
		name: 'RecordHandler',
		components: {
			DynamicInput: () => import('@/components/DynamicInput'),
			DateInput: () => import('@/components/DateInput'),
			TimeInput: () => import('@/components/TimeInput')
		},
		props: {
			show: { type: Boolean, default: false },
			happening: { type: Object },
			record: { type: Object }
		},
		data: () => ({
			recordHandlerDialog: null,
			datetimeSource: 'other',
			happening_: {},
			record_: {
				date: null,
				time: null,
				fields: []
			}
		}),
		created() {
			this.recordHandlerDialog = this.show
			this.happening_ = this.happening || {}
			if ( this.updateMode ) {
				this.record_ = JSON.parse( JSON.stringify(this.record) )
				this.datetimeSource = 'other'
			} else {
				this.datetimeSource = 'current'
			}
		},
		watch: {
			show(newShowValue) {
				if ( newShowValue && !this.updateMode ) {
					this.datetimeSource = 'current'
					this.record_ = {
						date: null,
						time: null,
						fields: []
					}
				}
				this.recordHandlerDialog = newShowValue
			},
			happening(newHappeningValue) {
				this.happening_ = newHappeningValue || {}
			},
			record(newRecordValue) {
				this.record_ = newRecordValue ? JSON.parse( JSON.stringify(this.record) ) : {
					date: null,
					time: null,
					fields: []
				}
			}
		},
		computed: {
			title() {
				return this.updateMode ? 'Modificar registro' : 'Nuevo registro'
			},
			hasFields() {
				return Boolean( Array.isArray(this.happening_.fields) && this.happening_.fields.length )
			},
			useCurrentDatetime() {
				return !this.updateMode && this.datetimeSource==='current'
			},
			acceptText() {
				return this.updateMode ? 'Editar' : 'Crear'
			},
			updateMode() {
				return Boolean(this.record)
			},
			wasUpdated() {
				const { record, record_ } = this
				if ( this.updateMode ) {
					if ( record.date===record_.date && record.time===record_.time ) {
						let [ fields, fields_ ] = [ record.fields || [], record_.fields || [] ]
						if ( fields.length!==fields_.length ) {
							return true
						}
						for (let field of fields ) {
							let field_ = fields_.find( ({ id }) => field.id===id )
							if ( !field_ || field.value!==field_.value ) {
								return true
							}
						}
					} else {
						return true
					}
				}
				return false
			},
			disableAccept() {
				const { date, time } = this.record_
				return this.updateMode ? !this.wasUpdated : !(date && time)
			}
		},
		methods: {
			hideRecordHandlerDialog(save) {
				this.recordHandlerDialog = false
				this.$emit('update:show', false)
				if ( save ) {
					console.log('Request sending for saving the new data must be implemented')
				}
			},
			getFieldValue(happeningFieldId) {
				const found = this.record_.fields.find( ({ id }) => happeningFieldId===id )
				return found ? found.value : null
			},
			setFieldValue(happeningFieldId, value) {
				const recordField = this.record_.fields.find( ({ id }) => happeningFieldId===id )
				recordField ? recordField.value = value : this.record_.fields.push({ id: happeningFieldId, value })
			}
		}
	}
</script>
