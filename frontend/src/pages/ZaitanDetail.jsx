import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Modal, Form, Input, Select, Row, Col,
  Timeline, message, DatePicker, Tag, Empty, Popconfirm, Dropdown
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, DeleteOutlined,
  ExportOutlined, PauseCircleOutlined, SendOutlined, SettingOutlined,
  CheckCircleOutlined, MessageOutlined, PaperClipOutlined, ExclamationCircleOutlined,
  RobotOutlined, MoreOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import DecisionFlow, { getDecisionNodes } from '../components/DecisionFlow'
import UpdateDecisionModal from '../components/UpdateDecisionModal'
import ZaitanEditModal from '../components/ZaitanEditModal'
import AssignModal from '../components/AssignModal'
import FeedbackModal from '../components/FeedbackModal'
import ZhuanQianyueModal from '../components/ZhuanQianyueModal'
import ProgressTimeline from '../components/ProgressTimeline'
import ProgressSummaryModal from '../components/ProgressSummaryModal'
import { useViewRole, msgStore } from '../store/viewStore'
import { findUnitByKey } from '../constants/assignConfig'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  pageCardStyle,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
  emptyTag,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

const { TextArea } = Input

const CURRENT_USER = '投促局管理员'
const ENTERPRISE_NATURE = ['国企（央企）', '国企（地方）', '民企', '外企']
const ENTERPRISE_CATEGORY = ['世界500强', '中国500强', '民营500强', '上市公司', '国家级高新技术企业', '专精特新', '其他']
const ZHAOSHANG_TYPE = ['驻点招商', '以商招商', '活动招商', '校友招商', '平台招商', '其他']
const STOCK_TYPE = ['本土成长', '外地存量扩能', '其他']
const WUGU = ['光谷科创大走廊', '车谷', '网谷', '星谷', '康养谷']
const AREA = ['东湖高新区', '武汉经开区', '临空港经开区', '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '蔡甸区', '江夏区', '东西湖区', '汉南区', '黄陂区', '新洲区']
const JIANBAN_LEVEL = ['书记', '市长', '副市长', '非领导交办', '区主要领导', '区分管领导', '区投促局领导']
const JIANSHE_TYPE = ['新建', '扩建', '改建', '技术改造', '其他']
const CHUSHANG_TYPE = ['湖北籍企业家', '武汉校友', '非楚商']
const INDUSTRY_CATEGORY = ['农业', '工业', '服务业']
const DOMESTIC_FOREIGN = ['内资', '外资']

function formatDate(d) {
  if (!d) return '-'
  const date = d instanceof Date ? d : new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 根据已通过节点构建展示节点列表
function buildDisplayNodes(baseNodes, passedNodes) {
  if (!baseNodes) return []
  let currentFound = false
  return baseNodes.map(n => {
    const passedDate = passedNodes[n.key]
    if (passedDate) return { ...n, status: 'passed', date: passedDate }
    if (!currentFound) { currentFound = true; return { ...n, status: 'current' } }
    return { ...n, status: 'pending' }
  })
}

export default function ZaitanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [basicForm] = Form.useForm()
  const [progressForm] = Form.useForm()
  const { role, isSponsor, myDeptKey } = useViewRole()

  // 构造mock项目数据
  const [project, setProject] = useState(() => {
    const categories = ['政策类', '投资类', '供地类', '其他']
    const item = mockData.zaitan.find(i => String(i.id) === String(id)) || mockData.zaitan[0]
    const idx = mockData.zaitan.findIndex(i => i.id === item.id)
    const cat = categories[idx % 4]
    return {
      key: String(item.id),
      projectName: item['项目名称'],
      projectStatus: '在谈',
      reporter: item['申报人'] || '-',
      sourceArea: item['来源地'] || '-',
      domesticForeign: item['内外资'] || '内资',
      industryType: item['行业类别'] || '-',
      chain965: item['对应"965"产业链类别'] || '-',
      industryCategory: item['产业类别'] || '工业',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: item['投资主体联系人'] || '-',
      investorContactPhone: '18612345625',
      investAmount: item['投资金额（亿元）'] || 0,
      enterpriseNature: item['企业性质'] || '民企',
      enterpriseCategory: item['企业类别'] || '国家级高新技术企业',
      reportTime: item['申报时间'] || '-',
      projectCategory: cat,
      assignedLevel: item['交办层级'] || '非领导交办',
      cityContact: item['市投促局联络人'] || '-',
      districtLeader: '周玲玲',
      districtLeaderPhone: '15600355959',
      districtContact: '易成豪',
      districtContactPhone: '17107815204',
      reportContact: '蔡威',
      reportContactPhone: '13800000000',
      contactTime: '2026-05-08',
      isStock: '否',
      stockType: undefined,
      firstInvestYear: '2026',
      registerCapital: 1000,
      zhaoshangType: '驻点招商',
      zhaoshangTypeDesc: '驻沪办对接',
      isYanpan: '否',
      isEnclave: '否',
      isRnd: '否',
      isAdvancedMfg: '否',
      isWaitao: '否',
      waitaoSource: undefined,
      wuguCluster: '光谷科创大走廊',
      pianqu: '东湖高新区',
      jiansheType: '新建',
      chushangType: '非楚商',
      natongName: '',
      natongAmount: undefined,
      chushangBasicInfo: '',
      phoneVerify: '已核实',
    }
  })

  // 初始决策节点已通过情况（mock：根据分类给一些已通过数据）
  const [decisionPassed, setDecisionPassed] = useState(() => {
    if (project.projectCategory === '政策类') return { touweihui: '2026-07-10' }
    if (project.projectCategory === '投资类' && project.investAmount > 0.5) return { guoqitoujuehui: '2026-07-05' }
    if (project.projectCategory === '供地类') return { touweihui: '2026-07-10', changwuhui: '2026-07-20' }
    return {}
  })

  const baseDecisionNodes = getDecisionNodes(project.projectCategory, project.investAmount)
  const displayDecisionNodes = buildDisplayNodes(baseDecisionNodes, decisionPassed)
  const canUpdateDecision = !!baseDecisionNodes

  // 进展列表，包含系统事件（创建/导入/决策节点初始通过）、谋划阶段历史进展、在谈阶段进展
  const [progressList, setProgressList] = useState(() => {
    const initList = []
    // 系统事件：由谋划阶段转入在谈（阶段推进动作，由项目经办人操作）
    initList.push({
      id: 'sys-import-zaitan',
      type: PROGRESS_TYPE.SYSTEM,
      content: '项目由谋划阶段转入在谈',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2025-12-22 10:00',
    })
    // 系统事件：项目新增（最早事件）
    initList.push({
      id: 'sys-create',
      type: PROGRESS_TYPE.SYSTEM,
      content: '新增项目',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2025-12-20 09:00',
    })
    // 谋划阶段历史进展（作为跨阶段记录展示）
    initList.push({
      id: 'mouhua-prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目初步摸排，企业符合我区重点产业方向，列入重点跟踪项目。',
      reporter: '驻沪办 蔡威',
      updateTime: '2025-12-21 15:00',
    })
    // 初始决策节点已通过记录
    Object.entries({
      touweihui: '投委会',
      guoqitoujuehui: '国企投决会',
      changwuhui: '常务会',
    }).forEach(([key, label]) => {
      const passedMap = project.projectCategory === '政策类' ? { touweihui: '2026-07-10' }
        : project.projectCategory === '投资类' && project.investAmount > 0.5 ? { guoqitoujuehui: '2026-07-05' }
        : project.projectCategory === '供地类' ? { touweihui: '2026-07-10', changwuhui: '2026-07-20' }
        : {}
      if (passedMap[key]) {
        initList.push({
          id: `init-decision-${key}`,
          type: PROGRESS_TYPE.DECISION,
          content: `决策节点更新：「${label}」已于 ${passedMap[key]} 通过`,
          reporter: CURRENT_USER,
          updateTime: `${passedMap[key]} 09:00`,
        })
      }
    })
    // 在谈阶段手动进展
    initList.push({
      id: 'prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '已完成项目初步对接，企业表示有较强投资意向，已安排下周实地考察。',
      reporter: '驻沪办 蔡威',
      updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    initList.push({
      id: 'prog-2',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '企业完成考察，双方就选址、政策支持等初步达成共识。',
      reporter: '东湖高新区 易成豪',
      updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    })
    return initList
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [zaitanEditVisible, setZaitanEditVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [aiVisible, setAiVisible] = useState(false)
  const [zhuanQianyueVisible, setZhuanQianyueVisible] = useState(false)
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuReason, setTuikuReason] = useState('')
  const [feedbackTarget, setFeedbackTarget] = useState(null) // 当前要反馈的分派记录id
  const [editingProgress, setEditingProgress] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  // 分派记录（新结构：拆分到单位、支持多条反馈、附件）
  const [assignList, setAssignList] = useState(() => [
    {
      id: 'a-kcj', toDeptKey: 'kcj', fromDeptName: '市投促局', toDeptName: '科创局',
      assignTime: '2026-08-28 10:30',
      content: '请协助对接高企认定政策，评估该企业入选光谷英才计划的可能性，并提供对接建议。',
      attachments: [],
      status: 'processing', // processing / done
      acceptTime: '2026-08-28 14:10',
      finishTime: null,
      feedbacks: [
        {
          id: 'fb-1', user: '科创局-王科长', time: '2026-08-28 15:20',
          content: '已与企业初步对接，该企业技术创新能力较强，符合高企认定基本条件，已安排专人下周对接光谷英才申报材料准备。',
          attachments: [],
        },
      ],
    },
    {
      id: 'a-qfj', toDeptKey: 'qfj', fromDeptName: '市投促局', toDeptName: '企服局',
      assignTime: '2026-08-28 10:30',
      content: '企业计划投资建设AI药物研发平台，请评估该项目纳入亿元以上技改项目或光电子信息重大专项的可能性。',
      attachments: [],
      status: 'processing',
      acceptTime: null, finishTime: null, feedbacks: [],
    },
    {
      id: 'a-wljs', toDeptKey: 'wljs', fromDeptName: '市投促局', toDeptName: '未来科技城',
      assignTime: '2026-08-25 09:00',
      content: '企业有意向选址未来科技城，请对接合适的楼宇载体，并提供租金优惠方案。',
      attachments: [],
      status: 'done',
      acceptTime: '2026-08-25 10:00',
      finishTime: '2026-08-27 17:30',
      feedbacks: [
        {
          id: 'fb-2', user: '未来科技城-陈主任', time: '2026-08-25 16:30',
          content: '已初步对接2处载体，A6栋3000㎡、B2栋4500㎡，均符合生物医药研发用房需求，租金可按一类企业标准给予30%优惠。',
          attachments: [],
        },
        {
          id: 'fb-3', user: '未来科技城-陈主任', time: '2026-08-27 17:30',
          content: '企业已实地考察A6栋，双方初步达成入驻意向，后续对接已交招商部继续跟进，本任务完成。',
          attachments: [],
        },
      ],
    },
  ])

  // 接收方视角下可见的分派记录（仅分派给自己的）
  const visibleAssignList = useMemo(() => {
    if (isSponsor) return assignList
    return assignList.filter(a => a.toDeptKey === myDeptKey)
  }, [assignList, isSponsor, myDeptKey])

  // 接收方视角下，该项目是否分派给自己（决定详情页是否有权限查看）
  const hasAccess = isSponsor || assignList.some(a => a.toDeptKey === myDeptKey)

  // URL参数触发对应操作
  useEffect(() => {
    if (!hasAccess) return
    const action = searchParams.get('action')
    if (action === 'report') {
      setActiveTab('progress')
      setTimeout(() => handleAddProgress(), 300)
    } else if (action === 'decision') {
      setTimeout(() => setDecisionModalVisible(true), 300)
    } else if (action === 'assign') {
      setActiveTab('assign')
    }
  }, [searchParams, hasAccess])

  const handleBack = () => navigate('/project/zaitan')

  const handleEditBasic = () => {
    setZaitanEditVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await basicForm.validateFields()
      setEditLoading(true)
      setProject(prev => ({
        ...prev,
        ...values,
        contactTime: values.contactDate ? formatDate(values.contactDate) : prev.contactTime,
        foundDate: values.foundDate ? formatDate(values.foundDate) : prev.foundDate,
      }))
      message.success('基础信息已更新')
      setEditModalVisible(false)
    } catch (e) {
      // validation error
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddProgress = () => {
    setEditingProgress(null)
    progressForm.resetFields()
    setProgressModalVisible(true)
  }

  const handleEditProgress = (record) => {
    setEditingProgress(record)
    progressForm.setFieldsValue({ content: record.content })
    setProgressModalVisible(true)
  }

  const handleProgressOk = async () => {
    try {
      const values = await progressForm.validateFields()
      setProgressLoading(true)
      const now = new Date().toISOString()
      if (editingProgress) {
        setProgressList(prev => prev.map(p =>
          p.id === editingProgress.id
            ? { ...p, content: values.content, updateTime: now }
            : p
        ))
        message.success('进展已更新')
      } else {
        setProgressList(prev => [
          {
            id: `prog-${Date.now()}`,
            type: PROGRESS_TYPE.NORMAL,
            stage: '在谈阶段',
            content: values.content,
            reporter: CURRENT_USER,
            updateTime: now,
          },
          ...prev,
        ])
        message.success('进展已添加')
      }
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDeleteProgress = (record) => {
    setProgressList(prev => prev.filter(p => p.id !== record.id))
    message.success('进展已删除')
  }

  const handleDecisionOk = (passedMap, changes = []) => {
    setDecisionPassed(passedMap)
    setDecisionModalVisible(false)
    // 把所有变更（通过/撤销）都记录到进展时间线
    if (changes.length > 0) {
      const now = new Date().toISOString()
      const records = changes.map((c, idx) => ({
        id: `prog-decision-${Date.now()}-${idx}`,
        content: c.action === 'pass'
          ? `决策节点更新：「${c.label}」已于 ${c.date} 通过`
          : `决策节点更新：撤销「${c.label}」的通过状态（原通过日期 ${c.date}）`,
        reporter: CURRENT_USER,
        updateTime: now,
        type: PROGRESS_TYPE.DECISION,
      }))
      setProgressList(prev => [...records, ...prev])
    }
  }

  const handleToQianyue = () => {
    Modal.confirm({
      title: '转签约',
      content: `确定将项目「${project.projectName}」推进至签约阶段吗？需要补充签约阶段必填字段信息。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => setZhuanQianyueVisible(true),
    })
  }

  const handleTuikuConfirm = () => {
    setProgressList(prev => [
      {
        id: `sys-tuiku-${Date.now()}`,
        type: PROGRESS_TYPE.SYSTEM,
        content: '项目已被标记为退库' + (tuikuReason ? `：${tuikuReason}` : ''),
        reporter: CURRENT_USER,
        updateTime: new Date().toISOString(),
      },
      ...prev,
    ])
    message.success('已标记为退库')
    setTuikuVisible(false)
    setTuikuReason('')
    setTimeout(() => navigate('/project/zaitan'), 800)
  }

  const handleAssign = () => {
    setAssignModalVisible(true)
  }

  // 提交分派
  const handleAssignOk = ({ targets, content, attachments }) => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const newRecords = targets.map((t, idx) => ({
      id: `a-${Date.now()}-${idx}`,
      toDeptKey: t.unitKey,
      fromDeptName: '市投促局',
      toDeptName: t.unitName,
      assignTime: timeStr,
      content,
      attachments,
      status: 'processing',
      acceptTime: null,
      finishTime: null,
      feedbacks: [],
    }))
    setAssignList(prev => [...newRecords, ...prev])
    // 给每个接收单位发一条站内信
    targets.forEach(t => {
      msgStore.addMessage({
        toDeptKey: t.unitKey,
        title: '【协作任务分派】',
        content: `您有一条来自"市投促局"的"${project.projectName}"协作配合任务，请及时查看并跟进处理。`,
        projectId: project.key,
        projectName: project.projectName,
        type: 'assign',
      })
    })
    message.success(`已成功分派给 ${targets.length} 个单位`)
    setAssignModalVisible(false)
    setActiveTab('assign')
  }

  // 打开提交反馈弹窗
  const handleOpenFeedback = (recordId) => {
    setFeedbackTarget(recordId)
    setFeedbackModalVisible(true)
  }

  // 提交反馈
  const handleFeedbackOk = ({ content, attachments }) => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const myUnit = findUnitByKey(myDeptKey)
    const feedbackUser = myUnit ? `${myUnit.shortName}-${role.userName}` : role.userName
    setAssignList(prev => prev.map(a => {
      if (a.id !== feedbackTarget) return a
      return {
        ...a,
        acceptTime: a.acceptTime || timeStr,
        feedbacks: [
          ...a.feedbacks,
          { id: `fb-${Date.now()}`, user: feedbackUser, time: timeStr, content, attachments },
        ],
      }
    }))
    // 给发起人发反馈提醒
    msgStore.addMessage({
      toDeptKey: 'sponsor',
      title: '【协作反馈提醒】',
      content: `"${role.deptName}"已提交"${project.projectName}"的协作处理结果，请点击查看详情。`,
      projectId: project.key,
      projectName: project.projectName,
      type: 'feedback',
    })
    message.success('反馈已提交')
    setFeedbackModalVisible(false)
    setFeedbackTarget(null)
  }

  // 标记完成
  const handleMarkDone = (recordId) => {
    Modal.confirm({
      title: '标记为已完成',
      content: '确认将该协作任务标记为已完成吗？标记后不可撤销。',
      okText: '确认完成', cancelText: '取消',
      onOk: () => {
        const now = new Date()
        const pad = n => String(n).padStart(2, '0')
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        setAssignList(prev => prev.map(a => a.id === recordId ? { ...a, status: 'done', finishTime: timeStr } : a))
        msgStore.addMessage({
          toDeptKey: 'sponsor',
          title: '【协作完成提醒】',
          content: `"${role.deptName}"已完成"${project.projectName}"的协作任务，请点击查看详情。`,
          projectId: project.key,
          projectName: project.projectName,
          type: 'done',
        })
        message.success('已标记为完成')
      },
    })
  }



  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }
  const colProps = { span: 12 }

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
            <Tag color="blue" style={{ background: COLORS.primaryLight, color: COLORS.primary, border: `1px solid ${COLORS.primaryBorder}`, margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            {isSponsor && (
              <>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
                  进展汇报
                </Button>
                <Button className="ai-grad-btn" icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>
                  AI 摘要
                </Button>
                {canUpdateDecision && (
                  <Button icon={<SettingOutlined />} onClick={() => setDecisionModalVisible(true)}>
                    更新决策节点
                  </Button>
                )}
                <Button icon={<SendOutlined />} onClick={handleAssign}>
                  分派
                </Button>
                <Button icon={<ExportOutlined />} onClick={handleToQianyue}>
                  转签约
                </Button>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: 'edit', icon: <EditOutlined />, label: '编辑' },
                      { type: 'divider' },
                      { key: 'tuiku', icon: <PauseCircleOutlined style={{ color: '#ff4d4f' }} />, label: '标记退库' },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'edit') handleEditBasic()
                      else if (key === 'tuiku') { setTuikuReason(''); setTuikuVisible(true) }
                    },
                  }}
                >
                  <Button icon={<MoreOutlined />} aria-label="更多" />
                </Dropdown>
              </>
            )}
            {!isSponsor && (
              <Tag color="orange" style={{ fontSize: 12, padding: '4px 10px' }}>
                当前为接收方视角：{role.deptName}-{role.userName}，仅可查看项目信息并反馈分派任务
              </Tag>
            )}
          </Space>
        </div>

        {/* 决策节点流程图 */}
        {displayDecisionNodes.length > 0 && <DecisionFlow nodes={displayDecisionNodes} />}

        {/* 接收方无权限提示 */}
        {!hasAccess && (
          <div style={{
            padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 6,
            border: '1px solid #f0f0f0',
          }}>
            <Empty
              description={
                <span style={{ color: '#8c8c8c' }}>
                  该项目未分派给您所在单位（{role.deptName}），您无权查看详情。
                  <br />
                  <span style={{ fontSize: 12 }}>如需查看，请联系项目发起人分派协作任务。</span>
                </span>
              }
            />
            <Button type="primary" style={{ marginTop: 16 }} onClick={handleBack}>返回列表</Button>
          </div>
        )}

        {hasAccess && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div>
                  <Descriptions
                    bordered
                    column={2}
                    labelStyle={{ width: 150, background: '#fafafa', fontWeight: 500 }}
                    contentStyle={{ minWidth: 200 }}
                  >
                    <Descriptions.Item label="项目名称">{project.projectName}</Descriptions.Item>
                    <Descriptions.Item label="项目分类">{project.projectCategory}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{project.reporter}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{project.reportTime}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.domesticForeign}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="对应965产业链">{project.chain965}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{project.investorEntity}</Descriptions.Item>
                    <Descriptions.Item label="投资主体联系人">{project.investorContactPerson}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{project.investorContactPhone}</Descriptions.Item>
                    <Descriptions.Item label="计划投资总额(亿元)">{project.investAmount}</Descriptions.Item>
                    <Descriptions.Item label="对接时间">{project.contactTime}</Descriptions.Item>
                    <Descriptions.Item label="招商类型">{project.zhaoshangType}</Descriptions.Item>
                    <Descriptions.Item label="招商类型说明">{project.zhaoshangTypeDesc}</Descriptions.Item>
                    <Descriptions.Item label="企业性质">{project.enterpriseNature}</Descriptions.Item>
                    <Descriptions.Item label="企业类别">{project.enterpriseCategory}</Descriptions.Item>
                    <Descriptions.Item label="是否为存量企业">{project.isStock}</Descriptions.Item>
                    <Descriptions.Item label="存量企业类型">{project.stockType || '-'}</Descriptions.Item>
                    <Descriptions.Item label="首次投资年份">{project.firstInvestYear}</Descriptions.Item>
                    <Descriptions.Item label="注册资本(亿元)">{project.registerCapital}</Descriptions.Item>
                    <Descriptions.Item label="所属五谷产业集群">{project.wuguCluster}</Descriptions.Item>
                    <Descriptions.Item label="所属片区">{project.pianqu}</Descriptions.Item>
                    <Descriptions.Item label="建设性质">{project.jiansheType}</Descriptions.Item>
                    <Descriptions.Item label="交办层级">{project.assignedLevel}</Descriptions.Item>
                    <Descriptions.Item label="区级责任领导人">{project.districtLeader}</Descriptions.Item>
                    <Descriptions.Item label="区级责任领导人电话">{project.districtLeaderPhone}</Descriptions.Item>
                    <Descriptions.Item label="区投促局责任人">{project.districtContact}</Descriptions.Item>
                    <Descriptions.Item label="区投促局责任人电话">{project.districtContactPhone}</Descriptions.Item>
                    <Descriptions.Item label="市投促局联络人">{project.cityContact}</Descriptions.Item>
                    <Descriptions.Item label="报送联络人">{project.reportContact}</Descriptions.Item>
                    <Descriptions.Item label="报送联络人电话">{project.reportContactPhone}</Descriptions.Item>
                    <Descriptions.Item label="电话核实情况">{project.phoneVerify}</Descriptions.Item>
                    <Descriptions.Item label="是否研判">{project.isYanpan}</Descriptions.Item>
                    <Descriptions.Item label="是否飞地园区">{project.isEnclave}</Descriptions.Item>
                    <Descriptions.Item label="是否研发中心">{project.isRnd}</Descriptions.Item>
                    <Descriptions.Item label="是否先进制造业">{project.isAdvancedMfg}</Descriptions.Item>
                    <Descriptions.Item label="是否产业外溢">{project.isWaitao}</Descriptions.Item>
                    <Descriptions.Item label="楚商类型">{project.chushangType}</Descriptions.Item>
                    <Descriptions.Item label="纳统项目名称">{project.natongName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="纳统计划总投资额(万元)">{project.natongAmount ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={2}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.projectDesc}</div>
                    </Descriptions.Item>
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
                  currentUser={CURRENT_USER}
                  onEdit={handleEditProgress}
                  onDelete={handleDeleteProgress}
                  summaryExtra={<span>（决策节点更新自动同步）</span>}
                />
              ),
            },
            {
              key: 'assign',
              label: '分派情况',
              children: (
                <div>
                  <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                      共 {visibleAssignList.length} 条分派记录
                      （处理中 <span style={{ color: '#1677ff' }}>{visibleAssignList.filter(a => a.status === 'processing').length}</span> / 已完成 <span style={{ color: '#52c41a' }}>{visibleAssignList.filter(a => a.status === 'done').length}</span>）
                    </span>
                    {isSponsor && (
                      <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setAssignModalVisible(true)}>
                        新增分派
                      </Button>
                    )}
                  </div>
                  {visibleAssignList.length === 0 ? (
                    <Empty description="暂无分派记录" style={{ padding: '40px 0' }} />
                  ) : (
                  <Timeline
                    items={visibleAssignList.map(item => {
                      const isDone = item.status === 'done'
                      const canOperate = !isSponsor && item.toDeptKey === myDeptKey && !isDone
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
                                  <span style={{ color: '#595959' }}>{item.fromDeptName}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{item.toDeptName}</span>
                                  <Tag color={statusColor} style={{ marginLeft: 12 }}>{statusLabel}</Tag>
                                </div>
                                {canOperate && (
                                  <Space size={4}>
                                    <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleOpenFeedback(item.id)}>
                                      提交反馈
                                    </Button>
                                    <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleMarkDone(item.id)} style={{ color: '#52c41a' }}>
                                      标记完成
                                    </Button>
                                  </Space>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 8 }}>
                                分派时间：{item.assignTime}
                                {item.finishTime && <span style={{ marginLeft: 16 }}>完成时间：{item.finishTime}</span>}
                              </div>

                              {/* 协同事项说明 */}
                              {item.content && (
                                <div style={{
                                  background: '#e6f4ff',
                                  borderRadius: 4, padding: '8px 12px',
                                  marginBottom: item.attachments && item.attachments.length > 0 ? 6 : 0,
                                  fontSize: 13, color: '#0958d9', lineHeight: 1.6,
                                }}>
                                  <span style={{ fontWeight: 500, marginRight: 6 }}>📋 协同事项：</span>{item.content}
                                </div>
                              )}

                              {/* 分派附件 */}
                              {item.attachments && item.attachments.length > 0 && (
                                <div style={{ marginTop: 6, marginBottom: 4 }}>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}><PaperClipOutlined /> 附件：</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {item.attachments.map((att, idx) => (
                                      att.isImage ? (
                                        <img
                                          key={idx} src={att.url} alt={att.name}
                                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                                          onClick={() => window.open(att.url, '_blank')}
                                        />
                                      ) : (
                                        <a key={idx} href={att.url} target="_blank" rel="noreferrer" style={{
                                          display: 'inline-flex', alignItems: 'center', gap: 4,
                                          padding: '4px 10px', background: '#f5f5f5', borderRadius: 4,
                                          fontSize: 12, color: '#595959',
                                        }}>
                                          📄 {att.name}
                                        </a>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 反馈时间线 */}
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
                                              <img
                                                key={aidx} src={att.url} alt={att.name}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                                                onClick={() => window.open(att.url, '_blank')}
                                              />
                                            ) : (
                                              <a key={aidx} href={att.url} target="_blank" rel="noreferrer" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '4px 10px', background: '#fff', borderRadius: 4,
                                                fontSize: 12, color: '#1677ff', border: '1px solid #d9d9d9',
                                              }}>
                                                📄 {att.name}
                                              </a>
                                            )
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
        )}
      </div>

      {/* 编辑基础信息弹窗 */}
      <Modal
        title="编辑基础信息"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
        okText="保存" cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={basicForm} {...formItemLayout} layout="horizontal" requiredMark={true} colon={false}>
          <Row gutter={24}>
            <Col {...colProps}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="项目分类" name="projectCategory" rules={[{ required: true }]}>
                <Select options={['政策类', '投资类', '供地类', '其他'].map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="内外资" name="domesticForeign" rules={[{ required: true }]}>
                <Select options={DOMESTIC_FOREIGN.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="来源地" name="sourceArea">
                <Input placeholder="请输入来源地" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="产业类别" name="industryCategory" rules={[{ required: true }]}>
                <Select options={INDUSTRY_CATEGORY.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="行业类别" name="industryType">
                <Input placeholder="请输入行业类别" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true }]}>
                <Input placeholder="请输入投资主体" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="投资主体联系人" name="investorContactPerson">
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="联系电话" name="investorContactPhone" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="计划投资总额" name="investAmount" rules={[{ required: true }]}>
                <Input type="number" addonAfter="亿元" min={0} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="对接时间" name="contactDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="招商类型" name="zhaoshangType" rules={[{ required: true }]}>
                <Select options={ZHAOSHANG_TYPE.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="企业性质" name="enterpriseNature" rules={[{ required: true }]}>
                <Select options={ENTERPRISE_NATURE.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="企业类别" name="enterpriseCategory" rules={[{ required: true }]}>
                <Select options={ENTERPRISE_CATEGORY.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDesc" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <TextArea rows={4} placeholder="请输入项目简介" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 进展汇报/编辑弹窗 */}
      <Modal
        {...progressModalProps({
          open: progressModalVisible,
          projectName: editingProgress ? `${project.projectName}（编辑）` : project.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressModalVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <Input.TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 更新决策节点弹窗 */}
      <UpdateDecisionModal
        key={`decision-${decisionModalVisible}`}
        open={decisionModalVisible}
        onCancel={() => setDecisionModalVisible(false)}
        onOk={handleDecisionOk}
        projectCategory={project.projectCategory}
        investAmount={project.investAmount}
        initialPassedNodes={decisionPassed}
      />

      {/* 编辑在谈项目弹窗（与转在谈/列表编辑字段一致） */}
      <ZaitanEditModal
        key={`zaitan-edit-${zaitanEditVisible}`}
        open={zaitanEditVisible}
        onCancel={() => setZaitanEditVisible(false)}
        onOk={() => { setZaitanEditVisible(false); message.success('保存成功（demo示意）') }}
        projectData={project}
      />

      {/* 新增分派弹窗 */}
      <AssignModal
        key={`assign-${assignModalVisible}`}
        open={assignModalVisible}
        projectName={project.projectName}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignOk}
      />

      {/* 提交反馈弹窗 */}
      <FeedbackModal
        key={`feedback-${feedbackModalVisible}-${feedbackTarget}`}
        open={feedbackModalVisible}
        unitName={feedbackTarget ? (assignList.find(a => a.id === feedbackTarget)?.toDeptName || '') : ''}
        onCancel={() => { setFeedbackModalVisible(false); setFeedbackTarget(null) }}
        onOk={handleFeedbackOk}
      />

      {/* 转签约弹窗 */}
      <ZhuanQianyueModal
        key={`zhuanqianyue-${zhuanQianyueVisible}`}
        open={zhuanQianyueVisible}
        projectData={project}
        onCancel={() => setZhuanQianyueVisible(false)}
        onOk={() => {
          // 写入系统事件：项目推进至签约
          setProgressList(prev => [
            {
              id: `sys-zhuanqianyue-${Date.now()}`,
              type: PROGRESS_TYPE.SYSTEM,
              content: '项目推进至「签约」阶段',
              reporter: CURRENT_USER,
              updateTime: new Date().toISOString(),
            },
            ...prev,
          ])
          message.success('转签约成功！项目已进入签约阶段')
          setZhuanQianyueVisible(false)
          setTimeout(() => navigate('/project/qianyue'), 800)
        }}
      />

      {/* 退库确认弹窗 */}
      <Modal
        title={
          <span style={{ color: '#d4380d' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            确认退库
          </span>
        }
        open={tuikuVisible}
        onCancel={() => { setTuikuVisible(false); setTuikuReason('') }}
        okText="确认退库"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onOk={handleTuikuConfirm}
      >
        <div style={{ marginBottom: 16 }}>
          确定将项目「<strong>{project.projectName}</strong>」标记为退库吗？退库后不可恢复。
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
            退库说明 <span style={{ color: '#bfbfbf' }}>（非必填，最多500字）</span>
          </div>
          <Input.TextArea
            value={tuikuReason}
            onChange={(e) => setTuikuReason(e.target.value)}
            placeholder="请输入退库原因（非必填）"
            maxLength={500}
            showCount
            rows={4}
          />
        </div>
      </Modal>

      {/* AI 月度进展摘要弹窗（严格按当前自然月） */}
      <ProgressSummaryModal
        open={aiVisible}
        onCancel={() => setAiVisible(false)}
        projectName={project.projectName}
        stageLabel="在谈阶段"
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
            stage: '在谈阶段',
          }, ...prev])
        }}
      />
    </div>
  )
}
