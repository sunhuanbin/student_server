import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'


//导入element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import myaxios from '@/api'
import qs from 'qs'

import filters from './filters'

//将axios对象挂载到Vue实例中
//在项目任何组件中，如果要使用axios对象，直接书写：this.$axios.请求方法()
Vue.prototype.$axios = myaxios
Vue.prototype.$qs = qs

//导入common.js中封装的WebStorage的方法
import{
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
}from './common.js'
//挂载
Vue.prototype.$setSessionStorage = setSessionStorage
Vue.prototype.$getSessionStorage = getSessionStorage
Vue.prototype.$removeSessionStorage = removeSessionStorage
Vue.prototype.$getLocalStorage = getLocalStorage
Vue.prototype.$setLocalStorage = setLocalStorage
Vue.prototype.$removeLocalStorage = removeLocalStorage

//注册全局过滤器
//Object.key(遍历对象).forEach(循环代码)
Object.keys(filters).forEach((key,index)=>{
  Vue.filter(key,filters[key])
})

Vue.use(ElementUI)
Vue.config.productionTip = false

//引入mock.js 只要编写这个代码，mock生效，如果注释掉，mock失效
// require('./mock.js')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
