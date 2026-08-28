import { useMemo } from 'react'
import { Space, Tag, Tooltip, Divider, Dropdown, Modal, message } from 'antd'
import {
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import mockData from '../mock/data.json'

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
const tagStartType = (v) => {
  if (!v || v === '-') return <span style={{ color: '#bfbfbf' }}>-</span>
  const colorMap = {
    '开工': 'blue',
    '开业': 'purple',
  }
  return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
}

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

const formatDate = (val) => {
  if (!val || val === '-') return '-'
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    return date.toISOString().split('T')[0]
  }
  return val
}

export default function Luodi() {
  const dataList = useMemo(() => {
    return mockData.luodi.map((item, idx) => ({
      key: item.id,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectName: item['项目名称'] || '-',
      projectCode: item['编号'] || '-',
      projectArea: item['项目区域'] || '-',
      investAmount: item['投资金额(亿元)'] || 0,
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      isStarted: item['是否已开工'] || '-',
      startDate: formatDate(item['开工/业时间']),
      startType: item['开工开业类型'] || '-',
      auditStatus: item['审核状态'] || '-',
    }))
  }, [])

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 130, align: 'left', fixed: 'left', ellipsis: true,
      render: (v) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
    },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => message.info('查看项目详情（demo示意）')}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'projectCode', title: '编号', dataIndex: 'projectCode', width: 120, align: 'center' },
    { key: 'projectArea', title: '项目区域', dataIndex: 'projectArea', width: 110, ellipsis: true },
    { key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 130, align: 'right', sorter: true,
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    },
    { key: 'fixedInvestAmount', title: '固投金额(亿元)', dataIndex: 'fixedInvestAmount', width: 130, align: 'right',
      render: (v) => <span style={{ fontWeight: 500 }}>{Number(v).toFixed(2)}</span>
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 80, align: 'center' },
    { key: 'industryType', title: '行业类别（门类）', dataIndex: 'industryType', width: 160, ellipsis: true },
    { key: 'isStarted', title: '是否已开工', dataIndex: 'isStarted', width: 90, align: 'center',
      render: (v) => tagBool(v)
    },
    { key: 'startDate', title: '开工/业时间', dataIndex: 'startDate', width: 110, align: 'center' },
    { key: 'startType', title: '开工开业类型', dataIndex: 'startType', width: 100, align: 'center',
      render: (v) => tagStartType(v)
    },
    { key: 'auditStatus', title: '审核状态', dataIndex: 'auditStatus', width: 110, align: 'center',
      render: (v) => tagAudit(v)
    },
    { key: 'action', title: '操作', dataIndex: 'action', width: 180, fixed: 'right', align: 'center', required: true,
      render: (_, record) => {
        const moreMenuItems = [
          { key: 'progress', icon: <FileTextOutlined />, label: '更新建设进度' },
          { key: 'funds', icon: <EyeOutlined />, label: '到资情况' },
          { key: 'stop', icon: <EyeOutlined />, label: '标记退库', danger: true },
        ]
        const handleMoreClick = (e) => {
          if (e.key === 'stop') {
            Modal.confirm({
              title: '确认退库',
              content: `确定将项目「${record.projectName}」标记为退库吗？退库后不可恢复。`,
              okText: '确认退库', cancelText: '取消',
              okButtonProps: { danger: true },
              onOk: () => message.success('已标记为退库'),
            })
          } else if (e.key === 'progress') {
            message.info('更新建设进度（demo示意）')
          } else if (e.key === 'funds') {
            message.info('到资情况（demo示意）')
          }
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
            <span style={actionLinkStyle} onClick={() => message.info('查看详情（demo示意）')}>
              <EyeOutlined /> 详情
            </span>
            <span style={actionLinkStyle} onClick={() => message.info('进展汇报（demo示意）')}>
              <FileTextOutlined /> 汇报
            </span>
            <Dropdown menu={{ items: moreMenuItems, onClick: handleMoreClick }} trigger={['click']}>
              <span style={actionLinkStyle} onClick={(e) => e.preventDefault()}>
                <MoreOutlined />
              </span>
            </Dropdown>
          </Space>
        )
      }
    },
  ], [])

  const extraFilters = [
    { key: 'startStatus', label: '开工状态', type: 'select', options: [
      { label: '已开工', value: 'started' },
      { label: '未开工', value: 'not_started' },
    ]},
    { key: 'startType', label: '开工开业类型', type: 'select', options: [
      { label: '开工', value: '开工' },
      { label: '开业', value: '开业' },
    ]},
  ]

  return (
    <GenericProjectList
      stage="luodi"
      dataList={dataList}
      columns={columns}
      filters={extraFilters}
      title="项目落地"
      addButtonText="新增落地项目"
      canAdd={true}
      scrollX={2200}
    />
  )
}
