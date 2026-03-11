<template>
  <panelHead :route="route"></panelHead>
  <div class="btns">
     <!-- 如果是新增窗口，调用open，传入null就可以 -->
    <el-button @click="open(null)" type="primary" :icon="Plus" size="small">新增</el-button>
  </div>
 
  <el-table :data="tableData.list" style="width: 100%;">
    <el-table-column prop="name" label="id"/>
    <el-table-column prop="id" label="昵称"/>
    <el-table-column prop="permissionName" label="菜单权限" width="500px"/>
    <el-table-column>
      <template #default="scope">
          <el-button type="primary" @click="open(scope.row)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
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
  <el-dialog 
  v-model="dialogVisable"
  width="500"
  title="添加权限"
  :before-close="beforeClose"
  >
    <el-form
    ref="formRef"
    label-width="100px"
    label-position="left"
    :model="form"
    :rules="rules"
    >
        <el-form-item prop="id" v-show="false">
          <el-input v-model="form.id"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
        <el-input placeholder="请填写权限名称" v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
        <el-tree
        style="max-width: 600px"
        ref="treeRef"
        :data="permissionData"
        show-checkbox
        node-key="id"
        :default-expanded-keys="[2]"
        :default-checked-keys="defaultKeys"
      />
      </el-form-item>
    </el-form>
     <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="confirm(formRef)">确认</el-button>
          </div>
        </template>
  </el-dialog>
</template>

<script setup>
  import {ref,reactive,onMounted, nextTick} from 'vue'
  import {userGetMenu,userSetMenu,menuList} from '../../../api'
  import { Plus } from "@element-plus/icons-vue";
  import {useRoute} from 'vue-router'

  const route=useRoute()
  console.log('group中的route',route);
  
  const dialogVisable=ref(false)
  const formRef=ref()

  const paginationData=reactive({
    pageNum:1,
    pageSize:10
  })

  // 树形菜单权限数据
  const permissionData=ref([])

  onMounted(()=>{
    // 菜单数据
    userGetMenu().then(({data})=>{
      console.log(data)
      permissionData.value=data.data
    })
    getListData()
  })

  // 请求列表数据
  const getListData=()=>{
    menuList(paginationData).then(({data})=>{
      const {list,total}=data.data
      tableData.list=list
      tableData.total=total
    })
  }

  // form表单
  // 这里的form.id是当前的配置项的id，
  const form=reactive({
    name:'',
    permissions:'',
    id:''
  })

  // 列表数据:这里定义成这样是因为调用menuList后端返回的table数据是包含list和total的
  // 这里的total是符合条件的数据的总条数
  const tableData=reactive({
    list:[],
    title:0
  })

  // open点击事件，需要实现的功能是：当点击新建或者编辑的按钮时，出现的是权限弹窗。如果点击的是编辑按钮（即传入的form表单内容非空，此时就需要将该非空表单的的信息注入，以保证该行数据所对应的表单数据正确显示）
  // 打开弹窗前的点击事件，对于权限中的新增和编辑其实打开的是同一个弹窗
  const open=(rowData={})=>{
    dialogVisable.value=true
      // 弹窗打开form表单生成是异步操作=>使用nextTick
      nextTick(()=>{
        if(rowData){
          Object.assign(form,{id:rowData.id,name:rowData.name})
          treeRef.value.setCheckedKeys(rowData.permission)
        }
      })
    }

  
  // 弹窗关闭前的回调
  const beforeClose=()=>{
    dialogVisable.value=false
    // 关闭前需要重置表单
    formRef.value.resetFields()
    // tree选择重置
    treeRef.value.setCheckedKeys(defaultKeys)
  }

  const rules=reactive({
    name:[{required:true,trigger:'blur',message:'请输入权限名称'}]
  })

  // 选中权限
  const defaultKeys=[4,5]
  const treeRef=ref()


  // 点击确认按钮触发表单校验(表单提交)
  const confirm=async()=>{
    if(!formRef.value) return
    await formRef.value.validate((valid,fields)=>{
      if (valid) {
      const permissions = JSON.stringify(treeRef.value.getCheckedKeys());
      userSetMenu({ name: form.name, permissions: permissions, id: form.id }).then(({ data }) => {
        console.log('userSetMenu',data);
        beforeClose()
        getListData()
      });
      }else{
        console.log('error submit!', fields)
      }
    })
  }


  // 切换每页显示条数时触发（如从 10 条 / 页改成 20 条 / 页）
  const handleSizeChange=(val)=>{
    paginationData.pageSize=val
    getListData()
  }
  // 切换当前页码时触发（如从第 1 页点到第 2 页）
  const handleCurrentChange=(val)=>{
    paginationData.pageNum=val
    getListData()
  }
</script>
  

<style scoped lang="less">
.btns{
  padding: 10px 0 10px 10px;
  background-color: #fff;
}
</style>