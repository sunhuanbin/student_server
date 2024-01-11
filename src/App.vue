<template>
  <router-view></router-view>
</template>

<script>
export default {
  watch:{
    //监听路由，浏览器刷新（直接从路由对象取出选项卡数据，创建一个选项卡）
    $route(to,from){
      if(to.path !== '/login' && to.path != '/'){
        let tab = {
          icon: to.meta.icon,
          name:to.name,
          title:to.meta.title,
        }

        this.$store.commit('ADD_TABS',tab);
      }
    }
  },
  data() {
    return {
      num:0
    }
  },
  beforeCreate(){
    console.log('创建之前钩子函数');
  },
  created() {
    console.log('created创建完毕');
  },
  beforeMount(){
    console.log('brforeMount挂载之前');
  },
  mounted(){
    console.log('mounted挂载完毕');
  },
  beforeUpdate() {
    console.log('beforeUpdate数据更新之前')    
  },
  updated(){
    console.log('update数据更新完毕')
  },
  beforeDestroy() {
    console.log('beforeDestroy')
  },
  destroyed(){
    console.log('destroy数据销毁完毕')
  },
  methods:{
    add1(){
      this.num += 1
    }
  },
}
</script>
<style>
*{
  padding: 0;
  margin: 0;
}
html,body{
  height: 100%;
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-family: 'Microsoft Yahei';
  color: '#494949';
  text-align: left;
}
</style>
