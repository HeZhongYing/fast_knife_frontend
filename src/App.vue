<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>Fast Knife - RBAC 权限管理系统</h1>
        <div class="data-source-switcher">
          <span class="label">当前数据源:</span>
          <el-tag :type="currentDataSource === 'JVM' ? 'warning' : 'success'" size="medium" class="data-source-tag">
            <i :class="currentDataSource === 'JVM' ? 'el-icon-magic-stick' : 'el-icon-s-data'"></i>
            {{ currentDataSource === 'JVM' ? 'JVM 内存' : 'MySQL' }}
          </el-tag>
          <el-button-group>
            <el-button
              :type="currentDataSource === 'JVM' ? 'warning' : 'default'"
              size="small"
              @click="switchDataSource('JVM')"
              :plain="currentDataSource !== 'JVM'">
              <i class="el-icon-magic-stick"></i> 切换到 JVM
            </el-button>
            <el-button
              :type="currentDataSource === 'MYSQL' ? 'success' : 'default'"
              size="small"
              @click="switchDataSource('MYSQL')"
              :plain="currentDataSource !== 'MYSQL'">
              <i class="el-icon-s-data"></i> 切换到 MySQL
            </el-button>
          </el-button-group>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="$route.path"
            router
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
            <el-menu-item index="/init">
              <i class="el-icon-setting"></i>
              <span slot="title">初始化</span>
            </el-menu-item>
            <el-menu-item index="/users">
              <i class="el-icon-user"></i>
              <span slot="title">用户管理</span>
            </el-menu-item>
            <el-menu-item index="/roles">
              <i class="el-icon-s-custom"></i>
              <span slot="title">角色管理</span>
            </el-menu-item>
            <el-menu-item index="/permissions">
              <i class="el-icon-key"></i>
              <span slot="title">权限管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
    <ApiMonitor :current-data-source="currentDataSource" />
  </div>
</template>

<script>
import ApiMonitor from './components/ApiMonitor.vue'
import api from './api/index'

export default {
  name: 'App',
  components: {
    ApiMonitor
  },
  data() {
    return {
      currentDataSource: 'JVM'
    }
  },
  created() {
    this.fetchCurrentDataSource()
  },
  methods: {
    async fetchCurrentDataSource() {
      try {
        const data = await api.getDataSource()
        this.currentDataSource = data.current
      } catch (error) {
        console.error('获取当前数据源失败:', error)
      }
    },
    async switchDataSource(newType) {
      if (this.currentDataSource === newType) return
      try {
        await api.switchDataSource(newType)
        this.currentDataSource = newType
        this.$message.success(`数据源已切换为 ${newType === 'JVM' ? 'JVM 内存' : 'MySQL'}`)
      } catch (error) {
        console.error('切换数据源失败:', error)
        this.$message.error('切换数据源失败')
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.el-header h1 {
  margin: 0;
  font-size: 24px;
}
.data-source-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
}
.data-source-switcher .label {
  font-size: 14px;
}
.data-source-tag {
  font-size: 14px;
  font-weight: bold;
  padding: 6px 12px;
}
.el-aside {
  background-color: #545c64;
  min-height: calc(100vh - 60px);
}
.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
