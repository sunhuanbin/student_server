<template>
    <el-row>
      <el-col :span="6">
        <h2>欢迎使用影院app后台管理系统</h2>
        <el-image style="width: 180px; height: 180px;" :src="require('@/assets/wanli.jpg')"></el-image>
        <p>万里学院大数据与软件工程学院提供技术支持</p>
        <p>基于Vue+Spring Boot技术实现</p>
      </el-col>
      <el-col :span="1">
        <el-divider direction="vertical"></el-divider>
      </el-col>
      <el-col :span="6">
        <el-form ref="loginForm" :model="loginObject" label-width="80px" label-position="right" :rules="rules">
          <el-form-item label="用户名" style="width: 360px;" prop="username">
            <el-input v-model="loginObject.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" style="width: 360px;" prop="password">
            <el-input v-model="loginObject.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="验证码" style="width: 360px;" prop="code">
            <el-input v-model="loginObject.code" style="width: 150px; float: left;" maxlength="5" placeholder="请输入验证码"></el-input>
            <el-image :src="captchaImg" class="captchaImg" @click="$event => getCaptcha()"></el-image>
          </el-form-item>
          <el-form-item label="">
            
            <el-button type="primary" plain style="float: left; width: 98px;" @click="subject('loginForm')">提交</el-button>
            <el-button type="danger" plain style="float: left;">忘记密码</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
</template>

<script>
export default {
  data() {
    return {
      
      //从java服务器端获得：验证码图片字符串 图片转base码

      //登录对象（登录表单关联对象）
      captchaImg:'',

      //登录对象
      loginObject:{
        key:'',//服务器端存储验证码到redis数据库key
        username:'',
        password:'',
        code:'',
      },
      rules:{
      username:[{required:true,message:'请输入登录的用户名',trigger:'blur'}],
      password:[{required:true,message:'请输入登录密码',trigger:'blur'}],
      code:[{required:true,message:'请输入验证码',trigger:'blur'},
    {min:5,max:5,message:'验证码长度为5个字符',trigger:'blur'}],
    }
    }
  },
  created(){ //生命周期钩子函数，Vue实例创建完毕阶段（请求Java服务器验证码）
    this.getCaptcha();
  },
    methods: {
      //上面表达 ref='loginForm'，在JS代码中可以使用表单定义引用名 获得表单对象。fromName参数中存储的就是loginForm引用名
     subject(fromname){
      this.$refs[fromname].validate((valid)=>{
        if(valid){
          //请求Java服务器进行登录操作：使用axios异步请求（Ajax概念）
          //post请求 post(路径，传递参数)
          //参数可以直接书写this.loginObject. 如果这样传参，Java服务器端就需要接受一个JSON对象
          //假设Java服务器端登录接收一个正常参数，不是一个JSON对象，需要将loginObjevt转换为参数形式
          //使用this.$axios.post('/api/login',this.$qs.stringif(this.loginObject))
          this.$axios.post('/login',this.$qs.stringify(this.loginObject))
          .then((response) => {
            // alert('登录成功')
            const jwt = response.headers['token']
            this.$store.commit('SET_TOKEN',jwt)
            this.$router.push('/')
          }).catch((error)=>{
            console.log(error)
          })
        }
        else{
          return false
        }
      })
     },
     getCaptcha(){
      this.$axios.get('/api/captcha')
      .then((response)=>{
        //获得响应回数据 response.data取到的值就是服务器端返回Result
        this.captchaImg = response.data.resultdata.captchaImg
        this.loginObject.key = response.data.resultdata.key
      }).catch((error)=>{
        console.log(error)
      })
     }
    }
}
</script>

<style scoped>
.el-row{
  background: #fafafa;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;
}
.el-divider{
  height: 200px;
}
.captchaImg{
  float: left;
  margin-left: 10px;
}
</style>
