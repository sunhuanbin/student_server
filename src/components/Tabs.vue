<template>
  <el-tabs v-model="TabsValue" type="card" closable @tab-click="clickTab" @tab-remove="removeTab">
    <!-- <span slot="label"><i class="el-icon-s-home"></i></span> -->
    <el-tab-pane v-for="item in TabsList" :key="item.name" :label="item.title" :name="item.name" >
      <span slot="label"><i :class='item.icon'></i>{{ item.title }}</span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>

export default {
  data() {
    return {

    }
  },
  components: {
  },
  computed:{
    //选项卡的数据在随时变化，定义在计算属性中
    TabsList:{
      get(){
        return this.$store.state.menus.TabsList;
      },
      set(val){
        this.$store.state.menus.TabsList = val
      },
    },
    TabsValue:{
      get(){
        return this.$store.state.menus.TabsValue
      },
      set(val){
        this.$store.state.menus.TabsValue = val
      }
    }
  },
  methods:{
    clickTab(target){
      this.$router.push({name:target.name},{})
    },
    removeTab(targetName){
      //参数targetName
      //首页不能删除
      if(targetName === 'Index'){
        return
      }
      let Tabs = this.TabsList //取到当前所有选项卡
      let activeName = this.TabsValue //取到当前激活的选项卡

      if(activeName === targetName){
        //删除的正是当前激活的选项卡
        Tabs.forEach((tab,index)=>{
          //数组中当前循环的这个选项卡name等于要删除的选项卡name
          if(tab.name === targetName){
            //下一个默认被激活的选项卡
            let nextTab = Tabs[index + 1] || Tabs[index - 1]
            if(nextTab){
              activeName = nextTab.name //将选项卡设置为激活的选项卡
            }
          }
        })
        //将获得activeName，激活选项卡的名字，赋值回计算属性
        this.TabsValue = activeName

       

      }

      //过滤，如果Tabs选项卡数组中，选项卡的name不是要删除的name
      this.TabsList = Tabs.filter(tab => tab.name !== targetName),
      this.$router.push({name:activeName},{})
    }
  }
}
</script>

<style scoped>
</style>
