<template>
  <div>
    <!-- 角色管理 工具栏 -->
    <el-form ref="searchForm" :model="searchForm" :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.name" placeholder="请输入要搜索的角色名称"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button @click="loadRoleList()">搜索</el-button>
        <el-button type="primary" @click="dialogFormVisible=true" style="margin-right: 10px;">新建</el-button>
        <el-popconfirm title="确认要批量删除这些角色信息吗" @confirm="deleteRole()">
          <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
        </el-popconfirm>
      </el-form-item>
    </el-form>
    <!-- 角色对话框 -->
    <el-dialog title="角色信息" :visible.sync="dialogFormVisible" width="550px" @closed="resetRoleForm('RoleForm')">
      <el-form :model="RoleForm" ref="RoleForm" label-width="100px" :rules="RoleRules">
        <el-form-item label="角色名称" label-width="100px" prop="name">
          <el-input v-model="RoleForm.name"></el-input>
        </el-form-item>

        <el-form-item label="角色编码" label-width="100px" prop="code">
          <el-input v-model="RoleForm.code"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" label-width="100px" prop="remark">
          <el-input v-model="RoleForm.remark"></el-input>
        </el-form-item>

        <el-form-item label="角色状态" label-width="100px" prop="statu">
          <el-radio-group v-model="RoleForm.statu">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitRoleForm('RoleForm')">提交</el-button>
          <el-button @click="resetRoleForm('RoleForm')">重置</el-button>
        </el-form-item>

      </el-form>
    </el-dialog>

    <!-- 角色分配权限对话框 -->
    <el-dialog title="权限信息" :visible.sync="dialogPermFormVisible" width="600px" @closed="resetPermForm('PermFrom')">
      <el-form :model="PermFrom" ref="PermFrom" label-width="100px">
        <el-tree show-checkbox :data="perTreeData" ref="permTree" node-key="id" :props="defaultProps" :default-expand-all="true" :check-strictly="true"></el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPerForm('PermFrom')">保存权限</el-button>
        <el-button @click="resetPermForm('PermFrom')">重置</el-button>
      </div>
    </el-dialog>
    <!-- 角色分页的表格数据显示 -->
    <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}" :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
      <!-- 复选框 -->
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="name" label="角色名称" width="200"></el-table-column>
      <el-table-column prop="code" label="角色编码" width="150"></el-table-column>
      <el-table-column prop="remark" label="角色描述" width="500"></el-table-column>
      <el-table-column prop="type" label="角色状态" width="90">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.statu === 0" type="danger">禁用</el-tag>
          <el-tag size="mini" v-else-if="scope.row.statu === 1" type="success">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editRole(scope.row.id)">编辑</el-button>
          <el-button type="text" size="small" @click="premsHandler(scope.row.id)">分配权限</el-button>&nbsp;
          <el-popconfirm title="确定要删除该角色数据吗" @confirm="deleteRole(scope.row.id)">
            <el-button type="text" size="small" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页页码 -->
    <el-pagination background layout="prev, pager, next,sizes,total,jumper"
      :total="total" :page-size="size"
      :page-sizes="[1,3,6,9,12]" :current-page="current" @size-change="sizeChangeHandler" @current-change="currentChangeHandler">
      </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deleteAllBtn:true, //不可用
      tableDate:[],
      //表单验证
      RoleRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
        remark: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
        statu: [{ required: true, message: '请选择角色状态', trigger: 'blur' }]
      },

      //新建/编辑角色对话框是否显示
      dialogFormVisible:false,

      //分配角色权限信息对话框是否显示
      dialogPermFormVisible:false,
      //工具栏搜索框的表单对象
      searchForm:{
        name:'', //可以按照角色名字进行搜索
      },

      //新建/编辑角色对户口对象
      RoleForm:{
          name:'', //角色名称
          code:'', //角色编码
          remark:'', //角色描述
          statu:0,//角色状态
        },

      PermFrom:{}, //角色分配权限的表单对象
      perTreeData:[], //角色权限菜单数组（Tree结构）
      current:1,//页码
      size:1,//一页显示记录数
      total:0,//总共有几条记录
      selection:[],
      defaultProps:{
        children:'children',
        label:'name',
      },
    }
  },
  created(){
    this.loadRoleList()
  },
  methods:{
    //修改一页显示的记录数
    sizeChangeHandler(val){
      this.size = val;
      this.loadRoleList();

    },


    //点击页码切换页面
    currentChangeHandler(val){
      this.current = val;
      //当前页码已经改变，重新发起请求
      this.loadRoleList();
    },

    //编辑角色的方法
    editRole(id){
      //TOOD:使用菜单编号id请求Java服务器进行查询，获得要编辑的菜单对象，将数据回显到编辑菜单对话框中
      //请求服务器端，通过角色id查询该角色的详细信息，在对话框中进行回显
      this.$axios.get("/role/info/"+id)
      .then(response=>{
        this.RoleForm = response.data.resultdata
        this.dialogFormVisible =true
      }).catch(e=>{
        console.log(e);
      })
    },

    //删除角色的方法：
    deleteRole(id){
      //TODO:使用菜单编号id 请求Java服务器端，进行菜单数据删除
      var roleIds = []; //存储要删除的所有的角色id
      id?roleIds.push(id):this.selection.forEach(role=>{
        roleIds.push(role.id)
      });
      this.$axios.post('/role/delete',roleIds).then(response=>{
        this.$message({
              showClose:true,
              message:response.data.resultdata,
              type:'success',
              onClose:()=>{
                this.loadRoleList(); //重新加载角色信息
              }
            });
      }).catch(e=>{
        console.log(e);
      })

      console.log('角色删除成功');
    },

    //赋予权限
    premsHandler(id){

    },

    //请求Java服务器获得所有的角色信息
    loadRoleList(){
      this.$axios.get('/role/list',{
        params:{
          name:this.searchForm.name, //搜索关键词
          current:this.current, //页码
          size:this.size, //一页显示多少条
        }
      }).then(response =>{
        this.tableDate = response.data.resultdata.records
        this.total = response.data.resultdata.total
        this.size = response.data.resultdata.size
        this.current = response.data.resultdata.current
      }).catch(e=>{console.log(e);})

      //加载树形控件 中权限（菜单）数据
      this.$axios.get('/menu/list').then(response=>{
        this.perTreeData = response.data.resultdata
      }).catch(e=>{
        console.log(e)
      })
    },
    //点击分配权限按钮，加载该角色的权限信息（menuIds），显示对话框
    premsHandler(id){
      //id要查询该角色权限，显示出来RESTFul传参：/role/info/23
      this.$axios.get("/role/info/"+id).then(response=>{
        //当前id角色所能操作的菜单id
        console.log(id+'角色所能操作的菜单id是：'+response.data.resultdata.menuIds);
        this.$refs.permTree.setCheckedKeys(response.data.resultdata.menuIds)
        //PermForm就是分配权限表单对象，包括角色对象信息和角色所能操作的菜单id（权限）
        this.PermFrom = response.data.resultdata
      }).catch(e=>{
        console.log(e)
      })
      this.dialogPermFormVisible = true
    },

    //重置分配角色权限对话框表单
    resetPermForm(ForName){
      this.PermFrom={};
      if(this.$refs[ForName]!=undefined){
        console.log("1")
        this.$refs[ForName].resetFields();
      }
      
    },
    submitPerForm(PermFrom){
      //保存权限：获得勾选的权限菜单id，getCheckedKeys()
      let menuIds = this.$refs.permTree.getCheckedKeys();
      //参数：/role/perm/3 参数2：要保存菜单权限menuIds数组
      this.$axios.post('/role/perm/'+this.PermFrom.id,menuIds).then(response=>{
        this.$message({
          showClose:true,
          message:response.data.resultdata,
          type:'success',
          onClose:()=>{
            this.loadRoleList;
          }
        });
        this.dialogPermFormVisible = false;
      }).catch(e=>{
        console.log(e);
      })
    },

    //提交
    submitRoleForm(ForName) {
      this.$refs[ForName].validate((valid) => {
        if (valid) {
          //RoleForm.id如果是false，没有id，进行添加角色操作，如果有id，进行就是更新操作
          this.$axios.post('/role/'+(this.RoleForm.id?'update':'save'),this.RoleForm)
          .then(response=>{
            this.$message({
              showClose:true,
              message:response.data.resultdata,
              type:'success',
              onClose:()=>{
                this.loadRoleList(); //重新加载角色信息
                this.resetRoleForm(ForName); //重置角色添加表单
              }
            });
            this.dialogFormVisible=false;
          }).catch(e=>{
            console.log(e);
          })
          
        } else {
          return false
        }
      })
    },
    //重置新建菜单
    resetRoleForm(ForName) {
      this.RoleForm = {};
      this.$refs[ForName].resetFields();
      
    },
    //选中表格中 复选框触发事件
    selectionChange(value){
      //value参数，就是复选框 对应这一行的参数
      this.selection = value
      if(this.selection){
        this.deleteAllBtn = (this.selection.length === 0)
      }
    }
  },
  components: {
  }
}
</script>

<style scoped>
</style>
