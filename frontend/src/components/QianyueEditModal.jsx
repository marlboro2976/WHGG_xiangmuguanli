import { useEffect, useState } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_NATURE_OPTIONS, ENTERPRISE_CATEGORY_OPTIONS,
  WUGU_OPTIONS, BELONG_AREA_OPTIONS, CONSTRUCTION_NATURE_OPTIONS,
  MERCHANT_TYPE_OPTIONS, CHUSHANG_TYPE_OPTIONS,
  OVERFLOW_SOURCE_OPTIONS, INDUSTRY_CASCADER_OPTIONS, CHAIN_965_CASCADER_OPTIONS,
  DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
  AGREEMENT_TYPE_OPTIONS, INVEST_FORM_OPTIONS, LAND_AREA_UNIT_OPTIONS,
  HQ_ECONOMY_LEVEL1_OPTIONS, HQ_ECONOMY_LEVEL2_OPTIONS,
  CONSTRUCTION_NATURE_LEVEL2_OPTIONS, CAPITAL_UNIT_OPTIONS,
  ASSESS_PROJECT_OPTIONS, PROJECT_ATTR_OPTIONS, SERVICE_INDUSTRY_OPTIONS,
  PLANNING_TYPE_OPTIONS,
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

export default function QianyueEditModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])

  const watchedCapitalNature = Form.useWatch('capitalNature', form)
  const watchedIsHq = Form.useWatch('isHqEconomy', form)
  const watchedIsRegistered = Form.useWatch('isRegistered', form)
  const watchedIndustryType = Form.useWatch('industryType', form)

  const toDayjs = (v) => {
    if (!v) return undefined
    if (typeof v === 'number') {
      const d = dayjs('1899-12-30').add(v, 'day')
      return d.isValid() ? d : undefined
    }
    const d = dayjs(v)
    return d.isValid() ? d : undefined
  }

  const clean = (v) => (v === '-' || v === '' || v === null || v === undefined ? undefined : v)

  const toCascader = (v) => {
    const c = clean(v)
    if (!c) return undefined
    if (Array.isArray(c)) return c
    return [c]
  }

  const sourceRegionOptions = watchedCapitalNature === '外资'
    ? FOREIGN_COUNTRY_OPTIONS.map(v => ({ label: v, value: v }))
    : watchedCapitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      setFileList([])
      const fv = projectData._formValues || {}
      const g = (formKey, ...aliases) => {
        if (fv[formKey] !== undefined) return fv[formKey]
        for (const k of aliases) {
          if (projectData[k] !== undefined && projectData[k] !== null) return projectData[k]
        }
        return undefined
      }

      const initialValues = {
        projectCode: clean(g('projectCode', '区级项目编码', '编号')),
        projectName: clean(g('projectName', '项目名称')),
        projectArea: clean(g('projectArea', '项目区域', '区域', '承接区')),
        reporter: clean(g('reporter', '申报人')),
        investAmount: g('investAmount', '计划投资总额(亿元)', '投资金额(亿元)', '投资金额（亿元）'),
        fixedInvestAmount: g('fixedInvestAmount', '固投金额(亿元)', '固投金额（亿元）'),
        yearArrivalAmount: g('yearArrivalAmount', '当年到位资金情况(亿元)'),
        currentStageArrival: g('currentStageArrival', '现阶段到资情况(亿元)'),
        projectDescription: clean(g('projectDescription', '项目简介')),
        capitalNature: clean(g('capitalNature', '内外资')),
        sourceRegion: clean(g('sourceRegion', '来源地')),
        industryType: clean(g('industryType', '产业类别')),
        industryCategory: toCascader(g('industryCategory', '行业类别（门类）', '行业类别（门类）')),
        chainType965: toCascader(g('chainType965', '对应“965”产业链类别')),
        wuguCluster: clean(g('wuguCluster', '所属”五谷”优势产业集群', '所属五谷产业集群')),
        belongArea: clean(g('belongArea', '所属片区')),
        planningType: clean(g('planningType', '策划类型')),
        isZheshang: g('isZheshang', '是否浙商') || '否',
        isFdi: g('isFdi', '是否FDI') || '否',
        isPushProvince: g('isPushProvince', '是否推送至省库') || '是',
        merchantType: clean(g('merchantType', '招商类型')) || '其它',
        isHqEconomy: g('isHqEconomy', '是否总部经济') || '否',
        hqEconomyLevel1: clean(g('hqEconomyLevel1', '总部经济类型')),
        hqEconomyLevel2: clean(g('hqEconomyLevel2', '总部建设类型')),
        isRdCenter: g('isRdCenter', '是否研发中心') || '否',
        chushangType: clean(g('chushangType', '楚商类型')),
        chushangInfo: clean(g('chushangInfo', '楚商基本信息')),
        signEntity: clean(g('signEntity', '签约主体(洽谈主体)')),
        investorEntity: clean(g('investorEntity', '投资主体')),
        signEntityLicense: clean(g('signEntityLicense', '签约主体证照号码')),
        investorEntityLicense: clean(g('investorEntityLicense', '投资主体社会信用代码', '投资主体证照号码')),
        enterpriseNature: clean(g('enterpriseNature', '企业性质')),
        enterpriseCategory: clean(g('enterpriseCategory', '企业类别')),
        isRegistered: g('isRegistered', '是否已注册') || '否',
        registeredCompany: clean(g('registeredCompany', '注册公司')),
        registerDate: toDayjs(g('registerDate', '注册时间')),
        registeredCapital: g('registeredCapital', '注册资本(万元)', '注册资本（万元）'),
        recordAmount: g('recordAmount', '备案证金额(亿元)'),
        investForm: clean(g('investForm', '投资形态')),
        arrivalAmount: g('arrivalAmount', '到资金额(亿元)'),
        expectedAnnualOutput: g('expectedAnnualOutput', '预计年产值(亿元)'),
        expectedAnnualTax: g('expectedAnnualTax', '预计年税收(亿元)'),
        investorContact: clean(g('investorContact', '投资主体联系人', '投资方联系人')),
        investorContactPhone: clean(g('investorContactPhone', '投资主体联系人电话', '投资方联系方式')),
        responsibleUnit: clean(g('responsibleUnit', '区投促局联系人', '负责单位')),
        districtLeader: clean(g('districtLeader', '区级责任领导')),
        isSigned: g('isSigned', '是否已签约') || '是',
        signDate: toDayjs(g('signDate', '协议签订时间')),
        agreementType: clean(g('agreementType', '协议类型')),
        projectAttr: clean(g('projectAttr', '立项属性')),
        constructionNature: clean(g('constructionNature', '建设性质')),
        constructionNatureLevel2: clean(g('constructionNatureLevel2', '建设分类')),
        projectAddress: clean(g('projectAddress', '项目建设地址')),
        landSituation: clean(g('landSituation', '用地情况')),
        landArea: g('landArea', '用地/办公面积'),
        landAreaUnit: clean(g('landAreaUnit')) || '亩',
        assessProject: clean(g('assessProject', '报送规范分类')),
        isOverflow: g('isOverflow', '是否产业外溢') || '否',
        overflowSource: clean(g('overflowSource')),
        isEnclave: g('isEnclave', '是否飞地园区') || '否',
        isAdvancedMfg: g('isAdvancedMfg', '是否先进制造业') || '否',
        serviceIndustryType: clean(g('serviceIndustryType', '服务业类别')),
        arrivalUseDesc: clean(g('arrivalUseDesc', '到位资金用途说明')),
        remark: clean(g('remark')),
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (fileList.length > 10) {
        message.warning('上传附件数量不能超过10个')
        return
      }
      message.success('保存成功（demo示意）')
      onOk?.({ ...values, attachments: fileList })
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

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newList }) => setFileList(newList.slice(0, 10)),
    beforeUpload: (file) => {
      const allowedExt = /\.(doc|docx|pdf|xls|xlsx|ppt|pptx|jpg|jpeg|png)$/i
      const isAllowedType = allowedExt.test(file.name)
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isAllowedType) {
        message.error('仅支持 word、pdf、excel、ppt、jpg、png 格式文件')
        return Upload.LIST_IGNORE
      }
      if (!isLt50M) {
        message.error('文件大小不能超过50MB')
        return Upload.LIST_IGNORE
      }
      return false
    },
    multiple: true,
  }

  return (
    <Modal
      title="编辑签约项目"
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

        <SectionHeader title="项目基本信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="区级项目编码" name="projectCode">
              <Input placeholder="区级项目编码（已存在不可修改）" disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 100, message: '不超过100字' }]}>
              <Input placeholder="请输入项目名称" maxLength={100} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="项目区域" name="projectArea" rules={[{ required: true, message: '请选择项目区域' }]}>
              <Select placeholder="请选择" options={BELONG_AREA_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="申报人" name="reporter">
              <Input placeholder="请输入申报人" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="策划类型" name="planningType">
              <Select placeholder="请选择" options={PLANNING_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="固投金额(亿元)" name="fixedInvestAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="当年到位资金(亿元)" name="yearArrivalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="现阶段到资情况(亿元)" name="currentStageArrival">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择' }]}>
              <Select
                placeholder="请选择"
                options={CAPITAL_NATURE_OPTIONS.map(v => ({ label: v, value: v }))}
                onChange={() => form.setFieldsValue({ sourceRegion: undefined })}
              />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
              <Cascader
                options={sourceRegionOptions}
                placeholder={watchedCapitalNature === '外资' ? '请选择国家' : watchedCapitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                expandTrigger="hover"
                showSearch
                disabled={!watchedCapitalNature}
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
              <Select placeholder="请选择" options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="门类 / 大类" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="对应965产业链" name="chainType965" rules={[{ required: true, message: '请选择产业链' }]}>
              <Cascader options={CHAIN_965_CASCADER_OPTIONS} placeholder="主链 / 子链" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="所属五谷集群" name="wuguCluster" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={WUGU_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="所属片区" name="belongArea" rules={[{ required: true, message: '请选择所属片区' }]}>
              <Select placeholder="请选择" options={BELONG_AREA_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="招商类型" name="merchantType" rules={[{ required: true, message: '请选择招商类型' }]}>
              <Select placeholder="请选择" options={MERCHANT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="楚商类型" name="chushangType">
              <Select placeholder="请选择" options={CHUSHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={3} placeholder="请输入项目简介" maxLength={999} showCount />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="楚商基本信息" name="chushangInfo" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={2} placeholder="请输入楚商基本信息" maxLength={500} showCount />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="签约主体与企业信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="签约主体" name="signEntity" rules={[{ required: true, message: '请输入签约主体' }]}>
              <Input placeholder="请输入签约主体(洽谈主体)" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true, message: '请输入投资主体' }]}>
              <Input placeholder="请输入投资主体" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="签约主体证照号码" name="signEntityLicense">
              <Input placeholder="统一社会信用代码" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资主体社会信用代码" name="investorEntityLicense" rules={[{ required: true, message: '请输入投资主体社会信用代码' }]}>
              <Input placeholder="统一社会信用代码" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="企业性质" name="enterpriseNature" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={ENTERPRISE_NATURE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="企业类别" name="enterpriseCategory" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" showSearch options={ENTERPRISE_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="投资主体联系人" name="investorContact">
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资主体联系人电话" name="investorContactPhone" rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}>
              <Input placeholder="11位手机号（选填）" maxLength={11} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="区投促局联系人" name="responsibleUnit">
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="区级责任领导" name="districtLeader">
              <Input placeholder="请输入姓名或联系方式" />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="协议与签约信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="是否已签约" name="isSigned" rules={[{ required: true }]}>
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="协议签订时间" name="signDate">
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="协议类型" name="agreementType">
              <Select placeholder="请选择协议类型" options={AGREEMENT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资形态" name="investForm">
              <Select placeholder="请选择" options={INVEST_FORM_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="报送规范分类" name="assessProject">
              <Select placeholder="请选择" options={ASSESS_PROJECT_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="注册与投资信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="是否已注册" name="isRegistered" rules={[{ required: true }]}>
              <Radio.Group
                options={radioYesNo}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ registeredCompany: undefined, registerDate: undefined, registeredCapital: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isRegistered !== cur.isRegistered}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isRegistered')
              return val === '是' ? (
                <>
                  <Col {...colProps}>
                    <Form.Item label="注册公司" name="registeredCompany">
                      <Input placeholder="请输入注册公司名称" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="注册时间" name="registerDate">
                      <DatePicker style={{ width: '100%' }} placeholder="请选择" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="注册资本" name="registeredCapital">
                      <InputNumber style={{ width: '100%' }} placeholder="金额" min={0} precision={2} addonAfter="万元" />
                    </Form.Item>
                  </Col>
                </>
              ) : null
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="备案证金额(亿元)" name="recordAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="到资金额(亿元)" name="arrivalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="预计年产值(亿元)" name="expectedAnnualOutput">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="预计年税收(亿元)" name="expectedAnnualTax">
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={4} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="到位资金用途说明" name="arrivalUseDesc" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={2} placeholder="请说明到位资金用途" maxLength={500} showCount />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="建设与落地信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="立项属性" name="projectAttr" rules={[{ required: true, message: '请选择立项属性' }]}>
              <Select placeholder="请选择" options={PROJECT_ATTR_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="建设性质" required labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Form.Item name="constructionNature" noStyle rules={[{ required: true, message: '请选择建设性质' }]}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="请选择"
                    options={CONSTRUCTION_NATURE_OPTIONS.map(v => ({ label: v, value: v }))}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="constructionNatureLevel2" noStyle rules={[{ required: true, message: '请选择建设分类' }]}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="请选择"
                    options={CONSTRUCTION_NATURE_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))}
                    allowClear
                  />
                </Form.Item>
              </div>
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否总部经济" name="isHqEconomy">
              <Radio.Group
                options={radioYesNo}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ hqEconomyLevel1: undefined, hqEconomyLevel2: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isHqEconomy !== cur.isHqEconomy}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isHqEconomy')
              return val === '是' ? (
                <Col span={24}>
                  <Form.Item label="总部经济类型" required labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Form.Item name="hqEconomyLevel1" noStyle rules={[{ required: true, message: '请选择' }]}>
                        <Select style={{ flex: 1 }} placeholder="请选择" options={HQ_ECONOMY_LEVEL1_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
                      </Form.Item>
                      <Form.Item name="hqEconomyLevel2" noStyle rules={[{ required: true, message: '请选择' }]}>
                        <Select style={{ flex: 1 }} placeholder="请选择" options={HQ_ECONOMY_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
                      </Form.Item>
                    </div>
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col span={24}>
            <Form.Item label="项目建设地址" name="projectAddress" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Input placeholder="请输入项目建设地址" maxLength={200} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="用地情况" name="landSituation">
              <Input placeholder="如：工业用地出让、租赁办公用房等" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="用地/办公面积">
              <Input.Group compact style={{ display: 'flex' }}>
                <Form.Item name="landArea" noStyle>
                  <InputNumber style={{ width: '70%' }} placeholder="面积" min={0} precision={2} />
                </Form.Item>
                <Form.Item name="landAreaUnit" noStyle initialValue="亩">
                  <Select style={{ width: '30%' }} options={LAND_AREA_UNIT_OPTIONS.map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="标记属性与附件" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="是否浙商" name="isZheshang">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否FDI" name="isFdi">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否推送省库" name="isPushProvince">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否研发中心" name="isRdCenter">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否产业外溢" name="isOverflow">
              <Radio.Group
                options={radioYesNo}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ overflowSource: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isOverflow !== cur.isOverflow}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isOverflow')
              return val === '是' ? (
                <Col {...colProps}>
                  <Form.Item label="外溢来源" name="overflowSource">
                    <Select placeholder="请选择外溢来源" options={OVERFLOW_SOURCE_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
                  </Form.Item>
                </Col>
              ) : <Col {...colProps} />
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="是否飞地园区" name="isEnclave">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否先进制造业" name="isAdvancedMfg">
              <Radio.Group options={radioYesNo} />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.industryType !== cur.industryType}>
            {({ getFieldValue }) => {
              const val = getFieldValue('industryType')
              return val === '服务业' ? (
                <Col {...colProps}>
                  <Form.Item label="服务业类别" name="serviceIndustryType">
                    <Select placeholder="请选择" options={SERVICE_INDUSTRY_OPTIONS.map(v => ({ label: v, value: v }))} allowClear />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col span={24}>
            <Form.Item label="备注" name="remark" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={2} placeholder="请输入备注信息" maxLength={500} showCount />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="上传附件" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Upload {...uploadProps}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <button type="button" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                    background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4,
                    padding: '5px 16px', cursor: 'pointer', fontSize: 13, lineHeight: 1.5,
                  }}>
                    <PlusOutlined /> 上传附件
                  </button>
                  <span style={{ fontSize: 12, color: '#999', lineHeight: 1.4 }}>
                    可上传不超过50MB的word、pdf、excel、ppt、jpg、png等格式的文件，最多10个
                  </span>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
