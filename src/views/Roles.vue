<template>
  <div class="roles-container">
    <el-card>
      <div slot="header" class="header">
        <span>角色管理</span>
        <div class="actions">
          <el-button type="primary" size="small" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增角色
          </el-button>
          <el-button type="danger" size="small" @click="handleClear">
            <i class="el-icon-delete"></i> 清空角色
          </el-button>
          <el-button type="success" size="small" @click="handleRefresh">
            <i class="el-icon-refresh"></i> 刷新
          </el-button>
        </div>
      </div>
      <el-table :data="roles" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="角色名" width="150"></el-table-column>
        <el-table-column prop="roleType" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.roleType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template slot-scope="scope">
            <el-button type="info" size="small" @click="handleViewUsers(scope.row)">
              用户
            </el-button>
            <el-button type="primary" size="small" @click="handleViewPermissions(scope.row)">
              权限
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-input-number v-model="form.roleType" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看用户对话框 -->
    <el-dialog title="角色用户" :visible.sync="userDialogVisible" width="600px">
      <div>
        <span>当前角色：{{ currentRole ? currentRole.name : '' }}</span>
      </div>
      <el-table :data="roleUsers" border stripe style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="nickname" label="昵称"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="permissionDialogVisible" width="600px">
      <div>
        <span>当前角色：{{ currentRole ? currentRole.name : '' }}</span>
      </div>
      <el-checkbox-group v-model="selectedPermissionIds" style="margin-top: 20px;">
        <el-checkbox v-for="perm in allPermissions" :key="perm.id" :label="perm.id">
          {{ perm.name }} ({{ perm.code }})
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignPermissions">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'Roles',
  data() {
    return {
      loading: false,
      roles: [],
      allUsers: [],
      allPermissions: [],
      roleUsers: [],
      dialogVisible: false,
      userDialogVisible: false,
      permissionDialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      currentRole: null,
      selectedPermissionIds: [],
      pageNum: 1,
      pageSize: 20,
      total: 0,
      form: {
        id: null,
        name: '',
        roleType: 1,
        description: '',
        status: 1
      },
      rules: {
        name: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadRoles(),
          this.loadUsers(),
          this.loadPermissions()
        ])
      } finally {
        this.loading = false
      }
    },
    async loadRoles() {
      try {
        const result = await api.getRoles({ pageNum: this.pageNum, pageSize: this.pageSize })
        this.roles = result.list || []
        this.total = result.total || 0
      } catch (e) {
        this.$message.error('加载角色数据失败')
      }
    },
    async loadUsers() {
      try {
        const result = await api.getUsers()
        this.allUsers = result.list || result || []
      } catch (e) {
        console.error('加载用户数据失败', e)
      }
    },
    async loadPermissions() {
      try {
        const result = await api.getPermissions()
        this.allPermissions = result.list || result || []
      } catch (e) {
        console.error('加载权限数据失败', e)
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadRoles()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.loadRoles()
    },
    handleRefresh() {
      this.pageNum = 1
      this.loadData()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增角色'
      this.form = {
        id: null,
        name: '',
        roleType: 1,
        description: '',
        status: 1
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑角色'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            let result
            if (this.isEdit) {
              result = await api.updateRole(this.form.id, this.form)
            } else {
              result = await api.createRole(this.form)
            }
            this.$message.success(result || '操作成功')
            this.dialogVisible = false
            this.loadRoles()
          } catch (e) {
            this.$message.error('操作失败')
          }
        }
      })
    },
    async handleDelete(row) {
      this.$confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await api.deleteRole(row.id)
          this.$message.success(result || '删除成功')
          this.loadRoles()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async handleClear() {
      this.$confirm('确定要清空所有角色吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          const result = await api.clearRoles()
          this.$message.success(result || '清空成功')
          this.pageNum = 1
          this.loadRoles()
        } catch (e) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    async handleViewUsers(role) {
      this.currentRole = role
      this.roleUsers = []
      try {
        this.roleUsers = await api.getRoleUsers(role.id)
      } catch (e) {
        console.error('加载角色用户失败', e)
      }
      this.userDialogVisible = true
    },
    async handleViewPermissions(role) {
      this.currentRole = role
      this.selectedPermissionIds = []
      try {
        const rolePermissions = await api.getPermissionsByRole(role.id)
        this.selectedPermissionIds = rolePermissions.map(p => p.id)
      } catch (e) {
        console.error('加载角色权限失败', e)
      }
      this.permissionDialogVisible = true
    },
    async handleAssignPermissions() {
      try {
        const result = await api.assignPermissionsToRole(this.currentRole.id, this.selectedPermissionIds)
        this.$message.success(result || '分配成功')
        this.permissionDialogVisible = false
      } catch (e) {
        this.$message.error('分配失败')
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
