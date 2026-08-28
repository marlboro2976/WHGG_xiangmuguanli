import { useState, useMemo } from 'react'
import {
  Table, Button, Input, Select, DatePicker, Space, Tag, Tooltip, Popover, Checkbox,
  Dropdown, Divider, Modal, message,
} from 'antd'
import {
  SearchOutlined, ExportOutlined, ReloadOutlined, PlusOutlined, SettingOutlined,
  MoreOutlined, UpOutlined, DownOutlined, EyeOutlined, FileTextOutlined,
  PauseCircleOutlined, ImportOutlined, CheckCircleOutlined, ArrowRightOutlined,
} from '@ant-design/icons'

const { RangePicker } = DatePicker

export default function GenericProjectList({
  stage,           // 'mouhua' | 'zaitan' | 'qianyue' | 'luodi'
  dataList,        // 数据数组
  columns: customColumns, // 列定义
  filters: extraFilters,  // 额外筛选项 [{key, label, options, type: 'select'|'input', width}]
  title,           // 页面标题
  addButtonText,   // 新增按钮文字
  nextStageText,   // 推进到下一阶段按钮文字（如"签约"、"落地"）
  nextStageConfirmTitle, // 推进确认弹窗标题
  canAdd = true,
  canImport = true,
  onAdd,
  addExtraButtons, // 工具栏左侧额外按钮
  scrollX = 2200,
  showProjectStatus = true,
  hiddenFilters = [], // 要隐藏的默认筛选项key数组：acceptStatus/auditStatus/warnStatus/enterpriseNature
}) {
  const [filters, setFilters] = useState({
    projectName: '',
    industryType: undefined,
    category: undefined,
    acceptStatus: undefined,
    auditStatus: undefined,
    capitalNature: undefined,
    warnStatus: undefined,
    enterpriseNature: undefined,
    dateRange: null,
    ...Object.fromEntries((extraFilters || []).map(f => [f.key, undefined])),
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)

  const data = useMemo(() => dataList, [dataList])

  const filteredData = useMemo(() => {
    return data.filter(r => {
      if (filters.projectName && !(r.projectName || r['项目名称'] || '').includes(filters.projectName)) return false
      return true
    })
  }, [data, filters])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const pageInvest = pageData.reduce((sum, r) => sum + (Number(r.investAmount || r['投资金额(亿元)'] || r['投资金额（亿元）'] || 0) || 0), 0)
  const filteredInvest = filteredData.reduce((sum, r) => sum + (Number(r.investAmount || r['投资金额(亿元)'] || r['投资金额（亿元）'] || 0) || 0), 0)

  const industryTypeOptions = useMemo(() => {
    const set = new Set()
    data.forEach(r => {
      const v = r.industryType || r['行业类别（门类）'] || r['行业类别']
      if (v && v !== '-') set.add(v)
    })
    return [...set].map(v => ({ label: v, value: v }))
  }, [data])

  const industryCategoryOptions = useMemo(() => {
    const set = new Set()
    data.forEach(r => {
      const v = r.industryCategory || r['产业类别']
      if (v && v !== '-') set.add(v)
    })
    return [...set].map(v => ({ label: v, value: v }))
  }, [data])

  const handleSearch = () => { message.success('查询完成'); setPagination(p => ({ ...p, current: 1 })) }
  const handleReset = () => {
    const resetState = { projectName: '', industryType: undefined, category: undefined, acceptStatus: undefined, auditStatus: undefined, dateRange: null }
    ;(extraFilters || []).forEach(f => { resetState[f.key] = f.type === 'input' ? '' : undefined })
    setFilters(resetState)
  }

  const tagBlue = (text) => <Tag color="blue" style={{ background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', margin: 0 }}>{text}</Tag>
  const tagWarn = (status) => {
    if (!status || status === '-') return <span style={{ color: '#bfbfbf' }}>-</span>
    if (status.includes('红')) return <Tag color="red" style={{ margin: 0 }}>{status}</Tag>
    if (status.includes('黄')) return <Tag color="orange" style={{ margin: 0 }}>{status}</Tag>
    return <Tag color="green" style={{ margin: 0 }}>{status}</Tag>
  }
  const tagAudit = (status) => {
    if (!status || status === '-') return <span style={{ color: '#bfbfbf' }}>-</span>
    if (status.includes('通过')) return <Tag color="success" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f', margin: 0 }}>{status}</Tag>
    if (status.includes('待')) return <Tag color="processing" style={{ margin: 0 }}>{status}</Tag>
    return <Tag color="error" style={{ margin: 0 }}>{status}</Tag>
  }
  const tagBool = (v) => {
    if (v === '是') return <Tag color="success" style={{ margin: 0 }}>{v}</Tag>
    if (v === '否') return <span style={{ color: '#bfbfbf' }}>否</span>
    return v || <span style={{ color: '#bfbfbf' }}>-</span>
  }

  const moreMenuItems = [
    { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
    ...(nextStageText ? [{ key: 'next', icon: <ArrowRightOutlined />, label: `推进至${nextStageText}` }] : []),
    { key: 'stop', icon: <PauseCircleOutlined />, label: '标记退库', danger: true },
  ]

  const handleMoreClick = (e, record) => {
    const name = record.projectName || record['项目名称']
    if (e.key === 'stop') {
      Modal.confirm({
        title: '确认退库', content: `确定将项目「${name}」标记为退库吗？退库后不可恢复。`,
        okText: '确认退库', cancelText: '取消', okButtonProps: { danger: true },
        onOk: () => message.success('已标记为退库'),
      })
    } else if (e.key === 'next' && nextStageText) {
      Modal.confirm({
        title: nextStageConfirmTitle || `转${nextStageText}`,
        content: `确定将项目「${name}」推进至${nextStageText}阶段吗？`,
        okText: '确认推进', cancelText: '取消',
        onOk: () => message.success(`已推进至${nextStageText}阶段（demo示意）`),
      })
    } else {
      message.info('进展汇报功能（demo示意）')
    }
  }

  const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }
  const fw = 140
  const selectCommon = { allowClear: true, style: { width: '100%' } }

  // 构建列
  const columns = useMemo(() => customColumns.map(col => {
    const c = { ...col }
    if (col.render) return c
    if (col.dataIndex === 'action') return c
    return c
  }), [customColumns])

  // 表头管理
  const columnKeys = columns.filter(c => c.key).map(c => c.key)
  const [visibleKeys, setVisibleKeys] = useState(columnKeys)
  const visibleColumns = useMemo(() => columns.filter(c => !c.key || visibleKeys.includes(c.key)), [columns, visibleKeys])

  const columnPopoverContent = (
    <div style={{ width: 200, maxHeight: 360, overflowY: 'auto' }}>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#666' }}>列显示设置</div>
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        value={visibleKeys}
        onChange={(keys) => {
          const required = columns.filter(c => c.required).map(c => c.key)
          setVisibleKeys([...new Set([...keys, ...required])])
        }}
      >
        {columns.filter(c => c.key).map(c => (
          <Checkbox key={c.key} value={c.key} disabled={c.required} style={{ fontSize: 13 }}>{c.title}</Checkbox>
        ))}
      </Checkbox.Group>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleKeys(columnKeys)}>重置默认</Button>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleKeys(columnKeys)}>全选</Button>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input style={{ width: fw }} placeholder="项目名称"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={filters.projectName} onChange={(e) => setFilters({ ...filters, projectName: e.target.value })} allowClear />
          <Select placeholder="产业类别" {...selectCommon} style={{ width: fw }}
            value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })}
            options={industryCategoryOptions} />
          <Select placeholder="行业类别" {...selectCommon} style={{ width: fw }}
            value={filters.industryType} onChange={(v) => setFilters({ ...filters, industryType: v })}
            options={industryTypeOptions} />
          {!hiddenFilters.includes('acceptStatus') && (
            <Select placeholder="承接状态" {...selectCommon} style={{ width: fw }}
              value={filters.acceptStatus} onChange={(v) => setFilters({ ...filters, acceptStatus: v })}
              options={[{ label: '已承接', value: 'accepted' }, { label: '待承接', value: 'pending' }]} />
          )}
          {!hiddenFilters.includes('auditStatus') && (
            <Select placeholder="审核状态" {...selectCommon} style={{ width: fw }}
              value={filters.auditStatus} onChange={(v) => setFilters({ ...filters, auditStatus: v })}
              options={[{ label: '已审核通过', value: 'passed' }, { label: '待审核', value: 'pending' }, { label: '审核不通过', value: 'rejected' }]} />
          )}
          {!hiddenFilters.includes('capitalNature') && (
            <Select placeholder="内外资" {...selectCommon} style={{ width: fw }}
              value={filters.capitalNature} onChange={(v) => setFilters({ ...filters, capitalNature: v })}
              options={[{ label: '内资', value: '内资' }, { label: '外资', value: '外资' }]} />
          )}
          <RangePicker style={{ width: 260 }} value={filters.dateRange}
            onChange={(v) => setFilters({ ...filters, dateRange: v })} />
          {(() => {
            const hasExpandContent =
              (extraFilters && extraFilters.length > 0) ||
              !hiddenFilters.includes('warnStatus') ||
              !hiddenFilters.includes('enterpriseNature')
            return hasExpandContent ? (
              <div style={{ flex: 1, textAlign: 'right' }}>
                <Button type="link"
                  icon={filterExpanded ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => setFilterExpanded(!filterExpanded)}
                  style={{ padding: '4px 0', fontSize: 13 }}>
                  {filterExpanded ? '收起' : '展开'}
                </Button>
              </div>
            ) : null
          })()}
        </div>

        {filterExpanded && extraFilters && extraFilters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            {extraFilters.map(f => {
              if (f.type === 'input') {
                return <Input key={f.key} style={{ width: f.width || fw }} placeholder={f.placeholder || f.label} suffix={f.suffix}
                  value={filters[f.key] || ''} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })} />
              }
              return <Select key={f.key} placeholder={f.label} {...selectCommon} style={{ width: f.width || fw }}
                value={filters[f.key]} onChange={(v) => setFilters({ ...filters, [f.key]: v })}
                options={f.options} />
            })}
          </div>
        )}

        {filterExpanded && (!hiddenFilters.includes('warnStatus') || !hiddenFilters.includes('enterpriseNature')) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: extraFilters && extraFilters.length ? 12 : 0, flexWrap: 'wrap' }}>
            {!hiddenFilters.includes('warnStatus') && (
              <Select placeholder="预警状态" {...selectCommon} style={{ width: fw }}
                value={filters.warnStatus} onChange={(v) => setFilters({ ...filters, warnStatus: v })}
                options={[{ label: '红色预警', value: 'red' }, { label: '黄色预警', value: 'yellow' }, { label: '正常', value: 'normal' }]} />
            )}
            {!hiddenFilters.includes('enterpriseNature') && (
              <Select placeholder="企业性质" {...selectCommon} style={{ width: fw }}
                value={filters.enterpriseNature} onChange={(v) => setFilters({ ...filters, enterpriseNature: v })}
                options={[{ label: '国企（央企）', value: 'central_soe' }, { label: '国企（地方）', value: 'local_soe' }, { label: '民企', value: 'private' }, { label: '外企', value: 'foreign' }]} />
            )}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
          <Button icon={<ExportOutlined />} onClick={() => message.success('导出任务已提交')}>导出</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            {addExtraButtons}
            共 <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{filteredData.length}</span> 个项目
            <span style={{ color: '#d9d9d9', margin: '0 16px' }}>|</span>
            当页投资额：<span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{pageInvest.toFixed(1)} 亿元</span>
            <span style={{ color: '#d9d9d9', margin: '0 16px' }}>|</span>
            筛选投资总额：<span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{filteredInvest.toFixed(1)} 亿元</span>
            {selectedRowKeys.length > 0 && (
              <span style={{ color: '#1677ff', fontSize: 13, marginLeft: 16 }}>已选 {selectedRowKeys.length} 项</span>
            )}
          </div>
          <Space size={8}>
            {canAdd && <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd ? onAdd() : message.info('新增项目（demo示意）')}>{addButtonText || '新增项目'}</Button>}
            {canImport && <Button icon={<ImportOutlined />} onClick={() => message.info('导入功能（demo示意）')}>导入</Button>}
            <Tooltip title="搜索"><Button type="text" icon={<SearchOutlined />} /></Tooltip>
            <Tooltip title="刷新"><Button type="text" icon={<ReloadOutlined />} onClick={() => window.location.reload()} /></Tooltip>
            <Popover content={columnPopoverContent} title={null} trigger="click"
              placement="bottomRight" open={columnPopoverOpen} onOpenChange={setColumnPopoverOpen}>
              <Tooltip title="表头管理"><Button type="text" icon={<SettingOutlined />} /></Tooltip>
            </Popover>
          </Space>
        </div>

        <Table
          columns={visibleColumns}
          dataSource={pageData}
          rowKey="key"
          scroll={{ x: scrollX }}
          sticky={{ offsetHeader: 0 }}
          size="middle"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, columnWidth: 40 }}
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
