import { useMemo } from 'react'
import { Modal, Button, Descriptions, Table, Empty } from 'antd'
import { COLORS, emptyTag, sectionTitleStyle } from '../constants/uiStyles'

const pad = (n) => String(n).padStart(2, '0')
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** 依据到资金额生成确定性的到资记录（演示数据）：落地后90天内分笔到账 */
function buildArrivalRecords(item) {
  const total = Number(item?.['到资金额(亿元)'] || 0)
  if (!total || total <= 0) return []
  const id = Number(item?.id) || 1
  const count = id % 3 === 0 ? 3 : 2
  const weights = count === 3 ? [0.5, 0.3, 0.2] : [0.6, 0.4]
  const start = new Date((item?.['落地时间'] || '2026-06-30') + 'T00:00:00')
  let acc = 0
  return weights.map((w, idx) => {
    const amount = Math.round(total * w * 10000) / 10000
    acc = Math.round((acc + amount) * 10000) / 10000
    const d = new Date(start)
    d.setDate(d.getDate() + Math.round((90 * (idx + 1)) / (count + 1)))
    return {
      key: `arr-${idx}`,
      date: fmtDate(d),
      amount,
      acc,
      remark: `第${idx + 1}笔到资`,
    }
  })
}

const numText = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n !== 0 ? n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') : emptyTag(v)
}

export default function FundsArrivalModal({ open, project, onCancel }) {
  const records = useMemo(() => buildArrivalRecords(project), [project])

  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, align: 'center', render: (_, r, i) => i + 1 },
    { title: '到资时间', dataIndex: 'date', width: 120, align: 'center' },
    {
      title: '到资金额(亿元)', dataIndex: 'amount', width: 130, align: 'right',
      render: (v) => <span style={{ fontWeight: 600, color: COLORS.primary }}>{v}</span>,
    },
    { title: '累计到资(亿元)', dataIndex: 'acc', width: 130, align: 'right', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
  ]

  return (
    <Modal
      title={`到资情况 - ${project?.['项目名称'] || ''}`}
      open={open}
      onCancel={onCancel}
      width={720}
      destroyOnClose
      footer={[<Button key="close" type="primary" onClick={onCancel}>关 闭</Button>]}
    >
      <Descriptions
        bordered size="small" column={2}
        labelStyle={{ width: 150, background: '#fafafa', fontWeight: 500 }}
        style={{ marginTop: 8 }}
      >
        <Descriptions.Item label="到资金额(亿元)">{numText(project?.['到资金额(亿元)'])}</Descriptions.Item>
        <Descriptions.Item label="当年到位资金(亿元)">{numText(project?.['当年到位资金情况(亿元)'])}</Descriptions.Item>
        <Descriptions.Item label="现阶段到资情况(亿元)">{numText(project?.['现阶段到资情况(亿元)'])}</Descriptions.Item>
        <Descriptions.Item label="落地时间">{emptyTag(project?.['落地时间'])}</Descriptions.Item>
        <Descriptions.Item label="到位资金用途说明" span={2}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{emptyTag(project?.['到位资金用途说明'])}</div>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ ...sectionTitleStyle, marginTop: 24 }}>到资记录</div>
      {records.length > 0 ? (
        <Table
          columns={columns}
          dataSource={records}
          size="small"
          pagination={false}
          tableLayout="fixed"
        />
      ) : (
        <Empty description="暂无到资记录" style={{ padding: '32px 0' }} />
      )}
    </Modal>
  )
}
