import { useState, useMemo } from 'react'
import {
  Table, Button, Input, Select, Space, Tag, Tooltip, Modal, message, Divider,
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, EyeOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import mockData from '../mock/data.json'

function buildDuplicateGroups() {
  const zaitanList = mockData.zaitan.map((item, idx) => ({
    id: item.id,
    stage: 'zaitan',
    stageName: '在谈',
    projectName: item['项目名称'] || '-',
    investorEntity: (item['投资主体'] || '').trim(),
    area: item['承接区'] || item['报送区'] || '-',
    investAmount: item['投资金额（亿元）'] || 0,
    reportTime: item['申报时间'] || '-',
    industryType: item['行业类别'] || '-',
  }))
  const qianyueList = mockData.qianyue.map((item, idx) => ({
    id: item.id,
    stage: 'qianyue',
    stageName: '签约',
    projectName: item['项目名称'] || '-',
    investorEntity: (item['投资主体'] || '').trim(),
    area: item['区域'] || item['项目区域'] || '-',
    investAmount: item['投资金额(亿元)'] || 0,
    reportTime: item['申报时间'] || '-',
    industryType: item['行业类别（门类）'] || '-',
  }))

  const all = [...zaitanList, ...qianyueList]
  const entityMap = new Map()
  all.forEach(p => {
    if (!p.investorEntity || p.investorEntity === '-') return
    if (!entityMap.has(p.investorEntity)) entityMap.set(p.investorEntity, [])
    entityMap.get(p.investorEntity).push(p)
  })

  const groups = []
  let idx = 0
  entityMap.forEach((projects, entity) => {
    const stages = new Set(projects.map(p => p.stage))
    const areas = [...new Set(projects.map(p => p.area).filter(a => a && a !== '-'))]
    if (stages.size >= 2 || projects.length >= 2) {
      idx += 1
      const stageNames = [...new Set(projects.map(p => p.stageName))].join('/')
      groups.push({
        key: `dup-${idx}`,
        index: idx,
        status: idx % 3 === 0 ? 'duplicate' : idx % 3 === 1 ? 'not_duplicate' : 'pending',
        projectName: projects[0].projectName,
        investorEntity: entity,
        stages: stageNames,
        areas: areas.join('、'),
        duplicateCount: projects.length,
        relatedProjects: projects,
        createTime: projects[0].reportTime,
      })
    }
  })

  if (groups.length === 0) {
    groups.push(
      {
        key: 'dup-1', index: 1, status: 'pending',
        projectName: '灵境万维AI影视产业基地项目',
        investorEntity: '灵境万维（杭州）智能科技有限公司',
        stages: '在谈/签约', areas: '东湖高新区、江夏区', duplicateCount: 2,
        relatedProjects: [
          { stageName: '在谈', projectName: '灵境万维AI影视产业基地（在谈）', area: '江夏区', reportTime: '2026-06-20' },
          { stageName: '签约', projectName: '灵境万维AI影视产业基地项目', area: '东湖高新区', reportTime: '2026-06-25' },
        ],
        createTime: '2026-06-20',
      },
      {
        key: 'dup-2', index: 2, status: 'pending',
        projectName: '驿路通光器件产业基地项目',
        investorEntity: '武汉驿路通科技股份有限公司',
        stages: '在谈/签约', areas: '东湖高新区', duplicateCount: 2,
        relatedProjects: [
          { stageName: '在谈', projectName: '驿路通光器件研发中心项目', area: '东湖高新区', reportTime: '2026-06-15' },
          { stageName: '签约', projectName: '驿路通光器件产业基地项目', area: '东湖高新区', reportTime: '2026-06-24' },
        ],
        createTime: '2026-06-15',
      },
      {
        key: 'dup-3', index: 3, status: 'duplicate',
        projectName: '国网新源湖北抽蓄电站配套项目',
        investorEntity: '国网新源集团有限公司湖北分公司',
        stages: '在谈/签约', areas: '东湖高新区、新洲区', duplicateCount: 2,
        relatedProjects: [
          { stageName: '在谈', projectName: '湖北新洲抽水蓄能电站配套项目', area: '新洲区', reportTime: '2026-06-10' },
          { stageName: '签约', projectName: '国网新源湖北运维中心项目', area: '东湖高新区', reportTime: '2026-06-25' },
        ],
        createTime: '2026-06-10',
      },
      {
        key: 'dup-4', index: 4, status: 'not_duplicate',
        projectName: '奇宏光电散热模组扩产项目',
        investorEntity: '奇宏光电（武汉）有限公司',
        stages: '在谈/签约', areas: '东湖高新区', duplicateCount: 2,
        relatedProjects: [
          { stageName: '在谈', projectName: '奇宏光电研发中心新建项目', area: '东湖高新区', reportTime: '2026-05-20' },
          { stageName: '签约', projectName: '奇宏光电扩产项目二期', area: '东湖高新区', reportTime: '2026-06-24' },
        ],
        createTime: '2026-05-20',
      },
      {
        key: 'dup-5', index: 5, status: 'pending',
        projectName: '兰丁云医学检验实验室扩建项目',
        investorEntity: '武汉兰丁云医学检验实验室有限公司',
        stages: '在谈/签约/落地', areas: '东湖高新区、洪山区', duplicateCount: 3,
        relatedProjects: [
          { stageName: '在谈', projectName: '兰丁云AI病理研发中心项目', area: '洪山区', reportTime: '2026-06-01' },
          { stageName: '签约', projectName: '兰丁云医学检验实验室扩建项目', area: '东湖高新区', reportTime: '2026-06-12' },
          { stageName: '落地', projectName: '兰丁云第三方检测中心项目', area: '东湖高新区', reportTime: '2026-06-18' },
        ],
        createTime: '2026-06-01',
      },
    )
  }

  return groups
}

const STATUS_MAP = {
  pending: { text: '待研判', color: 'orange', bg: '#fff7e6', borderColor: '#ffd591', textColor: '#fa8c16' },
  duplicate: { text: '已判定重复', color: 'red', bg: '#fff1f0', borderColor: '#ffa39e', textColor: '#f5222d' },
  not_duplicate: { text: '已判定不重复', color: 'green', bg: '#f6ffed', borderColor: '#b7eb8f', textColor: '#52c41a' },
}

const STAGE_TAG_COLORS = {
  '在谈': 'blue',
  '签约': 'purple',
  '落地': 'green',
}

export default function Yanpan() {
  const [filters, setFilters] = useState({ projectName: '', status: undefined })
  const [dataList, setDataList] = useState(() => buildDuplicateGroups())
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const filteredData = useMemo(() => {
    return dataList.filter(r => {
      if (filters.projectName && !r.projectName.includes(filters.projectName) && !r.investorEntity.includes(filters.projectName)) return false
      if (filters.status && r.status !== filters.status) return false
      return true
    })
  }, [dataList, filters])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const pendingCount = dataList.filter(r => r.status === 'pending').length
  const duplicateCount = dataList.filter(r => r.status === 'duplicate').length
  const notDuplicateCount = dataList.filter(r => r.status === 'not_duplicate').length

  const handleStatusChange = (record, newStatus) => {
    const title = newStatus === 'duplicate' ? '判定重复' : '判定不重复'
    const content = newStatus === 'duplicate'
      ? `确定判定「${record.investorEntity}」相关项目为重复项目吗？判定重复后将合并项目信息并通知相关区。`
      : `确定判定「${record.investorEntity}」相关项目为非重复项目吗？判定后各项目独立推进。`
    Modal.confirm({
      title,
      icon: newStatus === 'duplicate' ? <ExclamationCircleOutlined style={{ color: '#f5222d' }} /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content,
      okText: '确认判定', cancelText: '取消',
      okButtonProps: newStatus === 'duplicate' ? { danger: true } : { type: 'primary' },
      onOk: () => {
        setDataList(prev => prev.map(r => r.key === record.key ? { ...r, status: newStatus } : r))
        message.success(newStatus === 'duplicate' ? '已判定为重复项目' : '已判定为非重复项目')
      },
    })
  }

  const handleDetail = (record) => {
    Modal.info({
      title: '重复项目详情',
      width: 680,
      icon: <WarningOutlined style={{ color: '#fa8c16' }} />,
      content: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>投资主体</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{record.investorEntity}</div>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>涉及项目（共 {record.duplicateCount} 个）</div>
          {record.relatedProjects.map((p, i) => (
            <div key={i} style={{
              padding: '10px 12px', background: '#fafafa', borderRadius: 6, marginBottom: 8, border: '1px solid #f0f0f0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Space>
                  <Tag color={STAGE_TAG_COLORS[p.stageName] || 'default'} style={{ margin: 0 }}>{p.stageName}</Tag>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.projectName}</span>
                </Space>
              </div>
              <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 16 }}>
                <span>区域：{p.area}</span>
                <span>发起时间：{p.reportTime}</span>
              </div>
            </div>
          ))}
        </div>
      ),
      okText: '关闭',
    })
  }

  const columns = [
    {
      key: 'index', title: '序号', dataIndex: 'index', width: 60, align: 'center', fixed: 'left',
    },
    {
      key: 'status', title: '研判状态', dataIndex: 'status', width: 130, align: 'center', fixed: 'left',
      render: (status) => {
        const s = STATUS_MAP[status]
        return (
          <Tag style={{
            background: s.bg, color: s.textColor, border: `1px solid ${s.borderColor}`,
            margin: 0, fontSize: 12, padding: '0 7px', borderRadius: 4,
          }}>
            {s.text}
          </Tag>
        )
      },
    },
    {
      key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 260, ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }}>{v}</span>
        </Tooltip>
      ),
    },
    {
      key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 240, ellipsis: true,
    },
    {
      key: 'stages', title: '涉及阶段', dataIndex: 'stages', width: 110, align: 'center',
      render: (v) => (
        <Space size={4} wrap>
          {v.split('/').map(s => (
            <Tag key={s} color={STAGE_TAG_COLORS[s] || 'default'} style={{ margin: 0, fontSize: 12 }}>{s}</Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'areas', title: '涉及区域', dataIndex: 'areas', width: 180, ellipsis: true,
    },
    {
      key: 'duplicateCount', title: '重复项目数', dataIndex: 'duplicateCount', width: 100, align: 'center',
      render: (v) => <span style={{ color: '#f5222d', fontWeight: 600 }}>{v}</span>,
    },
    {
      key: 'createTime', title: '发起时间', dataIndex: 'createTime', width: 120, align: 'center',
    },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 240, fixed: 'right', align: 'center',
      render: (_, record) => (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span
            style={{ color: record.status === 'pending' ? '#f5222d' : 'rgba(0,0,0,0.25)', fontSize: 14, cursor: record.status === 'pending' ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => record.status === 'pending' && handleStatusChange(record, 'duplicate')}
          >
            <CloseCircleOutlined /> 判定重复
          </span>
          <span
            style={{ color: record.status === 'pending' ? '#1677ff' : 'rgba(0,0,0,0.25)', fontSize: 14, cursor: record.status === 'pending' ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => record.status === 'pending' && handleStatusChange(record, 'not_duplicate')}
          >
            <CheckCircleOutlined /> 判定不重复
          </span>
          <span
            style={{ color: '#1677ff', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => handleDetail(record)}
          >
            <EyeOutlined /> 详情
          </span>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input style={{ width: 220 }} placeholder="项目名称/投资主体"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={filters.projectName}
            onChange={(e) => setFilters({ ...filters, projectName: e.target.value })} allowClear />
          <Select placeholder="研判状态" allowClear style={{ width: 150 }}
            value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}
            options={[
              { label: '待研判', value: 'pending' },
              { label: '已判定重复', value: 'duplicate' },
              { label: '已判定不重复', value: 'not_duplicate' },
            ]} />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); message.success('查询完成') }}>搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={() => {
            setFilters({ projectName: '', status: undefined })
            setPagination({ current: 1, pageSize: 10 })
          }}>重置</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            <Space size={16}>
              <span>共 <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16 }}>{filteredData.length}</span> 条疑似重复记录</span>
              <span style={{ color: '#d9d9d9' }}>|</span>
              <span><Tag color="orange" style={{ margin: 0, fontSize: 12 }}>待研判 {pendingCount}</Tag></span>
              <span><Tag color="red" style={{ margin: 0, fontSize: 12 }}>已判定重复 {duplicateCount}</Tag></span>
              <span><Tag color="green" style={{ margin: 0, fontSize: 12 }}>已判定不重复 {notDuplicateCount}</Tag></span>
            </Space>
          </div>
          <Space size={8}>
            <Tooltip title="刷新"><Button type="text" icon={<ReloadOutlined />} onClick={() => window.location.reload()} /></Tooltip>
            <Tooltip title="表头管理"><Button type="text" icon={<SettingOutlined />} /></Tooltip>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          scroll={{ x: 1400 }}
          sticky={{ offsetHeader: 0 }}
          size="middle"
          pagination={{
            ...pagination, total: filteredData.length,
            showSizeChanger: true, showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>
    </div>
  )
}
