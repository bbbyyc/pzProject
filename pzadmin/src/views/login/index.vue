<template>
   <el-row class="login-container" justify="center" align="middle" >
    <el-card style="max-width: 480px;">
      <template #header>
        <div class="card-header">
          <img :src="imgUrl">
        </div>
      </template>
      <div class="jump-link">
        <el-link type="primary" @click="handleChange">{{btnLogin?'立即注册':'返回登录'}}</el-link>
      </div>
       <el-form
        ref="loginFormRef"
        :model="loginForm" 
        style="max-width: 600px" 
        class="demo-ruleForm"
        :rules="rules">
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" placeholder="手机号" :prefix-icon="'UserFilled'"></el-input>
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input v-model="loginForm.passWord" type="password" placeholder="密码" :prefix-icon="'Lock'"></el-input>
        </el-form-item>
        <el-form-item prop="validCode" v-if="!btnLogin">
          <el-input v-model="loginForm.validCode" placeholder="请输入验证码" :prefix-icon="'Lock'">
            <template #append>
              <span @click="countdownChange(countDown)" style="cursor: pointer;">{{countDown.validText}}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="submitForm">{{ btnLogin?'立即登录':'立即注册'}}</el-button>
        </el-form-item>
       </el-form>
    </el-card>
   </el-row>
</template>

<script setup>
import { ref , reactive,nextTick, toRaw,} from 'vue'
import {getCode,userAuthentication,Alogin,menuPermissions} from '../../api'
import { ElMessage } from 'element-plus'
import {useRouter} from 'vue-router'
import { ro } from 'element-plus/es/locales.mjs'
import {useMenuStore}  from '../../store/menu';
import {storeToRefs} from 'pinia'
// 图片
const imgUrl=new URL('../../../public/login-head.png', import.meta.url).href

// 接收pinia
const MenuStore=useMenuStore()

// 创建切换表单的响应式变量（1时登录页面 0注册）
const btnLogin=ref(1)
// 点击切换登陆或注册
function handleChange(){
  btnLogin.value=btnLogin.value?0:1
}



// 表单初始值
const loginForm=reactive({
  userName:'',
  passWord:'',
  validCode:''
})

// 验证码逻辑：
const countDown=reactive({
  validText:'获取验证码',
  time:60
})

// 避免连点进而创建多个计时器
let flag=false
function countdownChange(countDown){
  console.log('点击事件生效了');
  
  if(flag){
    return
  }
  // 判断手机号是否正确
  const phoneReg=/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
  if(!loginForm.userName||!phoneReg.test(loginForm.userName)){
    return ElMessage({
    message: '请输入正确的手机号！',
    type: 'warning',
  })
  }
  const timer=setInterval(()=>{
    console.log('计时器触发');
    
  if(countDown.time<=0){
    countDown.time=60
    countDown.validText='获取验证码'
    flag=false
    clearInterval(timer)
  }else{
    countDown.time-=1
    countDown.validText=`剩余${countDown.time}s`
  }
  },1000)
  flag=true
  // 向后端发送获取验证码的请求
  getCode({tel:loginForm.userName}).then((data)=>{
    console.log('验证码已发送');
    if(data.code===10000){
      ElMessage.success('发送成功')
    }
  })
}


// 表单校验相应函数
const validateUser=(rule,value,callback)=>{
  if(value===''){
    callback(new Error('请输入账号'))
  }else{
    const phoneReg=/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    phoneReg.test(value)?callback():callback(new Error('请输入正确的手机号'))
  }
}
const validatePass=(rule,value,callback)=>{
  if(!value){
    callback(new Error('请输入密码'))
  }else{
    const passReg=/^[a-zA-Z0-9_-]{4,16}$/
    passReg.test(value)?callback():callback(new Error('请输入正确的密码'))
  }
}
// 表单校验逻辑
const rules = reactive({
  userName: [{ validator: validateUser, trigger: 'blur' }],
  passWord: [{ validator: validatePass, trigger: 'blur' }]
})

const router=useRouter()

// 表单实例 ref - 确保有初始值
const loginFormRef = ref(null)

// 接收一下routerList
const {routerList}=storeToRefs(MenuStore)

// 提交信息时再次进行表单校验
const submitForm = async () => {
  if (!loginFormRef.value) {
    console.error('表单实例未获取到')
    return
  }
  
    // 先打印一下要提交的数据
  console.log('提交的数据：', loginForm)
  console.log('密码长度：', loginForm.passWord.length)
  console.log('密码是否符合正则：', /^[a-zA-Z0-9_-]{4,16}$/.test(loginForm.passWord))

  // 手动触发校验
  await loginFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log(loginForm, 'submit!')
      // 注册页面
      if(!btnLogin.value){
        console.log('正在校验登陆页面');
        
        /* userAuthentication({userName:loginForm.userName,passWord:loginForm.passWord,validCode:loginForm.validCode}).then(({data})=>{
        console.log('userAuthentication已执行');
        
          if(data.code===10000){
            ElMessage.success('注册成功，请登录')
            btnLogin.value=1
          }
        }) */
          userAuthentication({
            userName:loginForm.userName,
            passWord:loginForm.passWord,
            validCode:loginForm.validCode
          }).then((res) => { // 注意：参数是res，不是data
            console.log('这是后端传回来的数据',res)
            console.log('userAuthentication响应：', res.data);
            const { code } = res.data; // 解构正确的响应数据
            if(code===10000){
              ElMessage.success('注册成功，请登录')
              btnLogin.value=1 // 成功跳转登录
            }
          })
      }else{
        // 登陆界面
        /* Alogin({userName:loginForm.userName,passWord:loginForm.passWord}).then(({data})=>{
          console.log('login已执行');
          if(data.code===10000){
            ElMessage.success('登录成功')
            localStorage.setItem('pz_token',data.data.token)
            localStorage.setItem('pz_userInfo',JSON.stringify(data.data.userInfo))
          }
        }) */
       Alogin({userName:loginForm.userName,passWord:loginForm.passWord}).then(async (res)=>{
        console.log('这是后端传回来的数据',res)
        console.log('login响应：', res.data);
        if(res.data.code===10000){
          ElMessage.success('登录成功')
          localStorage.setItem('pz_token',res.data.data.token)
          localStorage.setItem('pz_userInfo',JSON.stringify(res.data.data.userInfo))
          
        /*   menuPermissions().then(({data})=>{
            MenuStore.dynamicMenu(data.data)
            console.log('登陆页面接口返回的路由数据：', data.data) // 确认这里有数据
            console.log('routerList', routerList)

            toRaw(routerList.value).forEach(item=>{
              router.addRoute('main',item)
            })
            await nextTick()
            router.push('/')
            
          }
        ) */
        // 1. 先获取菜单数据并存入 store
          const menuRes = await menuPermissions()
          const menuData = menuRes.data.data
          if (menuData) {
            localStorage.setItem('pz_v3pz', JSON.stringify(menuData))
            MenuStore.dynamicMenu(menuData)
            
            // 2. 获取添加完成后的路由列表
            const routes = MenuStore.routerList  // 或者 routerList.value
            // 3. 添加路由
            routes.forEach(item => {
              if (item && item.path) {
                router.addRoute('main', item)
              }
            })
            // 4. 确保路由添加完成后再跳转
            await nextTick()
            router.push('/')
          } else {
            console.error('menuPermissions 返回无效菜单数据', menuRes)
          }
        }
      })
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}


</script>

<style scoped lang="less">
:deep(.el-card__header) {
    padding: 0
  }
  .login-container {
    height: 100%;
    .card-header{
      background-color: #899fe1;
      img {
        width: 430px;
      }
    }
    .jump-link {
      text-align: right;
      margin-bottom: 10px;
    }
  }
</style>