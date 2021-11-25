<template>
	<div>
		<v-toolbar
			color="primary"
			dark
			class="px-2"
		>
			<v-app-bar-nav-icon @click="menu = true"/>
			<v-spacer />
			<v-toolbar-title>{{ $route.meta.title }}</v-toolbar-title>
		</v-toolbar>

		<slot></slot>

		<v-navigation-drawer
			v-model="menu"
			absolute
			mobile-breakpoint="99999"
		>
			<v-list
				nav
				class="mt-6"
			>
				<v-list-item
					v-for="(link, index) in links"
					:key="index"
					link
					:to="link.path"
					active-class="primary--text"
				>
					<v-list-item-icon>
						<v-icon>{{ link.icon }}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title>{{ link.text }}</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				<v-list-item @click="signOut">
					<v-list-item-icon>
						<v-icon> mdi-logout </v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title> Cerrar sesión </v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
	</div>
</template>

<script>
	import { mapMutations } from 'vuex'
	import requester from '@/helpers/requester'
	export default {
		name: 'Toolbar',
		data: () => ({
			menu: false,
			links: [
				{ icon: 'mdi-clipboard-text-multiple', text: 'Sucesos', path: '/sucesos' },
				{ icon: 'mdi-label-multiple', text: 'Etiquetas', path: '/etiquetas' },
				{ icon: 'mdi-account', text: 'Perfil', path: '/perfil' }
			]
		}),
		methods: {
			...mapMutations(['setSignedIn']),
			async signOut() {
				const response = await requester.delete('/auth/token')
				if ( response ) {
					switch ( response.status ) {
						case 204:
							this.setSignedIn(false)
							this.$router.push('/')
							break
						default:
							this.$showErrorDialog()
					}
				} else {
					this.$showErrorDialog()
				}
			}
		}
	}
</script>