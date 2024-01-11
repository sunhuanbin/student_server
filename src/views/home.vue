<template>
  <el-container>
    <el-aside width="201px">
      <NavMenu></NavMenu>
    </el-aside>
      <el-container>
        <el-header>
          <strong>AdminSystem影院后台管理系统</strong>
          <div class="header-avatar">
            <el-avatar :src="userInfo.avatar"></el-avatar>
            <el-dropdown>
              <span class="el-dropdown-link">
                {{userInfo.username}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <router-link :to="{name:'UserCenter'}" style="text-decoration: none;">个人中心</router-link>
                </el-dropdown-item>
                <el-dropdown-item @click.native="logout()">退出系统</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
      <el-main>
        <!-- 子路由出口 -->
        <Tabs/>
        <div style="margin: 0 15px;">
          <router-view></router-view>
        </div>
        
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import NavMenu from '@/components/NavMenu'
import Tabs from '@/components/Tabs.vue';
export default {
  data() {
    return {
      //登录之后，存储用户登录信息:头像、用户名
      userInfo:{
        id:'',
        username:'Root',
        avatar:require('@/assets/logo.png'),

      }

    }
  },
  created(){
    this.getUserINfo();
    //生命周期钩子函数
  },
  methods:{
    getUserINfo(){
      this.$axios.get('/api/userinfo').then(response => {
        this.userInfo = response.data.resultdata
      })
    },
    logout(){ 
      //SpringSecurity会拦截/login 和/logout
      this.$axios.get('/logout').then(response=>{
        //清除vuex中存储的token
        this.$store.commit('SET_TOKEN','');
        //清除localStorage
        sessionStorage.clear();
        localStorage.clear();
        //退出成功，重新跳转会登录页面
        this.$router.push('/login')
      }).catch(e=>{
        console.log(e)
      })
    }
  },
  components: {
    NavMenu,Tabs
  }
}
</script>

<style scoped>
.el-container{
  padding: 0;
  margin: 0;
  height: 100%;

}

.el-header{
  background-image: linear-gradient(to left, #409EFF,aqua);
  color: #333;
  text-align: left;
  line-height: 60px;
}
.el-aside{
  background-image: linear-gradient(to left, pink,aqua);
}
.el-main{
  color: #333;
  padding: 0;
}
.header-avatar{
  float: right;
  width: 110px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.el-dropdown-link{
  cursor: pointer;
}
</style>
