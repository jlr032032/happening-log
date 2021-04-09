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
	}
]

const router = new VueRouter({
	routes
})

export default router
