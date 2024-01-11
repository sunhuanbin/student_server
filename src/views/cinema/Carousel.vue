<template>
  <div>
    <!-- 用户管理工具栏 -->
    <el-form ref="searchForm" :model="searchForm" :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.carouselname" placeholder="请输入要搜索的内容"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button @click="" style="margin-left: 20px;">搜索</el-button>
        <el-button type="info" @click="clear1()">清空</el-button>
        <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 10px;">新建</el-button>
        <el-popconfirm title="确认要批量删除这些轮播图信息吗">
          <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
        </el-popconfirm>
      </el-form-item>
    </el-form>

    <!-- 用户对话框 -->
    <el-dialog title="轮播图信息" :visible.sync="dialogFormVisible" width="600px">
      <el-form :model="CarouseForm" ref="CarouseForm" label-width="100px" :rules="CarouseRules">
        <el-form-item label="轮播图图片" label-width="100px">
          <!-- 将本地图片上传到阿里云服务器 -->
          <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false" :on-success="handleAvatarSuccess">
            <img v-if="CarouseForm.avatar" :src="CarouseForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="电影名称" label-width="100px" prop="moviename">
          <el-input v-model="CarouseForm.moviename"></el-input>
        </el-form-item>

        <el-form-item label="状态" label-width="100px" prop="statu">
          <el-radio-group v-model="CarouseForm.statu">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">异常</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="创建时间" required>
          <el-form-item prop="data1">
            <el-date-picker v-model="CarouseForm.data1" type="datetime" placeholder="选择日期时间"></el-date-picker>
          </el-form-item>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitUserForm('CarouseForm')">提交</el-button>
          <el-button @click="resetUserForm('CarouseForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>


    <!-- 用户分页的表格数据显示 -->
    <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}" :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
      <!-- 复选框 -->
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="moviename" label="电影名称" width="200"></el-table-column>

      <el-table-column label="电影海报" width="180">
        <template slot-scope="scope">
          <el-image style="width: 150px; height: 150px" :src="scope.row.avatar" :fit="fit"></el-image>
        </template>
      </el-table-column>

      <el-table-column prop="statu" label="状态" width="90">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.statu === 0" type="danger">异常</el-tag>
          <el-tag size="mini" v-else-if="scope.row.statu === 1" type="success">正常</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="data1" label="创建时间" width="230">
        <template slot-scope="scope">
          {{ scope.row.data1 | fmtDate }}
        </template>
      </el-table-column>

      <el-table-column prop="data2" label="修改时间" width="230">
        <template slot-scope="scope">
          {{ scope.row.data2 | fmtDate }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280px">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editCarouse(scope.row.id)">编辑</el-button>
          <el-popconfirm title="确定要删除该电影海报吗" @confirm="deleteCarouse(scope.row.id)">
            <el-button type="text" size="small" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
export default {
  data() {
    return {
      tableDate:[],
      dialogFormVisible:false,
      deleteAllBtn:true,

      //表单验证
      CarouseRules: {
        moviename: [{ required: true, message: '请输入电影名称', trigger: 'blur' }],
        statu: [{ required: true, message: '请选择电影状态', trigger: 'blur' }],
        data1: [{ required: true, message: '请选择电影上映时间', trigger: 'change' }],
      },

      searchForm:{
        carouselname:'',
      },

      CarouseForm:{
        avatar:'',
        moviename:'',
        statu:0,
        data1:'',
        data2:''
      },

      total:0,
      current:0,
      size:0,
      fit:'',
    }
  },

  created(){
    this.loadCarouseList()
  },
  methods:{

    loadCarouseList(){
      this.$axios.get('/carouse/list',{
        params:{
          name:this.searchForm.moviename, //搜索关键词
          current:this.current, //页码
          size:this.size, //一页显示多少条
        }
      }).then(response =>{
        this.tableDate = response.data.resultdata.records
        this.total = response.data.resultdata.total
        this.size = response.data.resultdata.size
        this.current = response.data.resultdata.current
      }).catch(e=>{console.log(e);})
    },

    //重置新建菜单
    resetUserForm(ForName) {
      this.$refs[ForName].resetFields();
    },

    //提交
    submitUserForm(ForName) {
      this.$refs[ForName].validate((valid) => {
        if (valid) {

        } else {
          return false
        }
      })
    },

    //编辑电影海报的方法
    editCarouse(id){
      //TOOD:使用菜单编号id请求Java服务器进行查询，获得要编辑的菜单对象，将数据回显到编辑菜单对话框中
      this.dialogFormVisible = true
    },

    //删除电影海报的方法：
    deleteCarouse(id){
      //TODO:使用菜单编号id 请求Java服务器端，进行菜单数据删除
      console.log('电影删除成功');
    },


    handleAvatarSuccess(response, file) {
      //上传成功，从响应对象中获得上传图片在服务器的地址
      this.CarouseForm.avatar = response.data
    },

    clear1() {
        this.searchForm.carouselname = ''
    },

    //选中表格中 复选框触发事件
    selectionChange(value){
      //value参数，就是复选框 对应这一行的参数
      this.selection = value
      if(this.selection){
        this.deleteAllBtn = (this.selection.length === 0)
      }
    },
  },
  components: {
  }
}
</script>

<style scoped>
.avatar-uploader {
  border: 1px solid #aeaeae;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 150px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #aeaeae;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}
</style>
