import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store'
// import axios from 'axios'
import myaxios from '@/api'

Vue.use(VueRouter)

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/views/home.vue'),
    children: [
      {
        name: 'Index',
        path: '/index',
        meta: {
          icon: 'el-icon-s-home',
          title: '首页'
        },
        component: () => import('@/views/system/Index.vue')
      },
      {
        name: 'UserCenter',
        path: '/UserCenter',
        meta: {
          icon: 'el-icon-user',
          title: '个人中心'
        },
        component: () => import('@/views/UserCenter.vue')
      }
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login.vue')
  },
  {
    name: 'notfound',
    path: '/notfound',
    component: () => import('@/views/notfound.vue')
  },
  {
    name: 'abc',
    path: '/Abc',
    component: () => import('@/views/data/Abc.vue')
  }
]

const router = new VueRouter({
  routes
})

//路由守卫
router.beforeEach((to, from, next) => {


  //加载菜单数据(加载过的菜单数据，就不用加载了)
  let hasRoute = store.state.menus.hasRoute
  let menus = store.state.menus.menuList
  let token =  JSON.parse(localStorage.getItem('TOKEN'))


  //路由守卫会拦截所有请求，需要对请求路径过滤
  if (to.path == '/login') {
    next() //放行
  } else if (!token) {
    console.log('没有token')
    next({ path: '/login' })
  } else if (to.path == '/' || to.path == '') {
    next({ to: '/index' })
  }
  if (!hasRoute) {
    //得到当前路由配置对象
    let new_routes = router.options.routes
    console.log('加载菜单');
    //hasRoute如果为false，就加载菜单
    myaxios.get('/menu/nav').then(response => {
      //将菜单数据存储到Vuex中
      store.commit('SET_MENULIST', response.data.resultdata.nav)
      //将权限数据存储到Vuex中
      store.commit('SET_PERMLIST', response.data.resultdata.authoritys)

      //TODO:创建路由
      response.data.resultdata.nav.forEach(menu => {
        if (menu.children) {
          //循环二级菜单
          menu.children.forEach(child => {
            let route = menuToRoute(child)
            if (route) {
              //需要将创建路由配置对象，加到当前路由配置当中
              new_routes[0].children.push(route)
            }
          })
        }
      })
      //将配置完毕新 路由配置数组newRoutes,重新放回到router路由对象中
      router.addRoutes(new_routes)
      store.commit('SET_HASROUTE', true)
      next({ path: to.path })//跳转至原本要访问的地址
    }).catch(error => {
      console.log(error)
    })

  } else {
    console.log('菜单和路由配置加载过了')
    next()
  }

})
//封装方法：由菜单数据创建出路由配置对象
const menuToRoute = (child) => {
  if (!child.component) {
    return null
  }
  //创建路由配置对象
  let route = {
    path: child.path,
    name: child.name,
    meta: {
      icon: child.icon,//图标
      title: child.title//菜单标题
    },
    component: () => import('@/views/' + child.component + '.vue')
  }
  return route
}
export default router
