import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Tooltip, Divider, Dropdown, Modal, Form, Input, message } from 'antd'
import {
  EyeOutlined,
  FileTextOutlined,
  EditOutlined,
  ExportOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import QianyueEditModal from '../components/QianyueEditModal'
import ZhuanLuodiModal from '../components/ZhuanLuodiModal'
import ImportModal from '../components/ImportModal'
import mockData from '../mock/data.json'
import { useViewRole, useImported } from '../store/viewStore'
import {
  COLORS,
  actionLinkStyle,
  actionLinkPrimaryStyle,
  emptyTag,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
} from '../constants/uiStyles'

export default function Qianyue() {
  const navigate = useNavigate()
  const { isSponsor } = useViewRole()
  const [editVisible, setEditVisible] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [progressVisible, setProgressVisible] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressProject, setProgressProject] = useState(null)
  const [progressForm] = Form.useForm()
  const [luodiVisible, setLuodiVisible] = useState(false)
  const [luodiProject, setLuodiProject] = useState(null)
  const [importVisible, setImportVisible] = useState(false)
  const imported = useImported()

  const dataList = useMemo(() => {
    // Excel导入成功的项目置顶展示
    const raw = [
      ...(imported?.stage === 'qianyue' ? imported.successProjects : []),
      ...mockData.qianyue,
    ]
    return raw.map((item, idx) => ({
      key: item.id || idx,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectName: item['项目名称'] || '-',
      natongProjectCode: item['在谈项目编码'] || item['市级项目编码'] || item['项目编码'] || '-',
      districtProjectCode: item['区级项目编码'] || item['编号'] || '-',
      projectArea: item['项目区域'] || '-',
      investAmount: item['投资金额(亿元)'] || 0,
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      domesticForeign: item['内外资'] || '-',
      enterpriseNature: item['企业性质'] || '-',
      signDate: item['协议签订时间'] || '-',
      agreementType: item['协议类型'] || '-',
      _raw: item,
    }))
  }, [imported])

  const handleDetail = (record) => navigate(`/project/qianyue/detail/${record.key}`)
  const handleEdit = (record) => {
    setCurrentProject(record._raw)
    setEditVisible(true)
  }
  const handleReport = (record) => {
    setProgressProject(record)
    progressForm.resetFields()
    setProgressVisible(true)
  }
  const handleProgressOk = async () => {
    try {
      await progressForm.validateFields()
      setProgressLoading(true)
      setTimeout(() => {
        setProgressLoading(false)
        message.success('进展汇报已提交（演示）')
        setProgressVisible(false)
        progressForm.resetFields()
      }, 400)
    } catch {}
  }
  const handleToLuodi = (record) => {
    Modal.confirm({
      title: '推进落地',
      content: `确定将项目「${record.projectName}」推进至落地阶段吗？需要补充落地阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => {
        setLuodiProject(record._raw)
        setLuodiVisible(true)
      },
    })
  }
  const handleLuodiOk = () => {
    message.success('已推进至落地阶段')
    setLuodiVisible(false)
    setLuodiProject(null)
    navigate('/project/luodi')
  }

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'natongProjectCode', title: '市级项目编码', dataIndex: 'natongProjectCode', width: 140, align: 'center' },
    { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 140, align: 'center' },
    {
      key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true,
      fixed: 'left', required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: COLORS.primary, cursor: 'pointer' }} onClick={() => handleDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 160, ellipsis: true,
      render: (_, r) => emptyTag(r._raw['投资主体'])
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center' },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 140, ellipsis: true },
    { key: 'domesticForeign', title: '内外资', dataIndex: 'domesticForeign', width: 70, align: 'center' },
    {
      key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 120, align: 'right', sorter: true,
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    },
    { key: 'signDate', title: '协议签订时间', dataIndex: 'signDate', width: 110, align: 'center' },
    { key: 'responsibleUnit', title: '负责单位', dataIndex: 'responsibleUnit', width: 120, ellipsis: true,
      render: (_, r) => r._raw['负责单位'] || '区投促局'
    },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 90, align: 'center' },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center',
      render: (_, r) => emptyTag(r._raw['申报时间'])
    },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 200, fixed: 'right', align: 'center', required: true,
      render: (_, record) => {
        const moreMenuItems = [
          { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
          { key: 'edit', icon: <EditOutlined />, label: '编辑' },
        ]
        const handleMoreClick = (e) => {
          if (e.key === 'edit') handleEdit(record)
          else if (e.key === 'report') handleReport(record)
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 8px' }} />}>
            <span style={actionLinkStyle} onClick={() => handleDetail(record)}>
              <EyeOutlined /> 详情
            </span>
            {isSponsor && (
              <>
                <span style={actionLinkPrimaryStyle} onClick={() => handleToLuodi(record)}>
                  <ExportOutlined /> 落地
                </span>
                <Dropdown menu={{ items: moreMenuItems, onClick: handleMoreClick }} trigger={['click']}>
                  <span style={{ color: COLORS.primary, cursor: 'pointer', fontSize: 16, padding: '0 4px' }} onClick={(e) => e.preventDefault()}>
                    <MoreOutlined />
                  </span>
                </Dropdown>
              </>
            )}
          </Space>
        )
      }
    },
  ], [isSponsor])

  const extraFilters = [
    { key: 'agreementType', label: '协议类型', type: 'select', options: [
      { label: '投资协议', value: '投资协议' },
      { label: '框架协议', value: '框架协议' },
      { label: '补充协议', value: '补充协议' },
    ]},
    { key: 'enterpriseNature', label: '企业性质', type: 'select', options: [
      { label: '国企（央企）', value: '国企（央企）' },
      { label: '国企（地方）', value: '国企（地方）' },
      { label: '民企', value: '民企' },
      { label: '外企', value: '外企' },
    ]},
  ]

  return (
    <>
      <GenericProjectList
        stage="qianyue"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
        title="签约项目"
        canAdd={false}
        canImport={true}
        onImport={() => setImportVisible(true)}
        scrollX={1810}
      />

      {/* 导入弹窗（含判重检测） */}
      <ImportModal
        open={importVisible}
        stage="qianyue"
        stageLabel="签约"
        onCancel={() => setImportVisible(false)}
      />

      <QianyueEditModal
        open={editVisible}
        projectData={currentProject}
        onCancel={() => setEditVisible(false)}
        onOk={() => {
          message.success('签约信息已更新（演示）')
          setEditVisible(false)
        }}
      />

      {/* 签约转落地弹窗 */}
      <ZhuanLuodiModal
        open={luodiVisible}
        projectData={luodiProject}
        onCancel={() => { setLuodiVisible(false); setLuodiProject(null) }}
        onOk={handleLuodiOk}
      />

      {/* 列表页弹窗：进展汇报 */}
      <Modal
        {...progressModalProps({
          open: progressVisible,
          projectName: progressProject?.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <Input.TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
