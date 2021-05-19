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
		font-weight: 700 !important;
		font-size: 1.8rem !important;
	}
	.custom--title-2 {
		letter-spacing: 0.2rem !important;
		font-size: 1.1rem !important;
		font-weight: 400 !important;
		text-transform: uppercase !important;
	}
	.custom--title-3 {
		letter-spacing: 0.2rem !important;
		font-size: 0.92rem !important;
		font-weight: 400 !important;
		text-transform: uppercase !important;
	}
	.custom--title-4 {
		letter-spacing: 0.2rem !important;
		font-size: 0.83rem !important;
		font-weight: 300 !important;
		text-transform: uppercase !important;
	}
	.custom--no-data-text {
		color: #616161;
		font-style: italic;
	}
	.custom--main-fab {
		position: fixed !important;
		bottom: 0 !important;
		right: 0 !important;
		margin: 0 25px 25px 0 !important;
	}
	.custom--with-fixed-buttons {
		margin-bottom: 106px !important;
	}
	.custom--go-back-button {
		position: fixed !important;
		bottom: 25px;
		left: 25px;
	}
	.custom--full-width {
		width: 100% !important;
	}
	.custom--filter-type-chip {
		color: var(--v-primary-base) !important;
		background-color: transparent !important;
		border: solid 1px var(--v-primary-base) !important;
	}
	.custom--filter-type-active-chip {
		color: white !important;
		background-color: var(--v-primary-base) !important;
		border: none !important;
	}
</style>
