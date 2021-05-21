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
	<time-input
		v-else-if="isTimeInput"
		:time="value"
		@change="handleInput"
	/>
	<date-input
		v-else-if="isDateInput"
		:date="value"
		@change="handleInput"
	/>
</template>

<script>
	export default {
		name: 'DynamicInput',
		components: {
			NumberInput: () => import('@/components/NumberInput'),
			TimeInput: () => import('@/components/TimeInput'),
			DateInput: () => import('@/components/DateInput')
		},
		props: {
			type: { type: String, default: 'text' },
			value: {}
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
			isTimeInput() {
				return this.type==='time'
			},
			isDateInput() {
				return this.type==='date'
			}
		},
		methods: {
			handleInput(newValue) {
				this.$emit('input', newValue)
			}
		}
	}
</script>
