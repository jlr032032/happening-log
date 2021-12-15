<template>
	<div class="d-flex align-center justify-center custom--container mx-4">
		<v-card>
			<div class="d-flex align-center pa-4">
				<v-icon
					class="mr-3"
					x-large
				>
					mdi-information-outline
				</v-icon>
				<span>{{ message }}</span>
			</div>
		</v-card>
	</div>
</template>

<script>
	export default {
		props: {
			message: { type: String, default: '' }
		}
	}
</script>

<style>
	.custom--container {
		height: calc(100vh - 162px)
	}
</style>
