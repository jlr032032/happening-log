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
