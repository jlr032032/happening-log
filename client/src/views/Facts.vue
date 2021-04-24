<template>
	<div class="ma-5  custom--with-fixed-buttons">

		<div class="d-flex justify-center">
			<div class="d-flex align-center">
				<label class="custom--filter-type-label"> Filtrar por: </label>
				<v-chip-group
					mandatory
					active-class="custom--filter-type-active-chip"
					v-model="filter.by"
				>
					<v-chip
						class="custom--filter-type-chip"
						value="labels"
					>
						Etiquetas
					</v-chip>
					<v-chip
						class="custom--filter-type-chip"
						value="text"
					>
						Texto
					</v-chip>
				</v-chip-group>
			</div>
		</div>

		<div class="d-flex justify-center">
			<label-select
				v-show="filter.by==='labels'"
				class="custom--search-field"
				multiple
				clearable
				:labels="labels"
				v-model="filter.searchedLabels"
			/>
			<v-text-field
				v-show="filter.by==='text'"
				dense
				class="custom--search-field flex-grow-0"
				clearable
				v-model="filter.searchedText"
			/>
		</div>

		<div class="mt-5">
			<div
				v-for="(fact, fact_index) in factList"
				:key="fact_index"
			>
				<v-divider
					v-if="fact_index"
					class="my-2"
				/>
				<div class="d-flex align-center">
					<div class="flex-grow-1">
						{{ fact.name }}
						<div class="mt-1">
							<v-chip
								v-for="(label, label_index) in fact.labels"
								:key="label_index"
								:color="label.color"
								label
								small
								class="mr-1 mb-1"
								:class="contrastingColor(label.color, 'text')"
							>
								<span>{{ label.name }}</span>
							</v-chip>
						</div>
					</div>
					<div>
						<v-btn
							fab
							x-small
							elevation="0"
							class="primary white--text mr-1"
							@click="showHappeningHandler(fact)"
						>
							<v-icon> mdi-calendar-check </v-icon>
						</v-btn>
						<router-link :to="`/hechos/${fact.id}`">
							<v-btn
								fab
								x-small
								elevation="0"
								class="primary white--text"
							>
								<v-icon> mdi-dots-vertical </v-icon>
							</v-btn>
						</router-link>
					</div>
				</div>
			</div>
		</div>

		<fact-creator />

		<happening-handler
			:show.sync="happeningHandling.dialog"
			:fact="happeningHandling.fact"
		/>

	</div>
</template>

<script>
	import helpers from '@/mixins/helpers'
	import { mapState } from 'vuex'
	import { normalizeText } from 'normalize-text'

	export default {
		name: 'Facts',
		mixins: [ helpers ],
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			FactCreator: () => import('@/components/FactCreator'),
			HappeningHandler: () => import('@/components/HappeningHandler')
		},
		data: () => ({
			newFactDialog: false,
			happeningHandling: {
				dialog: false,
				happening: null,
				fact: null
			},
			filter: {
				by: 'labels',
				searchedLabels: [],
				searchedText: ''
			},
			facts: [
				{
					id: 1,
					name: 'Hecho 1',
					labels: [
						{ id: '4.2', name: 'Etiqueta 4.2', color: '#fff176' },
						{ id: '2', name: 'Etiqueta 2', color: '#e1f5fe' }
					],
					fields: [
						{ id: 1, name: "Uno", type: "text" },
						{ id: 2, name: "Dos", type: "number" },
						{ id: 3, name: "Tres", type: "date" },
						{ id: 4, name: "Cuatro", type: "time" }
					]
				},
				{ id: 2, name: 'Hecho 2', labels: [
					{ id: '4', name: 'Etiqueta 4', color: '#80cbc4' }
				]},
				{ id: 3, name: 'Hecho 3', labels: [
					{ id: '5', name: 'Etiqueta 5', color: '#2e7d32' }
				]}
			]
		}),
		computed: {
			...mapState(['labels']),
			searchedText() {
				return this.filter.searchedText ? normalizeText(this.filter.searchedText) : ''
			},
			filterByLabels() {
				return Boolean(this.filter.by==='labels' && this.filter.searchedLabels && this.filter.searchedLabels.length)
			},
			filterByText() {
				return Boolean(this.filter.by==='text' && this.searchedText)
			},
			factList() {
				if ( this.filterByLabels ) {
					return this.facts.filter( fact => {
						for ( let factLabel of fact.labels ) {
							for ( let searchedLabel of this.filter.searchedLabels ) {
								if ( factLabel.id===searchedLabel.id ) {
									return true
								}
							}
						}
						return false
					})
				}
				else if ( this.filterByText ) {
					return this.facts.filter( fact => normalizeText(fact.name).includes(this.searchedText) )
				}
				return this.facts
			}
		},
		methods: {
			showNewFactDialog(value) {
				this.newFactDialog = value
			},
			showHappeningHandler(fact) {
				this.happeningHandling.fact = fact
				this.happeningHandling.dialog = true
			}
		}
	}
</script>

<style scoped>
	.custom--fact-text {
		background-color: khaki !important;
	}
	.custom--filter-type-label {
		width: 85px
	}
	.custom--search-field {
		width: 243px
	}
</style>
