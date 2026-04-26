<template>
  <panelHead :route="route" />

  <div class="dashboard">
    <div class="top-cards">
      <el-card class="user-card" shadow="never">
        <div class="user-content">
          <el-avatar class="avatar" :size="72" :src="userInfo.avatar" />
          <div class="user-meta">
            <p class="name">{{ userInfo.name }}</p>
            <p class="role">当前权限：{{ userInfo.role }}</p>
            <p class="ip">登录ip：{{ loginIp }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" shadow="never">
        <div class="status-grid">
          <div class="status-item">
            <el-icon class="status-icon wait"><WalletFilled /></el-icon>
            <div>
              <p class="status-num">{{ stateCount.pendingPay }}</p>
              <p class="status-text">待支付</p>
            </div>
          </div>
          <div class="status-item">
            <el-icon class="status-icon service"><Clock /></el-icon>
            <div>
              <p class="status-num">{{ stateCount.waitService }}</p>
              <p class="status-text">待服务</p>
            </div>
          </div>
          <div class="status-item">
            <el-icon class="status-icon done"><Select /></el-icon>
            <div>
              <p class="status-num">{{ stateCount.finished }}</p>
              <p class="status-text">已完成</p>
            </div>
          </div>
          <div class="status-item">
            <el-icon class="status-icon cancel"><CircleCloseFilled /></el-icon>
            <div>
              <p class="status-num">{{ stateCount.cancelled }}</p>
              <p class="status-text">已取消</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="chart-card" shadow="never">
      <div class="chart-title">订单趋势</div>
      <div class="chart-wrap">
        <svg viewBox="0 0 760 280" preserveAspectRatio="none">
          <g class="grid">
            <line v-for="line in 5" :key="line" x1="60" :y1="line * 46" x2="730" :y2="line * 46" />
          </g>
          <g class="axis-text">
            <text
              v-for="(label, idx) in trendData.labels"
              :key="label"
              :x="70 + idx * 165"
              y="266"
            >
              {{ label }}
            </text>
          </g>
          <polyline :points="trendPolyline" class="line-path" />
          <g class="points">
            <circle
              v-for="(point, idx) in trendPointList"
              :key="idx"
              :cx="point.x"
              :cy="point.y"
              r="4"
            />
          </g>
        </svg>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import {
  CircleCloseFilled,
  Clock,
  Select,
  WalletFilled
} from '@element-plus/icons-vue'
import { adminOrder } from '../../api'

const route = useRoute()

type OrderItem = {
  trade_state: string
  order_start_time: number | string
}

const loginIp = '127.0.0.1'

const userInfo = reactive({
  name: '管理员',
  role: '超级管理员',
  avatar: ''
})

const stateCount = reactive({
  pendingPay: 0,
  waitService: 0,
  finished: 0,
  cancelled: 0
})

const trendData = reactive({
  labels: [] as string[],
  values: [] as number[]
})

const trendPointList = computed(() => {
  const values = trendData.values.length ? trendData.values : [0, 0, 0, 0, 0]
  const maxVal = Math.max(...values, 1)
  return values.map((value, idx) => {
    const x = 70 + idx * 165
    const y = 230 - (value / maxVal) * 150
    return { x, y }
  })
})

const trendPolyline = computed(() => trendPointList.value.map((p) => `${p.x},${p.y}`).join(' '))

const buildDefaultTrend = () => {
  const labels: string[] = []
  const values: number[] = []
  for (let i = 4; i >= 0; i -= 1) {
    labels.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
    values.push(0)
  }
  trendData.labels = labels
  trendData.values = values
}

const fillUserInfo = () => {
  const localUser = localStorage.getItem('pz_userInfo')
  if (!localUser) return
  try {
    const parsed = JSON.parse(localUser)
    userInfo.name = parsed?.name || '管理员'
    userInfo.avatar = parsed?.avatar || ''
  } catch (error) {
    console.error('解析用户信息失败', error)
  }
}

const setStateCounter = (list: OrderItem[]) => {
  stateCount.pendingPay = 0
  stateCount.waitService = 0
  stateCount.finished = 0
  stateCount.cancelled = 0

  list.forEach((item) => {
    if (item.trade_state === '待支付') stateCount.pendingPay += 1
    if (item.trade_state === '待服务') stateCount.waitService += 1
    if (item.trade_state === '已完成') stateCount.finished += 1
    if (item.trade_state === '已取消') stateCount.cancelled += 1
  })
}

const setTrend = (list: OrderItem[]) => {
  const labels: string[] = []
  const map: Record<string, number> = {}

  for (let i = 4; i >= 0; i -= 1) {
    const label = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    labels.push(label)
    map[label] = 0
  }

  list.forEach((item) => {
    const key = dayjs(item.order_start_time).format('YYYY-MM-DD')
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] = (map[key] || 0) + 1
    }
  })

  trendData.labels = labels
  trendData.values = labels.map((label) => map[label] ?? 0)
}

const getDashboardData = async () => {
  buildDefaultTrend()
  try {
    const { data } = await adminOrder({ pageNum: 1, pageSize: 100 })
    const list = (data?.data?.list || []) as OrderItem[]
    setStateCounter(list)
    setTrend(list)
  } catch (error) {
    console.error('获取控制台数据失败', error)
  }
}

onMounted(() => {
  fillUserInfo()
  getDashboardData()
})
</script>

<style scoped lang="less">
.dashboard {
  margin-top: 15px;
}

.top-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1.15fr;
}

.user-card,
.status-card,
.chart-card {
  border: 1px solid #ebeef5;
}

.user-content {
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  border: 1px solid #ebeef5;
}

.user-meta {
  .name {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .role,
  .ip {
    color: #606266;
    line-height: 1.8;
  }
}

.status-grid {
  min-height: 130px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-icon {
  font-size: 34px;
}

.wait {
  color: #e05a47;
}

.service {
  color: #715ecf;
}

.done {
  color: #45b3d9;
}

.cancel {
  color: #6ac048;
}

.status-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.status-text {
  margin-top: 3px;
  color: #606266;
}

.chart-card {
  margin-top: 16px;
}

.chart-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.chart-wrap {
  width: 100%;
  height: 320px;
}

svg {
  width: 100%;
  height: 100%;
}

.grid line {
  stroke: #e8ebf0;
}

.axis-text text {
  fill: #909399;
  font-size: 12px;
}

.line-path {
  fill: none;
  stroke: #89d1ca;
  stroke-width: 2;
}

.points circle {
  fill: #89d1ca;
}
</style>