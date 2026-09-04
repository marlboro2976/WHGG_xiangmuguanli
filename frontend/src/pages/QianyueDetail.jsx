import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Modal, Form, Input,
  message, Tag, Row, Col, Empty, Timeline
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined,
  ExportOutlined, PlusOutlined,
  CheckCircleOutlined, RobotOutlined,
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import AssignModal from '../components/AssignModal'
import FeedbackModal from '../components/FeedbackModal'
import QianyueEditModal from '../components/QianyueEditModal'
import ZhuanLuodiModal from '../components/ZhuanLuodiModal'
import ProgressTimeline from '../components/ProgressTimeline'
import ProgressSummaryModal from '../components/ProgressSummaryModal'
import { useViewRole, msgStore } from '../store/viewStore'
import { findUnitByKey } from '../constants/assignConfig'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  pageCardStyle,
  boolTag,
  emptyTag,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

const { TextArea } = Input

const CURRENT_USER = '投促局管理员'

function formatDate(d) {
  if (!d) return '-'
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return d
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function QianyueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [progressForm] = Form.useForm()
  const { role, isSponsor, myDeptKey } = useViewRole()

  // 构造mock项目数据（从qianyue mock数据读取，扩展完整字段）
  const [project, setProject] = useState(() => {
    const item = mockData.qianyue.find(i => String(i.id) === String(id)) || mockData.qianyue[0]
    return {
      key: String(item.id || id),
      _raw: item,
      projectCode: item['编号'] || 'QY20260901001',
      cityProjectCode: item['市级项目编码'] || item['在谈项目编码'] || item['项目编码'] || '-',
      projectName: item['项目名称'] || '-',
      reporter: item['申报人'] || '-',
      reportTime: item['申报时间'] || '2026-09-01',
      projectArea: item['项目区域'] || '东湖高新区',
      addressDetail: item['项目建设地址'] || '-',
      investAmount: item['投资金额(亿元)'] || 0,
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      recordAmount: item['备案证金额(亿元)'] || 0,
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      domesticForeign: item['内外资'] || '内资',
      enterpriseNature: item['企业性质'] || '-',
      enterpriseCategory: item['企业类别'] || '-',
      isSigned: item['是否已签约'] || '是',
      signDate: item['协议签订时间'] || '2026-09-01',
      agreementType: item['协议类型'] || '投资协议',
      isRegistered: item['是否已注册'] || '否',
      registerDate: item['注册时间'] || '-',
      registerCapital: item['注册资本(万元)'] || 0,
      registerCapitalUnit: '万元',
      registerCompanyName: item['注册公司名称'] || '-',
      creditCode: item['签约主体证照号码'] || item['投资主体证照号码'] || '-',
      investorEntity: item['投资主体'] || '-',
      signSubject: item['签约主体(洽谈主体)'] || item['投资主体'] || '-',
      investorContact: item['投资主体联系人'] || item['投资方联系人'] || '-',
      investorPhone: item['投资主体联系人电话'] || item['投资方联系方式'] || '-',
      districtContact: item['区投促局联系人'] || item['负责单位'] || '区投促局',
      districtPhone: item['区投促局联系人电话'] || '-',
      cityContact: item['市投促局联络人'] || '-',
      cityPhone: item['市投促局联络人电话'] || '-',
      projectDesc: item['项目简介'] || '-',
      remark: item['备注'] || '-',
      sourceArea: item['来源地'] || '-',
      yearArrivalAmount: item['当年到位资金情况(亿元)'] || 0,
      expectAnnualOutput: item['预计年产值(亿元)'] || 0,
      expectAnnualTax: item['预计年税收(亿元)'] || 0,
      investForm: item['投资形态'] || '新设',
      wugu: item['所属"五谷"优势产业集群'] || '光谷优势产业集群',
      pianqu: item['所属片区'] || '不涉及',
      landSituation: item['用地情况'] || '新供地',
      landArea: item['用地/办公面积'] || 0,
      isFdi: item['是否FDI'] || '否',
      fdiAmount: item['FDI金额(万美元)'] || 0,
      isRnd: item['是否研发中心'] || '否',
      isHqEconomy: item['是否总部经济'] || '否',
      hqEconomyLevel1: item['总部经济类型'] || '-',
      hqEconomyLevel2: item['总部建设类型'] || '-',
      chuShangType: item['楚商类型'] || '非楚商',
      isZheshang: item['是否浙商'] || '否',
      isKeyIndustry: item['是否为重点产业'] || '否',
      constructionNature: item['建设性质'] || '新建',
      constructionNatureLevel2: item['建设分类'] || '-',
      planningType: item['策划类型'] || '一般经营性项目',
      projectAttr: item['立项属性'] || '审批',
      currentStageArrival: item['现阶段到资情况(亿元)'] || 0,
      chain965: item['对应"965"产业链类别'] || '-',
      gbCategory: item['门类名称'] || '-',
      gbBigCategory: item['大类名称'] || '-',
      gbMiddleCategory: item['中类名称'] || '-',
      gbSmallCategory: item['小类名称'] || '-',
      gbCode: item['行业代码'] || '-',
      arrivalUsage: item['到位资金用途说明'] || '-',
    }
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [zhuanLuodiVisible, setZhuanLuodiVisible] = useState(false)
  const [aiVisible, setAiVisible] = useState(false)

  // 进展列表（含历史阶段进展与系统事件）
  const [progressList, setProgressList] = useState([
    // 系统事件：项目新增（最早事件）
    {
      id: 'sys-create',
      content: '新增项目',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-01-10 09:00',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'sys-1',
      content: '项目推进至「在谈」阶段',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-01-20 14:30',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'prog-mouhua',
      content: '完成项目初步谋划，形成投资意向方案，明确项目选址及投资规模。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-01-18 10:00',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
    },
    {
      id: 'prog-zaitan-1',
      content: '已与投资方完成首轮对接，投资方对项目落地条件表示认可，待进一步细化投资协议条款。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-02-01 16:20',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
    },
    {
      id: 'prog-zaitan-2',
      content: '完成投资协议谈判，双方就投资金额、用地规模、扶持政策等核心条款达成一致。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-02-08 11:00',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
    },
    {
      id: 'sys-3',
      content: '项目推进至「签约」阶段',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-02-10 09:00',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'prog-1',
      content: '项目已正式签约，进入履约推进阶段。',
      reporter: '投促局管理员',
      updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: PROGRESS_TYPE.NORMAL,
      stage: '签约阶段',
    },
  ])

  // 分派记录
  const [assignList, setAssignList] = useState([
    {
      id: 'a-fgj', toDeptKey: 'fgj', fromDeptName: '市投促局', toDeptName: '发改局',
      assignTime: '2026-09-01 10:00',
      content: '请协助办理项目立项备案手续，对接项目入库。',
      attachments: [],
      status: 'processing',
      acceptTime: null, finishTime: null, feedbacks: [],
    },
    {
      id: 'a-zjj', toDeptKey: 'zjj', fromDeptName: '市投促局', toDeptName: '住建局',
      assignTime: '2026-09-01 10:00',
      content: '请对接项目规划建设审批流程，跟进施工许可办理。',
      attachments: [],
      status: 'processing',
      acceptTime: null, finishTime: null, feedbacks: [],
    },
  ])

  const visibleAssignList = useMemo(() => {
    if (isSponsor) return assignList
    return assignList.filter(a => a.toDeptKey === myDeptKey)
  }, [assignList, isSponsor, myDeptKey])

  const hasAccess = isSponsor || assignList.some(a => a.toDeptKey === myDeptKey)

  const handleBack = () => navigate('/project/qianyue')

  const handleProgressOk = async () => {
    try {
      const values = await progressForm.validateFields()
      setProgressLoading(true)
      const now = new Date().toISOString()
      setProgressList(prev => [
        {
          id: `prog-${Date.now()}`,
          type: PROGRESS_TYPE.NORMAL,
          stage: '签约阶段',
          content: values.content,
          reporter: role.userName || CURRENT_USER,
          updateTime: now,
        },
        ...prev,
      ])
      message.success('进展已添加')
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation error
    } finally {
      setProgressLoading(false)
    }
  }

  const handleAssign = (values) => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const newItems = values.targets.map((t, idx) => ({
      id: `a-${Date.now()}-${idx}`,
      toDeptKey: t.key,
      fromDeptName: role.deptName || '市投促局',
      toDeptName: t.name,
      assignTime: timeStr,
      content: values.content,
      attachments: values.attachments || [],
      status: 'processing',
      acceptTime: null,
      finishTime: null,
      feedbacks: [],
    }))
    setAssignList(prev => [...newItems, ...prev])
    // 给被分派单位发送消息
    newItems.forEach(item => {
      msgStore.addMessage({
        id: `msg-${item.id}`,
        type: 'assign',
        toDeptKey: item.toDeptKey,
        projectId: project.key,
        projectName: project.projectName,
        projectStage: 'qianyue',
        fromDeptName: item.fromDeptName,
        content: `您有一条新的协作任务，请尽快处理：${values.content.slice(0, 50)}${values.content.length > 50 ? '...' : ''}`,
        time: timeStr,
        read: false,
      })
    })
    message.success(`已分派给 ${newItems.length} 个单位`)
    setAssignModalVisible(false)
  }

  const handleFeedback = (values) => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const fbItem = {
      id: `fb-${Date.now()}`,
      user: `${role.deptName}-${role.userName}`,
      time: timeStr,
      content: values.content,
      attachments: values.attachments || [],
    }
    setAssignList(prev => prev.map(a =>
      a.id === feedbackTarget
        ? { ...a, feedbacks: [...(a.feedbacks || []), fbItem], acceptTime: a.acceptTime || timeStr }
        : a
    ))
    // 给发起人发送反馈消息
    msgStore.addMessage({
      id: `msg-fb-${fbItem.id}`,
      type: 'feedback',
      toDeptKey: 'sponsor',
      projectId: project.key,
      projectName: project.projectName,
      projectStage: 'qianyue',
      fromDeptName: role.deptName,
      content: `${role.deptName}提交了协作反馈：${values.content.slice(0, 50)}${values.content.length > 50 ? '...' : ''}`,
      time: timeStr,
      read: false,
    })
    message.success('反馈已提交')
    setFeedbackModalVisible(false)
    setFeedbackTarget(null)
  }

  const handleMarkDone = (assignId) => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    setAssignList(prev => prev.map(a =>
      a.id === assignId ? { ...a, status: 'done', finishTime: timeStr } : a
    ))
    message.success('已标记为完成')
  }

  const handleEditOk = (values) => {
    setProject(prev => ({ ...prev, ...values }))
    message.success('签约信息已更新')
    setEditModalVisible(false)
  }

  const handleToLuodi = () => {
    Modal.confirm({
      title: '推进落地',
      content: `确定将项目「${project.projectName}」推进至落地阶段吗？需要补充落地阶段字段信息。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => {
        setZhuanLuodiVisible(true)
      },
    })
  }

  const handleZhuanLuodiOk = () => {
    setProgressList(prev => [
      {
        id: `sys-luodi-${Date.now()}`,
        type: PROGRESS_TYPE.SYSTEM,
        content: '项目推进至「落地」阶段',
        reporter: role.userName || CURRENT_USER,
        updateTime: new Date().toISOString(),
      },
      ...prev,
    ])
    message.success('已推进至落地阶段')
    setZhuanLuodiVisible(false)
    setTimeout(() => navigate('/project/luodi'), 800)
  }

  if (!hasAccess) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
        </div>
        <Empty description="您无权查看此项目" style={{ padding: '100px 0' }}>
          <Button type="primary" onClick={handleBack}>返回列表</Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        {/* 顶部标题 + 操作按钮 */}
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            {!isSponsor && (
              <Tag color="orange" style={{ fontSize: 12, padding: '4px 10px' }}>
                当前为接收方视角，仅可查看项目信息
              </Tag>
            )}
          </div>
          <Space size={8}>
            {isSponsor && (
              <>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setProgressModalVisible(true)}>进展汇报</Button>
                <Button className="ai-grad-btn" icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>AI 摘要</Button>
                <Button icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>编辑</Button>
                <Button icon={<ExportOutlined />} onClick={handleToLuodi}>推进落地</Button>
              </>
            )}
          </Space>
        </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <div>
                {/* 签约状态 */}
                <div style={sectionTitleStyle}>签约状态</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="是否签约">{boolTag(project.isSigned)}</Descriptions.Item>
                  <Descriptions.Item label="协议签订时间">{emptyTag(project.signDate)}</Descriptions.Item>
                  <Descriptions.Item label="协议类型">{emptyTag(project.agreementType)}</Descriptions.Item>
                  <Descriptions.Item label="是否注册">{boolTag(project.isRegistered)}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">{emptyTag(project.registerDate)}</Descriptions.Item>
                </Descriptions>

                {/* 项目基本信息 */}
                <div style={sectionTitleStyle}>项目基本信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="市级项目编码">{emptyTag(project.cityProjectCode)}</Descriptions.Item>
                  <Descriptions.Item label="区级项目编码">{emptyTag(project.projectCode)}</Descriptions.Item>
                  <Descriptions.Item label="项目名称" span={2}>{emptyTag(project.projectName)}</Descriptions.Item>
                  <Descriptions.Item label="申报人">{emptyTag(project.reporter)}</Descriptions.Item>
                  <Descriptions.Item label="申报时间">{emptyTag(project.reportTime)}</Descriptions.Item>
                  <Descriptions.Item label="策划类型">{emptyTag(project.planningType)}</Descriptions.Item>
                  <Descriptions.Item label="立项属性">{emptyTag(project.projectAttr)}</Descriptions.Item>
                  <Descriptions.Item label="建设性质" span={2}>
                    <Space size={8}>
                      <span>{emptyTag(project.constructionNature)}</span>
                      {project.constructionNatureLevel2 && project.constructionNatureLevel2 !== '-' ? (
                        <><span style={{ color: '#8c8c8c' }}>/</span><span>{project.constructionNatureLevel2}</span></>
                      ) : null}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="招商类型">{emptyTag(project.merchantType)}</Descriptions.Item>
                  <Descriptions.Item label="项目区域">{emptyTag(project.projectArea)}</Descriptions.Item>
                  <Descriptions.Item label="建设地址" span={4}>{emptyTag(project.addressDetail)}</Descriptions.Item>
                  <Descriptions.Item label="项目简介" span={4}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{emptyTag(project.projectDesc)}</div>
                  </Descriptions.Item>
                </Descriptions>

                {/* 项目分类指标 */}
                <div style={sectionTitleStyle}>项目分类指标</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="内外资">{emptyTag(project.domesticForeign)}</Descriptions.Item>
                  <Descriptions.Item label="是否FDI">{boolTag(project.isFdi)}</Descriptions.Item>
                  {project.isFdi === '是' ? (
                    <Descriptions.Item label="FDI金额(万美元)">{emptyTag(project.fdiAmount)}</Descriptions.Item>
                  ) : (
                    <Descriptions.Item label="来源地">{emptyTag(project.sourceArea)}</Descriptions.Item>
                  )}
                  <Descriptions.Item label="产业类别">{emptyTag(project.industryCategory)}</Descriptions.Item>
                  <Descriptions.Item label="行业类别">{emptyTag(project.industryType)}</Descriptions.Item>
                  <Descriptions.Item label="对应965产业链">{emptyTag(project.chain965)}</Descriptions.Item>
                  <Descriptions.Item label="所属五谷产业集群">{emptyTag(project.wugu)}</Descriptions.Item>
                  <Descriptions.Item label="所属片区">{emptyTag(project.pianqu)}</Descriptions.Item>
                  <Descriptions.Item label="用地情况">{emptyTag(project.landSituation)}</Descriptions.Item>
                  <Descriptions.Item label="用地/办公面积">{emptyTag(project.landArea)}</Descriptions.Item>
                  <Descriptions.Item label="是否研发中心">{boolTag(project.isRnd)}</Descriptions.Item>
                  <Descriptions.Item label="是否总部经济">{boolTag(project.isHqEconomy)}</Descriptions.Item>
                  <Descriptions.Item label="总部经济类型">
                    {project.isHqEconomy === '是' ? (
                      <Space size={8}>
                        <span>{emptyTag(project.hqEconomyLevel1)}</span>
                        {project.hqEconomyLevel2 && project.hqEconomyLevel2 !== '-' ? (
                          <><span style={{ color: '#8c8c8c' }}>/</span><span>{project.hqEconomyLevel2}</span></>
                        ) : null}
                      </Space>
                    ) : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="是否重点产业">{boolTag(project.isKeyIndustry)}</Descriptions.Item>
                  <Descriptions.Item label="楚商类型">{emptyTag(project.chuShangType)}</Descriptions.Item>
                  <Descriptions.Item label="是否浙商">{boolTag(project.isZheshang)}</Descriptions.Item>
                </Descriptions>

                {/* 项目投资信息 */}
                <div style={sectionTitleStyle}>项目投资信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="计划投资总额(亿元)">{emptyTag(project.investAmount)}</Descriptions.Item>
                  <Descriptions.Item label="备案证金额(亿元)">{emptyTag(project.recordAmount)}</Descriptions.Item>
                  <Descriptions.Item label="固投金额(亿元)">{emptyTag(project.fixedInvestAmount)}</Descriptions.Item>
                  <Descriptions.Item label="现阶段到资(亿元)">{emptyTag(project.currentStageArrival)}</Descriptions.Item>
                  <Descriptions.Item label="投资形态">{emptyTag(project.investForm)}</Descriptions.Item>
                  <Descriptions.Item label="当年到资(亿元)">{emptyTag(project.yearArrivalAmount)}</Descriptions.Item>
                  <Descriptions.Item label="预计年产值(亿元)">{emptyTag(project.expectAnnualOutput)}</Descriptions.Item>
                  <Descriptions.Item label="预计年税收(亿元)">{emptyTag(project.expectAnnualTax)}</Descriptions.Item>
                  <Descriptions.Item label="到位资金用途说明" span={4}>{emptyTag(project.arrivalUsage)}</Descriptions.Item>
                </Descriptions>

                {/* 投资主体及负责单位 */}
                <div style={sectionTitleStyle}>投资主体及负责单位</div>
                <Descriptions {...baseDescriptionsProps} labelStyle={{ width: 150, background: '#fafafa', fontWeight: 500 }}>
                  <Descriptions.Item label="签约主体">{emptyTag(project.signSubject)}</Descriptions.Item>
                  <Descriptions.Item label="签约主体信用代码">{emptyTag(project.creditCode)}</Descriptions.Item>
                  <Descriptions.Item label="企业性质">{emptyTag(project.enterpriseNature)}</Descriptions.Item>
                  <Descriptions.Item label="企业类别">{emptyTag(project.enterpriseCategory)}</Descriptions.Item>
                  <Descriptions.Item label="投资主体">{emptyTag(project.investorEntity)}</Descriptions.Item>
                  <Descriptions.Item label="投资主体社会信用代码">{emptyTag(project.investorEntityLicense)}</Descriptions.Item>
                  <Descriptions.Item label="注册公司名称" span={2}>{emptyTag(project.registerCompanyName)}</Descriptions.Item>
                  <Descriptions.Item label="注册资本" span={2}>
                    <Space size={4}>
                      <span>{emptyTag(project.capitalAmount)}</span>
                      {project.capitalUnit && project.capitalUnit !== '-' ? <span>{project.capitalUnit}</span> : null}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="工商注册凭证">
                    {project.businessLicenseFile ? (
                      <a href={project.businessLicenseFile} target="_blank" rel="noreferrer">查看附件</a>
                    ) : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="投资主体联系人">{emptyTag(project.investorContact)}</Descriptions.Item>
                  <Descriptions.Item label="投资主体联系人电话">{emptyTag(project.investorPhone)}</Descriptions.Item>
                  <Descriptions.Item label="区投促局联系人">{emptyTag(project.districtContact)}</Descriptions.Item>
                  <Descriptions.Item label="区投促局联系人电话">{emptyTag(project.districtPhone)}</Descriptions.Item>
                  <Descriptions.Item label="市投促局联络人">{emptyTag(project.cityContact)}</Descriptions.Item>
                  <Descriptions.Item label="市投促局联络人电话">{emptyTag(project.cityPhone)}</Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },
          {
            key: 'progress',
            label: '进展信息',
            children: (
              <ProgressTimeline
                list={progressList}
                currentUser={role.userName || CURRENT_USER}
              />
            ),
          },
          {
            key: 'assign',
            label: `分派情况${visibleAssignList.length ? ` (${visibleAssignList.length})` : ''}`,
            children: (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                    共 {visibleAssignList.length} 条分派记录
                    （处理中 <span style={{ color: '#1677ff' }}>{visibleAssignList.filter(a => a.status === 'processing').length}</span> / 已完成 <span style={{ color: '#52c41a' }}>{visibleAssignList.filter(a => a.status === 'done').length}</span>）
                  </span>
                </div>
                {visibleAssignList.length === 0 ? (
                  <Empty description="暂无分派记录" style={{ padding: '40px 0' }} />
                ) : (
                  <Timeline
                    items={visibleAssignList.map(item => {
                      const unit = findUnitByKey(item.toDeptKey)
                      const deptName = unit?.name || item.toDeptName
                      const isDone = item.status === 'done'
                      const statusColor = isDone ? 'green' : 'blue'
                      const statusLabel = isDone ? '已完成' : '处理中'
                      return {
                        color: statusColor,
                        children: (
                          <div style={{ paddingBottom: 20 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: '3px solid #1677ff',
                              padding: '12px 16px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ color: '#595959' }}>{item.fromDeptName || project.reporter}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{deptName}</span>
                                  <Tag color={statusColor} style={{ marginLeft: 12 }}>{statusLabel}</Tag>
                                </div>
                              </div>
                              <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 8 }}>
                                分派时间：{item.assignTime}
                                {item.finishTime && <span style={{ marginLeft: 16 }}>完成时间：{item.finishTime}</span>}
                              </div>
                              {item.content && (
                                <div style={{
                                  background: '#e6f4ff',
                                  borderRadius: 4, padding: '8px 12px',
                                  fontSize: 13, color: '#0958d9', lineHeight: 1.6,
                                }}>
                                  <span style={{ fontWeight: 500, marginRight: 6 }}>📋 协同事项：</span>{item.content}
                                </div>
                              )}
                              {item.feedbacks && item.feedbacks.length > 0 && (
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #f0f0f0' }}>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                                    📝 反馈记录（{item.feedbacks.length}）
                                  </div>
                                  {[...item.feedbacks].sort((a, b) => b.time.localeCompare(a.time)).map((fb, fIdx, arr) => (
                                    <div key={fb.id} style={{
                                      background: '#fafafa', borderRadius: 4, padding: '8px 12px',
                                      marginBottom: fIdx < arr.length - 1 ? 8 : 0,
                                    }}>
                                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                                        {fb.user} · {fb.time}
                                      </div>
                                      <div style={{ fontSize: 13, color: '#262626', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {fb.content}
                                      </div>
                                      {fb.attachments && fb.attachments.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                          {fb.attachments.map((att, aidx) => (
                                            att.isImage ? (
                                              <img key={aidx} src={att.url} alt={att.name}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                                                onClick={() => window.open(att.url, '_blank')}
                                              />
                                            ) : (
                                              <a key={aidx} href={att.url} target="_blank" rel="noreferrer" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '4px 10px', background: '#fff', borderRadius: 4,
                                                fontSize: 12, color: '#1677ff', border: '1px solid #d9d9d9',
                                              }}>📄 {att.name}</a>
                                            )
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.finishTime && (
                                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                                  <CheckCircleOutlined /> 已于 {item.finishTime} 完成
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }
                    })}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
      </div>

      {/* 进展汇报弹窗 */}
      <Modal
        {...progressModalProps({
          open: progressModalVisible,
          projectName: project.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressModalVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分派弹窗 */}
      <AssignModal
        open={assignModalVisible}
        projectName={project.projectName}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssign}
      />

      {/* 反馈弹窗 */}
      <FeedbackModal
        open={feedbackModalVisible}
        onCancel={() => { setFeedbackModalVisible(false); setFeedbackTarget(null) }}
        onOk={handleFeedback}
      />

      {/* 编辑签约信息弹窗 */}
      <QianyueEditModal
        open={editModalVisible}
        projectData={project}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditOk}
      />

      {/* 签约转落地弹窗 */}
      <ZhuanLuodiModal
        open={zhuanLuodiVisible}
        projectData={project._raw}
        onCancel={() => setZhuanLuodiVisible(false)}
        onOk={handleZhuanLuodiOk}
      />

      {/* AI 月度进展摘要弹窗（严格按当前自然月） */}
      <ProgressSummaryModal
        open={aiVisible}
        onCancel={() => setAiVisible(false)}
        projectName={project.projectName}
        stageLabel="签约阶段"
        items={progressList}
        onSave={(content) => {
          const now = new Date()
          const pad2 = (n) => String(n).padStart(2, '0')
          const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`
          setProgressList((prev) => [{
            id: `ai-${Date.now()}`,
            content,
            reporter: role.userName || CURRENT_USER,
            updateTime: ts,
            type: PROGRESS_TYPE.NORMAL,
            stage: '签约阶段',
          }, ...prev])
        }}
      />
    </div>
  )
}
