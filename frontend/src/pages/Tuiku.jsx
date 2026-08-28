import { useMemo } from 'react'
import { Tag, Tooltip, Space, Divider, message } from 'antd'
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import mockData from '../mock/data.json'

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

const TUIKU_REASONS = [
  '投资方战略调整',
  '选址不符合要求',
  '政策条件未达成',
  '企业资金问题',
  '重复申报无效',
]

function buildTuikuItem(raw, idx, sourceStage, reason, tuikuTime) {
  return {
    key: `tuiku-${idx + 1}`,
    index: idx + 1,
    reporter: raw['申报人'] || '-',
    projectStatus: '已退库',
    projectName: raw['项目名称'] || '-',
    sourceStage,
    sourceArea: raw['来源地'] || '-',
    industryCategory: raw['产业类别'] || '-',
    industryType: raw['行业类别（门类）'] || raw['行业类别'] || '-',
    investorEntity: raw['投资主体'] || '-',
    investAmount: raw['投资金额(亿元)'] || raw['投资金额（亿元）'] || 0,
    enterpriseNature: raw['企业性质'] || '-',
    tuikuReason: reason,
    tuikuTime,
    reportTime: raw['申报时间'] || '-',
    auditStatus: '已退库',
  }
}

export default function Tuiku() {
  const dataList = useMemo(() => {
    const zaitanTail = mockData.zaitan.slice(-2)
    const luodiFirst = (mockData.luodi && mockData.luodi[0]) ? [mockData.luodi[0]] : []

    const items = []
    zaitanTail.forEach((item, i) => {
      items.push(buildTuikuItem(item, items.length, '在谈', TUIKU_REASONS[i % TUIKU_REASONS.length], `2026-06-${10 + i}`))
    })
    luodiFirst.forEach((item, i) => {
      items.push(buildTuikuItem(item, items.length, '落地', TUIKU_REASONS[(2 + i) % TUIKU_REASONS.length], '2026-06-15'))
    })
    return items
  }, [])

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'sourceStage', title: '原阶段', dataIndex: 'sourceStage', width: 80, align: 'center', fixed: 'left',
      render: (v) => {
        const colorMap = { '在谈': 'gold', '签约': 'purple', '落地': 'green' }
        return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
      }
    },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 240, ellipsis: true, fixed: 'left', required: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => message.info('查看项目详情（demo示意）')}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'tuikuReason', title: '退库原因', dataIndex: 'tuikuReason', width: 130, align: 'center',
      render: (v) => <Tag color="volcano" style={{ margin: 0 }}>{v}</Tag>
    },
    { key: 'tuikuTime', title: '退库时间', dataIndex: 'tuikuTime', width: 110, align: 'center' },
    { key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 200, ellipsis: true },
    { key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 130, align: 'right',
      render: (v) => <span style={{ fontWeight: 600, color: '#ff4d4f' }}>{Number(v).toFixed(2)}</span>
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 80, align: 'center' },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 160, ellipsis: true },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 100, ellipsis: true },
    { key: 'enterpriseNature', title: '企业性质', dataIndex: 'enterpriseNature', width: 90, align: 'center' },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 120, ellipsis: true },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center' },
    { key: 'action', title: '操作', dataIndex: 'action', width: 150, fixed: 'right', align: 'center', required: true,
      render: () => (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span style={actionLinkStyle} onClick={() => message.info('查看详情（demo示意）')}>
            <EyeOutlined /> 详情
          </span>
          <span style={actionLinkStyle} onClick={() => message.info('恢复项目功能（demo示意）')}>
            <RollbackOutlined /> 恢复
          </span>
        </Space>
      )
    },
  ], [])

  const extraFilters = [
    { key: 'sourceStage', label: '原阶段', type: 'select',
      options: [{ label: '谋划', value: '谋划' }, { label: '在谈', value: '在谈' }, { label: '签约', value: '签约' }, { label: '落地', value: '落地' }]
    },
    { key: 'tuikuReason', label: '退库原因', type: 'select',
      options: TUIKU_REASONS.map(v => ({ label: v, value: v }))
    },
  ]

  return (
    <GenericProjectList
      stage="tuiku"
      title="项目退库"
      canAdd={false}
      dataList={dataList}
      columns={columns}
      filters={extraFilters}
      scrollX={1700}
    />
  )
}
