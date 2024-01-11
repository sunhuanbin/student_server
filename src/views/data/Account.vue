<template>
    <div>
        <!-- 客户管理工具栏 -->
        <el-form ref="searchForm" :model="searchForm" :inline="true">
            <el-form-item label="用户编号">
                <el-input v-model="searchForm.accountId" placeholder="请输入客户Id" style="width: 200px;"></el-input>
            </el-form-item>
            <el-form-item label="用户姓名">
                <el-input v-model="searchForm.userName" placeholder="请输入客户名称" style="width: 200px;"></el-input>
            </el-form-item>
            <el-form-item label="用户性别">
                <el-select v-model="searchForm.userSex" placeholder="请选择" style="width: 100px;">
                  <el-option v-for="item in userSex" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="用户封禁状态">
                <el-select v-model="searchForm.statu" placeholder="请选择" style="width: 100px;">
                  <el-option v-for="item in statu" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-button @click="loadAccountList()" style="margin-left: 20px;">搜索</el-button>
                <el-button icon="el-icon-refresh" @click="resetSearch()">重置</el-button>
                <el-button type="primary" @click="dialogAccountVisible = true" style="margin-right: 10px;">新建</el-button>
                <el-popconfirm title="确认要批量删除客户信息吗" @confirm="deleteAccount()">
                    <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
                </el-popconfirm>
            </el-form-item>
        </el-form>

        <!-- 地址管理 -->
        <el-dialog title="地址信息" :visible.sync="dialogAddressVisible" width="600px">
            <el-table :data="addressData" style="width:100%;margin-bottom:20px;" border
                default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                :cell-style="{ padding: '2px' }" @selection-change="selectionChange">>
                <el-table-column prop="address" label="地址" width="400"></el-table-column>
                <el-table-column prop="contactTel" label="联系电话" width="160"></el-table-column>
            </el-table>

        </el-dialog>

        <!-- 客户对话框 -->
        <el-dialog title="客户信息" :visible.sync="dialogAccountVisible" width="600px" @close="resetAccountForm('AccountForm')">
            <el-form :model="AccountForm" ref="AccountForm" label-width="100px" :rules="AccountRules">
                <el-form-item label="用户编号" label-width="100px" prop="accountId">
                    <el-input v-model="AccountForm.accountId"></el-input>
                </el-form-item>
                <el-form-item label="用户名称" label-width="100px" prop="userName">
                    <el-input v-model="AccountForm.userName"></el-input>
                </el-form-item>

                <el-form-item label="用户头像" label-width="100px">
                    <!-- 将本地图片上传到阿里云服务器 -->
                    <el-upload class="avatar-uploader" action="/sys/oss/upload" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :headers="headers">
                        <img v-if="AccountForm.userImg" :src="AccountForm.userImg" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>


                <el-form-item label="用户性别" label-width="100px" prop="userSex">
                    <el-radio-group v-model="AccountForm.userSex">
                        <el-radio :label="1">男性</el-radio>
                        <el-radio :label="0">女性</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="封禁状态" label-width="100px" prop="statu">
                    <el-radio-group v-model="AccountForm.statu">
                        <el-radio :label="1">正常</el-radio>
                        <el-radio :label="0">封禁</el-radio>
                    </el-radio-group>
                </el-form-item>


                <el-form-item>
                    <el-button type="primary" @click="submitAccountForm('AccountForm')">提交</el-button>
                    <el-button @click="resetAccountForm('AccountForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>


        <!-- 用户分页的表格数据显示 -->
        <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border
            default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
            <!-- 复选框 -->
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="accountId" label="用户编号" width="200"></el-table-column>
            <el-table-column prop="userName" label="用户名称" width="200"></el-table-column>
            <el-table-column label="用户头像" width="180">
                <template slot-scope="scope">
                    <el-image style="width: 50px; height: 50px" :src="scope.row.userImg" :fit="fit"></el-image>
                </template>
            </el-table-column>




            <el-table-column prop="userSex" label="用户性别" width="90">
                <template slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.userSex === 0" type="success">女性</el-tag>
                    <el-tag size="mini" v-else-if="scope.row.userSex === 1">男性</el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="statu" label="封禁状态" width="90">
                <template slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.statu === 1" type="success">正常</el-tag>
                    <el-tag size="mini" v-else-if="scope.row.statu === 0" type="danger">封禁</el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="280px">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="editAddress(scope.row.accountId)">地址信息</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" size="small" @click="editAccount(scope.row.accountId)">编辑</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-popconfirm title="确定要删除该类别吗" @confirm="deleteAccount(scope.row.accountId)">
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
            addressData: [],
            fit: 'fill',
            tableDate: [],
            dialogAccountVisible: false,
            dialogAddressVisible: false,
            deleteAllBtn: true,

            userSex:[
                {
                    value:'0',
                    label:'女性'
                },
                {
                    value:'1',
                    label:'男性'
                },
                {
                    value:'',
                    label:'全部'
                }
            ],
            statu:[
                {
                    value:'0',
                    label:'封禁'
                },
                {
                    value:'1',
                    label:'正常'
                },
                {
                    value:'',
                    label:'全部'
                }
            ],


            //表单验证
            AccountRules: {
                accountId: [{ required: true, message: '请输入客户编号', trigger: 'blur' }],
                userName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
                userSex: [{ required: true, message: '请输入客户性别', trigger: 'blur' }],
                statu: [{ required: true, message: '请输入客户账号状态', trigger: 'blur' }],
            },

            //搜索框内容
            searchForm: {
                accountId:'',
                userName: '',
                userSex:'',
                statu:'',
            },

            //表格内容
            AccountForm: {
                accountId: '',
                password: '',
                userName: '',
                userSex: '',
                userImg: '',
                statu: 1,
                isDelete: '',
            },
            current: 1,//页码
            size: 6,//一页显示记录数
            total: 0,//总共有几条记录
            selection: [],

            headers: {
                //之前所有的请求操作都是使用axios，全局配置，所有axios都会自动加上，token请求头
                //目前图片的上传，使用的是上传组件，:action="/oss/upload"并不使用axios，所以没有token。
                token: JSON.parse(localStorage.getItem('TOKEN'))
            },
        }
    },

    created() {
        this.loadAccountList()
    },
    methods: {
        //重置搜索
        resetSearch(){
            this.searchForm.accountId='',
            this.searchForm.userName='',
            this.searchForm.userSex='',
            this.searchForm.statu=''
            this.loadAccountList();
        },

        //地址信息
        editAddress(id) {
            this.$axios.get('/account/addressinfo/' + id).then(response => {
                this.addressData = response.data.resultdata
                this.dialogAddressVisible = true;
            }).catch(e => {
                console.log(e);
            })
        },

        //编辑类别
        editAccount(id) {
            this.$axios.get('/account/info/' + id).then(response => {
                this.AccountForm = response.data.resultdata
                this.dialogAccountVisible = true;
            }).catch(e => {
                console.log(e);
            })
        },

        //删除类别
        deleteAccount(id) {
            var AccountIds = [];
            id ? AccountIds.push(id) : this.selection.forEach(Account => {
                AccountIds.push(Account.accountId)
            });
            this.$axios.post('/account/delete', AccountIds).then(response => {
                this.$message({
                    showClose: true,
                    message: response.data.resultdata,
                    type: 'success',
                    onClose: () => {
                        this.loadAccountList();
                    }
                });
            }).catch(e => {
                console.log(e);
            })
            console.log('类别删除成功')
        },

        //点击页面
        currentChangeHandler(val) {
            this.current = val;
            //当前页码已经改变，重新发起请求。
            this.loadAccountList();
        },

        sizeChangeHandler(val) {
            this.size = val;
            this.loadAccountList();

        },

        //选中表格中 复选框触发事件
        selectionChange(value) {
            //value参数，就是复选框 对应这一行的参数
            this.selection = value
            if (this.selection) {
                this.deleteAllBtn = (this.selection.length === 0)
            }
        },



        //获取数据
        loadAccountList() {
            this.$axios.get('/account/list', {
                params: {
                    id:this.searchForm.accountId,
                    name: this.searchForm.userName, //搜索关键词
                    sex:this.searchForm.userSex,
                    statu:this.searchForm.statu,
                    is_delete:1,
                    current: this.current, //页码
                    size: this.size, //一页显示多少条
                }
            }).then(response => {
                // this.tableDate = response.data.resultdata
                this.tableDate = response.data.resultdata.records
                this.total = response.data.resultdata.total
                this.size = response.data.resultdata.size
                this.current = response.data.resultdata.current
            }).catch(e => { console.log(e); })
        },

        //重置新建菜单
        resetAccountForm(ForName) {
            this.$refs[ForName].resetFields();
            this.AccountForm = {};
        },

        //提交
        submitAccountForm(ForName) {
            this.$refs[ForName].validate((valid) => {
                if (valid) {
                    this.$axios.post('/account/' + (this.AccountForm.isDelete ? 'update' : 'save'), this.AccountForm).then(response => {
                        this.$message({
                            showClose: true,
                            message: response.data.resultdata,
                            type: 'success',
                        });
                        this.loadAccountList();
                        this.resetAccountForm(ForName);
                        this.dialogAccountVisible = false;
                    }).catch(e => {
                        console.log(e);
                    })
                } else {
                    return false
                }
            })
        },


        handleAvatarSuccess(response, file) {
            //上传成功，从响应对象中获得上传图片在服务器的地址
            this.AccountForm.userImg = response.resultdata
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
