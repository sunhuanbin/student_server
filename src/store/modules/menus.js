//创建了一个新的modules,它的结构同Vuex是一样的
import Vue from "vue";
import Vuex from 'vuex';

Vue.use(Vuex)

export default{
  state:{
    hasRoute:false,
    menuList:[],
    permList:[],

    //存储选项卡数组：点击菜单触发路由，动态添加一个新的选项卡到数组
    //选项卡，默认有一个首页
    TabsList:[
      {
        title:'首页',
        name:'Index',
        icon:'el-icon-s-home',
      }
    ],
    //记录选项卡激活下标
    TabsValue:'Index',//选项卡数组中，默认被激活的是“首页”
  },
  //调用mutation：this.$store.commit
  mutations: {
    //存储菜单的方法
    SET_MENULIST:(state,menus) => {
      //将菜单存入到sessionStorage
      sessionStorage.setItem("menuList",JSON.stringify(menus))
      state.menuList = menus
    },
    //存储权限的方法
    SET_PERMLIST:(state,authoritys) =>{
      state.permList = authoritys
    },
    //修改hasRoute值的方法
    SET_HASROUTE:(state,hasRoute) => {
      state.hasRoute = hasRoute
    },
    //添加选项卡到TabsList 数组中
    ADD_TABS:(state,tab)=>{
      //判断新选项卡是否已经存在,如果存在，找到下标
      let index = state.TabsList.findIndex(item=>item.name === tab.name)

      if(index === -1){
        state.TabsList.push(tab) //添加新的选项卡到数组中
      }

      //激活当前选项卡
      state.TabsValue = tab.name
    },
    //设置当前激活的选项卡 标识(tabName)
    SET_ACTIVE_TAB:(state,tabName)=>{
      state.TabsValue = tabName
    }
  },
  actions: {
  },
  modules: {
  }
}
