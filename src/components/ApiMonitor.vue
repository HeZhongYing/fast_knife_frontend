<template>
  <div class="api-monitor" ref="monitorRoot">
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
      <div v-if="visible" class="monitor-panel" ref="monitorPanel">
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
          <div class="chart-container" ref="chartContainer"></div>
          <div class="table-container">
            <el-table :data="records" size="small" max-height="450" stripe>
              <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
              <el-table-column prop="timestamp" label="时间" width="80"></el-table-column>
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
              <el-table-column prop="implType" label="实现类型" width="90">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.implType === 'JVM' ? 'primary' : 'success'" size="mini">{{ scope.row.implType }}</el-tag>
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
      </div>
    </transition>
  </div>
</template>

<script>
import { apiMonitorBus } from '../api'
import * as echarts from 'echarts'

export default {
  name: 'ApiMonitor',
  props: {
    currentDataSource: {
      type: String,
      default: 'JVM'
    }
  },
  data() {
    return {
      visible: false,
      records: [],
      maxRecords: 50,
      chartData: {
        JVM: [],
        MYSQL: []
      },
      maxChartPoints: 20,
      chart: null
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
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initChart()
        })
      }
    }
  },
  mounted() {
    apiMonitorBus.$on('api-call', this.handleApiCall)
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeDestroy() {
    apiMonitorBus.$off('api-call', this.handleApiCall)
    document.removeEventListener('click', this.handleOutsideClick)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    // 判断是否是用户查询接口
    isUserQueryApi(url, method) {
      if (method !== 'GET') return false
      // 只统计用户查询接口
      return /^\/api\/users(\?.*)?$/.test(url)
    },
    // 判断是否是列表查询接口（用于表格展示）
    isListQueryApi(url, method) {
      if (method !== 'GET') return false
      // 列表查询接口的URL模式
      const listPatterns = [
        /^\/api\/users$/,
        /^\/api\/roles$/,
        /^\/api\/permissions$/,
        /^\/api\/users\/\d+\/roles$/,
        /^\/api\/roles\/\d+\/users$/,
        /^\/api\/permissions\/\d+\/roles$/,
        /^\/api\/permissions\/by-role\/\d+$/
      ]
      return listPatterns.some(pattern => pattern.test(url))
    },
    handleApiCall(record) {
      // 使用当前数据源作为实现类型
      record.implType = this.currentDataSource

      // 表格展示所有列表查询接口
      if (this.isListQueryApi(record.url, record.method)) {
        this.records.unshift(record)
        if (this.records.length > this.maxRecords) {
          this.records.pop()
        }
      }

      // 只对用户查询接口记录图表数据
      if (this.isUserQueryApi(record.url, record.method)) {
        this.updateChartData(record)
      }
    },
    updateChartData(record) {
      const implType = record.implType
      const dataPoint = {
        time: record.timestamp,
        duration: record.duration
      }

      this.chartData[implType].push(dataPoint)

      // 限制数据点数量
      if (this.chartData[implType].length > this.maxChartPoints) {
        this.chartData[implType].shift()
      }

      // 更新图表
      if (this.chart && this.visible) {
        this.updateChart()
      }
    },
    initChart() {
      if (!this.$refs.chartContainer) return

      if (this.chart) {
        this.chart.dispose()
      }

      this.chart = echarts.init(this.$refs.chartContainer)
      this.updateChart()

      window.addEventListener('resize', this.handleChartResize)
    },
    updateChart() {
      if (!this.chart) return

      const option = {
        title: {
          text: '用户查询接口耗时对比',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let result = params[0].axisValue + '<br/>'
            params.forEach(param => {
              result += `${param.marker} ${param.seriesName}: ${param.value} ms<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['JVM', 'MYSQL'],
          bottom: 5
        },
        grid: {
          left: '3%',
          right: '4%',
          top: '15%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.getCombinedTimestamps()
        },
        yAxis: {
          type: 'value',
          name: '耗时(ms)',
          min: 0
        },
        series: [
          {
            name: 'JVM',
            type: 'line',
            smooth: true,
            data: this.getSeriesData('JVM'),
            itemStyle: { color: '#409EFF' },
            lineStyle: { color: '#409EFF', width: 2 }
          },
          {
            name: 'MYSQL',
            type: 'line',
            smooth: true,
            data: this.getSeriesData('MYSQL'),
            itemStyle: { color: '#67C23A' },
            lineStyle: { color: '#67C23A', width: 2 }
          }
        ]
      }

      this.chart.setOption(option)
    },
    getCombinedTimestamps() {
      const allTimes = []
      this.chartData.JVM.forEach(d => allTimes.push(d.time))
      this.chartData.MYSQL.forEach(d => allTimes.push(d.time))
      // 去重并保留最多20个
      const unique = [...new Set(allTimes)].slice(-this.maxChartPoints)
      return unique
    },
    getSeriesData(implType) {
      const timestamps = this.getCombinedTimestamps()
      const dataMap = {}
      this.chartData[implType].forEach(d => {
        dataMap[d.time] = d.duration
      })
      return timestamps.map(t => dataMap[t] || null)
    },
    handleChartResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    toggleVisible() {
      this.visible = !this.visible
    },
    clearRecords() {
      this.records = []
      this.chartData = {
        JVM: [],
        MYSQL: []
      }
      if (this.chart) {
        this.updateChart()
      }
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
    },
    handleOutsideClick(event) {
      if (!this.visible) return
      const root = this.$refs.monitorRoot
      if (root && !root.contains(event.target)) {
        this.visible = false
      }
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
  width: 1000px;
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

.chart-container {
  width: 100%;
  height: 400px;
  margin-bottom: 10px;
}

.table-container {
  border-top: 1px solid #eee;
  padding-top: 10px;
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
