import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { Row, Col, Card, DatePicker, Button, Space, Table, Select, Tooltip, message } from 'antd'
import {
  InfoCircleOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  FundOutlined,
  GlobalOutlined,
  DownloadOutlined,
  ReloadOutlined,
  BulbOutlined,
  TeamOutlined,
  RobotOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as XLSX from 'xlsx'
import mockData from '../mock/data.json'
import { useViewRole } from '../store/viewStore'
import { statsRangeStore } from '../store/statsRangeStore'
import { buildDashboardSummary } from '../utils/dashboardSummary'
import {
  fieldYm,
  filterByRange,
  parkOf,
  sumOf,
  num,
  fmtMoney,
  fmtDate,
} from '../utils/projectStats'

const BLUE = '#1677ff'
const ORANGE = '#fa8c16'
const GREEN = '#52c41a'

// 时间/金额/园区口径常量
const SIGN_TIME_KEY = '签约审核通过时间' // 签约时间口径
const LAND_TIME_KEY = '落地审核通过时间' // 落地时间口径（转落地通过）
const AMOUNT_KEY = '投资金额(亿元)' // 投资/签约金额口径
const ARRIVAL_KEYS = ['当年到位资金情况(亿元)', '到资金额(亿元)'] // 到位资金口径
const PARK_ORDER = ['生物城', '未来城', '综保区', '光电园', '服务业园', '智造园', '中华园', '中心城']

// 演示口径：无外资金额字段时，按 1 美元≈7 元人民币折算（1亿元 ≈ 1428.57万美元）
const RMB_PER_USD = 7
const toUsd = (yi) => Math.round(num(yi) * (10000 / RMB_PER_USD))
const fmtUsd = (v) => Number(v).toLocaleString('zh-CN')

// 各阶段数据：谋划/在谈 取自 zaitan 数组前4条（与谋划列表页 slice 一致），在谈为其余记录
const MOUHUA_ROWS = (mockData.zaitan || []).slice(0, 4)
const ZAITAN_ROWS = (mockData.zaitan || []).slice(4)
const QIANYUE_ROWS = mockData.qianyue || []
const LUODI_ROWS = mockData.luodi || []

// 园区账号视角 → 负责单位名称映射（登录后默认只看本园区）
const ROLE_PARK_MAP = {
  光谷生物城: '生物城',
  生物城: '生物城',
  未来科技城: '未来城',
  未来城: '未来城',
  光谷中心城: '中心城',
  中心城: '中心城',
  东湖综合保税区: '综保区',
  综保区: '综保区',
  光电园: '光电园',
  服务业园: '服务业园',
  智造园: '智造园',
  中华园: '中华园',
}

const KPI_HINTS = {
  signedCount: '签约审核通过时间落在所选区间与主体内的项目个数',
  signedAmount: 'Σ 投资金额(亿元)，口径同上',
  landed: '落地审核通过时间（转落地）落在所选区间与主体内，即"开工开业项目"口径',
  arrival: 'Σ 当年到位资金情况(亿元)',
  fdiCount: '所选区间与主体内 FDI/外资项目（是否FDI=是 或 内外资=外资）个数',
  fdiAmount: '所选区间与主体内 FDI/外资项目投资金额折算（演示口径按 1 美元≈7 元）',
}

function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${y}年${Number(m)}月`
}

function TitleHint({ text }) {
  return (
    <Tooltip title={text}>
      <InfoCircleOutlined style={{ fontSize: 13, color: '#bfbfbf', marginLeft: 4, cursor: 'help' }} />
    </Tooltip>
  )
}

function StatCard({ icon, bgColor, title, hint, value, unit, color = BLUE }) {
  return (
    <Card styles={{ body: { padding: '14px 20px' } }} style={{ borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#333', fontWeight: 500, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
            {hint && <TitleHint text={hint} />}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>
            {value}
            {unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>{unit}</span>}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

// 横向条形图（金额排名，从高到低，顶部为大）
function hBarOption(rows, color, unit) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).reverse() // echarts 纵向自底向上，反转使最大在顶部
  return {
    color: [color],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p) => `${p[0].name}<br/>${p[0].value.toLocaleString('zh-CN')} ${unit}` },
    grid: { left: 76, right: 56, top: 8, bottom: 8 },
    xAxis: { type: 'value', name: unit, splitLine: { show: false } },
    yAxis: { type: 'category', data: sorted.map((r) => r.name), axisLabel: { fontSize: 11 } },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: sorted.map((r) => Number(r.value)),
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: 'right',
          formatter: (p) => (p.value > 0 ? `${Number(p.value).toLocaleString('zh-CN')} ${unit}` : ''),
          fontSize: 11,
          color: '#595959',
        },
      },
    ],
  }
}

export default function DashboardProject() {
  const navigate = useNavigate()
  const { role } = useViewRole()

  // ===== 全局主体筛选：园区账号进入页面时默认只看本园区，其他主体默认全区 =====
  const [scope, setScope] = useState(ROLE_PARK_MAP[role?.deptName] || 'all')

  // 主体候选（数据中出现的园区）
  const parkOptions = useMemo(() => {
    const set = new Set()
    ;[...MOUHUA_ROWS, ...ZAITAN_ROWS, ...QIANYUE_ROWS, ...LUODI_ROWS].forEach((it) => {
      const p = parkOf(it)
      if (p && p !== '其他') set.add(p)
    })
    return [...set].sort((a, b) => {
      const ia = PARK_ORDER.indexOf(a)
      const ib = PARK_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }, [])

  // ===== 时间区间 =====
  const dataBounds = useMemo(() => {
    const yms = [
      ...QIANYUE_ROWS.map((it) => fieldYm(it, SIGN_TIME_KEY)),
      ...LUODI_ROWS.map((it) => fieldYm(it, LAND_TIME_KEY)),
    ].filter(Boolean).sort()
    if (!yms.length) return { min: '2026-01', max: '2026-12' }
    return { min: yms[0], max: yms[yms.length - 1] }
  }, [])
  const [range, setRange] = useState({ start: dataBounds.min, end: dataBounds.max })
  const [draft, setDraft] = useState({ start: dataBounds.min, end: dataBounds.max })
  const [quickKey, setQuickKey] = useState('all') // prevMonth | thisMonth | ytd | h1 | all | ''

  // 把统计区间发布到全局（供"AI招商总结"/其他模块共享）
  const { start: startR, end: endR } = range
  useEffect(() => {
    statsRangeStore.setRange({ start: startR, end: endR })
  }, [startR, endR])

  const applyRange = (s, e, qk = '') => {
    if (s > e) {
      message.warning('起始年月不能晚于结束年月')
      return
    }
    setRange({ start: s, end: e })
    setDraft({ start: s, end: e })
    setQuickKey(qk)
  }
  const quickRange = (mode) => {
    if (mode === 'thisMonth' || mode === 'prevMonth') {
      const ym = mode === 'thisMonth' ? dayjs().format('YYYY-MM') : dayjs().subtract(1, 'month').format('YYYY-MM')
      applyRange(ym, ym, mode)
      return
    }
    const yyyy = String(dataBounds.max).slice(0, 4)
    if (mode === 'ytd') applyRange(`${yyyy}-01`, dataBounds.max, mode)
    else if (mode === 'h1') applyRange(`${yyyy}-01`, `${yyyy}-06`, mode)
    else applyRange(dataBounds.min, dataBounds.max, 'all')
  }

  const { start, end } = range
  const scopeLabel = scope === 'all' ? '全区' : scope

  // ===== 统计 =====
  const stats = useMemo(() => {
    const inScope = (it) => scope === 'all' || parkOf(it) === scope

    // 谋划/在谈为当前在库存量，不随统计区间变化（仅受主体筛选影响）
    const mouhuaRows = MOUHUA_ROWS.filter(inScope)
    const zaitanRows = ZAITAN_ROWS.filter(inScope)
    const mouhuaAmount = sumOf(mouhuaRows, AMOUNT_KEY)
    const zaitanAmount = sumOf(zaitanRows, AMOUNT_KEY)

    // 区间口径（主体 + 时间）
    const signedAll = filterByRange(QIANYUE_ROWS, SIGN_TIME_KEY, start, end).filter(inScope)
    const landedAll = filterByRange(LUODI_ROWS, LAND_TIME_KEY, start, end).filter(inScope)
    const signedAmount = sumOf(signedAll, AMOUNT_KEY)
    const landedAmount = sumOf(landedAll, AMOUNT_KEY)

    // 到位资金 / FDI（签约+落地，按编号去重）
    const arrivalMap = new Map()
    const fdiSet = new Set()
    const arrivalOf = (it) => {
      let v = it[ARRIVAL_KEYS[0]]
      if (v == null || v === '') v = it[ARRIVAL_KEYS[1]]
      return num(v)
    }
    const isFdiRow = (it) => it['是否FDI'] === '是' || it['内外资'] === '外资'
    const fdiAmountMap = new Map() // 编号 -> 亿元（跨阶段去重取大）
    const fdiCodePark = new Map() // 编号 -> 园区
    ;[...signedAll, ...landedAll].forEach((it) => {
      const code = it['编号'] || String(it.id)
      const nv = arrivalOf(it)
      const old = arrivalMap.get(code)
      if (old == null || nv > old) arrivalMap.set(code, nv)
      if (isFdiRow(it)) {
        fdiSet.add(code)
        const amt = num(it[AMOUNT_KEY])
        if ((fdiAmountMap.get(code) || 0) < amt) fdiAmountMap.set(code, amt)
        if (!fdiCodePark.has(code)) fdiCodePark.set(code, parkOf(it))
      }
    })
    const arrivalTotal = [...arrivalMap.values()].reduce((s, v) => s + v, 0)
    const fdiCount = fdiSet.size
    // 园区 FDI 汇总（按编号去重后求和）
    const fdiParkYi = new Map()
    fdiAmountMap.forEach((amt, code) => {
      const p = fdiCodePark.get(code) || '其他'
      fdiParkYi.set(p, (fdiParkYi.get(p) || 0) + amt)
    })
    const fdiUsdTotal = toUsd([...fdiAmountMap.values()].reduce((s, v) => s + v, 0))

    // 园区排名（固定展示八大园区，签约金额 / 落地金额 / 外商投资金额）
    const group = (rows) => {
      const map = Object.fromEntries(PARK_ORDER.map((p) => [p, 0]))
      rows.forEach((it) => {
        const p = parkOf(it)
        if (map[p] !== undefined) map[p] += num(it[AMOUNT_KEY])
      })
      return PARK_ORDER.map((name) => ({ name, value: map[name] }))
        .sort((a, b) => b.value - a.value)
    }
    const signRank = group(signedAll)
    const landRank = group(landedAll)
    const fdiRank = PARK_ORDER.map((name) => ({ name, value: toUsd(fdiParkYi.get(name) || 0) }))
      .sort((a, b) => b.value - a.value)

    return {
      mouhuaNowCount: mouhuaRows.length,
      mouhuaNowAmount: mouhuaAmount,
      zaitanNowCount: zaitanRows.length,
      zaitanNowAmount: zaitanAmount,
      signedCount: signedAll.length,
      signedAmount,
      landedCount: landedAll.length,
      landedAmount,
      arrivalTotal,
      fdiCount,
      fdiUsdTotal,
      signRank,
      landRank,
      fdiRank,
      signedRows: signedAll,
      landedRows: landedAll,
    }
  }, [scope, start, end])

  // ===== AI 招商总结（年度累计口径：截至查询结束月，对照年度考核目标） =====
  const aiSummary = useMemo(() => {
    const year = end.slice(0, 4)
    const ymOf = (key) => (it) => {
      const ym = fieldYm(it, key)
      return !!ym && ym >= `${year}-01` && ym <= end
    }
    const arrivalOf = (it) => {
      let v = it[ARRIVAL_KEYS[0]]
      if (v == null || v === '') v = it[ARRIVAL_KEYS[1]]
      return num(v)
    }
    const isFdiRow = (it) => it['是否FDI'] === '是' || it['内外资'] === '外资'
    const calc = (park) => {
      const signed = QIANYUE_ROWS.filter((it) => ymOf(SIGN_TIME_KEY)(it) && (!park || parkOf(it) === park))
      const landed = LUODI_ROWS.filter((it) => ymOf(LAND_TIME_KEY)(it) && (!park || parkOf(it) === park))
      const arrivalMap = new Map()
      const fdiSet = new Set()
      let fdiYi = 0
      ;[...signed, ...landed].forEach((it) => {
        const code = it['编号'] || String(it.id)
        const old = arrivalMap.get(code)
        const nv = arrivalOf(it)
        if (old == null || nv > old) arrivalMap.set(code, nv)
        if (isFdiRow(it)) {
          fdiSet.add(code)
          const amt = num(it[AMOUNT_KEY])
          const prev = fdiYi
          fdiYi = prev + amt
        }
      })
      return {
        signedCount: signed.length,
        signedAmount: sumOf(signed, AMOUNT_KEY),
        arrival: [...arrivalMap.values()].reduce((s, v) => s + v, 0),
        openCount: landed.length,
        fdiCount: fdiSet.size,
        fdiUsd: toUsd(fdiYi),
      }
    }
    const parkRates = PARK_ORDER.map((name) => ({ name, ...calc(name) }))
    const overall = scope === 'all' ? calc(null) : (parkRates.find((r) => r.name === scope) || calc(scope))
    const text = buildDashboardSummary({
      endYm: end,
      scopeLabel: scope === 'all' ? '全区' : scope,
      isAllScope: scope === 'all',
      overall,
      parkRates,
    })
    return { text, overall }
  }, [scope, end])

  // 分段渲染总结：按行识别"一、/二、"标题，其余为正文（正文不加大加粗）
  const summaryBlocks = useMemo(() => {
    const blocks = []
    ;(aiSummary.text || '').split('\n').forEach((line) => {
      const t = line.trim()
      if (/^[一二]、/.test(t)) {
        blocks.push({ type: 'h', text: t })
      } else if (t) {
        const last = blocks[blocks.length - 1]
        if (last && last.type === 'p') last.text += `\n${line}`
        else blocks.push({ type: 'p', text: line })
      }
    })
    return blocks
  }, [aiSummary.text])

  const copyAiText = () => {
    if (!aiSummary.text) return
    navigator.clipboard?.writeText(aiSummary.text).then(
      () => message.success('总结已复制'),
      () => message.warning('复制失败，请手动选择复制'),
    )
  }

  // ===== 明细（区间口径，项目名称 + 投资金额） =====
  const viewDetail = (stage, id) => {
    if (id == null) return
    navigate(`/project/${stage}/detail/${id}`)
  }
  const nameLink = (v, id, stage) =>
    id != null ? <span style={{ color: BLUE, cursor: 'pointer' }} onClick={() => viewDetail(stage, id)}>{v}</span> : v

  const signCols = [
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: (v, r) => nameLink(v, r.id, 'qianyue') },
    { title: '投资金额(亿元)', dataIndex: 'amount', width: 140, align: 'center', render: (v) => fmtMoney(v) },
  ]
  const landCols = [
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: (v, r) => nameLink(v, r.id, 'luodi') },
    { title: '投资金额(亿元)', dataIndex: 'amount', width: 140, align: 'center', render: (v) => fmtMoney(v) },
  ]
  const signRowsData = stats.signedRows.map((it) => ({ id: it.id, name: it['项目名称'] || '-', amount: num(it[AMOUNT_KEY]) }))
  const landRowsData = stats.landedRows.map((it) => ({ id: it.id, name: it['项目名称'] || '-', amount: num(it[AMOUNT_KEY]) }))

  // 导出（区间明细，全量字段）
  const exportRows = (rows, filename) => {
    if (!rows.length) {
      message.info('当前无数据可导出')
      return
    }
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '明细')
    XLSX.writeFile(wb, filename)
    message.success(`已导出 ${rows.length} 条明细`)
  }
  const intervalLabel = `${monthLabel(start)} ~ ${monthLabel(end)}`
  const rangeShort = start.slice(0, 4) === end.slice(0, 4)
    ? `${start.slice(0, 4)}年${Number(start.slice(5, 7))}-${Number(end.slice(5, 7))}月`
    : `${monthLabel(start)}-${monthLabel(end)}`
  const exportSign = () => exportRows(
    stats.signedRows.map((it) => ({ ...it, 阶段: '签约', 统计区间: intervalLabel, 负责单位: parkOf(it), 签约时间: fmtDate(it[SIGN_TIME_KEY]) })),
    `${rangeShort}签约项目明细.xlsx`,
  )
  const exportLand = () => exportRows(
    stats.landedRows.map((it) => ({ ...it, 阶段: '落地', 统计区间: intervalLabel, 负责单位: parkOf(it), 落地时间: fmtDate(it[LAND_TIME_KEY]) })),
    `${rangeShort}落地项目明细.xlsx`,
  )

  // ===== 顶部快捷项 =====
  const quickBtn = (key, label) => (
    <Button size="small" type={quickKey === key ? 'primary' : 'text'} onClick={() => quickRange(key)}>
      {label}
    </Button>
  )
  const cardTitle = (title, hint) => (
    <span>
      {title}
      {hint && <TitleHint text={hint} />}
    </span>
  )

  return (
    <div className="page-container">
      {/* ===== 主体 + 时间筛选 ===== */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Space size={8}>
            <span style={{ fontSize: 14, color: '#595959' }}>数据主体</span>
            <Select
              value={scope}
              onChange={setScope}
              style={{ width: 140 }}
              options={[{ label: '全区', value: 'all' }, ...parkOptions.map((p) => ({ label: p, value: p }))]}
            />
          </Space>
          <Space size={8}>
            <span style={{ fontSize: 14, color: '#595959' }}>统计区间</span>
            <DatePicker
              picker="month"
              value={draft.start ? dayjs(draft.start, 'YYYY-MM') : null}
              onChange={(d) => { setDraft((p) => ({ ...p, start: d ? d.format('YYYY-MM') : p.start })); setQuickKey('') }}
              allowClear={false}
              disabledDate={(cur) => cur && cur.isAfter(dayjs(draft.end || dataBounds.max, 'YYYY-MM').endOf('month'))}
              style={{ width: 120 }}
            />
            <span style={{ color: '#bfbfbf' }}>至</span>
            <DatePicker
              picker="month"
              value={draft.end ? dayjs(draft.end, 'YYYY-MM') : null}
              onChange={(d) => { setDraft((p) => ({ ...p, end: d ? d.format('YYYY-MM') : p.end })); setQuickKey('') }}
              allowClear={false}
              disabledDate={(cur) => cur && cur.isBefore(dayjs(draft.start || dataBounds.min, 'YYYY-MM').startOf('month'))}
              style={{ width: 120 }}
            />
            <Button type="primary" onClick={() => applyRange(draft.start, draft.end)}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => quickRange('all')}>重置</Button>
          </Space>
          <Space size={4}>
            {quickBtn('prevMonth', '上月')}
            {quickBtn('thisMonth', '本月')}
            {quickBtn('ytd', '今年至今')}
            {quickBtn('h1', '上半年')}
            {quickBtn('all', '全部')}
          </Space>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>
          数据主体：{scopeLabel} · 统计区间：{monthLabel(start)} ~ {monthLabel(end)}
        </div>
      </div>

      {/* ===== 当前谋划 / 当前在谈（存量，不随统计区间变化） ===== */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="当前谋划项目数"
            hint="当前在库谋划项目数，不随统计区间变化"
            value={stats.mouhuaNowCount}
            unit="个"
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<BulbOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="当前谋划项目金额"
            hint="当前在库谋划项目投资金额合计，不随统计区间变化"
            value={fmtMoney(stats.mouhuaNowAmount)}
            unit="亿元"
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<FundOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="当前在谈项目数"
            hint="当前在库在谈项目数，不随统计区间变化"
            value={stats.zaitanNowCount}
            unit="个"
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<TeamOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="当前在谈项目金额"
            hint="当前在库在谈项目投资金额合计，不随统计区间变化"
            value={fmtMoney(stats.zaitanNowAmount)}
            unit="亿元"
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<FundOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
      </Row>

      {/* ===== 区间口径：签约 / 落地 / 到位资金 / FDI ===== */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="区间签约项目数"
            hint={KPI_HINTS.signedCount}
            value={stats.signedCount}
            unit="个"
            bgColor="linear-gradient(135deg,#f6ffed,#d9f7be)"
            icon={<FileProtectOutlined style={{ fontSize: 22, color: GREEN }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="区间签约金额"
            hint={KPI_HINTS.signedAmount}
            value={fmtMoney(stats.signedAmount)}
            unit="亿元"
            bgColor="linear-gradient(135deg,#f6ffed,#d9f7be)"
            icon={<FundOutlined style={{ fontSize: 22, color: GREEN }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="区间落地项目数"
            hint={KPI_HINTS.landed}
            value={stats.landedCount}
            unit="个"
            bgColor="linear-gradient(135deg,#fff7e6,#ffe7ba)"
            icon={<CheckCircleOutlined style={{ fontSize: 22, color: ORANGE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="区间落地金额"
            hint="落地（转落地）项目投资金额合计，口径同落地项目数"
            value={fmtMoney(stats.landedAmount)}
            unit="亿元"
            bgColor="linear-gradient(135deg,#fff7e6,#ffe7ba)"
            icon={<FundOutlined style={{ fontSize: 22, color: ORANGE }} />}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="到位资金情况(亿元)"
            hint={KPI_HINTS.arrival}
            value={fmtMoney(stats.arrivalTotal)}
            bgColor="linear-gradient(135deg,#e6f4ff,#bae0ff)"
            icon={<DownloadOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="区间 FDI 项目数"
            hint={KPI_HINTS.fdiCount}
            value={stats.fdiCount}
            unit="个"
            bgColor="linear-gradient(135deg,#f0f5ff,#d6e4ff)"
            icon={<GlobalOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="区间 FDI 项目金额"
            hint={KPI_HINTS.fdiAmount}
            value={fmtUsd(stats.fdiUsdTotal)}
            unit="万美元"
            bgColor="linear-gradient(135deg,#f0f5ff,#d6e4ff)"
            icon={<GlobalOutlined style={{ fontSize: 22, color: BLUE }} />}
          />
        </Col>
      </Row>

      {/* ===== AI 招商总结（跟随主体+统计区间） ===== */}
      <Card
        className="ai-summary-card"
        style={{ borderRadius: 8, marginTop: 16 }}
        title={
          <span>
            <RobotOutlined style={{ color: BLUE, marginRight: 8 }} />
            <span style={{ fontWeight: 600 }}>AI 招商总结（参考通报口径）</span>
            <TitleHint text="正文随“数据主体+统计区间”联动；年度目标为演示配置，超时序=完成值>年度目标×已过月份/12" />
          </span>
        }
        extra={<Button size="small" icon={<CopyOutlined />} onClick={copyAiText}>复制总结</Button>}
      >
        <div style={{ fontSize: 13, color: '#595959', lineHeight: 1.9 }}>
          {summaryBlocks.map((block, idx) => (
            block.type === 'h'
              ? (
                <div key={idx} style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginTop: idx ? 14 : 0 }}>
                  {block.text}
                </div>
              )
              : (
                <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 4 }}>
                  {block.text}
                </div>
              )
          ))}
        </div>
      </Card>

      {/* ===== 园区排名（3 张条形图卡片） ===== */}
      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('园区签约金额排名', '按所选主体/区间内各园区签约投资金额从高到低')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={hBarOption(stats.signRank, BLUE, '亿元')} style={{ height: 260 }} />
            {!stats.signRank.length && <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0' }}>暂无数据</div>}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('园区落地金额排名', '按所选主体/区间内各园区落地（转落地）项目投资金额从高到低')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={hBarOption(stats.landRank, ORANGE, '亿元')} style={{ height: 260 }} />
            {!stats.landRank.length && <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0' }}>暂无数据</div>}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('园区外商投资金额排名', 'FDI/外资项目投资金额折算（演示口径按 1 美元≈7 元），从高到低')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8 }}>
            <ReactECharts option={hBarOption(stats.fdiRank, GREEN, '万美元')} style={{ height: 260 }} />
            {!stats.fdiRank.length && <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0' }}>暂无数据</div>}
          </Card>
        </Col>
      </Row>

      {/* ===== 签约 / 落地明细（按上方统计区间） ===== */}
      <Card
        title={cardTitle(`签约 / 落地项目明细（${intervalLabel}）`, '明细取上方数据主体与统计区间；受主体筛选影响')}
        styles={{ body: { padding: '16px 20px' } }}
        style={{ borderRadius: 8, marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                签约明细
                <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>
                  共 {stats.signedRows.length} 个 · 金额 {fmtMoney(stats.signedAmount)} 亿元
                </span>
              </span>
              <Button size="small" icon={<DownloadOutlined />} onClick={exportSign}>导出</Button>
            </div>
            <Table columns={signCols} dataSource={signRowsData} rowKey="id" size="small" pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }} />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                落地明细
                <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>
                  共 {stats.landedRows.length} 个 · 金额 {fmtMoney(stats.landedAmount)} 亿元
                </span>
              </span>
              <Button size="small" icon={<DownloadOutlined />} onClick={exportLand}>导出</Button>
            </div>
            <Table columns={landCols} dataSource={landRowsData} rowKey="id" size="small" pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
