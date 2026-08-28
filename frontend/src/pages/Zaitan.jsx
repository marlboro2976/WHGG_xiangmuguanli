import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Tooltip,
  Popover,
  Checkbox,
  Dropdown,
  Divider,
  Modal,
  Form,
  message,
} from 'antd'
import {
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  MoreOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import UpdateDecisionModal from '../components/UpdateDecisionModal'
import ZaitanEditModal from '../components/ZaitanEditModal'

const { RangePicker } = DatePicker

// 所有列定义（带key用于列管理）
const ALL_COLUMNS = [
  { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
  { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 130, align: 'left', fixed: 'left', ellipsis: true },
  { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true },
  { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 100, ellipsis: true },
  { key: 'chushangType', title: '楚商类型', dataIndex: 'chushangType', width: 90, align: 'center' },
  { key: 'chushangInfo', title: '楚商基本信息', dataIndex: 'chushangInfo', width: 110, align: 'center' },
  { key: 'domesticForeign', title: '内外资', dataIndex: 'domesticForeign', width: 70, align: 'center' },
  { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 80, align: 'center' },
  { key: 'projectCategory', title: '项目分类', dataIndex: 'projectCategory', width: 85, align: 'center' },
  { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 160, ellipsis: true },
  { key: 'projectDesc', title: '项目简介', dataIndex: 'projectDesc', width: 260, ellipsis: true },
  { key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 180, ellipsis: true },
  { key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 130, align: 'right', sorter: true },
  { key: 'enterpriseNature', title: '企业性质', dataIndex: 'enterpriseNature', width: 80, align: 'center' },
  { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center' },
  { key: 'action', title: '操作', dataIndex: 'action', width: 180, fixed: 'right', align: 'center', required: true },
]

// 默认显示的列
const DEFAULT_VISIBLE_KEYS = ALL_COLUMNS.map(c => c.key)

export default function Zaitan() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    projectName: '',
    industryType: undefined,
    category: undefined,
    chushangType: undefined,
    domesticForeign: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    dateRange: null,
    enterpriseNature: undefined,
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(DEFAULT_VISIBLE_KEYS)
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)

  // 列表弹窗状态
  const [progressForm] = Form.useForm()
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)

  const data = useMemo(() => {
    return mockData.zaitan.map((item, idx) => ({
      key: item.id,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectStatus: item['项目状态'] || '在谈',
      projectName: item['项目名称'] || '-',
      sourceArea: item['来源地'] || '-',
      chushangType: item['楚商类型'] || '-',
      chushangInfo: '-',
      domesticForeign: item['内外资'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investorContact: item['投资主体联系人'] || '-',
      investAmount: item['投资金额（亿元）'] || 0,
      enterpriseNature: item['企业性质'] || '-',
      enterpriseCategory: item['企业类别'] || '-',
      assignedLevel: item['交办层级'] || '-',
      cityContact: item['市投促局联络人'] || '-',
      districtLeader: item['区级责任领导'] || '-',
      districtContact: item['区投促局责任人'] || '-',
      problemType: item['问题类型'] || '-',
      warnStatus: item['预警状态'] || '-',
      reportTime: item['申报时间'] || '-',
      auditStatus: item['审核状态'] || '-',
      isEnclave: item['是否飞地园区'] || '否',
      isAdvancedMfg: item['是否先进制造业'] || '否',
      chain965: item['对应"965"产业链类别'] || '-',
      acceptArea: item['承接区'] || '-',
      projectCategory: ['政策类', '投资类', '供地类', '其他'][idx % 4],
    }))
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(r => {
      if (filters.projectName && !r.projectName.includes(filters.projectName)) return false
      if (filters.industryType && r.industryType !== filters.industryType) return false
      if (filters.category && r.industryCategory !== filters.category) return false
      if (filters.domesticForeign && r.domesticForeign !== filters.domesticForeign) return false
      if (filters.enterpriseNature && r.enterpriseNature !== filters.enterpriseNature) return false
      const amt = Number(r.investAmount) || 0
      if (filters.minAmount !== undefined && filters.minAmount !== '' && amt < Number(filters.minAmount)) return false
      if (filters.maxAmount !== undefined && filters.maxAmount !== '' && amt > Number(filters.maxAmount)) return false
      return true
    })
  }, [data, filters])

  // 分页数据
  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  // 当页投资总额（按分页数据计算）
  const pageInvest = pageData.reduce((sum, r) => sum + (Number(r.investAmount) || 0), 0)
  const filteredInvest = filteredData.reduce((sum, r) => sum + (Number(r.investAmount) || 0), 0)

  const industryTypeOptions = [...new Set(data.map(r => r.industryType).filter(v => v && v !== '-'))].map(v => ({ label: v, value: v }))
  const industryCategoryOptions = [...new Set(data.map(r => r.industryCategory).filter(v => v && v !== '-'))].map(v => ({ label: v, value: v }))

  const handleSearch = () => {
    message.success('查询完成')
    setPagination(p => ({ ...p, current: 1 }))
  }

  const handleReset = () => {
    setFilters({
      projectName: '', industryType: undefined, category: undefined,
      chushangType: undefined, domesticForeign: undefined,
      minAmount: undefined, maxAmount: undefined, dateRange: null, enterpriseNature: undefined,
    })
  }

  // 是否显示更新决策节点入口
  const canUpdateDecision = (record) => {
    if (record.projectCategory === '政策类' || record.projectCategory === '供地类') return true
    if (record.projectCategory === '投资类' && Number(record.investAmount) > 0.5) return true
    return false
  }

  const getMoreMenuItems = (record) => {
    const items = [
      { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
      { key: 'edit', icon: <EditOutlined />, label: '编辑' },
    ]
    if (canUpdateDecision(record)) {
      items.push({ key: 'decision', icon: <SettingOutlined />, label: '更新决策节点' })
    }
    items.push({ key: 'stop', icon: <PauseCircleOutlined />, label: '标记退库', danger: true })
    return items
  }

  const handleMoreClick = (e, record) => {
    setCurrentProject(record)
    if (e.key === 'stop') {
      Modal.confirm({
        title: '确认退库',
        content: `确定将项目「${record.projectName}」标记为退库吗？退库后不可恢复。`,
        okText: '确认退库', cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => message.success('已标记为退库'),
      })
    } else if (e.key === 'report') {
      progressForm.resetFields()
      setProgressModalVisible(true)
    } else if (e.key === 'decision') {
      setDecisionModalVisible(true)
    } else if (e.key === 'edit') {
      setEditModalVisible(true)
    }
  }

  const handleProgressOk = async () => {
    try {
      await progressForm.validateFields()
      setProgressLoading(true)
      message.success('进展汇报已提交（demo示意）')
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDecisionOk = () => {
    setDecisionModalVisible(false)
    setCurrentProject(null)
    message.success('决策节点已更新（demo示意）')
  }

  const handleEditOk = () => {
    setEditModalVisible(false)
    setCurrentProject(null)
  }

  const selectCommon = { allowClear: true, style: { width: '100%' } }
  const fw = 140

  const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

  // 渲染单元格
  const renderCell = (col, record) => {
    const v = record[col.dataIndex]
    if (col.dataIndex === 'reporter') {
      return <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
    }
    if (col.dataIndex === 'projectName') {
      return (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => navigate(`/project/zaitan/detail/${record.key}`)}>{v}</span>
        </Tooltip>
      )
    }
    if (col.dataIndex === 'chushangType') {
      return v === '-' || v === '' ? <span style={{ color: '#bfbfbf' }}>-</span> : v
    }
    if (col.dataIndex === 'chushangInfo') {
      return <span style={{ color: '#bfbfbf' }}>-</span>
    }
    if (col.dataIndex === 'projectDesc') {
      return <Tooltip title={v} placement="topLeft" overlayStyle={{ maxWidth: 480 }}><span>{v}</span></Tooltip>
    }
    if (col.dataIndex === 'investAmount') {
      return <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    }
    if (col.dataIndex === 'action') {
      return (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span style={actionLinkStyle} onClick={() => navigate(`/project/zaitan/detail/${record.key}`)}>
            <EyeOutlined /> 详情
          </span>
          <span style={actionLinkStyle} onClick={() => {
            Modal.confirm({
              title: '转签约',
              content: `确定将项目「${record.projectName}」推进至签约阶段吗？需要补充签约阶段必填字段。`,
              okText: '去补充信息', cancelText: '取消',
              onOk: () => message.success('已进入签约信息补全流程（demo示意）'),
            })
          }}>
            <EditOutlined /> 签约
          </span>
          <Dropdown menu={{ items: getMoreMenuItems(record), onClick: (e) => handleMoreClick(e, record) }} trigger={['click']}>
            <span style={actionLinkStyle} onClick={(e) => e.preventDefault()}>
              <MoreOutlined />
            </span>
          </Dropdown>
        </Space>
      )
    }
    return v
  }

  // 根据visibleColumnKeys构建显示列
  const columns = useMemo(() => {
    return ALL_COLUMNS
      .filter(c => visibleColumnKeys.includes(c.key))
      .map(c => {
        const col = { ...c }
        col.render = (_, record) => renderCell(c, record)
        return col
      })
  }, [visibleColumnKeys])

  // 表头管理Popover内容
  const columnPopoverContent = (
    <div style={{ width: 200, maxHeight: 360, overflowY: 'auto' }}>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#666' }}>列显示设置</div>
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        value={visibleColumnKeys}
        onChange={(keys) => {
          // 确保必选列始终选中
          const requiredKeys = ALL_COLUMNS.filter(c => c.required).map(c => c.key)
          const merged = [...new Set([...keys, ...requiredKeys])]
          setVisibleColumnKeys(merged)
        }}
      >
        {ALL_COLUMNS.map(c => (
          <Checkbox key={c.key} value={c.key} disabled={c.required} style={{ fontSize: 13 }}>
            {c.title}
          </Checkbox>
        ))}
      </Checkbox.Group>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS)}>
          重置默认
        </Button>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => {
          const optional = ALL_COLUMNS.filter(c => !c.required).map(c => c.key)
          setVisibleColumnKeys([...visibleColumnKeys.filter(k => ALL_COLUMNS.find(c => c.key === k)?.required), ...optional])
        }}>
          全选
        </Button>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      {/* 筛选区域 */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            style={{ width: fw }}
            placeholder="项目名称"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={filters.projectName}
            onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
            allowClear
          />
          <Select placeholder="产业类别" {...selectCommon} style={{ width: fw }}
            value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })}
            options={industryCategoryOptions} />
          <Select placeholder="行业类别" {...selectCommon} style={{ width: fw }}
            value={filters.industryType} onChange={(v) => setFilters({ ...filters, industryType: v })}
            options={industryTypeOptions} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <InputNumber placeholder="投资金额" style={{ width: 110 }}
              value={filters.minAmount} onChange={(v) => setFilters({ ...filters, minAmount: v })}
              min={0} precision={2} addonAfter="亿" />
            <span style={{ color: '#bfbfbf' }}>--</span>
            <InputNumber placeholder="投资金额" style={{ width: 110 }}
              value={filters.maxAmount} onChange={(v) => setFilters({ ...filters, maxAmount: v })}
              min={0} precision={2} addonAfter="亿" />
          </div>
          <RangePicker style={{ width: 260 }} value={filters.dateRange}
            onChange={(v) => setFilters({ ...filters, dateRange: v })} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <Button
              type="link"
              icon={filterExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setFilterExpanded(!filterExpanded)}
              style={{ padding: '4px 0', fontSize: 13 }}
            >
              {filterExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>

        {filterExpanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <Select placeholder="楚商类型" {...selectCommon} style={{ width: fw }}
              value={filters.chushangType} onChange={(v) => setFilters({ ...filters, chushangType: v })}
              options={[
                { label: '湖北籍企业家', value: 'hubei' },
                { label: '武汉校友', value: 'wh_alumni' },
                { label: '非楚商', value: 'none' },
              ]} />
            <Select placeholder="内外资" {...selectCommon} style={{ width: fw }}
              value={filters.domesticForeign} onChange={(v) => setFilters({ ...filters, domesticForeign: v })}
              options={[{ label: '内资', value: '内资' }, { label: '外资', value: '外资' }]} />
            <Select placeholder="企业性质" {...selectCommon} style={{ width: fw }}
              value={filters.enterpriseNature} onChange={(v) => setFilters({ ...filters, enterpriseNature: v })}
              options={[
                { label: '国企（央企）', value: '国企（央企）' },
                { label: '国企（地方）', value: '国企（地方）' },
                { label: '民企', value: '民企' },
                { label: '外企', value: '外企' },
              ]} />
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => message.success('导出任务已提交，请在消息中心查看')}>
            导出
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="table-card">
        {/* 工具栏：左侧统计数据，右侧操作按钮 */}
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('新增项目（demo示意）')}>
              新增项目
            </Button>
            <Button icon={<ImportOutlined />} onClick={() => message.info('导入功能（demo示意）')}>
              导入
            </Button>
            <Tooltip title="搜索">
              <Button type="text" icon={<SearchOutlined />} />
            </Tooltip>
            <Tooltip title="刷新">
              <Button type="text" icon={<ReloadOutlined />} onClick={() => window.location.reload()} />
            </Tooltip>
            <Popover
              content={columnPopoverContent}
              title={null}
              trigger="click"
              placement="bottomRight"
              open={columnPopoverOpen}
              onOpenChange={setColumnPopoverOpen}
            >
              <Tooltip title="表头管理">
                <Button type="text" icon={<SettingOutlined />} />
              </Tooltip>
            </Popover>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          scroll={{ x: 2200 }}
          sticky={{ offsetHeader: 0 }}
          size="middle"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            columnWidth: 40,
          }}
          pagination={{
            ...pagination,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>

      {/* 列表页弹窗：进展汇报 */}
      <Modal
        title={`进展汇报 - ${currentProject?.projectName || ''}`}
        open={progressModalVisible}
        onOk={handleProgressOk}
        onCancel={() => { setProgressModalVisible(false); progressForm.resetFields() }}
        confirmLoading={progressLoading}
        okText="提交"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" requiredMark={true} style={{ marginTop: 16 }}>
          <Form.Item
            label="进展内容"
            name="content"
            rules={[{ required: true, message: '请输入进展内容' }, { max: 500, message: '进展内容不超过500个字符' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入进展内容，最多500字" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 列表页弹窗：更新决策节点 */}
      <UpdateDecisionModal
        key={`list-decision-${decisionModalVisible}`}
        open={decisionModalVisible}
        onCancel={() => { setDecisionModalVisible(false); setCurrentProject(null) }}
        onOk={handleDecisionOk}
        projectCategory={currentProject?.projectCategory}
        investAmount={currentProject?.investAmount}
        initialPassedNodes={{}}
      />

      {/* 列表页弹窗：编辑在谈项目 */}
      <ZaitanEditModal
        key={`list-edit-${editModalVisible}`}
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setCurrentProject(null) }}
        onOk={handleEditOk}
        projectData={currentProject}
      />
    </div>
  )
}
