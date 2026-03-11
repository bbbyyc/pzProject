import axios from 'axios'
import { ElMessage } from 'element-plus';
const http = axios.create({
  baseURL: 'https://v3pz.itndedu.com/v3pz',
  timeout: 10000,
});

// 定义一个拦截器：在请求或响应被then或catch处理前拦截他们
// 添加请求拦截器
http.interceptors.request.use(function (config) {
    // 在发送请求之前的行为：
    const token=localStorage.getItem('pz_token')
    // 建立一个不需要token的白名单
    const whiteList=['/get/code','/user/authentication','/login']
    if(token&&!whiteList.includes(config.url)){
      // 把token放入请求头中X-token的位置，这个请求到底能不能成功另说，需要后端判断才知道是否成功:
      config.headers['x-token']=token
    }
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
http.interceptors.response.use(function (response) {
    // 对接口异常的数据，给用户提示
    if(response.data.code===-1){
      ElMessage.warning(response.data.message)
    }
    if(response.data.code===-2){
      localStorage.removeItem('pz_token')
      localStorage.removeItem('pz_userInfo')
      localStorage.removeItem('pz_v3pz')
      window.location.href=window.location.origin
    }
    return response;
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  });

  export default http