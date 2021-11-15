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
				v-model="happening.labels"
			/>

			<field-handler
				large-title
				class="mt-7"
				v-model="happening.fields"
			/>

			<div class="mt-7">
				<h2 class="primary--text custom--title-2"> Últimos registros </h2>
				<records-table
					:happening="happening"
					:records="records"
				/>
				<router-link :to="`/sucesos/${happening.id}/registros`">
					<v-btn class="mt-2 primary white--text custom--full-width"> Ver todos los registros </v-btn>
				</router-link>
			</div>

			<v-btn class="mt-6 black white--text custom--full-width"> Eliminar suceso </v-btn>

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
	import { mapState } from 'vuex'
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
			messageScreen: {
				show: false,
				text: ''
			},
			temporaryHappening: {
				name: ''
			},
			happening: {
				id: 1,
				name: '',
				labels: [],
				fields: []
			},
			records: [
				{ date: '2021-05-14T04:00:00.000Z', time: '19:00', fields: [
					{ id: 1, value: 'Quinto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-14T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-05-10T04:00:00.000Z', time: '18:00', fields: [
					{ id: 1, value: 'Cuarto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-10T04:00:00.000Z' }
				]},
				{ date: '2021-05-02T04:00:00.000Z', time: '17:00', fields: [
					{ id: 1, value: 'Tercer tema de estudio' },
					{ id: 2, value: 1 },
					{ id: 3, value: '2021-05-02T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]}
			]
		}),
		async created() {
			this.messageScreen = { show: true, text: 'Cargando' }
			const results = await Promise.all([
				this.fetchLabels(),
				requester.get(`happenings/${this.$route.params.id}`)
			])
			const response = results[1]
			switch ( response && response.status ) {
				case 200:
					const { id, name, labels, fields } = response.data
					this.happening = { id, name, fields }
					if ( labels ) {
						let labelsIds = labels.map( label => label.id )
						let labelsReferences = []
						this.findlabelsReferences(labelsIds, this.labels, labelsReferences)
						this.happening.labels = labelsReferences
					}
					this.messageScreen.show = false
					break
				case 404:
					this.messageScreen.text = 'Suceso no encontrado'
					break
				default:
					this.messageScreen.text = 'No se puede procesar la acción en este momento'
			}
		},
		computed: {
			...mapState(['labels'])
		},
		methods: {
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
			updateHappeningName(newName) {
				newName = normalizeWhiteSpaces(newName)
				if ( newName ) {
					this.happening.name = newName
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
