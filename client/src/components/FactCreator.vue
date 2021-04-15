<template>
	<div>
		<v-btn
			fab
			medium
			dark
			color="secondary"
			class="custom--main-fab"
			@click="showNewFactDialog()"
		>
			<v-icon>mdi-plus</v-icon>
		</v-btn>
		<v-dialog v-model="newFactDialog">
			<v-card>
				<v-card-title class="custom--title-2 primary--text"> Crear hecho </v-card-title>
				<v-card-text>
					<div class="d-flex align-center">
						<label class="custom--creation-form-label"> Nombre: </label>
						<v-text-field
							dense
							v-model="newFactData.name"
						/>
					</div>
					<div class="d-flex align-center">
						<label class="custom--creation-form-label"> Etiquetas: </label>
						<label-select
							:labels="labels"
							multiple
							clearable
							v-model="newFactData.labels"
						/>
					</div>
					<field-manager
						class="mt-4"
						v-model="newFactData.fields"
					/>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						text
						@click="hideNewFactDialog()"
					>
						Cancelar
					</v-btn>
					<v-btn
						color="secondary"
						class="white--text"
						:disabled="!isValidFact"
						@click="createFact(newFactData)"
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

	export default {
		name: 'FactCreator',
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			FieldManager: () => import('@/components/FieldManager')
		},
		data: () => ({
			newFactDialog : false,
			newFactData: {
				name: '',
				labels: [],
				fields: []
			}
		}),
		computed: {
			...mapState(['labels']),
			isValidFact() {
				return Boolean(this.newFactData.name.trim())
			}
		},
		methods: {
			showNewFactDialog() {
				this.newFactData = {
					name: '',
					labels: [],
					fields: []
				}
				this.newFactDialog = true
			},
			hideNewFactDialog() {
				this.newFactDialog = false
			},
			createFact(newFact) {
				console.log('Create fact:', newFact)
				this.newFactDialog = false
			}
		}
	}
</script>

<style scoped>
	.custom--creation-form-label {
		width: 76px
	}
</style>
