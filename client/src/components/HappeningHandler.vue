<template>
	<div>
		<v-dialog
			:value="happeningHandlerDialog"
			@input="hideHappeningHandlerDialog()"
		>
			<v-card>
				<v-card-title class="flex-column align-start pb-0">
					<h2 class="custom--title-4 primary--text">{{ title }}</h2>
					<h3 class="custom--title-1 primary--text">{{ fact_.name }}</h3>
				</v-card-title>
				<v-card-text class="mt-4">
					<div v-if="hasFields">
						<h4 class="custom--title-4 primary--text"> Características </h4>
						<v-row
							v-for="(field, index) of fact_.fields"
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
									v-model="happening_.date"
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
									v-model="happening_.time"
								/>
							</v-col>
						</v-row>
					</div>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						text
						@click="hideHappeningHandlerDialog()"
					>
						Cancelar
					</v-btn>
					<v-btn
						color="primary"
						:disabled="disableAccept"
						@click="hideHappeningHandlerDialog(true)"
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
		name: 'HappeningHandler',
		components: {
			DynamicInput: () => import('@/components/DynamicInput'),
			DateInput: () => import('@/components/DateInput'),
			TimeInput: () => import('@/components/TimeInput')
		},
		props: {
			show: { type: Boolean, default: false },
			fact: { type: Object },
			happening: { type: Object }
		},
		data: () => ({
			happeningHandlerDialog: null,
			datetimeSource: 'other',
			fact_: {},
			happening_: {
				date: null,
				time: null,
				fields: []
			}
		}),
		created() {
			this.happeningHandlerDialog = this.show
			this.fact_ = this.fact || {}
			if ( this.updateMode ) {
				this.happening_ = JSON.parse( JSON.stringify(this.happening) )
				this.datetimeSource = 'other'
			} else {
				this.datetimeSource = 'current'
			}
		},
		watch: {
			show(newShowValue) {
				if ( newShowValue && !this.updateMode ) {
					this.datetimeSource = 'current'
					this.happening_ = {
						date: null,
						time: null,
						fields: []
					}
				}
				this.happeningHandlerDialog = newShowValue
			},
			fact(newFactValue) {
				this.fact_ = newFactValue || {}
			},
			happening(newHappeningValue) {
				this.happening_ = newHappeningValue ? JSON.parse( JSON.stringify(this.happening) ) : {
					date: null,
					time: null,
					fields: []
				}
			}
		},
		computed: {
			title() {
				return this.updateMode ? 'Modificar suceso' : 'Nuevo suceso'
			},
			hasFields() {
				return Boolean( Array.isArray(this.fact_.fields) && this.fact_.fields.length )
			},
			useCurrentDatetime() {
				return this.datetimeSource==='current'
			},
			acceptText() {
				return this.updateMode ? 'Editar' : 'Crear'
			},
			updateMode() {
				return Boolean(this.happening)
			},
			wasUpdated() {
				const { happening, happening_ } = this
				if ( this.updateMode ) {
					if ( happening.date===happening_.date && happening.time===happening_.time ) {
						let [ fields, fields_ ] = [ happening.fields || [], happening_.fields || [] ]
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
				const { date, time } = this.happening_
				return this.updateMode ? !this.wasUpdated : !(date && time)
			}
		},
		methods: {
			hideHappeningHandlerDialog(save) {
				this.happeningHandlerDialog = false
				this.$emit('update:show', false)
				if ( save ) {
					console.log('Request sending for saving the new data must be implemented')
				}
			},
			getFieldValue(factFieldId) {
				const found = this.happening_.fields.find( ({ id }) => factFieldId===id )
				return found ? found.value : null
			},
			setFieldValue(factFieldId, value) {
				const happeningField = this.happening_.fields.find( ({ id }) => factFieldId===id )
				happeningField ? happeningField.value = value : this.happening_.fields.push({ id: factFieldId, value })
			}
		}
	}
</script>
