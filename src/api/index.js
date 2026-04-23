import axios from 'axios'
import Vue from 'vue'

// 创建一个事件总线，用于传递耗时数据
export const apiMonitorBus = new Vue()

const request = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 请求拦截器：记录开始时间
request.interceptors.request.use(
  config => {
    config._startTime = Date.now()
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 格式化时间为 hh:mm:ss
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 根据URL判断实现类型
function getImplType(url) {
  // 简单判断规则：根据接口路径或其他特征区分，这里默认JVM，可扩展
  return 'JVM'
}

// 响应拦截器：计算耗时
request.interceptors.response.use(
  response => {
    const endTime = Date.now()
    const startTime = response.config._startTime || endTime
    const duration = endTime - startTime

    // 提取接口信息
    const url = response.config.url || ''
    const method = response.config.method || 'GET'
    const fullUrl = url.startsWith('/api') ? url : `/api${url}`

    // 从响应头获取实现类型（如果后端返回了 X-Impl-Type）
    const implType = response.headers['x-impl-type'] || 'JVM'

    // 发送耗时数据到监控组件
    apiMonitorBus.$emit('api-call', {
      url: fullUrl,
      method: method.toUpperCase(),
      duration: duration,
      timestamp: formatTime(new Date()),
      status: 'success',
      implType: implType
    })

    return response.data
  },
  error => {
    const endTime = Date.now()
    const startTime = error.config?._startTime || endTime
    const duration = endTime - startTime

    const url = error.config?.url || ''
    const method = error.config?.method || 'GET'
    const fullUrl = url.startsWith('/api') ? url : `/api${url}`

    apiMonitorBus.$emit('api-call', {
      url: fullUrl,
      method: method.toUpperCase(),
      duration: duration,
      timestamp: formatTime(new Date()),
      status: 'error',
      implType: 'JVM'
    })

    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default {
  // 初始化接口
  initAllData() {
    return request.post('/init/all')
  },
  clearAllData() {
    return request.delete('/init/all')
  },

  // 用户接口
  getUsers(params) {
    return request.get('/users', { params })
  },
  getUserById(id) {
    return request.get(`/users/${id}`)
  },
  getUserRoles(userId) {
    return request.get(`/users/${userId}/roles`)
  },
  createUser(data) {
    return request.post('/users', data)
  },
  updateUser(id, data) {
    return request.put(`/users/${id}`, data)
  },
  assignRolesToUser(userId, roleIds) {
    return request.post(`/users/${userId}/roles`, roleIds)
  },
  deleteUser(id) {
    return request.delete(`/users/${id}`)
  },
  clearUsers() {
    return request.delete('/users/clear')
  },
  createSampleUsers() {
    return request.post('/users/sample')
  },

  // 角色接口
  getRoles(params) {
    return request.get('/roles', { params })
  },
  getRoleById(id) {
    return request.get(`/roles/${id}`)
  },
  getRoleUsers(roleId) {
    return request.get(`/roles/${roleId}/users`)
  },
  createRole(data) {
    return request.post('/roles', data)
  },
  updateRole(id, data) {
    return request.put(`/roles/${id}`, data)
  },
  assignUsersToRole(roleId, userIds) {
    return request.post(`/roles/${roleId}/users`, userIds)
  },
  deleteRole(id) {
    return request.delete(`/roles/${id}`)
  },
  clearRoles() {
    return request.delete('/roles/clear')
  },
  createSampleRoles() {
    return request.post('/roles/sample')
  },

  // 权限接口
  getPermissions(params) {
    return request.get('/permissions', { params })
  },
  getPermissionById(id) {
    return request.get(`/permissions/${id}`)
  },
  getPermissionRoles(permissionId) {
    return request.get(`/permissions/${permissionId}/roles`)
  },
  getPermissionsByRole(roleId) {
    return request.get(`/permissions/by-role/${roleId}`)
  },
  createPermission(data) {
    return request.post('/permissions', data)
  },
  updatePermission(id, data) {
    return request.put(`/permissions/${id}`, data)
  },
  assignPermissionsToRole(roleId, permissionIds) {
    return request.post(`/permissions/by-role/${roleId}`, permissionIds)
  },
  deletePermission(id) {
    return request.delete(`/permissions/${id}`)
  },
  clearPermissions() {
    return request.delete('/permissions/clear')
  },
  createSamplePermissions() {
    return request.post('/permissions/sample')
  },

  // 数据源管理接口
  getDataSource() {
    return request.get('/datasource')
  },
  switchDataSource(type) {
    return request.put(`/datasource/${type}`)
  }
}
