<template>
	<div>

		<template v-if="availableRecords">

			<v-simple-table
				dense
				class="transparent mt-3"
				mobile-breakpoint="0"
			>
				<template v-slot:default>
					<thead>
						<tr>
							<th
								v-for="(field, happeningFieldIndex) in happening.fields"
								:key="happeningFieldIndex"
								class="text-left"
							>
								{{ field.name }}
							</th>
							<th> Opciones </th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(record, recordIndex) in records"
							:key="recordIndex"
						>
							<td
								v-for="(field, happeningFieldIndex) in happening.fields"
								:key="happeningFieldIndex"
							>
								{{ getFieldValue(record, field) }}
							</td>
							<td>
								<div class="custom--item-actions">
									<v-btn
										fab
										x-small
										elevation="0"
										class="transparent primary--text mr-1"
										@click="showRecordHandler(record)"
									>
										<v-icon> mdi-pencil </v-icon>
									</v-btn>
									<v-btn
										fab
										x-small
										elevation="0"
										class="transparent primary--text"
										@click="deleteRecord(record.id)"
									>
										<v-icon> mdi-delete </v-icon>
									</v-btn>
								</div>
							</td>
						</tr>
					</tbody>
				</template>
			</v-simple-table>

			<record-handler
				:show.sync="recordHandling.dialog"
				:happening="happening"
				:record="recordHandling.record"
			/>

		</template>

		<p
			v-else
			class="mt-3 mb-6 custom--no-data-text"
		>
			No hay registros disponibles todavía.
		</p>

	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import requester from '@/helpers/requester'
	export default {
		name: 'RecordsTable',
		components: {
			RecordHandler: () => import('@/components/RecordHandler')
		},
		data: () => ({
			recordHandling: {
				dialog: false,
				record: null
			},
		}),
		computed: {
			...mapState(['happening', 'records']),
			availableRecords() {
				return this.records && this.records.length
			}
		},
		methods: {
			...mapMutations(['removeRecord']),
			formatDate(date) {
				const formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' }
				return new Date(date.local).toLocaleDateString('es-MX', formatOptions)
			},
			formatDatetime(datetime) {
				const datePart = this.formatDate(datetime)
				datetime = new Date(datetime.local)
				const timeFormatOptions = { hour12: true, hour: '2-digit', minute: '2-digit' }
				const timePart = datetime
					.toLocaleTimeString('es-MX', timeFormatOptions)
					.replace(/^0/, '')
				return `${datePart} ${timePart}`
			},
			getFieldValue(record, metadata) {
				const field = record.fields.find( ({ id }) => metadata.id===id )
				if ( field ) {
					switch ( metadata.type ) {
						case 'date': return this.formatDate(field.value)
						case 'datetime': return this.formatDatetime(field.value)
						default: return field.value
					}
				}
				return null
			},
			showRecordHandler(record) {
				this.recordHandling.record = record
				this.recordHandling.dialog = true
			},
			async deleteRecord(id) {
				const response = await requester.delete(`/happenings/records/${id}`)
				switch ( response && response.status ) {
					case 200:
						this.removeRecord(id)
						break
					default:
						this.$showErrorDialog()
				}
			}
		}
	}
</script>

<style scoped>
	.custom--item-actions {
		width: 68px;
	}
</style>