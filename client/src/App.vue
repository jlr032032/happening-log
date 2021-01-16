<template>
	<v-app>
		<template v-if="layout=='layout-0'">
			<v-main>
				<router-view />
			</v-main>
		</template>
		<template v-else-if="layout=='layout-1'">
			<v-app-bar
				app
				dense
				flat
			>
				<v-toolbar-title>Registro de Actividades</v-toolbar-title>
				<template v-slot:extension>
					<v-tabs grow>
					</v-tabs>
				</template>
			</v-app-bar>
			<v-main>
				<router-view />
			</v-main>
		</template>
	</v-app>
</template>

<script>
	export default {
		name: 'App',
		computed: {
			layout() {
				switch(this.$route.path) {
					case '/':
						return 'layout-0'
				}
				return 'layout-0'
			}
		}
	}
</script>
