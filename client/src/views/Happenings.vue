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
				v-for="(happening, happening_index) in happeningList"
				:key="happening_index"
			>
				<v-divider
					v-if="happening_index"
					class="my-2"
				/>
				<div class="d-flex align-center">
					<div class="flex-grow-1">
						{{ happening.name }}
						<div class="mt-1">
							<v-chip
								v-for="(label, label_index) in happening.labels"
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
							@click="showRecordHandler(happening)"
						>
							<v-icon> mdi-calendar-check </v-icon>
						</v-btn>
						<router-link :to="`/sucesos/${happening.id}`">
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

		<happening-creator @createdHappening="addHappening"/>

		<record-handler
			:show.sync="recordHandling.dialog"
			:happening="recordHandling.happening"
		/>

	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import { normalizeText } from 'normalize-text'
	import helpers from '@/mixins/helpers'
	import requester from '@/helpers/requester'

	export default {
		name: 'Happenings',
		mixins: [ helpers ],
		components: {
			LabelSelect: () => import('@/components/LabelSelect'),
			HappeningCreator: () => import('@/components/HappeningCreator'),
			RecordHandler: () => import('@/components/RecordHandler')
		},
		data: () => ({
			newHappeningDialog: false,
			recordHandling: {
				dialog: false,
				record: null,
				happening: null
			},
			filter: {
				by: 'labels',
				searchedLabels: [],
				searchedText: ''
			},
			happenings: []
		}),
		async created() {
			await Promise.all([
				this.fetchLabels(),
				this.fetchHappenings()
			])
		},
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
			happeningList() {
				if ( this.filterByLabels ) {
					return this.happenings.filter( happening => {
						for ( let happeningLabel of happening.labels ) {
							for ( let searchedLabel of this.filter.searchedLabels ) {
								if ( happeningLabel.id===searchedLabel.id ) {
									return true
								}
							}
						}
						return false
					})
				}
				else if ( this.filterByText ) {
					return this.happenings.filter( happening => normalizeText(happening.name).includes(this.searchedText) )
				}
				return this.happenings
			}
		},
		methods: {
			...mapMutations(['setHappening']),
			addHappening(newHappening) {
				this.happenings.push(newHappening)
			},
			async fetchHappenings() {
				const response = await requester.get('/happenings')
				switch ( response && response.status ) {
					case 200:
						this.happenings = response.data
						break
					default:
						const message = 'No se pueden obtener los sucesos en este momento.'
						this.$showErrorDialog({ message })
				}
			},
			showNewHappeningDialog(value) {
				this.newHappeningDialog = value
			},
			showRecordHandler(happening) {
				this.setHappening(happening)
				this.recordHandling.dialog = true
			}
		}
	}
</script>

<style scoped>
	.custom--happening-text {
		background-color: khaki !important;
	}
	.custom--filter-type-label {
		width: 85px
	}
	.custom--search-field {
		width: 243px
	}
</style>
