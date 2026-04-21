<template>
  <div class="init-container">
    <el-card>
      <div slot="header">
        <span>数据初始化</span>
      </div>
      <el-alert
        title="提示"
        type="info"
        description="点击下方按钮可以一键初始化完整的测试数据，包括用户、角色、权限及其关联关系。"
        show-icon
        style="margin-bottom: 20px;">
      </el-alert>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="primary" size="large" @click="handleInitAll" style="width: 100%;">
            <i class="el-icon-refresh"></i> 一键初始化所有数据
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="danger" size="large" @click="handleClearAll" style="width: 100%;">
            <i class="el-icon-delete"></i> 清空所有数据
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span>分步初始化（可选）</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="success" @click="handleCreateSampleUsers">
            <i class="el-icon-user"></i> 创建示例用户
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="success" @click="handleCreateSampleRoles">
            <i class="el-icon-s-custom"></i> 创建示例角色
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="success" @click="handleCreateSamplePermissions">
            <i class="el-icon-key"></i> 创建示例权限
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span>测试数据预览</span>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户数据" name="users">
          <el-table :data="users" border stripe>
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
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="角色数据" name="roles">
          <el-table :data="roles" border stripe>
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
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="权限数据" name="permissions">
          <el-table :data="permissions" border stripe>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="权限名" width="150"></el-table-column>
            <el-table-column prop="code" label="权限码" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag>{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'Init',
  data() {
    return {
      activeTab: 'users',
      users: [],
      roles: [],
      permissions: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      await Promise.all([
        this.loadUsers(),
        this.loadRoles(),
        this.loadPermissions()
      ])
    },
    async loadUsers() {
      try {
        this.users = await api.getUsers()
      } catch (e) {
        console.error('加载用户数据失败', e)
      }
    },
    async loadRoles() {
      try {
        this.roles = await api.getRoles()
      } catch (e) {
        console.error('加载角色数据失败', e)
      }
    },
    async loadPermissions() {
      try {
        this.permissions = await api.getPermissions()
      } catch (e) {
        console.error('加载权限数据失败', e)
      }
    },
    async handleInitAll() {
      this.$confirm('确定要初始化所有测试数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await api.initAllData()
          this.$message.success(result || '初始化成功')
          await this.loadData()
        } catch (e) {
          this.$message.error('初始化失败')
        }
      }).catch(() => {})
    },
    async handleClearAll() {
      this.$confirm('确定要清空所有数据吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          const result = await api.clearAllData()
          this.$message.success(result || '清空成功')
          await this.loadData()
        } catch (e) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    async handleCreateSampleUsers() {
      try {
        const result = await api.createSampleUsers()
        this.$message.success(result || '创建成功')
        await this.loadUsers()
      } catch (e) {
        this.$message.error('创建失败')
      }
    },
    async handleCreateSampleRoles() {
      try {
        const result = await api.createSampleRoles()
        this.$message.success(result || '创建成功')
        await this.loadRoles()
      } catch (e) {
        this.$message.error('创建失败')
      }
    },
    async handleCreateSamplePermissions() {
      try {
        const result = await api.createSamplePermissions()
        this.$message.success(result || '创建成功')
        await this.loadPermissions()
      } catch (e) {
        this.$message.error('创建失败')
      }
    }
  }
}
</script>

<style scoped>
.init-container {
  padding: 0;
}
</style>
