<template>
	<div class="px-3 custom--with-fixed-buttons">

		<message-screen
			v-if="messageScreen.show"
			:message="messageScreen.message"
		/>

		<div v-else>
			<div
				class="custom--pagination-section d-flex align-center"
			>
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

			<records-table :pagination="pagination"/>
		</div>

		<router-link :to="`/sucesos/${$route.params.id}`">
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
	import requester from '@/helpers/requester'
	export default {
		name: 'Records',
		components: {
			RecordsTable: () => import('@/components/RecordsTable'),
			MessageScreen: () => import('@/components/MessageScreen')
		},
		data: () => ({
			messageScreen: {
				message: '',
				show: true
			},
			pagination: {
				currentPage: 1,
				itemsPerPage: 10,
				menu: false,
				temporaryItemsPerPage: null
			}
		}),
		async created() {
			this.messageScreen.show = true
			this.messageScreen.message = 'Cargando'
			const [ success1, success2 ] = await Promise.all([
				this.fetchRecords(),
				this.fetchHappening()
			])
			if ( success1 && success2 ) {
				this.messageScreen.show = false
			} else {
				this.messageScreen.message = 'No se pudo obtener la información consultada en este momento'
				this.messageScreen.show = true
			}
		},
		watch: {
			'pagination.menu': function (show) {
				if (show) {
					this.pagination.temporaryItemsPerPage = this.pagination.itemsPerPage
					setTimeout( () => this.$refs.itemsPerPageInput.$refs.input.select(), 250 )
				}
			}
		},
		computed: {
			...mapState(['records', 'happening']),
			totalPages() {
				const totalRecords = this.records ? this.records.length : 0
				return Math.ceil(totalRecords/this.pagination.itemsPerPage)
			}
		},
		methods: {
			...mapMutations(['setRecords', 'setHappening']),
			async fetchHappening() {
				const happeningId = this.$route.params.id
				const response = await requester.get(`/happenings/${happeningId}`)
				if ( response && response.status===200 ) {
					this.setHappening(response.data)
					return true
				}
				return false
			},
			async fetchRecords() {
				const happeningId = this.$route.params.id
				const response = await requester.get(`/happenings/${happeningId}/records`)
				if ( response && response.status===200 ) {
					this.setRecords(response.data)
					return true
				}
				return false
			},
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
