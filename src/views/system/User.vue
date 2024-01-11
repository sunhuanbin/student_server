<template>
  <div>
    <!-- 用户管理工具栏 -->
    <el-form ref="searchForm" :model="searchForm" :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.username" placeholder="请输入要搜索的用户名称"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button @click="loadUserList()">搜索</el-button>
        <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 10px;">新建</el-button>
        <el-popconfirm title="确认要批量删除这些用户信息吗">
          <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
        </el-popconfirm>
      </el-form-item>
    </el-form>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogRoleFormVisible" width="600px" @close="resetRoleForm()">
      <el-form :model="UserRoleForm" ref="UserRoleForm">
        <el-tree show-checkbox :data="roleTreeData" ref="roleTree" node-key="id" :props="defaultProps"
          :default-expand-all="true" :check-strictly="true">
        </el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRoleForm('UserRoleForm')">保存分配角色</el-button>
        <el-button @click="resetRoleForm('UserRoleForm')">重置</el-button>
      </div>

    </el-dialog>


    <!-- 用户对话框 -->
    <el-dialog title="用户信息" :visible.sync="dialogFormVisible" width="600px" @closed="resetUserForm('UserForm')">
      <el-form :model="UserForm" ref="UserForm" label-width="100px" :rules="UserRules">
        <el-form-item label="用户头像" label-width="100px">
          <!-- 将本地图片上传到阿里云服务器 -->
          <el-upload class="avatar-uploader" :action="'/sys/oss/upload'" :show-file-list="false"
            :on-success="handleAvatarSuccess" :headers="headers">
            <img v-if="UserForm.avatar" :src="UserForm.avatar" class="avatar" :fit="fit">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="用户名称" label-width="100px" prop="username">
          <el-input v-model="UserForm.username"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" label-width="100px" prop="email">
          <el-input v-model="UserForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机号" label-width="100px" prop="tel">
          <el-input v-model="UserForm.tel"></el-input>
        </el-form-item>

        <el-form-item label="用户状态" label-width="100px" prop="statu">
          <el-radio-group v-model="UserForm.statu">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitUserForm('UserForm')">提交</el-button>
          <el-button @click="resetUserForm('UserForm')">重置</el-button>
        </el-form-item>

      </el-form>
    </el-dialog>

    <!-- 用户分页的表格数据显示 -->
    <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border
      default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}" :cell-style="{ padding: '2px' }"
      @selection-change="selectionChange">
      <!-- 复选框 -->
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column label="用户头像" width="80">
        <template slot-scope="scope" style="text-align: center;">
          <el-avatar size="small" :src="scope.row.avatar" :fit="fit"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名称" width="120"></el-table-column>
      <el-table-column label="角色" width="200">
        <template slot-scope="scope">
          <el-tag v-for="(role, index) in scope.row.roles" :key="role.id" style="margin-left: 2px;">
            {{ role.name }}
          </el-tag>
        </template>

      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="tel" label="电话号码" width="140"></el-table-column>
      <el-table-column prop="type" label="用户状态" width="90">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.statu === 0" type="danger">禁用</el-tag>
          <el-tag size="mini" v-else-if="scope.row.statu === 1" type="success">正常</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created | fmtDate }}
        </template>
      </el-table-column>





      <el-table-column fixed="right" label="操作" width="280px">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editUser(scope.row.id)">编辑</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-popconfirm title="确定要重置该用户的密码吗" @confirm="resetPassword(scope.row.id, scope.row.username)">
            <el-button type="text" size="small" slot="reference">重置密码</el-button>
          </el-popconfirm>
          <el-divider direction="vertical"></el-divider>

          <el-button type="text" size="small" @click="editRoleMethod(scope.row.id)">分配角色</el-button>
          <el-divider direction="vertical"></el-divider>

          <el-popconfirm title="确定要删除该用户数据吗" @confirm="deleteUser(scope.row.id)">
            <el-button type="text" size="small" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页页码 -->
    <el-pagination background layout="prev, pager, next,sizes,total,jumper" :total="total" :page-size="size"
      :page-sizes="[3, 6, 9, 12, 15]" :current-page="current" @size-change="sizeChangeHandler"
      @current-change="currentChangeHandler">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fit: 'scale-down',
      tableDate: [],
      deleteAllBtn: true, //不可用
      //表单验证
      UserRules: {
        username: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
        email: [{ required: true, message: '请输入用户邮箱', trigger: 'blur' }],
        tel: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        statu: [{ required: true, message: '请选择用户状态', trigger: 'blur' }]
      },


      UserForm: {
        avatar: '',//用户图片地址
        username: '',
        email: '',
        tel: '',
        statu: 0,
      },
      UserRoleForm: {}, //用户分配角色对话框表单对象
      roleTree: [],
      headers: {
        //之前所有的请求操作都是使用axios，全局配置，所有axios都会自动加上，token请求头
        //目前图片的上传，使用的是上传组件，:action="/oss/upload"并不使用axios，所以没有token。
        token: JSON.parse(localStorage.getItem('TOKEN'))
      },

      current: 1,//页码
      size: 3,//一页显示记录数
      total: 0,//总共有几条记录
      selection: [],

      deleteAllBtnStu: true,
      dialogFormVisible: false,
      dialogRoleFormVisible: false,
      roleTreeData: [],
      searchForm: {
        username: '',//搜索关键词
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },

    }
  },
  created() {
    this.loadUserList()

    this.$axios.get('/role/tree').then(response => {
      this.roleTreeData = response.data.resultdata
    }).catch(e => {
      console.log(e)
    })
  },

  methods: {
    //分配角色按钮事件执行方法
    editRoleMethod(id) {
      this.$axios.get('/user/info/' + id).then(response => {
        let user = response.data.resultdata;
        this.UserRoleForm = user;
        //以及用户所具备的角色信息
        let roleIds = [];
        user.roles.forEach(role => {
          roleIds.push(role.id)
        });
        this.$refs.roleTree.setCheckedKeys(roleIds); //选中树形控件，用户具备角色
      }).catch(e => {
        console.log(e);
      })
      this.dialogRoleFormVisible = true;
    },

    //提交分配角色表单
    submitRoleForm(ForName) {
      //获得tree控件中设置的角色id
      let roleIds = this.$refs.roleTree.getCheckedKeys();

      this.$axios.post('/user/role/' + this.UserRoleForm.id, roleIds).then(response => {
        this.$message({
          showClose: true,
          message: response.data.resultdata,
          type: 'success',

        });
        this.loadUserList()//重新加载角色信息
        this.dialogRoleFormVisible = false
      }).catch(e => {
        console.log(e)
      })
    },

    //重置分配角色表单
    resetRoleForm(ForName) {
      this.$refs.roleTree.setCheckedKeys([]);
      this.UserRoleForm = {}
      if (this.$refs[ForName] != undefined) {
        this.$refs[ForName].resetFields();
      }
    },

    handleAvatarSuccess(response, file) {
      //上传成功，从响应对象中获得上传图片在服务器的地址
      this.UserForm.avatar = response.resultdata
    },

    //赋予权限


    //修改一页显示的记录数
    sizeChangeHandler(val) {
      this.size = val;
      this.loadUserList();

    },


    //点击页面
    currentChangeHandler(val) {
      this.current = val;
      //当前页码已经改变，重新发起请求。
      this.loadUserList();
    },

    //编辑用户的方法
    editUser(id) {
      //TOOD:使用菜单编号id请求Java服务器进行查询，获得要编辑的菜单对象，将数据回显到编辑菜单对话框中
      this.$axios.get('/user/info/' + id).then(response => {
        this.UserForm = response.data.resultdata
        this.dialogFormVisible = true;
      }).catch(e => {
        console.log(e)
      })
    },

    //重置密码
    resetPassword(id, username) {
      this.$confirm('重置用户【' + username + '】的密码，是否继续执行该操作', '重置密码提示', {
        confirmButtonText: '执行',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //点击消息框，执行按钮，执行代码
        this.$axios.post('/user/repass/' + id).then(response => {
          this.$message({
            showClose: true,
            message: response.data.resultdata,
            type: 'success',
            onClose: () => {
              this.loadUserList();//重新加载角色信息
            }
          });
        }).catch(e => {
          console.log(e)
        })
      })
    },

    //删除用户的方法：
    deleteUser(id) {
      //TODO:使用菜单编号id 请求Java服务器端，进行菜单数据删除
      console.log('用户删除成功');
    },

    loadUserList() {
      this.$axios.get('/user/list', {
        params: {
          name: this.searchForm.username, //搜索关键词
          current: this.current, //页码
          size: this.size, //一页显示多少条
        }
      }).then(response => {
        this.tableDate = response.data.resultdata.records
        this.total = response.data.resultdata.total
        this.size = response.data.resultdata.size
        this.current = response.data.resultdata.current
      }).catch(e => { console.log(e); })
    },

    //新建或编辑用户表单提交
    submitUserForm(ForName) {
      this.$refs[ForName].validate((valid) => {
        if (valid) {
          this.$axios.post('/user/' + (this.UserForm.id ? 'update' : 'save'), this.UserForm).then(response => {
            this.$message({
              showClose: true,
              message: response.data.resultdata,
              type: 'success',
            });
            this.loadUserList();
            this.resetUserForm(ForName);
            this.dialogFormVisible = false;
          }).catch(e => {
            console.log(e);
          })
        } else {
          return false
        }
      })
    },
    //重置新建菜单
    resetUserForm(ForName) {
      if (this.$refs[ForName] != undefined) {
        this.$refs[ForName].resetFields();
      }
      this.UserForm = {};
    },


    //选中表格中 复选框触发事件
    selectionChange(value) {
      //value参数，就是复选框 对应这一行的参数
      this.selection = value
      if (this.selection) {
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

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
