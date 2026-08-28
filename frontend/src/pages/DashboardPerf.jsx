import { useMemo } from 'react'
import { Row, Col, Card, Table, Tag } from 'antd'
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import mockData from '../mock/data.json'

const BLUE = '#1677ff'
const GREEN = '#52c41a'
const ORANGE = '#fa8c16'
const RED = '#ff4d4f'

function getRegion(item) {
  return item['承接区'] || item['项目区域'] || item['区域'] || '其他'
}

function getReporter(item) {
  const r = item['报送区'] || item['报送单位'] || item['申报人'] || ''
  return r.split(/[- ]/)[0] || '其他'
}

function isCompleted(item) {
  const s = item['项目状态'] || ''
  return s.includes('落地') || s.includes('开工') || s.includes('开业') || item._stage === 'luodi'
}

function isOverdue(item) {
  return item['预警状态'] === '红色预警'
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

export default function DashboardPerf() {
  const data = useMemo(() => {
    const zaitan = mockData.zaitan || []
    const qianyue = mockData.qianyue || []
    const luodi = mockData.luodi || []
    const all = [...zaitan, ...qianyue, ...luodi]

    let completed = 0
    let inProgress = 0
    let overdue = 0

    const regionMap = {}
    all.forEach((item) => {
      if (isCompleted(item)) completed++
      else if (isOverdue(item)) overdue++
      else inProgress++

      const region = getRegion(item)
      if (!regionMap[region]) {
        regionMap[region] = { target: 0, completed: 0, name: region }
      }
      regionMap[region].target += 1
      if (isCompleted(item)) regionMap[region].completed += 1
    })

    const depts = ['驻沪办', '驻京办', '东湖高新区', '市科创局', '市直部门', '生物城', '光电园']
    const dimensions = ['项目数量', '签约率', '落地率', '投资金额', '到位资金', '活动频次']
    const deptRadar = depts.map((dept) => {
      const items = all.filter((it) => getReporter(it) === dept || (it['报送区'] || '').includes(dept))
      const total = Math.max(items.length, 1)
      const signedCount = items.filter((it) => it._stage === 'qianyue' || it._stage === 'luodi').length
      const landedCount = items.filter((it) => it._stage === 'luodi').length
      const amount = items.reduce((s, it) => {
        const v = it['投资金额（亿元）'] ?? it['投资金额(亿元)'] ?? 0
        return s + (Number(v) || 0)
      }, 0)
      const arrival = items.reduce((s, it) => s + (Number(it['到资金额(亿元)']) || Number(it['当年到位资金情况(亿元)']) || 0), 0)
      const hash = dept.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
      return {
        name: dept,
        value: [
          Math.min(100, total * 8),
          Math.round((signedCount / total) * 100),
          Math.round((landedCount / total) * 100),
          Math.min(100, Math.round(amount * 5)),
          Math.min(100, Math.round(arrival * 20)),
          60 + (hash % 35),
        ],
      }
    })

    const regionList = Object.values(regionMap)
      .map((r) => ({
        ...r,
        rate: r.target ? Math.round((r.completed / r.target) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .map((r, idx) => ({ ...r, rank: idx + 1, key: r.name }))

    const regionBar = {
      names: regionList.map((r) => r.name),
      rates: regionList.map((r) => r.rate),
    }

    return {
      completed,
      inProgress,
      overdue,
      radarDimensions: dimensions,
      radarSeries: deptRadar,
      regionBar,
      regionTable: regionList,
    }
  }, [])

  const radarOption = {
    color: [BLUE, '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#faad14'],
    tooltip: {},
    legend: { bottom: 0, icon: 'circle', type: 'scroll' },
    radar: {
      indicator: data.radarDimensions.map((d) => ({ name: d, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#595959', fontSize: 12 },
      splitLine: { lineStyle: { color: '#e8e8e8' } },
      splitArea: { areaStyle: { color: ['#fafafa', '#fff'] } },
    },
    series: [
      {
        type: 'radar',
        data: data.radarSeries.map((s) => ({
          name: s.name,
          value: s.value,
          areaStyle: { opacity: 0.08 },
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 5,
        })),
      },
    ],
  }

  const regionBarOption = {
    color: [BLUE],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p) => `${p[0].name}<br/>完成率：${p[0].value}%` },
    grid: { left: 80, right: 32, top: 24, bottom: 40 },
    xAxis: { type: 'value', name: '完成率(%)', max: 100 },
    yAxis: { type: 'category', data: data.regionBar.names, axisLabel: { fontSize: 12 } },
    series: [
      {
        type: 'bar',
        barWidth: 20,
        data: data.regionBar.rates,
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
        label: { show: true, position: 'right', formatter: '{c}%' },
      },
    ],
  }

  const columns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 70, align: 'center', render: (v) => {
      if (v === 1) return <Tag color="gold" style={{ fontWeight: 600 }}>第{v}名</Tag>
      if (v === 2) return <Tag color="silver" style={{ fontWeight: 600 }}>第{v}名</Tag>
      if (v === 3) return <Tag color="orange" style={{ fontWeight: 600 }}>第{v}名</Tag>
      return <span style={{ color: '#8c8c8c' }}>第{v}名</span>
    }},
    { title: '区域', dataIndex: 'name', key: 'name', align: 'center' },
    { title: '目标数', dataIndex: 'target', key: 'target', align: 'center' },
    { title: '完成数', dataIndex: 'completed', key: 'completed', align: 'center' },
    {
      title: '完成率',
      dataIndex: 'rate',
      key: 'rate',
      align: 'center',
      render: (v) => {
        const color = v >= 80 ? GREEN : v >= 50 ? ORANGE : RED
        return <span style={{ color, fontWeight: 600 }}>{v}%</span>
      },
    },
  ]

  return (
    <div className="page-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="已完成指标"
            value={data.completed}
            color={GREEN}
            bgColor="linear-gradient(135deg,#f6ffed,#d9f7be)"
            icon={<CheckCircleOutlined style={{ fontSize: 28, color: GREEN }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="进行中指标"
            value={data.inProgress}
            color={BLUE}
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<SyncOutlined style={{ fontSize: 28, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="超期指标"
            value={data.overdue}
            color={RED}
            bgColor="linear-gradient(135deg,#fff1f0,#ffccc7)"
            icon={<ExclamationCircleOutlined style={{ fontSize: 28, color: RED }} />}
          />
        </Col>

        <Col xs={24} md={12}>
          <Card title="各部门招商绩效维度评分" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={radarOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="各区项目完成率对比" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={regionBarOption} style={{ height: 400 }} />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="各区绩效明细" styles={{ body: { padding: 12 } }} style={{ borderRadius: 8 }}>
            <Table
              columns={columns}
              dataSource={data.regionTable}
              pagination={false}
              bordered
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
