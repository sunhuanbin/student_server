<template>
  <div>
    <el-form ref='form' :model="form" label-width="80px">
      <el-form-item label="用户名" style="width: 300px;">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="用户密码" style="width: 300px;">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('form')">提交</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        id: '',
        name: '',
        password: ''
      }

    }
  },
  components: {
  },

  methods: {
    submitForm(ForName) {
      this.$refs[ForName].validate((valid) => {
        if (valid) {
          this.$axios.post('/student/login',this.form)
            .then((response) => {
              this.$message({
                showClose: true,
                message: response.data.resultdata,
                type: 'success',
              });
            }).catch((error) => {
              console.log(error)
            })
        }
        else {
          return false
        }
      })
    },

    resetForm(ForName) {
      this.form = {};
    }
  }
}
</script>

<style scoped></style>
