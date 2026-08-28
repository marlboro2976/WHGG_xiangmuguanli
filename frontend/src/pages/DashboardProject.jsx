import { useMemo } from 'react'
import { Row, Col, Card } from 'antd'
import {
  TeamOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import mockData from '../mock/data.json'

const BLUE = '#1677ff'
const GREEN = '#52c41a'
const ORANGE = '#fa8c16'
const RED = '#ff4d4f'

function getAmount(item) {
  const v = item['投资金额（亿元）'] ?? item['投资金额(亿元)'] ?? 0
  return Number(v) || 0
}

function getIndustryCategory(item) {
  return item['对应"965"产业链类别'] || item['对应\u201c965\u201d产业链类别'] || item['行业类别（门类）'] || item['行业类别'] || '其他'
}

function getDeclareTime(item) {
  return item['申报时间'] || ''
}

function getProjectName(item) {
  return item['项目名称'] || '未命名项目'
}

function StatCard({ title, value, color, icon, bgColor }) {
  return (
    <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function DashboardProject() {
  const stats = useMemo(() => {
    const zaitan = mockData.zaitan || []
    const qianyue = mockData.qianyue || []
    const luodi = mockData.luodi || []
    const tuiku = mockData.tuiku || []

    const all = [...zaitan, ...qianyue, ...luodi, ...tuiku]

    const stagePie = [
      { name: '在谈', value: zaitan.length },
      { name: '签约', value: qianyue.length },
      { name: '落地', value: luodi.length },
      { name: '退库', value: tuiku.length },
    ]

    const industryMap = {}
    all.forEach((item) => {
      const cat = getIndustryCategory(item)
      industryMap[cat] = (industryMap[cat] || 0) + 1
    })
    const industryBar = Object.entries(industryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const monthMap = {}
    all.forEach((item) => {
      const t = getDeclareTime(item)
      if (!t) return
      const ym = t.slice(0, 7)
      monthMap[ym] = (monthMap[ym] || 0) + 1
    })
    const months = Object.keys(monthMap).sort().slice(-6)
    const monthLine = {
      months,
      values: months.map((m) => monthMap[m]),
    }

    const top10 = all
      .map((item) => ({ name: getProjectName(item), value: getAmount(item) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      zaitanCount: zaitan.length,
      qianyueCount: qianyue.length,
      luodiCount: luodi.length,
      tuikuCount: tuiku.length,
      stagePie,
      industryBar,
      monthLine,
      top10,
    }
  }, [])

  const pieOption = {
    color: [BLUE, GREEN, ORANGE, RED],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, icon: 'circle' },
    series: [
      {
        name: '项目阶段分布',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
        labelLine: { show: true },
        data: stats.stagePie,
      },
    ],
  }

  const industryOption = {
    color: [BLUE],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 60, right: 24, top: 24, bottom: 60 },
    xAxis: {
      type: 'category',
      data: stats.industryBar.map((i) => i.name),
      axisLabel: { rotate: 30, fontSize: 11, interval: 0 },
    },
    yAxis: { type: 'value', name: '项目数量' },
    series: [
      {
        name: '项目数量',
        type: 'bar',
        barWidth: 28,
        data: stats.industryBar.map((i) => i.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#4096ff' },
              { offset: 1, color: '#1677ff' },
            ],
          },
        },
      },
    ],
  }

  const lineOption = {
    color: [BLUE],
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 32, bottom: 32 },
    xAxis: { type: 'category', boundaryGap: false, data: stats.monthLine.months },
    yAxis: { type: 'value', name: '申报数' },
    series: [
      {
        name: '申报项目数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: stats.monthLine.values,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22,119,255,0.35)' },
              { offset: 1, color: 'rgba(22,119,255,0.02)' },
            ],
          },
        },
      },
    ],
  }

  const barHNames = stats.top10.map((i) => i.name).reverse()
  const barHValues = stats.top10.map((i) => i.value).reverse()
  const barHOption = {
    color: [BLUE],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p) => `${p[0].name}<br/>投资金额：${p[0].value} 亿元` },
    grid: { left: 180, right: 32, top: 16, bottom: 32 },
    xAxis: { type: 'value', name: '投资金额（亿元）' },
    yAxis: { type: 'category', data: barHNames, axisLabel: { fontSize: 11 } },
    series: [
      {
        name: '投资金额',
        type: 'bar',
        barWidth: 18,
        data: barHValues,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#69b1ff' },
              { offset: 1, color: '#1677ff' },
            ],
          },
        },
        label: { show: true, position: 'right', formatter: '{c} 亿' },
      },
    ],
  }

  return (
    <div className="page-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="在谈项目数"
            value={stats.zaitanCount}
            color={BLUE}
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<TeamOutlined style={{ fontSize: 28, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="签约项目数"
            value={stats.qianyueCount}
            color={GREEN}
            bgColor="linear-gradient(135deg,#f6ffed,#d9f7be)"
            icon={<FileProtectOutlined style={{ fontSize: 28, color: GREEN }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="落地项目数"
            value={stats.luodiCount}
            color={ORANGE}
            bgColor="linear-gradient(135deg,#fff7e6,#ffe7ba)"
            icon={<CheckCircleOutlined style={{ fontSize: 28, color: ORANGE }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="退库项目数"
            value={stats.tuikuCount}
            color={RED}
            bgColor="linear-gradient(135deg,#fff1f0,#ffccc7)"
            icon={<CloseCircleOutlined style={{ fontSize: 28, color: RED }} />}
          />
        </Col>

        <Col xs={24} md={12}>
          <Card title="项目阶段分布" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={pieOption} style={{ height: 340 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="各产业类别项目数量统计" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={industryOption} style={{ height: 340 }} />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="月度申报趋势（最近6个月）" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={lineOption} style={{ height: 340 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="投资金额 TOP10 项目" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={barHOption} style={{ height: 340 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
