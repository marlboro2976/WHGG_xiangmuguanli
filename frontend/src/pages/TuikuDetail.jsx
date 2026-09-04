/**
 * 退库项目详情页（只读）
 * 展示项目历史信息：基础信息、进展信息、分派情况。
 * 已退库项目不可恢复、不可编辑，仅供查看。
 */
import { useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Tabs, Descriptions, Button, Tag, Timeline, Empty, Result } from 'antd'
import { ArrowLeftOutlined, StopOutlined } from '@ant-design/icons'
import ProgressTimeline from '../components/ProgressTimeline'
import { buildTuikuList } from './Tuiku'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  pageCardStyle,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  emptyTag,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

/* ========== mock 历史数据构建 ========== */

function pad(n) { return String(n).padStart(2, '0') }

// 基于基准日期偏移天数，返回 "yyyy-MM-dd HH:mm"
function addDays(dateStr, days, time = '10:00') {
  const base = dateStr && dateStr !== '-' ? dateStr : '2026-06-10'
  const d = new Date(base)
  if (isNaN(d.getTime())) return `${base} ${time}`
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`
}

// 历史进展（含退库系统事件）
function buildProgressList(r) {
  const list = []
  const reporter = r.reporter !== '-' ? r.reporter : '投促局 易成豪'

  list.push({
    id: 'sys-create',
    type: PROGRESS_TYPE.SYSTEM,
    content: '新增项目',
    reporter,
    updateTime: addDays(r.reportTime, 0, '09:00'),
  })

  if (r.sourceStage === '在谈') {
    list.push({
      id: 'prog-mouhua-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目初步摸排，形成投资意向方案，明确投资方向及初步选址需求。',
      reporter,
      updateTime: addDays(r.reportTime, 3, '15:00'),
    })
    list.push({
      id: 'sys-stage',
      type: PROGRESS_TYPE.SYSTEM,
      content: '项目由谋划阶段转入在谈',
      reporter,
      updateTime: addDays(r.reportTime, 6, '10:00'),
    })
    list.push({
      id: 'prog-zaitan-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '已与投资方完成首轮对接，投资方对项目落地条件表示认可，待进一步细化合作条款。',
      reporter,
      updateTime: addDays(r.reportTime, 14, '14:30'),
    })
    list.push({
      id: 'prog-zaitan-2',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '双方就投资规模、载体选址及扶持政策进行多轮磋商，部分核心条款尚未达成一致。',
      reporter,
      updateTime: addDays(r.reportTime, 22, '16:00'),
    })
  } else {
    list.push({
      id: 'prog-mouhua-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目信息初步采集，待进一步核实投资主体及投资意愿。',
      reporter,
      updateTime: addDays(r.reportTime, 4, '11:00'),
    })
  }

  // 退库系统事件（最后一条）
  list.push({
    id: 'sys-tuiku',
    type: PROGRESS_TYPE.SYSTEM,
    content: '项目已被标记为退库' + (r.tuikuReason ? `：${r.tuikuReason}` : ''),
    reporter: r.tuikuOperator,
    updateTime: r.tuikuTime,
  })

  return list
}

// 历史分派记录（谋划阶段退库项目无分派）
function buildAssignList(r) {
  if (r.sourceStage !== '在谈') return []
  return [
    {
      id: 'a-kcj', fromDeptName: '市投促局', toDeptName: '科创局',
      assignTime: addDays(r.reportTime, 8, '10:30'),
      content: '请协助核实企业资质及产业政策适配情况，评估项目落地可行性。',
      status: 'done',
      finishTime: addDays(r.reportTime, 12, '17:30'),
      feedbacks: [
        {
          id: 'fb-1', user: '科创局-王科长', time: addDays(r.reportTime, 12, '17:30'),
          content: '已完成核实，企业具备相关资质，但投资强度未达到我区重点项目准入标准。',
        },
      ],
    },
    {
      id: 'a-qfj', fromDeptName: '市投促局', toDeptName: '企服局',
      assignTime: addDays(r.reportTime, 10, '09:00'),
      content: '请对接企业服务政策，梳理可提供的扶持措施清单。',
      status: 'processing',
      finishTime: null,
      feedbacks: [],
    },
  ]
}

// 分派状态Tag：项目退库后未完成任务自动终止
function assignStatusTag(status) {
  if (status === 'done') return <Tag color="success" style={{ marginLeft: 12 }}>已完成</Tag>
  return <Tag color="default" style={{ marginLeft: 12 }}>已终止</Tag>
}

export default function TuikuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // 优先读取路由 state（列表跳转带入），否则按 key 重建（刷新/直接访问兼容）
  const record = useMemo(() => {
    if (location.state?.record) return location.state.record
    return buildTuikuList().find(r => r.key === id)
  }, [id, location.state])

  const progressList = useMemo(() => (record ? buildProgressList(record) : []), [record])
  const assignList = useMemo(() => (record ? buildAssignList(record) : []), [record])

  const handleBack = () => navigate('/project/tuiku')

  if (!record) {
    return (
      <div className="page-container">
        <div className="table-card" style={pageCardStyle}>
          <Result
            status="warning"
            title="未找到该退库项目"
            subTitle="记录可能已被删除，请返回列表重新查看"
            extra={<Button type="primary" onClick={handleBack}>返回列表</Button>}
          />
        </div>
      </div>
    )
  }

  const stageColorMap = { '谋划': 'blue', '在谈': 'gold' }

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{record.projectName}</span>
            <Tag icon={<StopOutlined />} color="error" style={{ margin: 0 }}>已退库</Tag>
            <Tag color={stageColorMap[record.sourceStage] || 'default'} style={{ margin: 0 }}>原阶段：{record.sourceStage}</Tag>
          </div>
          <span style={{ fontSize: 13, color: '#8c8c8c', lineHeight: '32px' }}>
            该项目已退库，历史信息仅供查看
          </span>
        </div>

        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div>
                  <div style={sectionTitleStyle}>退库信息</div>
                  <Descriptions {...baseDescriptionsProps}>
                    <Descriptions.Item label="原阶段">
                      <Tag color={stageColorMap[record.sourceStage] || 'default'} style={{ margin: 0 }}>{record.sourceStage}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="退库时间">{emptyTag(record.tuikuTime)}</Descriptions.Item>
                    <Descriptions.Item label="退库操作人">{emptyTag(record.tuikuOperator)}</Descriptions.Item>
                    <Descriptions.Item label="退库原因">
                      <span style={{ color: '#d4380d' }}>{record.tuikuReason || '-'}</span>
                    </Descriptions.Item>
                  </Descriptions>

                  <div style={{ ...sectionTitleStyle, marginTop: 24 }}>项目基本信息</div>
                  <Descriptions {...baseDescriptionsProps}>
                    <Descriptions.Item label="项目名称">{emptyTag(record.projectName)}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{emptyTag(record.investorEntity)}</Descriptions.Item>
                    <Descriptions.Item label="投资金额(亿元)">
                      {Number(record.investAmount) > 0
                        ? <span style={{ fontWeight: 600 }}>{Number(record.investAmount).toFixed(2)}</span>
                        : emptyTag('')}
                    </Descriptions.Item>
                    <Descriptions.Item label="内外资">{emptyTag(record.domesticForeign)}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{emptyTag(record.industryCategory)}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{emptyTag(record.industryType)}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{emptyTag(record.sourceArea)}</Descriptions.Item>
                    <Descriptions.Item label="企业性质">{emptyTag(record.enterpriseNature)}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{emptyTag(record.reporter)}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{emptyTag(record.reportTime)}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={4}>
                      {record.projectDesc
                        ? <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{record.projectDesc}</div>
                        : emptyTag('')}
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
                  emptyText="暂无进展记录"
                  summaryExtra={<span>（项目退库后不可再新增进展）</span>}
                />
              ),
            },
            {
              key: 'assign',
              label: '分派情况',
              children: (
                <div>
                  <div style={{ marginBottom: 20, fontSize: 13, color: '#8c8c8c' }}>
                    共 {assignList.length} 条分派记录
                    （已完成 <span style={{ color: COLORS.success }}>{assignList.filter(a => a.status === 'done').length}</span> / 已终止 <span style={{ color: COLORS.textSecondary }}>{assignList.filter(a => a.status !== 'done').length}</span>）
                    <span style={{ marginLeft: 12 }}>项目退库后，未完成的分派任务已自动终止</span>
                  </div>
                  {assignList.length === 0 ? (
                    <Empty description="暂无分派记录" style={{ padding: '60px 0' }} />
                  ) : (
                    <Timeline
                      items={assignList.map(item => ({
                        color: item.status === 'done' ? 'green' : 'gray',
                        children: (
                          <div style={{ paddingBottom: 20 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: `3px solid ${item.status === 'done' ? '#52c41a' : '#d9d9d9'}`,
                              padding: '12px 16px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ color: '#595959' }}>{item.fromDeptName}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{item.toDeptName}</span>
                                  {assignStatusTag(item.status)}
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
                                  marginBottom: item.feedbacks && item.feedbacks.length > 0 ? 8 : 0,
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
                                  {item.feedbacks.map((fb, fIdx, arr) => (
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
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
