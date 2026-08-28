import { useMemo } from 'react'
import { Space, Tag, Tooltip, Divider, Dropdown, Modal, message } from 'antd'
import {
  EyeOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
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

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

export default function Qianyue() {
  const dataList = useMemo(() => {
    return mockData.qianyue.map((item, idx) => ({
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
      domesticForeign: item['内外资'] || '-',
      enterpriseNature: item['企业性质'] || '-',
      isSigned: item['是否已签约'] || '-',
      signDate: item['协议签订时间'] || '-',
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
    { key: 'industryType', title: '行业类别（门类）', dataIndex: 'industryType', width: 140, ellipsis: true },
    { key: 'domesticForeign', title: '内外资', dataIndex: 'domesticForeign', width: 70, align: 'center' },
    { key: 'enterpriseNature', title: '企业性质', dataIndex: 'enterpriseNature', width: 90, align: 'center' },
    { key: 'isSigned', title: '是否已签约', dataIndex: 'isSigned', width: 90, align: 'center',
      render: (v) => tagBool(v)
    },
    { key: 'signDate', title: '协议签订时间', dataIndex: 'signDate', width: 110, align: 'center' },
    { key: 'auditStatus', title: '审核状态', dataIndex: 'auditStatus', width: 110, align: 'center',
      render: (v) => tagAudit(v)
    },
    { key: 'action', title: '操作', dataIndex: 'action', width: 240, fixed: 'right', align: 'center', required: true,
      render: (_, record) => {
        const moreMenuItems = [
          { key: 'edit', icon: <FileTextOutlined />, label: '编辑签约信息' },
          { key: 'register', icon: <ArrowRightOutlined />, label: '注册公司' },
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
          } else if (e.key === 'edit') {
            message.info('编辑签约信息（demo示意）')
          } else if (e.key === 'register') {
            message.info('注册公司（demo示意）')
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
            <span style={actionLinkStyle} onClick={() => {
              Modal.confirm({
                title: '推进落地',
                content: `确定将项目「${record.projectName}」推进至落地阶段吗？需要补充落地阶段必填字段。`,
                okText: '去补充信息', cancelText: '取消',
                onOk: () => message.success('已进入落地信息补全流程（demo示意）'),
              })
            }}>
              <ArrowRightOutlined /> 推进落地
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
    { key: 'signStatus', label: '签约状态', type: 'select', options: [
      { label: '已签约', value: 'signed' },
      { label: '未签约', value: 'unsigned' },
    ]},
    { key: 'enterpriseNature', label: '企业性质', type: 'select', options: [
      { label: '国企（央企）', value: '国企（央企）' },
      { label: '国企（地方）', value: '国企（地方）' },
      { label: '民企', value: '民企' },
      { label: '外企', value: '外企' },
    ]},
  ]

  return (
    <GenericProjectList
      stage="qianyue"
      dataList={dataList}
      columns={columns}
      filters={extraFilters}
      title="签约注册"
      addButtonText="新增签约项目"
      nextStageText="落地"
      nextStageConfirmTitle="推进落地"
      scrollX={2400}
    />
  )
}
