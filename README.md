# fast_knife_frontend

Fast Knife 后端项目的前端管理界面，基于 Vue2 + ElementUI 实现。

## 技术栈

- Vue 2.7.14
- Vue Router 3.6.5
- Element UI 2.15.14
- Axios 1.6.0
- ECharts 5.x

## 功能特性

### 核心功能
- ✅ 数据初始化：一键创建/清空测试数据
- ✅ 用户管理：增删改查、分配角色
- ✅ 角色管理：增删改查、查看用户、分配权限
- ✅ 权限管理：增删改查、查看关联角色
- ✅ 模糊查询：用户列表支持按用户名/昵称搜索
- ✅ 分页查询：接口列表支持分页展示

### 数据源切换
- 🔄 JVM 内存模式（默认）
- 🔄 MySQL 模式
- 📊 实时切换，无需重启

### 接口耗时监控
- 📈 实时展示接口调用耗时
- 📉 折线图对比 JVM/MySQL 性能（仅用户查询接口）
- 📋 表格展示所有列表查询接口详情
- 🏷️ 耗时分级颜色标识：
  - 绿色：<100ms
  - 蓝色：100-500ms
  - 橙色：500-1000ms
  - 红色：>1000ms

## 快速开始

### 前置要求

- Node.js 14+
- npm 或 yarn
- 后端服务运行在 http://localhost:8888

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run serve
```

前端将在 http://localhost:8080 启动。

### 生产构建

```bash
npm run build
```

## 项目结构

```
src/
├── api/
│   └── index.js           # API 接口封装 + 耗时监控事件总线
├── components/
│   └── ApiMonitor.vue     # 接口耗时监控组件
├── router/
│   └── index.js           # 路由配置
├── views/
│   ├── Init.vue           # 数据初始化页面
│   ├── Users.vue          # 用户管理页面
│   ├── Roles.vue          # 角色管理页面
│   └── Permissions.vue    # 权限管理页面
├── App.vue                # 根组件（含数据源切换）
└── main.js                # 入口文件
```

## 使用说明

1. 启动后端服务（fast_knife）
2. 启动前端服务
3. 访问 http://localhost:8080
4. 进入「初始化」页面，点击「一键初始化所有数据」
5. 开始使用用户、角色、权限管理功能
6. 点击右下角「接口监控」查看耗时统计
7. 在右上角切换 JVM/MySQL 数据源进行性能对比

## 代理配置

开发环境已配置代理，`/api` 请求会转发到 `http://localhost:8888`，详见 `vue.config.js`。

## 接口超时配置

默认超时时间 60 秒，可在 `src/api/index.js` 中修改 `timeout` 配置。
