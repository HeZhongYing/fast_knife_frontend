<template>
  <div class="users-container">
    <el-card>
      <div slot="header" class="header">
        <span>用户管理</span>
        <div class="actions">
          <el-button type="primary" size="small" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增用户
          </el-button>
          <el-button type="danger" size="small" @click="handleClear">
            <i class="el-icon-delete"></i> 清空用户
          </el-button>
          <el-button type="success" size="small" @click="handleRefresh">
            <i class="el-icon-refresh"></i> 刷新
          </el-button>
        </div>
      </div>
      <el-table :data="users" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="130"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleViewRoles(scope.row)">
              角色
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
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="500px">
      <div>
        <span>当前用户：{{ currentUser ? currentUser.nickname : '' }}</span>
      </div>
      <el-checkbox-group v-model="selectedRoleIds" style="margin-top: 20px;">
        <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">
          {{ role.name }}
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignRoles">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'Users',
  data() {
    return {
      loading: false,
      users: [],
      allRoles: [],
      dialogVisible: false,
      roleDialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      currentUser: null,
      selectedRoleIds: [],
      form: {
        id: null,
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        status: 1,
        remark: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
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
          this.loadUsers(),
          this.loadRoles()
        ])
      } finally {
        this.loading = false
      }
    },
    async loadUsers() {
      try {
        this.users = await api.getUsers()
      } catch (e) {
        this.$message.error('加载用户数据失败')
      }
    },
    async loadRoles() {
      try {
        this.allRoles = await api.getRoles()
      } catch (e) {
        console.error('加载角色数据失败', e)
      }
    },
    handleRefresh() {
      this.loadData()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增用户'
      this.form = {
        id: null,
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        status: 1,
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            let result
            if (this.isEdit) {
              result = await api.updateUser(this.form.id, this.form)
            } else {
              result = await api.createUser(this.form)
            }
            this.$message.success(result || '操作成功')
            this.dialogVisible = false
            this.loadUsers()
          } catch (e) {
            this.$message.error('操作失败')
          }
        }
      })
    },
    async handleDelete(row) {
      this.$confirm(`确定要删除用户 "${row.nickname}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await api.deleteUser(row.id)
          this.$message.success(result || '删除成功')
          this.loadUsers()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async handleClear() {
      this.$confirm('确定要清空所有用户吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          const result = await api.clearUsers()
          this.$message.success(result || '清空成功')
          this.loadUsers()
        } catch (e) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    async handleViewRoles(user) {
      this.currentUser = user
      this.selectedRoleIds = []
      try {
        const userRoles = await api.getUserRoles(user.id)
        this.selectedRoleIds = userRoles.map(r => r.id)
      } catch (e) {
        console.error('加载用户角色失败', e)
      }
      this.roleDialogVisible = true
    },
    async handleAssignRoles() {
      try {
        const result = await api.assignRolesToUser(this.currentUser.id, this.selectedRoleIds)
        this.$message.success(result || '分配成功')
        this.roleDialogVisible = false
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
</style>
