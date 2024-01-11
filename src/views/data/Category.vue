<template>
    <div>
        <!-- 类别管理工具栏 -->
        <el-form ref="searchForm" :model="searchForm" :inline="true">
            <el-form-item>
                <el-input v-model="searchForm.name" placeholder="请输入类别名称"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-button @click="loadCategoryList()" style="margin-left: 20px;">搜索</el-button>
                <el-button type="primary" @click="dialogCategoryVisible = true" style="margin-right: 10px;">新建</el-button>
                <el-popconfirm title="确认要批量删除类别信息吗" @confirm="deleteCategory()">
                    <el-button slot="reference" type="danger" :disabled="deleteAllBtn">批量删除</el-button>
                </el-popconfirm>
            </el-form-item>
        </el-form>

        <!-- 类别对话框 -->
        <el-dialog title="美食信息" :visible.sync="dialogCategoryVisible" width="600px"
            @close="resetCategoryForm('CategoryForm')">
            <el-form :model="CategoryForm" ref="CategoryForm" label-width="100px" :rules="CategoryRules">
                <el-form-item label="类别图标" label-width="100px">
                    <!-- 将本地图片上传到阿里云服务器 -->
                    <el-upload class="avatar-uploader" action="/sys/oss/upload" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :headers="headers">
                        <img v-if="CategoryForm.categoryCover" :src="CategoryForm.categoryCover" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>

                <el-form-item label="类别名称" label-width="100px" prop="categoryName">
                    <el-input v-model="CategoryForm.categoryName"></el-input>
                </el-form-item>


                <el-form-item>
                    <el-button type="primary" @click="submitCategoryForm('CategoryForm')">提交</el-button>
                    <el-button @click="resetCategoryForm('CategoryForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>


        <!-- 类别分页的表格数据显示 -->
        <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border
            default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
            <!-- 复选框 -->
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="categoryName" label="类别名称" width="200"></el-table-column>


            <el-table-column label="类别图标" width="180">
                <template slot-scope="scope">
                    <el-image style="width: 50px; height: 50px" :src="scope.row.categoryCover" :fit="fit"></el-image>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="280px">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="editCategory(scope.row.categoryId)">编辑</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-popconfirm title="确定要删除该类别吗" @confirm="deleteCategory(scope.row.categoryId)">
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
            fit: 'fill',
            tableDate: [],
            dialogCategoryVisible: false,
            deleteAllBtn: true,

            //表单验证
            CategoryRules: {
                categoryName: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
            },

            //搜索框内容
            searchForm: {
                name: '',
            },
            bussiness:[],

            //表格内容
            CategoryForm: {
                categoryId: '',
                categoryName: '',
                categoryCover: ''
            },
            current: 1,//页码
            size: 3,//一页显示记录数
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
        this.loadCategoryList()
    },
    methods: {
        //编辑类别
        editCategory(id) {
            this.$axios.get('/category/info/' + id).then(response => {
                this.CategoryForm = response.data.resultdata
                this.dialogCategoryVisible = true;
            }).catch(e => {
                console.log(e);
            })
        },

        //删除类别
        deleteCategory(id) {
            var categoryIds = [];
            id ? categoryIds.push(id) : this.selection.forEach(category => {
                categoryIds.push(category.categoryId)
            });
            this.$axios.post('/category/delete', categoryIds).then(response => {
                this.$message({
                    showClose: true,
                    message: response.data.resultdata,
                    type: 'success',
                    onClose: () => {
                        this.loadCategoryList();
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
            this.loadCategoryList();
        },

        sizeChangeHandler(val) {
            this.size = val;
            this.loadCategoryList();

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
        loadCategoryList() {
            this.$axios.get('/category/list', {
                params: {
                    name: this.searchForm.name, //搜索关键词
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
        resetCategoryForm(ForName) {
            this.$refs[ForName].resetFields();
            this.CategoryForm = {};
        },

        //提交
        submitCategoryForm(ForName) {
            this.$refs[ForName].validate((valid) => {
                if (valid) {
                    this.$axios.post('/category/' + (this.CategoryForm.categoryId ? 'update' : 'save'), this.CategoryForm).then(response => {
                        this.$message({
                            showClose: true,
                            message: response.data.resultdata,
                            type: 'success',
                        });
                        this.loadCategoryList();
                        this.resetCategoryForm(ForName);
                        this.dialogCategoryVisible = false;
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
            this.CategoryForm.categoryCover = response.resultdata
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
