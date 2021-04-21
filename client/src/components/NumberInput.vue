<template>
	<v-menu :close-on-content-click="false">
		<template v-slot:activator="{ attrs, on }">
			<v-text-field
				dense
				readonly
				v-bind="attrs"
				v-on="on"
				:value="formattedValue"
				@click="focusActualInput"
			/>
		</template>
		<template v-slot:default>
			<v-card
				elevation="0"
			>
				<v-card-text class="pb-0 pt-1">
					<v-text-field
						dense
						type="number"
						clearable
						ref="actualInput"
						:value="value_"
						@input="setValue"
					/>
				</v-card-text>
			</v-card>
		</template>
	</v-menu>
</template>

<script>
	export default {
		name: 'NumberInput',
		props: {
			value: Number
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		data: () => ({
			value_: null
		}),
		created() {
			if ( this.value ) {
				this.value_ = this.value
			}
		},
		watch: {
			value(newValue) {
				this.value_ = newValue
			}
		},
		computed: {
			formattedValue() {
				if ( typeof this.value_==='number' ) {
					return Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(this.value_)
				}
				return null
			}
		},
		methods: {
			focusActualInput() {
				setTimeout( () => this.$refs.actualInput.focus(), 200 )
			},
			setValue(newValue) {
				newValue = newValue ? Number(newValue) : null
				if ( newValue!==this.value_ ) {
					this.value_ = newValue
					this.$emit('input', newValue)
				}
			}
		}
	}
</script>
