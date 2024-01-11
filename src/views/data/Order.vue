<template>
    <div>
        <!-- 订单管理工具栏 -->
        <el-form ref="searchForm" :model="searchForm" :inline="true">
            <el-form-item>
                <el-input v-model="searchForm.name" placeholder="用户姓名" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="searchForm.businessname" placeholder="商家名称" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="searchForm.address" placeholder="配送地址" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="searchForm.date" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="支付状态">
                <el-select v-model="searchForm.statu" placeholder="请选择" style="width: 100px;">
                    <el-option v-for="item in statu" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-button @click="loadOrderList()" style="margin-left: 20px;">搜索</el-button>
                <el-button icon="el-icon-refresh" @click="resetSearch()">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 订单详情 -->
        <el-dialog title="订单详情" :visible.sync="dialogOrdersVisible" width="950px">
            <el-table :data="OrdersData" style="width:100%;margin-bottom:20px;" border
                default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                :cell-style="{ padding: '2px' }" @selection-change="selectionChange">>
                <el-table-column prop="orderId" label="订单编号" width="80"></el-table-column>
                <el-table-column prop="account_id" label="客户编号" width="100"></el-table-column>
                <el-table-column prop="business_id" label="商家编号" width="100"></el-table-column>
                <el-table-column prop="food_name" label="食品名称" width="160"></el-table-column>
                <el-table-column label="食品图片" width="100">
                    <template slot-scope="scope">
                        <el-image style="width: 60px; height: 60px" :src="scope.row.food_picture" :fit="fit"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="食品数量" width="100"></el-table-column>
                <el-table-column prop="food_price" label="食品单价(元)" width="120"></el-table-column>
                <el-table-column prop="food_total_price" label="单件食品总价(元)" width="140"></el-table-column>
            </el-table>
        </el-dialog>

        <!-- 订单分页的表格数据显示 -->
        <el-table :data="tableDate" style="width:100%;margin-bottom:20px;" border
            default-expand-all:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            :cell-style="{ padding: '2px' }" @selection-change="selectionChange">
            <!-- 复选框 -->
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="username" label="用户姓名" width="100" type="success"></el-table-column>
            <el-table-column prop="businessname" label="商家名称" width="200" type="success"></el-table-column>
            <el-table-column prop="orderDate" label="下单时间" width="200"></el-table-column>
            <el-table-column prop="orderTotal" label="订单金额" width="80"></el-table-column>
            <el-table-column prop="address" label="配送地址" width="300"></el-table-column>
            <el-table-column prop="delivery_price" label="配送费" width="70"></el-table-column>
            <el-table-column prop="orderState" label="支付状态" width="90">
                <template slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.orderState === 1" type="danger">未支付</el-tag>
                    <el-tag size="mini" v-else-if="scope.row.orderState === 0" type="success">已支付</el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="280px">


                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="editOrders(scope.row.orderId)">订单详情</el-button>
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
            statu: [
                {
                    value: '0',
                    label: '已支付'
                },
                {
                    value: '1',
                    label: '未支付'
                },
                {
                    value: '',
                    label: '全部'
                }
            ],

            fit: 'fill',
            totalPrice: [],
            OrdersData: [],
            tableDate: [],
            dialogOrderVisible: false,
            dialogOrdersVisible: false,
            deleteAllBtn: true,
            //搜索框内容
            searchForm: {
                name: '',
                businessname: '',
                address: '',
                statu: '',
                date: '',
            },

            //表格内容
            OrderForm: {
                OrderId: '',
                OrderName: '',
                OrderCover: ''
            },
            current: 1,//页码
            size: 12,//一页显示记录数
            total: 0,//总共有几条记录
            selection: [],
        }
    },

    created() {
        this.loadOrderList()
    },
    methods: {

        //重置搜索
        resetSearch() {
            this.searchForm.address = '',
                this.searchForm.businessname = '',
                this.searchForm.name = '',
                this.searchForm.statu = '',
                this.searchForm.date = '',
                this.loadOrderList();
        },

        //订单信息
        editOrders(id) {
            this.$axios.get('/orders/ordersinfo/' + id).then(response => {
                this.OrdersData = response.data.resultdata
                this.dialogOrdersVisible = true;
            }).catch(e => {
                console.log(e);
            })
        },

        //删除订单
        deleteOrder(id) {
            var OrderIds = [];
            id ? OrderIds.push(id) : this.selection.forEach(Order => {
                OrderIds.push(Order.orderId)
            });
            this.$axios.post('/orders/delete', OrderIds).then(response => {
                this.$message({
                    showClose: true,
                    message: response.data.resultdata,
                    type: 'success',
                    onClose: () => {
                        this.loadOrderList();
                    }
                });
            }).catch(e => {
                console.log(e);
            })
            console.log('订单删除成功')
        },

        //点击页面
        currentChangeHandler(val) {
            this.current = val;
            //当前页码已经改变，重新发起请求。
            this.loadOrderList();
        },

        sizeChangeHandler(val) {
            this.size = val;
            this.loadOrderList();

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
        loadOrderList() {
            if (this.searchForm.date == '') {
                this.$axios.get('/orders/list', {
                    params: {
                        name: this.searchForm.name, //搜索关键词
                        businessname: this.searchForm.businessname,
                        address: this.searchForm.address,
                        statu: this.searchForm.statu,
                        beging:'',
                        ending:'',
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
            }
            else{
                this.$axios.get('/orders/list', {
                    params: {
                        name: this.searchForm.name, //搜索关键词
                        businessname: this.searchForm.businessname,
                        address: this.searchForm.address,
                        statu: this.searchForm.statu,
                        beging: this.searchForm.date[0],
                        ending: this.searchForm.date[1],
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
            }


        },

        //重置新建菜单
        resetOrderForm(ForName) {
            this.$refs[ForName].resetFields();
            this.OrderForm = {};
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
