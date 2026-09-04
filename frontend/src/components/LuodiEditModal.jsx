import { useEffect } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, DatePicker, Radio } from 'antd'
import dayjs from 'dayjs'
import {
  START_WORK_TYPE_OPTIONS,
  CONSTRUCTION_NATURE_LEVEL2_OPTIONS,
} from '../constants/projectEnums'

const { TextArea } = Input

const SectionHeader = ({ title }) => (
  <div style={{
    background: '#e6f4ff', borderLeft: '3px solid #1677ff',
    padding: '8px 16px', margin: '0 0 20px 0', fontSize: 15, fontWeight: 600,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: '2px 0 0 2px',
  }}>
    <span>{title}</span>
    <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>注：<span style={{ color: '#ff4d4f' }}>*</span>为必填项</span>
  </div>
)

/**
 * 落地信息编辑弹窗：落地为最终阶段，前期阶段字段只读回显，仅可编辑落地阶段补充字段。
 */
export default function LuodiEditModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()

  const watchedIsStarted = Form.useWatch('isStarted', form)

  const toDayjs = (v) => {
    if (!v || v === '-') return undefined
    if (typeof v === 'number') {
      const d = dayjs('1899-12-30').add(v, 'day')
      return d.isValid() ? d : undefined
    }
    const d = dayjs(v)
    return d.isValid() ? d : undefined
  }

  const clean = (v) => (v === '-' || v === '' || v === null || v === undefined ? undefined : v)

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      const fv = projectData._formValues || {}
      const g = (formKey, ...aliases) => {
        if (fv[formKey] !== undefined) return fv[formKey]
        for (const k of aliases) {
          if (projectData[k] !== undefined && projectData[k] !== null) return projectData[k]
        }
        return undefined
      }
      form.setFieldsValue({
        landingDate: toDayjs(g('landingDate', '落地时间')),
        isStarted: g('isStarted', '是否已开工') || '否',
        startWorkType: clean(g('startWorkType', '开工开业类型')),
        startDate: toDayjs(g('startDate', '开工/业时间')),
        constructionType: clean(g('constructionType', '建设类型', '建设分类')),
        fgStartWorkDate: toDayjs(g('fgStartWorkDate', '实际开工时间(发改)')),
        fgFinishDate: toDayjs(g('fgFinishDate', '实际竣工时间(发改)')),
        fgRuTong: g('fgRuTong', '是否入统(发改)') || '否',
        jxStartWorkDate: toDayjs(g('jxStartWorkDate', '实际开工时间(经信)')),
        jxRuTongDate: toDayjs(g('jxRuTongDate', '入统时间(经信)')),
        jxJinGuiDate: toDayjs(g('jxJinGuiDate', '进规时间(经信)')),
        jxTouChanDate: toDayjs(g('jxTouChanDate', '投产时间(经信)')),
        jxJiGai: g('jxJiGai', '是否技改(经信)') || '否',
        fundName: clean(g('fundName', '基金名称')),
        fundAmount: g('fundAmount', '基金参投金额(万元)'),
        arrivalAmount: g('arrivalAmount', '到资金额(亿元)'),
        yearArrivalAmount: g('yearArrivalAmount', '当年到位资金情况(亿元)'),
        currentStageArrival: g('currentStageArrival', '现阶段到资情况(亿元)'),
        arrivalUseDesc: clean(g('arrivalUseDesc', '到位资金用途说明')),
      })
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk?.(values)
    } catch (e) {
      // validation error
    }
  }

  const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
  const colProps = { span: 12 }
  const radioYesNo = [
    { label: '是', value: '是' },
    { label: '否', value: '否' },
  ]

  return (
    <Modal
      title="编辑落地信息"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      width={960}
      destroyOnClose
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', padding: '16px 24px 8px' } }}
    >
      <Form form={form} layout="horizontal" colon={false} requiredMark={true} {...formItemLayout}>

        <SectionHeader title="落地信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="落地时间" name="landingDate" rules={[{ required: true, message: '请选择落地时间' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择落地时间" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否已开工" name="isStarted" rules={[{ required: true }]}>
              <Radio.Group
                options={radioYesNo}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ startWorkType: undefined, startDate: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          {watchedIsStarted === '是' && (
            <>
              <Col {...colProps}>
                <Form.Item label="开工开业类型" name="startWorkType" rules={[{ required: true, message: '请选择开工开业类型' }]}>
                  <Select placeholder="请选择" options={START_WORK_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item label="开工/开业时间" name="startDate" rules={[{ required: true, message: '请选择开工/开业时间' }]}>
                  <DatePicker style={{ width: '100%' }} placeholder="请选择" />
                </Form.Item>
              </Col>
            </>
          )}

          <Col {...colProps}>
            <Form.Item label="建设类型" name="constructionType">
              <Select
                placeholder="请选择"
                allowClear
                options={CONSTRUCTION_NATURE_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="建设推进（发改）" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="实际开工时间(发改)" name="fgStartWorkDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="实际竣工时间(发改)" name="fgFinishDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否入统(发改)" name="fgRuTong">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="建设推进（经信）" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="实际开工时间(经信)" name="jxStartWorkDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="入统时间(经信)" name="jxRuTongDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="进规时间(经信)" name="jxJinGuiDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投产时间(经信)" name="jxTouChanDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否技改(经信)" name="jxJiGai">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="基金信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="基金名称" name="fundName">
              <Input placeholder="请输入基金名称，多个用顿号分隔" maxLength={200} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="基金参投金额(万元)" name="fundAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="万元" />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="到资信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="到资金额(亿元)" name="arrivalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={4} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="当年到位资金(亿元)" name="yearArrivalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={4} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="现阶段到资情况(亿元)" name="currentStageArrival">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={4} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="到位资金用途说明" name="arrivalUseDesc" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={2} placeholder="请说明到位资金用途" maxLength={500} showCount />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
