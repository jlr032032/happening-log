<template>
	<div class="mt-5 mx-5 custom--with-fixed-buttons">

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
			v-model="happening.label"
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

	export default {
		name: 'Happening',
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			FieldHandler: () => import('@/components/FieldHandler'),
			RecordsTable: () => import('@/components/RecordsTable')
		},
		data: () => ({
			temporaryHappening: {
				name: ''
			},
			happening: {
				id: 1,
				name: 'Suceso 1',
				labels: [
					{ id: '4.2', name: 'Etiqueta 4.2', color: '#fff176' },
					{ id: '2', name: 'Etiqueta 2', color: '#e1f5fe' }
				],
				fields: [
					{ id: 1, name: "Tema de estudio", type: "text" },
					{ id: 2, name: "Descansos", type: "number" },
					{ id: 3, name: "Fecha de fin", type: "date" },
					{ id: 4, name: "Hora de fin", type: "time" }
				]
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
		computed: {
			...mapState(['labels'])
		},
		methods: {
			updateHappeningName(newName) {
				newName = normalizeWhiteSpaces(newName)
				if ( newName ) {
					this.happening.name = newName
				}
			}
		}
	}
</script>
