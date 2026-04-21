<template>
  <div class="permissions-container">
    <el-card>
      <div slot="header" class="header">
        <span>权限管理</span>
        <div class="actions">
          <el-button type="primary" size="small" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增权限
          </el-button>
          <el-button type="danger" size="small" @click="handleClear">
            <i class="el-icon-delete"></i> 清空权限
          </el-button>
          <el-button type="success" size="small" @click="handleRefresh">
            <i class="el-icon-refresh"></i> 刷新
          </el-button>
        </div>
      </div>
      <el-table :data="permissions" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="权限名" width="150"></el-table-column>
        <el-table-column prop="code" label="权限码" width="180"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="info" size="small" @click="handleViewRoles(scope.row)">
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

    <!-- 新增/编辑权限对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="权限名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="权限码" prop="code">
          <el-input v-model="form.code" placeholder="如: user:view"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input-number v-model="form.type" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看角色对话框 -->
    <el-dialog title="权限角色" :visible.sync="roleDialogVisible" width="600px">
      <div>
        <span>当前权限：{{ currentPermission ? currentPermission.name : '' }}</span>
      </div>
      <el-table :data="permissionRoles" border stripe style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="角色名" width="150"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'Permissions',
  data() {
    return {
      loading: false,
      permissions: [],
      permissionRoles: [],
      dialogVisible: false,
      roleDialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      currentPermission: null,
      form: {
        id: null,
        name: '',
        code: '',
        type: 1,
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入权限名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入权限码', trigger: 'blur' }]
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
        await this.loadPermissions()
      } finally {
        this.loading = false
      }
    },
    async loadPermissions() {
      try {
        this.permissions = await api.getPermissions()
      } catch (e) {
        this.$message.error('加载权限数据失败')
      }
    },
    handleRefresh() {
      this.loadData()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增权限'
      this.form = {
        id: null,
        name: '',
        code: '',
        type: 1,
        description: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑权限'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            let result
            if (this.isEdit) {
              result = await api.updatePermission(this.form.id, this.form)
            } else {
              result = await api.createPermission(this.form)
            }
            this.$message.success(result || '操作成功')
            this.dialogVisible = false
            this.loadPermissions()
          } catch (e) {
            this.$message.error('操作失败')
          }
        }
      })
    },
    async handleDelete(row) {
      this.$confirm(`确定要删除权限 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await api.deletePermission(row.id)
          this.$message.success(result || '删除成功')
          this.loadPermissions()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async handleClear() {
      this.$confirm('确定要清空所有权限吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          const result = await api.clearPermissions()
          this.$message.success(result || '清空成功')
          this.loadPermissions()
        } catch (e) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    async handleViewRoles(permission) {
      this.currentPermission = permission
      this.permissionRoles = []
      try {
        this.permissionRoles = await api.getPermissionRoles(permission.id)
      } catch (e) {
        console.error('加载权限角色失败', e)
      }
      this.roleDialogVisible = true
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
