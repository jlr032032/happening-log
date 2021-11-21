<template>
	<v-menu
		offset-y
		max-width="290px"
		:close-on-content-click="false"
		v-model="dateMenu"
	>
		<template v-slot:activator="{ attrs, on }">
			<v-text-field
				dense
				readonly
				v-bind="attrs"
				v-on="on"
				:placeholder="placeholder"
				:disabled="disabled"
				:value="formattedDate"
			/>
		</template>
		<template v-slot:default>
			<v-date-picker
				scrollable
				reactive
				locale="es-MX"
				v-model="date.temporary"
			>
				<v-spacer />
				<v-btn
					text
					@click="closeDateMenu()"
				>
					Cancelar
				</v-btn>
				<v-btn
					color="primary"
					:disabled="isAcceptDisabled"
					@click="closeDateMenu(date.temporary)"
				>
					Aceptar
				</v-btn>
			</v-date-picker>
		</template>
	</v-menu>
</template>

<script>
	import dateHelper from '@/helpers/date'

	export default {
		name: 'DateInput',
		props: {
			value: { type: Object, default: null },
			placeholder: { type: String, default: '' },
			disabled: { type: Boolean, default: false }
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data: () => ({
			dateMenu: false,
			date: {
				temporary: null,
				inner: null,
				outer: { utc: null, local: null }
			},
		}),
		created: async function() {
			this.setValue(this.value)
		},
		watch: {
			value(newDate) {
				this.setValue(newDate)
			}
		},
		computed: {
			formattedDate() {
				const formatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
				let date = this.date.outer.utc
				date = date && new Date(date)
				return date ? date.toLocaleDateString('es-MX', formatOptions) : ''
			},
			isAcceptDisabled() {
				return !this.date.temporary
			}
		},
		methods: {
			closeDateMenu(newDate) {
				if ( newDate ) {
					newDate = new Date(newDate.replaceAll('-', '/'))
					newDate = dateHelper.utcAndLocal(newDate)
					this.date.outer = newDate
					this.$emit('change', newDate)
				}
				this.dateMenu = false
			},
			innerDateFormat(date) {
				const { pad } = dateHelper
				date = new Date(date)
				const YY = date.getFullYear()
				const MM = pad(date.getMonth()+1, 2)
				const DD = pad(date.getDate(), 2)
				return `${YY}-${MM}-${DD}`
			},
			setValue(value) {
				if ( value && value.utc ) {
					this.date.outer = value
					const formatted = this.innerDateFormat(value.utc)
					this.date.inner = formatted
					this.date.temporary = formatted
				} else {
					this.date.outer = { utc: null, local: null }
					this.date.inner = null
					this.date.temporary = undefined
				}
			},
			showDateMenu() {
				this.dateMenu = true
			}
		}
	}
</script>
