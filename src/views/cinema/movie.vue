<template>
  <div>
    <!-- 用户管理工具栏 -->
    <el-form ref="searchForm" :model="searchForm" :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.moviename" placeholder="请输入要搜索的内容"></el-input>
      </el-form-item>
      <el-form-item label="">
        <label style="margin-right: 10px;">添加时间</label>
        <el-date-picker v-model="value1" type="monthrange" range-separator="至" start-placeholder="开始月份"
          end-placeholder="结束月份"></el-date-picker>
        <el-button @click="" style="margin-left: 20px;">搜索</el-button>
        <el-button type="info" @click="clear1()">清空</el-button>
        <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 10px;">新建</el-button>
        <el-popconfirm title="确认要批量删除这些电影信息吗">
          <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
        </el-popconfirm>
      </el-form-item>
    </el-form>


    <!-- 用户对话框 -->
    <el-dialog title="电影信息" :visible.sync="dialogFormVisible" width="600px">
      <el-form :model="MovieForm" ref="MovieForm" label-width="100px" :rules="MovieRules">
        <el-form-item label="电影图片" label-width="100px">
          <!-- 将本地图片上传到阿里云服务器 -->
          <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false"
            :on-success="handleAvatarSuccess">
            <img v-if="MovieForm.avatar" :src="MovieForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="电影名称" label-width="100px" prop="moviename">
          <el-input v-model="MovieForm.moviename"></el-input>
        </el-form-item>


        <el-form-item label="电影类型" prop="type">
          <el-select v-model="MovieForm.type" clearable placeholder="请选择电影类型">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="电影地区" label-width="100px" prop="area">
          <el-input v-model="MovieForm.area"></el-input>
        </el-form-item>

        <el-form-item label="电影时长" label-width="100px" prop="time">
          <el-input v-model="MovieForm.time"></el-input>
        </el-form-item>

        <el-form-item label="电影状态" label-width="100px" prop="statu">
          <el-radio-group v-model="MovieForm.statu">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上映时间" required>
          <el-form-item prop="date1">
            <el-date-picker type="date" placeholder="选择日期" v-model="MovieForm.date1"
              style="width: 100%;"></el-date-picker>
          </el-form-item>
        </el-form-item>

        <el-form-item label="电影简介" label-width="100px" prop="synopsis">
          <el-input v-model="MovieForm.synopsis"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitUserForm('MovieForm')">提交</el-button>
          <el-button @click="resetUserForm('MovieForm')">重置</el-button>
        </el-form-item>

      </el-form>
    </el-dialog>

    <!-- 用户分页的表格数据显示 -->
    <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}" :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
      <!-- 复选框 -->
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column label="电影封面" width="150">
        <template slot-scope="scope">
          <el-image style="width: 150px; height: 150px" :src="scope.row.avatar" :fit="fit"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="moviename" label="电影名称" width="120"></el-table-column>
      <el-table-column prop="type" label="类型" width="120"></el-table-column>

      <el-table-column prop="statu" label="状态" width="90">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.statu === 0" type="danger">下架</el-tag>
          <el-tag size="mini" v-else-if="scope.row.statu === 1" type="success">上架</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="area" label="地区" width="120"></el-table-column>
      <el-table-column prop="time" label="电影时长" width="120"></el-table-column>

      <el-table-column prop="data1" label="创建时间" width="200">
        <template slot-scope="scope">
          {{ scope.row.data1 | fmtDate }}
        </template>
      </el-table-column>

      <el-table-column label="评分" prop="start">
        <template slot-scope="scope">
          <el-rate v-if="scope.row.start > 0" v-model="scope.row.start" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
          <label v-else>暂无评分</label>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="280px">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editMovie(scope.row.id)">编辑</el-button>
          <el-popconfirm title="确定要删除该电影数据吗" @confirm="deleteMovie(scope.row.id)">
            <el-button type="text" size="small" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页页码 -->
    <el-pagination background layout="prev, pager,next,sizes,total,jumper" :total="total" :page-size="size" :page-sizes="[5,10,15,20,25]" :current-page="current" @size-change="sizeChangeHandler" @current-change="currentChangeHandler">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableDate:[],

      options: [{
        value: '选项1',
        label: '动作片'
      }, {
        value: '选项2',
        label: '爱情片'
      }, {
        value: '选项3',
        label: '动画片'
      }, {
        value: '选项4',
        label: '科幻片'
      }, {
        value: '选项5',
        label: '言情片'
      }, {
        value: '选项6',
        label: '恐怖片'
      }, {
        value: '选项7',
        label: '喜剧片'
      }
      ],


      value1: '',
      

      dialogFormVisible: false,
      deleteAllBtn: true,

      searchForm: {
        moviename: '',
      },

      MovieForm: {
        moviename: '',
        avatar: '',
        area: '',
        time: '',
        statu: 0,
        type: '',
        synopsis: '',
        date1: '',
        start:3.7,
      },
      total:0,
      current:0,
      size:0,
      fit:'',

      //表单验证
      MovieRules: {
        moviename: [{ required: true, message: '请输入电影名称', trigger: 'blur' }],
        email: [{ required: true, message: '请输入用户邮箱', trigger: 'blur' }],
        time: [{ required: true, message: '请输入电影时长', trigger: 'blur' }],
        statu: [{ required: true, message: '请选择电影状态', trigger: 'blur' }],
        type: [{ required: true, message: '请选择电影类型', trigger: 'change' }],
        area: [{ required: true, message: '请输入电影地区', trigger: 'blur' }],
        date1: [{ required: true, message: '请选择电影上映时间', trigger: 'change' }],
      },

    }
  },
  created(){
    this.loadMovieList()
  },

  methods: {
    handleAvatarSuccess(response, file) {
      //上传成功，从响应对象中获得上传图片在服务器的地址
      this.UserForm.avatar = response.data
    },

    clear1() {
      this.value1 = '',
        this.searchForm.moviename = ''
    },
    //编辑电影的方法
    editMovie(id){
      //TOOD:使用菜单编号id请求Java服务器进行查询，获得要编辑的菜单对象，将数据回显到编辑菜单对话框中
      this.dialogFormVisible = true
    },

    //删除电影的方法：
    deleteMovie(id){
      //TODO:使用菜单编号id 请求Java服务器端，进行菜单数据删除
      console.log('电影删除成功');
    },

    //修改一页显示的记录数
    sizeChangeHandler(){

    },


    //点击页面
    currentChangeHandler(){

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

    loadMovieList(){
      this.$axios.get('/movie/list',{
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
