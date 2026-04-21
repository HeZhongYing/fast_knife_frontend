import Vue from 'vue'
import VueRouter from 'vue-router'
import Init from '../views/Init.vue'
import Users from '../views/Users.vue'
import Roles from '../views/Roles.vue'
import Permissions from '../views/Permissions.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/init' },
  { path: '/init', component: Init },
  { path: '/users', component: Users },
  { path: '/roles', component: Roles },
  { path: '/permissions', component: Permissions }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
