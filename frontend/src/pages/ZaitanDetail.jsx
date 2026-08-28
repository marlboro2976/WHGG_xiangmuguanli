import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Modal, Form, Input, Select, Row, Col,
  Timeline, message, Popconfirm, Typography, Empty, DatePicker, Tag
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, DeleteOutlined,
  ExportOutlined, PauseCircleOutlined, SendOutlined, SettingOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import DecisionFlow, { getDecisionNodes } from '../components/DecisionFlow'
import UpdateDecisionModal from '../components/UpdateDecisionModal'
import ZaitanEditModal from '../components/ZaitanEditModal'

const { TextArea } = Input
const { Text } = Typography

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

function formatTime(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

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

  // 进展列表，包含初始的决策节点记录
  const [progressList, setProgressList] = useState([
    {
      id: 'prog-1',
      content: '已完成项目初步对接，企业表示有较强投资意向，已安排下周实地考察。',
      reporter: '驻沪办 蔡威',
      updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'normal',
    },
    {
      id: 'prog-2',
      content: '企业完成考察，双方就选址、政策支持等初步达成共识。',
      reporter: '东湖高新区 易成豪',
      updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'normal',
    },
  ])

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [zaitanEditVisible, setZaitanEditVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [editingProgress, setEditingProgress] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  // 分派记录mock数据
  const [assignList] = useState([
    {
      id: 'a1', time: '2026-05-08 10:30', from: '市投促局', to: '东湖高新区', status: '已完成',
      feedback: '已接收项目，安排服务业园进行对接。',
      feedbackImages: ['https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=政府办公大楼商务场景照片,写实风格&image_size=square'],
      feedbackTime: '2026-05-08 15:20', feedbackUser: '东湖高新区-周玲玲',
    },
    {
      id: 'a2', time: '2026-05-09 14:20', from: '东湖高新区', to: '服务业园办', status: '处理中',
      feedback: '已与企业方取得初步联系，预计下周完成实地考察。',
      feedbackImages: [],
      feedbackTime: '2026-05-10 09:15', feedbackUser: '服务业园-张主任',
    },
  ])

  // URL参数触发对应操作
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'report') {
      setActiveTab('progress')
      setTimeout(() => handleAddProgress(), 300)
    } else if (action === 'decision') {
      setTimeout(() => setDecisionModalVisible(true), 300)
    }
  }, [searchParams])

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
          { id: `prog-${Date.now()}`, content: values.content, reporter: CURRENT_USER, updateTime: now, type: 'normal' },
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
        type: 'decision',
      }))
      setProgressList(prev => [...records, ...prev])
    }
  }

  const handleToQianyue = () => {
    Modal.confirm({
      title: '转签约',
      content: `确定将项目「${project.projectName}」推进至签约阶段吗？需要补充签约阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => message.success('已进入签约信息补全流程（demo示意）'),
    })
  }

  const handleTuiku = () => {
    Modal.confirm({
      title: '确认退库',
      content: `确定将项目「${project.projectName}」标记为退库吗？退库后不可恢复。`,
      okText: '确认退库', cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => { message.success('已标记为退库'); navigate('/project/zaitan') },
    })
  }

  const handleAssign = () => {
    message.info('分派功能（demo示意，稍后补充需求）')
  }

  const sortedProgressList = useMemo(() => {
    return [...progressList].sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  }, [progressList])

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }
  const colProps = { span: 12 }

  return (
    <div className="page-container">
      <div className="table-card" style={{ padding: '16px 24px 24px' }}>
        {/* 顶部标题 + 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="blue" style={{ background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
              进展汇报
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditBasic}>
              编辑
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
            <Button danger icon={<PauseCircleOutlined />} onClick={handleTuiku}>
              标记退库
            </Button>
          </Space>
        </div>

        {/* 决策节点流程图 */}
        {displayDecisionNodes.length > 0 && <DecisionFlow nodes={displayDecisionNodes} />}

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
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <Text type="secondary" style={{ fontSize: 13, color: '#8c8c8c' }}>共 {progressList.length} 条进展记录（按更新时间倒序，决策节点更新自动同步）</Text>
                  </div>
                  {sortedProgressList.length === 0 ? (
                    <Empty description="暂无进展记录，点击顶部「进展汇报」添加" style={{ padding: '60px 0' }} />
                  ) : (
                    <Timeline
                      items={sortedProgressList.map(item => ({
                        color: item.type === 'decision' ? 'green' : 'blue',
                        children: (
                          <div style={{ paddingBottom: 24 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: `3px solid ${item.type === 'decision' ? '#52c41a' : '#1677ff'}`,
                              padding: '12px 16px 10px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              {item.type === 'decision' && (
                                <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 6, fontWeight: 500 }}>
                                  ● 决策节点更新
                                </div>
                              )}
                              <div style={{
                                fontSize: 15,
                                color: '#262626',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                marginBottom: item.reporter === CURRENT_USER || item.type === 'decision' ? 10 : 8,
                              }}>
                                {item.content}
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                                color: '#bfbfbf',
                              }}>
                                <span>—— {item.reporter} · {formatTime(item.updateTime)}</span>
                                {item.type !== 'decision' && item.reporter === CURRENT_USER && (
                                  <Space size={0}>
                                    <Button
                                      type="text"
                                      size="small"
                                      style={{ fontSize: 12, color: '#bfbfbf', padding: '0 4px', height: 'auto' }}
                                      onClick={() => handleEditProgress(item)}
                                      onMouseEnter={e => e.currentTarget.style.color = '#1677ff'}
                                      onMouseLeave={e => e.currentTarget.style.color = '#bfbfbf'}
                                    >
                                      编辑
                                    </Button>
                                    <Popconfirm
                                      title="确定删除这条进展记录吗？"
                                      okText="删除" cancelText="取消"
                                      okButtonProps={{ danger: true, size: 'small' }}
                                      onConfirm={() => handleDeleteProgress(item)}
                                    >
                                      <Button
                                        type="text"
                                        size="small"
                                        style={{ fontSize: 12, color: '#bfbfbf', padding: '0 4px', height: 'auto' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ff4d4f'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#bfbfbf'}
                                      >
                                        删除
                                      </Button>
                                    </Popconfirm>
                                  </Space>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'assign',
              label: '分派情况',
              children: (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <Text type="secondary" style={{ fontSize: 13, color: '#8c8c8c' }}>共 {assignList.length} 条分派记录</Text>
                  </div>
                  <Timeline
                    items={assignList.map(item => {
                      const statusColor = item.status === '已完成' ? 'green' : item.status === '处理中' ? 'blue' : 'orange'
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
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6 }}>
                                <span style={{ color: '#595959' }}>{item.from}</span>
                                <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                <span style={{ fontWeight: 500 }}>{item.to}</span>
                                <Tag color={statusColor} style={{ marginLeft: 12 }}>{item.status}</Tag>
                              </div>
                              <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: item.feedback ? 10 : 0 }}>
                                分派时间：{item.time}
                              </div>

                              {item.feedback && (
                                <div style={{
                                  background: '#f9f9f9',
                                  borderRadius: 4,
                                  padding: '10px 12px',
                                  marginTop: 4,
                                }}>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                                    被委派对象反馈 · {item.feedbackUser} · {item.feedbackTime}
                                  </div>
                                  <div style={{ fontSize: 14, color: '#262626', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {item.feedback}
                                  </div>
                                  {item.feedbackImages && item.feedbackImages.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                      {item.feedbackImages.map((src, i) => (
                                        <img
                                          key={i}
                                          src={src}
                                          alt={`反馈图片${i + 1}`}
                                          style={{
                                            width: 120, height: 120, objectFit: 'cover',
                                            borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer',
                                          }}
                                          onClick={() => window.open(src, '_blank')}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }
                    })}
                  />
                </div>
              ),
            },
          ]}
        />
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
        title={editingProgress ? '编辑进展' : '新增进展'}
        open={progressModalVisible}
        onOk={handleProgressOk}
        onCancel={() => { setProgressModalVisible(false); progressForm.resetFields() }}
        confirmLoading={progressLoading}
        okText="保存" cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" requiredMark={true} style={{ marginTop: 16 }}>
          <Form.Item
            label="进展内容"
            name="content"
            rules={[{ required: true, message: '请输入进展内容' }, { max: 500, message: '进展内容不超过500个字符' }]}
          >
            <TextArea rows={6} placeholder="请输入进展内容，最多500字" maxLength={500} showCount />
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
    </div>
  )
}
