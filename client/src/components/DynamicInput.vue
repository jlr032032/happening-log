<template>
	<v-text-field
		v-if="isTextInput"
		dense
		:value="value"
		@input="handleInput"
	/>
	<number-input
		v-else-if="isNumberInput"
		:value="value"
		@input="handleInput"
	/>
	<date-input
		v-else-if="isDateInput"
		:date="value"
		@change="handleInput"
	/>
	<datetime-input
		v-else-if="isDatetimeInput"
		:updateMode="updateMode"
		:value="value"
		@change="handleInput"
	/>
</template>

<script>
	export default {
		name: 'DynamicInput',
		components: {
			NumberInput: () => import('@/components/NumberInput'),
			DateInput: () => import('@/components/DateInput'),
			DatetimeInput: () => import('@/components/DatetimeInput')
		},
		props: {
			type: { type: String, default: 'text' },
			updateMode: { type: Boolean, default: false },
			value: true
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		computed: {
			isTextInput() {
				return this.type==='text'
			},
			isNumberInput() {
				return this.type==='number'
			},
			isDateInput() {
				return this.type==='date'
			},
			isDatetimeInput() {
				return this.type==='datetime'
			}
		},
		methods: {
			handleInput(newValue) {
				this.$emit('input', newValue)
			}
		}
	}
</script>
