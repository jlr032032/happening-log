<template>
	<div>
		<h2
			class="primary--text"
			:class="titleStyle"
		>
			Características
		</h2>

		<div
			v-if="fields_.length"
			class="d-flex justify-center mt-2"
		>
			<div>
				<div
					v-for="(field, fieldIndex) in fields_"
					:key="fieldIndex"
					class="d-flex align-center"
				>
					<v-edit-dialog
						large
						save-text="Editar"
						cancel-text="Cancelar"
						class="flex-grow-1"
						@open="newFieldData.name = field.name"
						@save="updateField(field, fieldIndex, 'name', newFieldData.name)"
					>
						<template v-slot:default> 
							{{ field.name }}:
						</template>
						<template v-slot:input>
							<v-text-field
								clearable
								single-line
								label="Nombre de característica"
								v-model="newFieldData.name"
							/>
						</template>
					</v-edit-dialog>
					<v-select
						dense
						class="flex-grow-0 flex-shrink-0 custom--field-type"
						:items="fieldTypes"
						item-text="name"
						:value="field.type"
						@change="updateField(field, fieldIndex, 'type', $event)"
					/>
					<v-btn
						fab
						x-small
						class="primary white--text ml-3"
						@click="deleteField(field, fieldIndex)"
					>
						<v-icon dark> mdi-delete </v-icon>
					</v-btn>
				</div>
			</div>
		</div>

		<div
			v-else
			class="d-flex justify-center my-2"
		>
			<span class="custom--no-data-text"> No se han agregado características. </span>
		</div>

		<div class="d-flex justify-end mt-2">
			<v-btn
				color="primary"
				dark
				class="ml-2"
				@click="showNewFieldDialog"
			>
				Agregar
			</v-btn>
			<v-dialog v-model="newFieldData.dialog">
				<v-card>
					<v-card-title class="custom--title-2 primary--text"> Característica </v-card-title>
					<v-card-text>
						<div class="d-flex align-center">
							<label class="custom--field-label flex-shrink-0"> Nombre: </label>
							<v-text-field
								dense
								clearable
								v-model="newFieldData.name"
							/>
						</div>
						<div class="d-flex align-center">
							<label class="custom--field-label flex-shrink-0"> Tipo: </label>
							<v-select
								dense
								:items="fieldTypes"
								item-text="name"
								v-model="newFieldData.type"
							/>
						</div>
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn
							text
							@click="hideNewFieldDialog()"
						>
							Cancelar
						</v-btn>
						<v-btn class="white--text"
							color="primary"
							:disabled="!validNewField"
							@click="hideNewFieldDialog(true)"
						>
							Agregar
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</div>

	</div>
</template>

<script>
	export default {
		name: 'FieldManager',
		props: {
			largeTitle: { type: Boolean, default: false },
			fields: { type: Array, default: () => [] }
		},
		model: {
			prop: 'fields',
			event: 'change'
		},
		data: () => ({
			fields_: [],
			newFieldData: {
				name: '',
				type: 'text',
				dialog: false
			},
			fieldTypes: [
				{ value: 'text', name: 'Texto' },
				{ value: 'number', name: 'Número' },
				{ value: 'date', name: 'Fecha' },
				{ value: 'time', name: 'Hora' }
			]
		}),
		created() {
			if ( this.fields ) {
				this.fields_ = this.fields
			}
		},
		watch: {
			fields(newValue) {
				if ( this.fields_!==newValue ) {
					this.fields_ = newValue
				}
			}
		},
		computed: {
			validNewField() {
				return Boolean(this.newFieldData.name && this.newFieldData.name.trim())
			},
			titleStyle() {
				return this.largeTitle ? 'custom--title-2' : 'custom--title-3'
			}
		},
		methods: {
			showNewFieldDialog() {
				this.newFieldData = {
					name: '',
					type: 'text',
					dialog: true
				}
			},
			hideNewFieldDialog(save) {
				if ( save ) {
					const newField = {
						name: this.newFieldData.name.trim(),
						type: this.newFieldData.type
					}
					this.fields_ = [ ...this.fields_, newField ]
					this.$emit('change', this.fields_)
					this.$emit('newField', newField)
				}
				this.newFieldData.dialog = false
			},
			updateField(oldField, index, key, value) {
				let newField = JSON.parse( JSON.stringify(oldField) )
				if ( key==='name' ) {
					value = value && value.trim()
				}
				if ( value ) {
					newField[key] = value
					this.fields_ = this.fields_
						.slice(0, index)
						.concat([ newField, ...this.fields_.slice(index+1) ])
					this.$emit('change', this.fields_)
					this.$emit('updateField', {
						newValue: newField,
						oldValue: oldField,
						index
					})
				}
			},
			deleteField(deletedField, index) {
				this.fields_ = this.fields_
					.slice(0, index)
					.concat( this.fields_.slice(index+1) )
				this.$emit('change', this.fields_)
				this.$emit('deleteField', deletedField)
			}
		}
	}
</script>

<style scoped>
	.custom--fact-fixed-width-section {
		width: 145px
	}
	.custom--field-label {
		width: 65px
	}
	.custom--field-type {
		margin-left: 8px;
		width: 92px
	}
</style>
