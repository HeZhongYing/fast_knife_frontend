import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
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
  getUsers() {
    return request.get('/users')
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
  getRoles() {
    return request.get('/roles')
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
  getPermissions() {
    return request.get('/permissions')
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
  }
}
