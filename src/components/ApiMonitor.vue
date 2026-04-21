<template>
  <div class="api-monitor">
    <el-button
      class="toggle-btn"
      :type="visible ? 'warning' : 'primary'"
      size="small"
      @click="toggleVisible">
      <i :class="visible ? 'el-icon-arrow-down' : 'el-icon-data-analysis'"></i>
      {{ visible ? '隐藏监控' : '接口监控' }}
      <span v-if="!visible && stats.total > 0" class="badge">{{ stats.total }}</span>
    </el-button>

    <transition name="slide">
      <div v-if="visible" class="monitor-panel">
        <div class="panel-header">
          <span class="title">接口耗时监控</span>
          <div class="header-actions">
            <el-tag type="info" size="small">平均: {{ stats.avg }}ms</el-tag>
            <el-tag type="success" size="small">成功: {{ stats.success }}</el-tag>
            <el-tag type="danger" size="small">失败: {{ stats.error }}</el-tag>
            <el-button type="text" size="small" @click="clearRecords">清空</el-button>
          </div>
        </div>
        <div class="panel-content">
          <el-table :data="records" size="small" max-height="300" stripe>
            <el-table-column prop="timestamp" label="时间" width="90"></el-table-column>
            <el-table-column prop="method" label="方法" width="70">
              <template slot-scope="scope">
                <el-tag :type="getMethodType(scope.row.method)" size="mini">{{ scope.row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="url" label="接口"></el-table-column>
            <el-table-column prop="duration" label="耗时(ms)" width="100" sortable>
              <template slot-scope="scope">
                <span :class="getDurationClass(scope.row.duration)">
                  {{ scope.row.duration }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="60">
              <template slot-scope="scope">
                <i :class="scope.row.status === 'success' ? 'el-icon-circle-check success' : 'el-icon-circle-close error'"></i>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { apiMonitorBus } from '../api'

export default {
  name: 'ApiMonitor',
  data() {
    return {
      visible: false,
      records: [],
      maxRecords: 50
    }
  },
  computed: {
    stats() {
      const total = this.records.length
      const success = this.records.filter(r => r.status === 'success').length
      const error = total - success
      const avg = total > 0
        ? Math.round(this.records.reduce((sum, r) => sum + r.duration, 0) / total)
        : 0
      return { total, success, error, avg }
    }
  },
  mounted() {
    apiMonitorBus.$on('api-call', this.handleApiCall)
  },
  beforeDestroy() {
    apiMonitorBus.$off('api-call', this.handleApiCall)
  },
  methods: {
    handleApiCall(record) {
      this.records.unshift(record)
      if (this.records.length > this.maxRecords) {
        this.records.pop()
      }
    },
    toggleVisible() {
      this.visible = !this.visible
    },
    clearRecords() {
      this.records = []
    },
    getMethodType(method) {
      const types = {
        'GET': 'success',
        'POST': 'primary',
        'PUT': 'warning',
        'DELETE': 'danger'
      }
      return types[method] || 'info'
    },
    getDurationClass(duration) {
      if (duration < 100) return 'duration-fast'
      if (duration < 500) return 'duration-normal'
      if (duration < 1000) return 'duration-slow'
      return 'duration-very-slow'
    }
  }
}
</script>

<style scoped>
.api-monitor {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

.toggle-btn {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.badge {
  display: inline-block;
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  margin-left: 4px;
  min-width: 16px;
  text-align: center;
}

.monitor-panel {
  position: absolute;
  right: 0;
  bottom: 50px;
  width: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  background: #409EFF;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header .title {
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-actions .el-button {
  color: white;
}

.header-actions .el-button:hover {
  color: #ecf5ff;
}

.panel-content {
  padding: 10px;
}

.duration-fast {
  color: #67c23a;
  font-weight: bold;
}

.duration-normal {
  color: #409EFF;
}

.duration-slow {
  color: #e6a23c;
  font-weight: bold;
}

.duration-very-slow {
  color: #f56c6c;
  font-weight: bold;
}

.success {
  color: #67c23a;
  font-size: 16px;
}

.error {
  color: #f56c6c;
  font-size: 16px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  transform-origin: right bottom;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
