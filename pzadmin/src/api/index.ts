import request from '../utils/request'
// 发送验证码的参数类型
interface GetCodeParams {
  tel: string; // 手机号
}

// 验证验证码（注册）的参数类型
interface UserAuthenticationParams {
  userName: string;
  passWord: string;
  validCode: string;
}

// 登录的参数类型
interface LoginParams {
  userName: string;
  passWord: string;
}

// 账号管理的参数类型
interface AuthAdminParams {
  pageNum: number;
  pageSize: number;
  // 可根据接口文档添加其他参数
}

// 菜单权限修改参数类型
interface userSetMenu {
  name: string;
  permissions: string;
  id: number
}

// 菜单权限列表参数类型
interface menuList {
  pageNum: number;
  pageSize: number;
}

// 用户信息修改
interface updateUser {
  name: string;
  permissions_id: string;
  id?: string | number;
}

// 陪护师创建接口
interface companion {
  id: number,
  mobile: string;
  active: number,
  age: number,
  avatar: string;
  name: string;
  sex: string;
}

// 陪护师列表接口
interface companionList {
  pageNum: number;
  pageSize: number;
}

// 陪护师删除
interface delectCompanion {
  id: string
}


// 发送验证码的api
export const getCode = (data: GetCodeParams) => {
  return request.post('/get/code', data)
}

// 验证验证码的api
export const userAuthentication = (data: UserAuthenticationParams) => {
  return request.post('/user/authentication', data)
}

// 验证登录的的api
export const Alogin = (data: LoginParams) => {
  return request.post('/login', data)
}

// 账号管理 :获取管理员列表
export const authAdmin = (parmas: AuthAdminParams) => {
  return request.get('/auth/admin', {
    params: parmas
  })
}

// 菜单权限数据 实现的是挂载的时候初始化弹窗的选项
export const userGetMenu = () => {
  return request.get('/user/getmenu')
}

// 菜单权限修改
export const userSetMenu = (data: userSetMenu) => {
  return request.post('/user/setmenu', data)
}

// 菜单权限列表
export const menuList = (params: menuList) => {
  return request.get('/menu/list', {
    params: params
  })
}

// 账号管理：菜单权限下拉，：获取权限组下拉列表
export const menuSelectList = () => {
  return request.get('/menu/selectlist')
}

// 编辑管理员信息
export const updateUser = (data: updateUser) => {
  return request.post('/update/user', data)
}

// 获取用户菜单权限
// 此接口返回的是权限信息，同时根据接口文件，还需要通过token拿到用户权限->推断出是在登陆的时候调用此接口
export const menuPermissions = () => {
  return request.get('/menu/permissions')
}

// 陪护师弹窗
export const companion = (data: companion) => {
  return request.post('/companion', data)
}

// 得到陪护师头像
export const photoList = () => {
  return request.get('/photo/list')
}

// 陪护师列表
export const companionList = (params: companionList) => {
  return request.get('/companion/list', {
    params: params
  })
}

// 陪护师删除
export const delectCompanion = (data: delectCompanion) => {
  return request.post('/delete/companion', data)
}

// 订单列表
export const adminOrder = (params: companionList) => {
  return request.get('/admin/order', {
    params: params
  })
}

// 服务状态完成/update/order
export const updateOrder = (data: string) => {
  return request.post('/update/order', data)
}