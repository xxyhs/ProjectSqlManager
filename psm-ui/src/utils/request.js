import axios from 'axios'
// import { ElMessage } from 'element-plus';
const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000/api' : '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    import.meta.env.DEV && console.log('request error', error.toJSON())
    const errorMessage = error.response && error.response.data && error.response.data.msg || 'api request error'
    const errorStatus = error.response && error.response.status || 'unknow'
    ElMessage.error(`[${errorStatus}]${errorMessage}`)
    return Promise.reject(error);
  }
)

const request = {
  get: (url, params, options = {}) => {
    return api({
      url,
      method: 'get',
      params,
      ...options
    })
  },
  post: (url, body, params, options = {}) => {
    return api({
      method: 'post',
      url: url,
      data: body,
      params,
      ...options

    })
  },
  put: (url, body, params, options = {}) => {
    return api({
      url,
      method: 'put',
      data: body,
      params,
      ...options
    })
  },
  delete: (url, params, options = {}) => {
    return api({ 
      url,
      method: 'delete',
      params,
      ...options
    })
  }
}

export default request
