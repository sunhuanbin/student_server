import Vue from 'vue'
import Vuex from 'vuex'

import menus from './modules/menus'

Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    token:'',
  },
  getters: {
  },
  //调用mutation：this.$store.commit
  mutations: {
    //存储token到Vue中
    SET_TOKEN:(state,tokenValue) => {
      state.token = tokenValue,
      //存储到localStorage
      localStorage.setItem('TOKEN', JSON.stringify(tokenValue))
    },

  },
  actions: {
  },
  modules: {
    //大型项目使用，state中数据很多，可以分类存储到不同的modules
    menus,
  }
})
