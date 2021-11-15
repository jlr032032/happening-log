<template>
	<div>
		<v-btn
			fab
			medium
			dark
			color="secondary"
			class="custom--main-fab"
			@click="showNewHappeningDialog()"
		>
			<v-icon>mdi-plus</v-icon>
		</v-btn>
		<v-dialog v-model="newHappeningDialog">
			<v-card>
				<v-card-title class="custom--title-2 primary--text"> Crear suceso </v-card-title>
				<v-card-text>
					<div class="d-flex align-center">
						<label class="custom--creation-form-label"> Nombre: </label>
						<v-text-field
							dense
							v-model="newHappeningData.name"
						/>
					</div>
					<div class="d-flex align-center">
						<label class="custom--creation-form-label"> Etiquetas: </label>
						<label-select
							:labels="labels"
							multiple
							clearable
							v-model="newHappeningData.labels"
						/>
					</div>
					<field-handler
						class="mt-4"
						v-model="newHappeningData.fields"
					/>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						text
						@click="hideNewHappeningDialog()"
					>
						Cancelar
					</v-btn>
					<v-btn
						color="secondary"
						class="white--text"
						:disabled="!isValidHappening"
						@click="createHappening(newHappeningData)"
					>
						Crear
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import requester from '@/helpers/requester'

	export default {
		name: 'HappeningCreator',
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			FieldHandler: () => import('@/components/FieldHandler')
		},
		data: () => ({
			newHappeningDialog : false,
			newHappeningData: {
				name: '',
				labels: [],
				fields: []
			}
		}),
		computed: {
			...mapState(['labels']),
			isValidHappening() {
				const { name, fields } = this.newHappeningData
				return Boolean( name.trim() && fields.length )
			}
		},
		methods: {
			showNewHappeningDialog() {
				this.newHappeningData = {
					name: '',
					labels: [],
					fields: []
				}
				this.newHappeningDialog = true
			},
			hideNewHappeningDialog() {
				this.newHappeningDialog = false
			},
			async createHappening() {
				let { name, labels, fields } = this.newHappeningData
				let newHappening = { name, fields }
				labels.length && ( newHappening.labelsIds = labels.map( label => label.id ) )
				const response = await requester.post('/happenings', newHappening)
				switch ( response && response.status ) {
					case 201:
						this.$emit('createdHappening', response.data)
						this.newHappeningDialog = false
						break
					default:
						this.$showErrorDialog()
				}
			}
		}
	}
</script>

<style scoped>
	.custom--creation-form-label {
		width: 76px
	}
</style>
