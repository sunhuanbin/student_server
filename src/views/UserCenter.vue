<template>
  <div style="text-align: center;">
    <h2>您好，{{userInfo.username}} </h2>
    <el-form ref="passForm" :model="passForm" label-width="100px" :rules="rules">
      <el-form-item label="旧密码" prop="currentPass">
        <el-input type="password" v-model="passForm.currentPass"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input type="password" v-model="passForm.password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model="passForm.checkPass"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="SubmitPassForm('passForm')">提交</el-button>
        <el-button type="primary" @click="resetForm('passForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    //自定义验证，验证确认密码必须和密码一样
    var validatePass = (rule, value, callback) => {
      //value就是确认密码
      if (value == '') {
        callback(new Error('请在此输入确认密码')) //callback()失败，回调验证失败
      } else if (value != this.passForm.password) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback();
      }
    }
    return {
      userInfo:{},
      passForm: {
        password: '',
        checkPass: '',
        currentPass: '',
      },
      rules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度在6到12位个字符', trigger: 'blur' }
        ],
        checkPass: [
          //validator指定使用自定义验证规则
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        currentPass: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ]
      }
    }
  },
  created(){
    this.getUserINfo();
    //生命周期钩子函数
  },
  methods: {
    SubmitPassForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {

        } else {
          return false
        }
      })
    },
    //充值修改密码表单
    resetForm(formName) {
      this.$refs[formName].resetFidlds();
    },
    getUserINfo(){
      this.$axios.get('/api/userinfo').then(response => {
        this.userInfo = response.data.resultdata
      })
    },
  },
  components: {
  }
}
</script>

<style scoped>
.el-form {
  width: 420px;
  margin: 50px auto;
}
</style>
