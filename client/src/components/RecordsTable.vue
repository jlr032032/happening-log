<template>
	<div>

		<v-simple-table
			dense
			class="transparent mt-3"
			mobile-breakpoint="0"
		>
			<template v-slot:default>
				<thead>
					<tr>
						<th class="text-left"> Fecha </th>
						<th class="text-left"> Hora </th>
						<th
							v-for="(field, factFieldIndex) in fact.fields"
							:key="factFieldIndex"
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
						<td>{{ formatDate(record.date) }}</td>
						<td>{{ formatTime(record.time) }}</td>
						<td
							v-for="(field, factFieldIndex) in fact.fields"
							:key="factFieldIndex"
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
									@click="deleteRecord(recordIndex)"
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
			:fact="fact"
			:record="recordHandling.record"
		/>

	</div>
</template>

<script>
	export default {
		name: 'RecordsTable',
		components: {
			RecordHandler: () => import('@/components/RecordHandler')
		},
		props: {
			fact: { type: Object, default: () => ({ name: '', fields: [] }) },
			records: { type: Array, default: () => [] }
		},
		data: () => ({
			recordHandling: {
				dialog: false,
				record: null
			},
		}),
		methods: {
			formatDate(date) {
				return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'numeric', day: 'numeric' })
			},
			formatTime(time) {
				const dateObject = new Date(0, 0, 0, ...time.split(':'))
				return dateObject.toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit' })
			},
			getFieldValue(record, metadata) {
				const field = record.fields.find( ({ id }) => metadata.id===id )
				if ( field ) {
					switch ( metadata.type ) {
						case 'date': return this.formatDate(field.value)
						case 'time': return this.formatTime(field.value)
						default: return field.value
					}
				}
				return null
			},
			showRecordHandler(record) {
				this.recordHandling.record = record
				this.recordHandling.dialog = true
			},
			deleteRecord(index) {
				this.records.splice(index, 1)
				console.log('Item deletion should be persisted')
			}
		}
	}
</script>

<style scoped>
	.custom--item-actions {
		width: 68px;
	}
</style>