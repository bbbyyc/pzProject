<template>
   <panelHead :route="route"></panelHead>
   <div class="btns">
     <!-- 如果是新增窗口，调用open，传入null就可以 -->
    <el-button @click="open(null)" type="primary" :icon="Plus" size="small">新增</el-button>
    <!-- 删除按钮 -->
    <el-popconfirm
    confirm-button-text="是"
    cancel-button-text="否"
    title="你确定要删除吗"
    @confirm="confirmEvent"
    @cancel="cancelEvent"
  >
    <template #reference>
      <el-button :icon="DeleteFilled" size="small" type="danger">删除</el-button>
    </template>
  </el-popconfirm>
  </div>
  
  <!-- table渲染 -->
  <el-table
   :data="tableData.list" 
   style="width: 100%;"
   @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <el-table-column prop="id" label="id"/>
    <el-table-column prop="name" label="昵称"/>
    <el-table-column prop="avatar" label="头像">
       <template #default="scope">
          <el-image 
          :src="scope.row.avatar"
          style="width:50px;height:50px"
          ></el-image>
      </template>
    </el-table-column>
    <el-table-column prop="sex" label="性别">
      <template #default="scope">
         {{ scope.row.sex==='1'?'男':'女' }}
      </template>
    </el-table-column>
    <el-table-column prop="mobile" label="手机号"/>
    <el-table-column prop="active" label="状态">
      <template #default="scope">
          <el-tag :type="scope.row.active?'success':'denger'">{{ scope.row.active?'正常':'失效' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间">
      <template #default="scope">
          <div class="flex-box">
            <el-icon><Clock /></el-icon>
            <span style="margin-left: 10px;">{{ scope.row.create_time }}</span>
          </div>
      </template>
    </el-table-column>
    <el-table-column lable="操作">
      <template #default="scope">
          <el-button type="primary" @click="open(scope.row)">编辑</el-button>
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

   <!-- 弹窗 -->
    <el-dialog 
      v-model="dialogVisable"
      width="500"
      title="陪护师添加"
      :before-close="beforeClose"
      >
      <el-form
      ref="formRef"
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
      >
      <el-form-item v-show="false" prop="id">
        <el-input v-model="form.id"></el-input>
      </el-form-item>
        <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name" placeholder="请输入昵称"/>
        </el-form-item>
        <el-form-item label="头像" prop="avatar"> 
          <el-button v-if="!form.avatar" type="primary" @click="dialogImgVisable=true">点击上传</el-button>
          <el-image 
          v-else 
          :src="form.avatar"
          style="width:100px;height:100px"
          ></el-image>
        </el-form-item>
        <el-form-item label="性别" prop="sex"> 
        <el-select v-model="form.sex" placeholder="请输入性别">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age"> 
        <el-input-number v-model="form.age" min="18" max="50" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile"> 
        <el-input v-model="form.mobile" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="是否生效" prop="active"> 
          <el-radio-group v-model="form.active">
            <el-radio :value="0">失效</el-radio>
            <el-radio :value="1">生效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
     <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="confirm(formRef)">确认</el-button>
          </div>
        </template>
  </el-dialog>


  <!-- 陪护师照片弹窗 -->
  <el-dialog
    v-model="dialogImgVisable"
    width="680"
    title="图片添加"
    :before-close="beforeClose"
    >
    <div class="image-list">
      <div 
        class="img-box"
        v-for="(i,index) in fileList"
        :key="i.name"
        @click="selectIndex=index">
        <div v-if="selectIndex===index" class="select">
          <el-icon color="#fff"><Check /></el-icon>
        </div>
        <el-image style="width: 148px;height:148px" :src="i.url"></el-image>
      </div>
    </div>
    <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogImgVisable=false">取消</el-button>
            <el-button type="primary" @click="confirmImg">确认</el-button>
          </div>
        </template>
  </el-dialog>
</template>

<script setup>
import { ref ,reactive, onMounted,nextTick} from 'vue'
import {companion,photoList,companionList,delectCompanion} from '../../../api'
import { Plus,DeleteFilled} from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus'
import {useRoute} from 'vue-router'
import dayjs from 'dayjs'

const route=useRoute()
console.log('staff中的route',route);

// 定义图像接口返回的数据
const fileList=ref([])
// 定义被选中的图片
const selectIndex=ref(0)

onMounted(()=>{
  // 图片弹窗
  photoList().then(({data})=>{
    console.log('图片接口返回回来的数据',data.data)
    fileList.value=data.data
  })
  getListData()
})
const formRef=ref()

const tableData=reactive({
  list:[],
  title:0
})

// 定义获取陪护师列表的方法
  const getListData=()=>{
    companionList(paginationData).then(({data})=>{
      console.log(data,'companionList')
      const {list,total}=data.data
      // 对list进行遍历，将每一个create_time从原本的时间戳形式转换成YYYY-MM-DD
      // 直接遍历并修改原数组中的元素
      list.forEach(item=>{
        item.create_time=dayjs(item.create_time).format('YYYY-MM-DD')
      })
      // 引用类型，拿到的是地址
      //把处理后的数据赋值给表格渲染所需要用到的tableData
      tableData.list=list
      tableData.total=total
    })
  }

const dialogVisable=ref(false)
const dialogImgVisable=ref(false)

const rules=({
  name:[{required:true,trigger:'blur',message:'请输入权限名称'}],
  avatar:[{required:true,message:'请选择头像'}],
  sex:[{required:true,trigger:'change',message:'请选择性别'}],
  mobile:[{required:true,trigger:'blur',message:'请填写手机号'}],
})
const paginationData=reactive({
    pageNum:1,
    pageSize:10
  })

// 关闭弹窗
const beforeClose=()=>{
  dialogVisable.value=false
  formRef.value.resetFields()
}

const handleSizeChange=()=>{

}

const handleCurrentChange=()=>{

}

// 编辑弹窗的表单数据
  const form=reactive({
    id:'',
    mobile:'',
    active:1,
    age:28,
    avatar:'',
    name:'',
    sex:'',
  })

// 新建陪诊师弹窗确认
const confirm=async ()=>{
    if(!formRef.value) return
    await formRef.value.validate((valid,fields)=>{
      if (valid) {
        const {id,mobile,active,age,avatar,name,sex}=form
        companion({id,mobile,active,age,avatar,name,sex}).then(({data})=>{
           if(data.code===10000){
            ElMessage.success('成功')
            beforeClose()
            // 更新当前列表数据
            getListData()
              }
            else{
              ElMessage.error(data,message)
            }})
      }else{
        console.log('error submit!', fields)
      }
    })
  }

// 头像选择弹窗确认
const confirmImg=()=>{
  form.avatar=fileList.value[selectIndex.value].url
  dialogImgVisable.value=false
}

// 点击新建或编辑按钮
const open=(rowData={})=>{
    dialogVisable.value=true
      // 弹窗打开form表单生成是异步操作=>使用nextTick
      nextTick(()=>{
        if(rowData){
          Object.assign(form,rowData)
          // 更新当前列表数据
          getListData()
        }
      })
    }

const selectTableData=ref([])
const handleSelectionChange=(val)=>{
  console.log(val,'val');
  selectTableData.value=val.map(item=>({id:item.id}))
}
const confirmEvent=()=>{
  // 如果没有选择数据
  if(!selectTableData.value.length){
    return ElMessage.warning('请至少选择一个数据')
  }
  delectCompanion({id:selectTableData.value}).then(({data})=>{
    if(data.code===10000){
      // 更新当前列表数据
        getListData()
    }
  })
}

</script>
<style lang="less" scoped>
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .img-box {
    position: relative;
    .select {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 24px;
      height: 24px;
      background-color: #67c23a;
      z-index: 999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .el-image {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>