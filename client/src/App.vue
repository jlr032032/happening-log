<template>
	<v-app>
		<v-main>
			<component :is="layout">
				<router-view />
			</component>
		</v-main>
	</v-app>
</template>

<script>
	export default {
		name: 'App',
		computed: {
			layout() {
				return `${this.$route.meta.layout || 'default'}-layout`
			}
		}
	}
</script>

<style>
	#app {
		background-image: url("assets/background.png");
		background-size: cover;
		background-position-x: center;
		background-position-y: center;
		background-repeat: no-repeat;
	}
	.custom--title-1 {
		font-weight: 700;
		font-size: 1.8rem;
	}
	.custom--title-2 {
		letter-spacing: 0.2rem !important;
		font-size: 1.1rem;
		font-weight: 400;
		text-transform: uppercase;
	}
</style>
