<template>
<panelHead :route="route"></panelHead>
<div class="form">
<el-form inline="true" :model="searchForm">
  <el-form-item prop="out_trade_no">
    <el-input v-model="searchForm.out_trade_no" placeholder="订单号"/>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit(searchForm.out_trade_no)">查询</el-button>
  </el-form-item>
</el-form>
</div>

<el-table
:data="tableData.list" 
  style="width: 100%;">
  <el-table-column prop="out_trade_no" label="订单号" width="150" fixed="left"></el-table-column>
  <el-table-column prop="hospital_name" label="就诊医院"></el-table-column>
  <el-table-column prop="service_name" label="陪诊服务"></el-table-column>
  <el-table-column prop="serviceImg" label="陪诊师">
    <template #default="scope">
        <el-image 
        :src="scope.row.companion.avatar"
        style="width:40px;height:40px"
        ></el-image>
    </template>
  </el-table-column>
  <el-table-column label="陪诊师手机号" width="120">
      <template #default="scope">
        {{ scope.row.companion.mobile}}
      </template>
  </el-table-column>
  <el-table-column prop="price" label="总价"></el-table-column>
  <el-table-column prop="paidPrice" label="已付"></el-table-column>
  <el-table-column prop="order_start_time" label="下单时间" width="120">
    <template #default="scope">
        {{ dayjs(scope.row.order_start_time).format('YYYY-MM-DD')}}
      </template>
  </el-table-column>
  <el-table-column prop="trade_state" label="订单状态">
    <template #default="scope">
      <el-tag :type="statusMap(scope.row.trade_state)">{{scope.row.trade_state}}</el-tag>
        <!-- <el-tag type="info" v-if="scope.row.trade_state==='已取消'">{{ scope.row.trade_state}}</el-tag>
        <el-tag type="warning" v-if="scope.row.trade_state==='待支付'">{{ scope.row.trade_state}}</el-tag>
        <el-tag type="success" v-if="scope.row.trade_state==='已完成'">{{ scope.row.trade_state}}</el-tag> -->
    </template>
  </el-table-column>
  <el-table-column prop="service_state" label="接单状态"></el-table-column>
  <el-table-column prop="tel" label="联系人手机号" width="120"></el-table-column>
  <el-table-column label="操作" fixed="right">
    <template #default="scope">
       <el-popconfirm
        v-if="scope.row.trade_state==='待服务'"
        confirm-button-text="是"
        cancel-button-text="否"
        title="是否确认完成"
        :icon="InfoFilled"
        @confirm="confirmEvent(scope.row.out_trade_no)"
      >
        <template #reference>
          <el-button type="primary" link>服务完成</el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" link v-else disabled>暂无服务</el-button>
    </template>
  </el-table-column>
</el-table>
 <!-- 分页效果实现 -->
  <div class="pagination-info">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      :page-size="paginationData.pageSize"
      :background="false"
      layout="total, prev, pager, next"
      size="small"
      :total="tableData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
   </div>

</template>

<script setup>
import {adminOrder,updateOrder} from '../../../api'
import { reactive,onMounted } from 'vue'
import {useRoute} from 'vue-router'
import dayjs from 'dayjs'
import { InfoFilled} from "@element-plus/icons-vue";

const route=useRoute()

onMounted(()=>{
  getListData()
})
const statusMap=(key)=>{
  const obj={
    '已取消':'info',
    '待支付':'warning',
    '已完成':'success'
  }
  return obj[key]
}
const paginationData=reactive({
    pageNum:1,
    pageSize:10
  })
const tableData=reactive({
list:[],
title:0
})

  // 提交操作
const confirmEvent=(id)=>{
  // 注意此接口要传入的是一个对象 要用大括号将id包裹
  updateOrder({id}).then(({data})=>{
    if(data.code===10000){
      getListData()
    }
  })
}

const handleSizeChange=()=>{

}

const handleCurrentChange=()=>{

}

// 表单搜索
const searchForm=reactive({
  out_trade_no:''
})

// 订单查询：调用列表接口将out_trade_no参数传递进去
const onSubmit=()=>{
  getListData(searchForm)
}

const getListData=(params={})=>{
    adminOrder({...paginationData,...params}).then(({data})=>{
      console.log(data,'adminOrder')
      const {list,total}=data.data
      tableData.list=list
      tableData.total=total
    })
  }
</script>

<style scoped lang="less">
.form{
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 10px 10px;
  background-color: #fff;
}
</style>