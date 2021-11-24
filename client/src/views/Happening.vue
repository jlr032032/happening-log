<template>
	<div class="custom--with-fixed-buttons">

		<div
			v-if="messageScreen.show"
			class="d-flex justify-center custom--loading-screen"
		>
			<p class="align-self-center custom--title-2 primary--text">{{ messageScreen.text }}</p>
		</div>

		<div
			v-else
			class="mt-5 mx-5"
		>
			<v-edit-dialog
				large
				save-text="Editar"
				cancel-text="Cancelar"
				@open="temporaryHappening.name = happening.name"
				@save="updateHappeningName(temporaryHappening.name)"
			>
				<template v-slot:default>
					<h2 class="custom--title-1 primary--text">{{ happening.name }}</h2>
				</template>
				<template v-slot:input>
					<v-text-field
						clearable
						v-model="temporaryHappening.name"
					/>
				</template>
			</v-edit-dialog>
			
			<label-select
				only-labels
				multiple
				:labels="labels"
				:selected="happening.labels"
				@change="updateHappeningLabels"
			/>

			<field-handler
				large-title
				class="mt-7"
				:canBeEmptied="false"
				:fields="happening.fields"
				@change="updateHappeningFields"
			/>

			<div class="mt-7">
				<h2 class="primary--text custom--title-2"> Últimos registros </h2>
				<records-table
					:happening="happening"
					:records="records"
				/>
				<router-link
					v-if="availableRecords"
					:to="`/sucesos/${happening.id}/registros`"
				>
					<v-btn class="mt-2 primary white--text custom--full-width"> Ver todos los registros </v-btn>
				</router-link>
			</div>

			<v-dialog v-model="showDeletionDialog">
				<template v-slot:activator="{ attrs, on }">
					<v-btn
						class="mt-6 black white--text custom--full-width"
						v-bind="attrs"
						v-on="on"
					>
						Eliminar suceso
					</v-btn>
				</template>
				<template v-slot:default>
					<v-card>
						<v-card-title class="custom--title-2 primary--text"> Eliminar suceso </v-card-title>
						<v-card-text>
							Se eliminará el suceso y todos sus registros de forma irreversible ¿Deseas continuar?
						</v-card-text>
						<v-card-actions>
							<v-spacer />
							<v-btn
								class="primary"
								@click="closeDeletionDialog()"
							>
								Cancelar
							</v-btn>
							<v-btn
								class="black white--text"
								@click="closeDeletionDialog(true)"
							>
								Eliminar
							</v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
			

		</div>

		<router-link to="/sucesos">
			<v-btn
				fab
				medium
				dark
				color="secondary"
				class="custom--go-back-button"
			>
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
		</router-link>

	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import { normalizeWhiteSpaces } from 'normalize-text'
	import helpers from '@/mixins/helpers'
	import requester from '@/helpers/requester'

	export default {
		name: 'Happening',
		mixins: [ helpers ],
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			FieldHandler: () => import('@/components/FieldHandler'),
			RecordsTable: () => import('@/components/RecordsTable')
		},
		data: () => ({
			showDeletionDialog: false,
			messageScreen: {
				show: false,
				text: ''
			},
			temporaryHappening: {
				name: ''
			}
		}),
		async created() {
			this.messageScreen = { show: true, text: 'Cargando' }
			const [ result1, result2, result3 ] = await Promise.all([
				this.fetchLastRecords(this.$route.params.id),
				this.fetchLabels(),
				this.fetchHappening(this.$route.params.id)
			])
			if ( result3.success ) {
				if ( result2.success ) {
					if ( !result1.success ) {
						this.$showErrorDialog({ message: 'No se pudo obtener los últimos registros en este momento' })
					}
					this.messageScreen = { show: false, text: '' }
				} else {
					this.messageScreen.text = 'No se pudo obtener la información en este momento'
				}
			} else {
				if ( result3.status===404 ) {
					this.messageScreen.text = 'Suceso no encontrado'
				} else {
					this.messageScreen.text = 'No se pudo obtener la información en este momento'
				}
			}
		},
		computed: {
			...mapState(['labels', 'records', 'happening']),
			availableRecords() {
				return this.records && this.records.length
			}
		},
		methods: {
			...mapMutations(['setRecords']),
			async fetchLastRecords(happeningId) {
				this.$store.commit('setRecords', [])
				const response = await requester.get(`/happenings/${happeningId}/records?last=3`)
				if ( response && response.status===200 ) {
					this.$store.commit('setRecords', response.data)
					return { success: true }
				} else {
					return { success: false }
				}
			},
			findlabelsReferences(ids, labels, references) {
				for (let label of labels) {
					if ( !ids.length ) {
						return
					}
					if ( label.subLabels ) {
						this.findlabelsReferences(ids, label.subLabels, references)
					}
					const idIndex = ids.findIndex( id => label.id===id )
					if ( idIndex>-1 ) {
						references.push(label)
						ids.splice(idIndex, 1)
					}
				}
			},
			async updateHappeningName(newName) {
				newName = newName && normalizeWhiteSpaces(newName)
				if ( newName ) {
					const { id, labels, fields } = this.happening
					let happening = { name: newName, fields }
					labels && ( happening.labelsIds = labels.map( label => label.id ) )
					const response = await requester.put(`/happenings/${id}`, happening)
					switch ( response && response.status ) {
						case 200:
							this.$store.commit('setHappening', response.data)
							break
						default:
							this.$showErrorDialog()
					}
				}
			},
			async updateHappeningLabels(labels) {
				const { id, name, fields } = this.happening
				let happening = { name, fields }
				labels.length && ( happening.labelsIds = labels.map( label => label.id ) )
				const response = await requester.put(`/happenings/${id}`, happening)
				switch ( response && response.status ) {
					case 200:
						this.$store.commit('setHappening', response.data)
						break
					default:
						this.$showErrorDialog()
				}
			},
			async updateHappeningFields(fields) {
				const { id, name, labels } = this.happening
				let happening = { name, fields }
				labels && labels.length && ( happening.labelsIds = labels.map( label => label.id ) )
				const response = await requester.put(`/happenings/${id}`, happening)
				switch ( response && response.status ) {
					case 200:
						this.$store.commit('setHappening', response.data)
						break
					default:
						this.$showErrorDialog()
				}
			},
			async closeDeletionDialog(erase) {
				if ( erase ) {
					const { id } = this.happening
					const response = await requester.delete(`/happenings/${id}`)
					switch ( response && response.status ) {
						case 200:
							this.$router.replace('/sucesos')
							break
						default:
							this.$showErrorDialog()
					}
				} else {
					this.showDeletionDialog = false
				}
			}
		}
	}
</script>

<style scoped>
	.custom--loading-screen {
		height: calc(100vh - 162px)
	}
</style>
