<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>Fast Knife - RBAC 权限管理系统</h1>
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
    <ApiMonitor />
  </div>
</template>

<script>
import ApiMonitor from './components/ApiMonitor.vue'

export default {
  name: 'App',
  components: {
    ApiMonitor
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
}
.el-header h1 {
  margin: 0;
  font-size: 24px;
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
