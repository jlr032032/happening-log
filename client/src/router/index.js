import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{ path: '/', component: () => import('@/views/Signin') },
	{
		path: '/perfil',
		component: () => import('@/views/Profile'),
		meta: { layout: 'toolbar', title: 'Perfil' }
	},
	{
		path: '/etiquetas',
		component: () => import('@/views/Labels'),
		meta: { layout: 'toolbar', title: 'Etiquetas' }
	},
	{
		path: '/hechos',
		component: () => import('@/views/Facts'),
		meta: { layout: 'toolbar', title: 'Hechos' }
	},
	{
		path: '/hechos/:id',
		component: () => import('@/views/Fact'),
		meta: { layout: 'toolbar', title: 'Hechos' }
	}
]

const router = new VueRouter({
	routes
})

export default router
