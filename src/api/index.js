//配置全局axios的代码文件
import axios from "axios";
import Element from "element-ui";
import router from "@/router";

//进行全局axios设置，需要定义一个新的axios，进行全局设置
//myaxios就是进行了全局设置之后的对象，组件中使用myaxios对象
const myaxios = axios.create({
    timeout:5000, //设置超时时间

})

//进行基础路径设置:基础路径就是请求Java服务器端路径前缀。
//目前开发阶段，使用的是mockjs，没有地址前缀，后续生成环境中需要解开
myaxios.defaults.baseURL = '/sys'
// myaxios.default.baseURL = 'http://localhost:10001'

//设置axios请求携带token，进行全局设置。
//interceptors拦截器（请求前，请求之后(响应数据之前)）
myaxios.interceptors.request.use(config => {
    //从localStorage取出token，设置到axios的请求头中，这样请求头中，会自带token信息
    config.headers['TOKEN'] = JSON.parse(localStorage.getItem('TOKEN'))
    return config
})

//对于axios响应状态（包括2000，或者失败）做全局处理
myaxios.interceptors.response.use(response => {
    let Result = response.data //从响应对象中获得服务器端返回Result
    if(Result.code == 20000){
        return response
    }else{
        Element.Message.warning(Result.message ? Result.message : '系统执行异常')
        return Promise.reject(response.data.message)
    }
},
error => {
    //error错误不是Java程序返回的，而是http请求错误
    if(error.response.status == 401){
        //Java服务器上的API接口方法是权限限制，当前登录用户没有权限访问时，会报401报错
        router.push('/login')
        return Promise.reject(error)
    }
    if(error.response.status == 404){
        router.push('/notfound')
        return Promise.reject(error)
    }
    if(error.response.status == 400){
        //请求Java服务器端方法方式错误
        error.message = '请求服务器端方法错误'
    }
    if(error.response.status == 500){
        //java代码错误
        error.message = '服务器代码错误'
    }
    Element.message.warning(error.message)
    return Promise.reject(error)
}
)
export default myaxios

