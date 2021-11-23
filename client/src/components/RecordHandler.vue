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
					<h4 class="custom--title-4 primary--text"> Características </h4>
					<div class="d-flex mt-2">
						<div>
							<div
								v-for="(field, index) of happening_.fields"
								:key="index"
								class="d-flex align-center"
							>
								<label class="mr-7">{{ field.name }}:</label>
								<dynamic-input
									:type="field.type"
									:updateMode="updateMode"
									:value="getFieldValue(field.id)"
									@input="setFieldValue(field.id, $event)"
								/>
							</div>
						</div>
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
	import requester from '@/helpers/requester'
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
			}
		},
		watch: {
			show(newShowValue) {
				if ( newShowValue ) {
					if ( this.updateMode ) {
						this.record_ = JSON.parse( JSON.stringify(this.record) )
					} else {
						this.datetimeSource = 'current'
						this.record_ = {
							date: null,
							time: null,
							fields: []
						}
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
			useCurrentDatetime() {
				return !this.updateMode && this.datetimeSource==='current'
			},
			acceptText() {
				return this.updateMode ? 'Editar' : 'Crear'
			},
			updateMode() {
				return Boolean(this.record)
			}
		},
		methods: {
			async hideRecordHandlerDialog(save) {
				let closeDialog = true
				if ( save ) {
					if ( this.updateMode ) {
						closeDialog = await this.updateRecord()
					} else {
						closeDialog = await this.createRecord()
					}
				}
				if ( closeDialog ) {
					this.recordHandlerDialog = false
					this.$emit('update:show', false)
				}
			},
			async createRecord() {
				const { record_: { fields }, happening: { id } } = this
				let record = { happeningId: id, fields }
				const response = await requester.post(`/happenings/${id}/records`, record)
				switch ( response && response.status ) {
					case 201:
						return true
					default:
						this.$showErrorDialog()
						return false
				}
			},
			async updateRecord() {
				let { record_, happening } = this
				record_.fields = record_.fields.filter( field => field.value )
				const endpoint = `/happenings/${happening.id}/records/${record_.id}`
				const response = await requester.put(endpoint, record_)
				switch( response && response.status ) {
					case 200:
						this.$emit('update:record', response.data)
						return true
					default:
						this.$showErrorDialog()
						return false
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
