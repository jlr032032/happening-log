import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'

const routes = [
	{ path: '/', component: () => import('@/views/Signin') },
	{
		path: '/perfil',
		component: () => import('@/views/Profile'),
		meta: { layout: 'toolbar', title: 'Perfil' },
		beforeEnter: loginRequiredGuard
	},
	{
		path: '/etiquetas',
		component: () => import('@/views/Labels'),
		meta: { layout: 'toolbar', title: 'Etiquetas' },
		beforeEnter: loginRequiredGuard
	},
	{
		path: '/sucesos',
		component: () => import('@/views/Happenings'),
		meta: { layout: 'toolbar', title: 'Sucesos' },
		beforeEnter: loginRequiredGuard
	},
	{
		path: '/sucesos/:id',
		component: () => import('@/views/Happening'),
		meta: { layout: 'toolbar', title: 'Sucesos' },
		beforeEnter: loginRequiredGuard
	},
	{
		path: '/sucesos/:id/registros',
		component: () => import('@/views/Records'),
		meta: { layout: 'toolbar', title: 'Registros' },
		beforeEnter: loginRequiredGuard
	}
]

function loginRequiredGuard(to, from, next) {
	store.getters.signedIn ? next() : next('/')
}

Vue.use(VueRouter)
export default new VueRouter({ routes })
