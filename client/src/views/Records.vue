<template>
	<div class="custom--with-fixed-buttons">

		<div class="custom--pagination-section d-flex align-center">
			<div class="flex-grow-1 d-flex justify-center">
				<v-pagination
					circle
					:length="totalPages"
					v-model="pagination.currentPage"
				/>
			</div>
			<div class="custom--items-per-page flex-shrink-0">
				<v-menu
					class="flex-shrink-0 flex-grow-0"
					:close-on-content-click="false"
					v-model="pagination.menu"
				>
					<template v-slot:activator="{ attrs, on }">
						<v-badge
							overlap
							:content="pagination.itemsPerPage"
						>
							<v-btn
								fab
								x-small
								elevation="0"
								class="transparent"
								v-bind="attrs"
								v-on="on"
							>
								<v-icon> mdi-format-list-bulleted </v-icon>
							</v-btn>
						</v-badge>
					</template>
					<template v-slot:default>
						<v-card>
							<div class="pt-5 pb-1 px-4">
								<v-text-field
									ref="itemsPerPageInput"
									dense
									class="flex-grow-0"
									type="number"
									label="Registros por página:"
									v-model="pagination.temporaryItemsPerPage"
								/>
								<v-btn
									text
									small
									@click="hidePaginationMenu()"
								>
									Cancelar
								</v-btn>
								<v-btn
									text
									small
									color="primary"
									@click="hidePaginationMenu(true)"
								>
									Aceptar
								</v-btn>
							</div>
						</v-card>
					</template>
				</v-menu>
			</div>
		</div>

		<records-table
			:fact="fact"
			:records="pageRecords"
		/>

		<router-link :to="`/hechos/${fact.id}`">
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
	export default {
		name: 'Records',
		components: {
			RecordsTable: () => import('@/components/RecordsTable')
		},
		data: () => ({
			pagination: {
				currentPage: 1,
				itemsPerPage: 6,
				menu: false,
				temporaryItemsPerPage: null
			},
			fact: {
				id: 1,
				name: 'Hecho 1',
				fields: [
					{ id: 1, name: "Tema de estudio", type: "text" },
					{ id: 2, name: "Descansos", type: "number" },
					{ id: 3, name: "Fecha de fin", type: "date" },
					{ id: 4, name: "Hora de fin", type: "time" }
				]
			},
			records: [
				{ date: '2021-04-24T04:00:00.000Z', time: '00:00', fields: [
					{ id: 1, value: 'Primer tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-04-24T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-04-27T04:00:00.000Z', time: '01:00', fields: [
					{ id: 1, value: 'Segundo tema de estudio' },
					{ id: 3, value: '2021-04-27T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-05-02T04:00:00.000Z', time: '02:00', fields: [
					{ id: 1, value: 'Tercer tema de estudio' },
					{ id: 2, value: 1 },
					{ id: 3, value: '2021-05-02T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-05-10T04:00:00.000Z', time: '03:00', fields: [
					{ id: 1, value: 'Cuarto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-10T04:00:00.000Z' }
				]},
				{ date: '2021-05-14T04:00:00.000Z', time: '04:00', fields: [
					{ id: 1, value: 'Quinto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-14T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-04-24T04:00:00.000Z', time: '05:00', fields: [
					{ id: 1, value: 'Primer tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-04-24T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-04-27T04:00:00.000Z', time: '06:00', fields: [
					{ id: 1, value: 'Segundo tema de estudio' },
					{ id: 3, value: '2021-04-27T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-05-02T04:00:00.000Z', time: '07:00', fields: [
					{ id: 1, value: 'Tercer tema de estudio' },
					{ id: 2, value: 1 },
					{ id: 3, value: '2021-05-02T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-05-10T04:00:00.000Z', time: '08:00', fields: [
					{ id: 1, value: 'Cuarto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-10T04:00:00.000Z' }
				]},
				{ date: '2021-05-14T04:00:00.000Z', time: '09:00', fields: [
					{ id: 1, value: 'Quinto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-14T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-04-24T04:00:00.000Z', time: '10:00', fields: [
					{ id: 1, value: 'Primer tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-04-24T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-04-27T04:00:00.000Z', time: '11:00', fields: [
					{ id: 1, value: 'Segundo tema de estudio' },
					{ id: 3, value: '2021-04-27T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-05-02T04:00:00.000Z', time: '12:00', fields: [
					{ id: 1, value: 'Tercer tema de estudio' },
					{ id: 2, value: 1 },
					{ id: 3, value: '2021-05-02T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-05-10T04:00:00.000Z', time: '13:00', fields: [
					{ id: 1, value: 'Cuarto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-10T04:00:00.000Z' }
				]},
				{ date: '2021-05-14T04:00:00.000Z', time: '14:00', fields: [
					{ id: 1, value: 'Quinto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-14T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-04-24T04:00:00.000Z', time: '15:00', fields: [
					{ id: 1, value: 'Primer tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-04-24T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-04-27T04:00:00.000Z', time: '16:00', fields: [
					{ id: 1, value: 'Segundo tema de estudio' },
					{ id: 3, value: '2021-04-27T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]},
				{ date: '2021-05-02T04:00:00.000Z', time: '17:00', fields: [
					{ id: 1, value: 'Tercer tema de estudio' },
					{ id: 2, value: 1 },
					{ id: 3, value: '2021-05-02T04:00:00.000Z' },
					{ id: 4, value: '17:00' },
				]},
				{ date: '2021-05-10T04:00:00.000Z', time: '18:00', fields: [
					{ id: 1, value: 'Cuarto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-10T04:00:00.000Z' }
				]},
				{ date: '2021-05-14T04:00:00.000Z', time: '19:00', fields: [
					{ id: 1, value: 'Quinto tema de estudio' },
					{ id: 2, value: 2 },
					{ id: 3, value: '2021-05-14T04:00:00.000Z' },
					{ id: 4, value: '17:00' }
				]}
			]
		}),
		watch: {
			'pagination.menu': function (show) {
				if (show) {
					this.pagination.temporaryItemsPerPage = this.pagination.itemsPerPage
					setTimeout( () => this.$refs.itemsPerPageInput.$refs.input.select(), 250 )
				}
			}
		},
		computed: {
			totalPages() {
				return Math.ceil(this.records.length/this.pagination.itemsPerPage)
			},
			pageRecords() {
				const { currentPage, itemsPerPage } = this.pagination
				const start = (currentPage-1) * itemsPerPage
				return this.records.slice(start, start+itemsPerPage)
			}
		},
		methods: {
			hidePaginationMenu(save) {
				if (save) {
					const itemsPerPage = Number(this.pagination.temporaryItemsPerPage)
					this.pagination.itemsPerPage = itemsPerPage>0? itemsPerPage : 1
				}
				this.pagination.menu = false
			}
		}
	}
</script>

<style scoped>
	.custom--pagination-section {
		margin-top: 15px;
		margin-bottom: 18px;
		width: 100%;
	}
	.custom--items-per-page {
		width: 41px;
	}
</style>
