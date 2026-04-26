<template>
  <panelHead :route="route"></panelHead>
  <!-- table渲染 -->
  <el-table :data="tableData.list" style="width: 100%;">
    <el-table-column prop="name" label="昵称"/>
    <el-table-column prop="id" label="id"/>
    <el-table-column prop="permissions_id" label="所属组别">
       <template #default="scope">
          {{ permissionName(scope.row.permissions_id) }}
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
    <el-table-column>
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
        <el-form-item label="手机号" prop="mobile"> 
        <el-input v-model="form.mobile" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="菜单权限" prop="permissions_id">
          <el-select v-model="form.permissions_id" placeholder="请选择菜单权限" style="width: 240px">
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
          </el-select>
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
  import {authAdmin,menuSelectList,updateUser,menuPermissions} from '../../../api'
  import { ref,reactive ,onMounted} from 'vue'
  import {useRoute,useRouter} from 'vue-router'
  import {useMenuStore} from '../../../store/menu'
  import dayjs from 'dayjs'

  const route=useRoute()
  const router=useRouter()
  const menuStore=useMenuStore()
  const currentUserInfo = JSON.parse(localStorage.getItem('pz_userInfo') || '{}')
  const currentUserId = currentUserInfo?.id
  console.log('admin中的route',route);
  
  onMounted(()=>{
    getListData()
    // 调用menuSelectList，获取下拉列表；下拉列表里的内容已经是给死的了
    // 初始化时获取权限组下拉选项
    menuSelectList().then(({data})=>{
      options.value=data.data
    })
  })

  // 定义弹窗字段
  const dialogVisable=ref(false)

  // 关闭弹窗的方法
  const beforeClose=()=>{
    dialogVisable.value=false
  }

  const formRef=ref()

 
  // 弹窗表单提交
  const confirm=async ()=>{
    if(!formRef.value) return
    await formRef.value.validate(async (valid,fields)=>{
      if (valid) {
        const {name,permissions_id,id}=form
        updateUser({name,permissions_id,id}).then(async ({data})=>{
           if(data.code===10000){
            dialogVisable.value=false
            // 更新当前列表数据
            getListData()
            // 如果编辑的是当前登录用户，刷新当前权限菜单
            if (id && String(id) === String(currentUserId)) {
              try {
                const menuRes = await menuPermissions()
                const menuData = menuRes.data.data
                if (menuData) {
                  localStorage.setItem('pz_v3pz', JSON.stringify(menuData))
                  menuStore.dynamicMenu(menuData)
                  router.replace({ path: '/' })
                }
              } catch (err) {
                console.error('刷新菜单权限失败', err)
              }
            }
          }})
      }else{
        console.log('error submit!', fields)
      }
    })
  }

  // 编辑弹窗的表单数据
  const form=reactive({
    mobile:'',
    name:'',
    permissions_id:'',
    id:''
  })

  const paginationData=reactive({
    pageNum:1,
    pageSize:10
  })


  // 列表数据
  const tableData=reactive({
    list:[],
    title:0
  })

  // 定义获取列表的方法
  const getListData=()=>{
    authAdmin(paginationData).then(({data})=>{
      console.log(data,'authAdmin')
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

  

  // 创建一个变量来存储下拉列表服务器返回过来的数据
  const options=ref([])

  // 根据权限id转权限名称
  const permissionName=(id)=>{
    const data= options.value.find(el=>el.id===id)
    return data ?data.name:'未知权限'
  }

  // open
  const open=(rowData)=>{
    dialogVisable.value=true
    Object.assign(form,{
      mobile:rowData.mobile,
      name:rowData.name,
      permissions_id:rowData.permissions_id,
      id: rowData.id
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

   const rules=reactive({
    name:[{required:true,trigger:'blur',message:'请填写昵称'}],
    permissions_id:[{required:true,trigger:'blur',message:'请选择菜单权限'}]
  })

</script>

<style>
.flex-box{
  align-items: center;
}
</style>