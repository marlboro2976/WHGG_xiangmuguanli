import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Tag, Tooltip, Divider } from 'antd'
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import FundsArrivalModal from '../components/FundsArrivalModal'
import mockData from '../mock/data.json'
import { actionLinkStyle } from '../constants/uiStyles'

const tagBool = (v) => {
  if (v === '是') return <Tag color="success" style={{ margin: 0 }}>{v}</Tag>
  if (v === '否') return <span style={{ color: '#bfbfbf' }}>否</span>
  return v || <span style={{ color: '#bfbfbf' }}>-</span>
}
const tagStartType = (v) => {
  if (!v || v === '-') return <span style={{ color: '#bfbfbf' }}>-</span>
  const colorMap = { '已开工（设备购置类）': 'blue', '开业': 'purple', '已开工（建安类）': 'cyan' }
  return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
}

const formatDate = (val) => {
  if (!val || val === '-') return '-'
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    return date.toISOString().split('T')[0]
  }
  return val
}

export default function Luodi() {
  const navigate = useNavigate()
  const [fundsProject, setFundsProject] = useState(null)

  const dataList = useMemo(() => {
    return mockData.luodi.map((item, idx) => ({
      key: item.id,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectName: item['项目名称'] || '-',
      cityProjectCode: item['市级项目编码'] || item['在谈项目编码'] || '-',
      districtProjectCode: item['编号'] || '-',
      projectArea: item['项目区域'] || '-',
      investAmount: item['投资金额(亿元)'] || 0,
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      isStarted: item['是否已开工'] || '-',
      startDate: formatDate(item['开工/业时间']),
      startType: item['开工开业类型'] || '-',
      landingDate: item['落地时间'] || '-',
      _raw: item,
    }))
  }, [])

  const handleDetail = (record) => navigate(`/project/luodi/detail/${record.key}`)
  const handleFunds = (record) => setFundsProject(record._raw)

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 130, align: 'left', fixed: 'left', ellipsis: true,
      render: (v) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
    },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'cityProjectCode', title: '市级项目编码', dataIndex: 'cityProjectCode', width: 140, align: 'center' },
    { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 140, align: 'center' },
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
    { key: 'startDate', title: '开工/开业时间', dataIndex: 'startDate', width: 120, align: 'center' },
    { key: 'startType', title: '开工开业类型', dataIndex: 'startType', width: 170, align: 'center',
      render: (v) => tagStartType(v)
    },
    { key: 'landingDate', title: '落地时间', dataIndex: 'landingDate', width: 110, align: 'center' },
    { key: 'action', title: '操作', dataIndex: 'action', width: 160, fixed: 'right', align: 'center', required: true,
      render: (_, record) => (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span style={actionLinkStyle} onClick={() => handleDetail(record)}>
            <EyeOutlined /> 详情
          </span>
          <span style={actionLinkStyle} onClick={() => handleFunds(record)}>
            <FileTextOutlined /> 到资情况
          </span>
        </Space>
      )
    },
  ], [])

  const extraFilters = [
    { key: 'startStatus', label: '是否已开工', type: 'select', options: [
      { label: '是', value: 'started' },
      { label: '否', value: 'not_started' },
    ]},
    { key: 'startType', label: '开工开业类型', type: 'select', options: [
      { label: '已开工（设备购置类）', value: '已开工（设备购置类）' },
      { label: '开业', value: '开业' },
      { label: '已开工（建安类）', value: '已开工（建安类）' },
    ]},
  ]

  return (
    <>
      <GenericProjectList
        stage="luodi"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
        title="项目落地"
        canAdd={false}
        canImport={false}
        scrollX={1935}
      />

      <FundsArrivalModal
        open={!!fundsProject}
        project={fundsProject}
        onCancel={() => setFundsProject(null)}
      />
    </>
  )
}
