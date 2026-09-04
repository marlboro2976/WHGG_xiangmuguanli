import { useEffect, useState } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio, Upload, Button, Table, Space, message } from 'antd'
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_NATURE_OPTIONS, ENTERPRISE_CATEGORY_OPTIONS,
  WUGU_OPTIONS, BELONG_AREA_OPTIONS, CONSTRUCTION_NATURE_OPTIONS,
  MERCHANT_TYPE_OPTIONS, CHUSHANG_TYPE_OPTIONS,
  DOMESTIC_REGION_OPTIONS, INDUSTRY_CASCADER_OPTIONS, CHAIN_965_CASCADER_OPTIONS,
  AGREEMENT_TYPE_OPTIONS, INVEST_FORM_OPTIONS, LAND_AREA_UNIT_OPTIONS,
  HQ_ECONOMY_LEVEL1_OPTIONS, HQ_ECONOMY_LEVEL2_OPTIONS,
  CONSTRUCTION_NATURE_LEVEL2_OPTIONS, ZHESHANG_TYPE_OPTIONS,
  DOMESTIC_FOREIGN_TRADE_OPTIONS, STOCK_ENTERPRISE_TYPE_FULL_OPTIONS,
  PROJECT_ATTR_OPTIONS, CAPITAL_UNIT_OPTIONS,
  GB_NATIONAL_INDUSTRY, PLANNING_TYPE_OPTIONS,
} from '../constants/projectEnums'

const { TextArea } = Input
const { YearPicker } = DatePicker

const LAND_SITUATION_OPTIONS = ['新供地', '现有用地', '租赁厂房', '购买房产', '其他']
const KEY_INDUSTRY_OPTIONS = ['光电子信息', '新能源与智能网联汽车', '生命健康', '高端装备', '北斗', '人工智能', '数字经济', '新材料', '新能源']

const radioOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

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

function generateProjectCode() {
  const dateStr = dayjs().format('YYYYMMDD')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `QY${dateStr}${seq}`
}

export default function ZhuanQianyueModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [agreementFileList, setAgreementFileList] = useState([])
  const [registerFileList, setRegisterFileList] = useState([])
  const [otherFileList, setOtherFileList] = useState([])
  const [enterpriseCategoryFileList, setEnterpriseCategoryFileList] = useState([])
  const [investmentPlans, setInvestmentPlans] = useState([])

  const watchedIsZheshang = Form.useWatch('isZheshang', form)
  const watchedIsFdi = Form.useWatch('isFdi', form)
  const watchedIsStock = Form.useWatch('isStock', form)
  const watchedStockType = Form.useWatch('stockEnterpriseType', form)
  const watchedIsHqEconomy = Form.useWatch('isHqEconomy', form)
  const watchedIsKeyIndustry = Form.useWatch('isKeyIndustry', form)
  const watchedIsRegister = Form.useWatch('isRegister', form)
  const watchedGbCategory = Form.useWatch('gbCategory', form)

  const toDayjs = (v) => {
    if (!v) return undefined
    const d = dayjs(v)
    return d.isValid() ? d : undefined
  }
  const toYearDayjs = (v) => {
    if (!v) return undefined
    const year = typeof v === 'string' ? parseInt(v, 10) : v
    if (!year || isNaN(year)) return undefined
    const d = dayjs().year(year).startOf('year')
    return d.isValid() ? d : undefined
  }
  const clean = (v) => (v === '-' || v === '' || v === null || v === undefined ? undefined : v)
  const toCascader = (v) => {
    const c = clean(v)
    if (!c) return undefined
    if (Array.isArray(c)) return c
    return [c]
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
      setAgreementFileList([])
      setRegisterFileList([])
      setOtherFileList([])
      setEnterpriseCategoryFileList([])
      setInvestmentPlans([])

      const initialValues = {
        projectCode: generateProjectCode(),
        projectName: clean(projectData?.projectName),
        declarationDate: dayjs(),
        natongProjectName: clean(projectData?.natongProjectName),
        natongInvestAmount: projectData?.natongInvestAmount,
        planningType: undefined,
        projectAttr: undefined,
        constructionNature: clean(projectData?.constructionNature),
        constructionNatureLevel2: undefined,
        address: '东湖高新区',
        addressDetail: clean(projectData?.addressDetail),
        merchantType: clean(projectData?.merchantType) || '其它',
        merchantTypeDesc: clean(projectData?.merchantTypeDesc),
        reporter: clean(projectData?.reporter),
        isOverflow: clean(projectData?.isOverflow) || '否',
        isPushToProvince: '是',
        chushangType: clean(projectData?.chushangType),
        chushangInfo: clean(projectData?.chushangInfo),
        isZheshang: '否',
        zheshangType: undefined,
        zheshangInfo: undefined,
        projectDescription: clean(projectData?.projectDescription || projectData?.projectDesc),

        capitalNature: clean(projectData?.capitalNature),
        isFdi: '否',
        fdiAmount: undefined,
        domesticForeignTrade: undefined,
        sourceRegion: toCascader(projectData?.sourceRegion || projectData?.sourceArea),
        isStock: '否',
        stockEnterpriseType: undefined,
        stockEnterpriseOther: undefined,
        firstInvestYear: undefined,
        expectedOutput: undefined,
        declareReason: undefined,
        industryType: clean(projectData?.industryType || projectData?.industryCategory),
        industryCategory: toCascader(projectData?.industryCategory || projectData?.industryType),
        secondaryIndustryCategory: toCascader(projectData?.secondaryIndustryCategory),
        chainType965: toCascader(projectData?.chainType965 || projectData?.chain965),
        secondaryChain965: toCascader(projectData?.secondaryChain965),
        wuguCluster: clean(projectData?.wuguCluster),
        belongArea: clean(projectData?.belongArea || projectData?.pianqu || projectData?.acceptArea),
        landSituation: undefined,
        landArea: undefined,
        landAreaUnit: undefined,
        isRdCenter: clean(projectData?.isRdCenter || projectData?.isRnd) || '否',
        isEnclave: clean(projectData?.isEnclave) || '否',
        isAdvancedMfg: clean(projectData?.isAdvancedMfg) || '否',
        isHqEconomy: '否',
        hqEconomyLevel1: undefined,
        hqEconomyLevel2: undefined,
        isStrategicEmerging: '否',
        isKeyIndustry: '否',
        keyIndustryType: undefined,
        gbCategory: undefined,
        gbMajorClass: undefined,
        gbMiddleClass: undefined,
        gbSmallClass: undefined,
        gbIndustryCode: undefined,
        gbSecondaryCategory: undefined,

        planInvestAmount: projectData?.investAmount || projectData?.planInvestAmount,
        recordAmount: undefined,
        fixedInvestAmount: undefined,
        investForm: undefined,
        expectedAnnualOutput: undefined,
        expectedAnnualTax: undefined,
        currentYearArrival: undefined,
        currentStageArrival: undefined,
        arrivalUseDesc: undefined,

        agreementSignDate: dayjs(),
        agreementType: undefined,
        isRegister: '否',
        registerDate: undefined,
        registeredCapital: undefined,
        capitalUnit: undefined,
        registerCompanyName: undefined,
        socialCreditCode: undefined,
        registerFile: undefined,

        signSubject: undefined,
        signSubjectCreditCode: undefined,
        enterpriseNature: clean(projectData?.enterpriseNature),
        enterpriseCategory: clean(projectData?.enterpriseCategory),
        investorEntity: clean(projectData?.investorEntity),
        investorCreditCode: undefined,
        investorContactPerson: clean(projectData?.investorContactPerson || projectData?.investorContact),
        investorContactPhone: clean(projectData?.investorContactPhone),
        districtPromoContact: clean(projectData?.districtContact),
        districtPromoPhone: clean(projectData?.districtContactPhone),
        cityPromoContact: clean(projectData?.cityContact),
        cityPromoPhone: clean(projectData?.cityContactPhone),
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const allValues = {
        ...values,
        agreementAttachments: agreementFileList,
        registerAttachments: registerFileList,
        otherAttachments: otherFileList,
        enterpriseCategoryAttachments: enterpriseCategoryFileList,
        investmentPlans,
      }
      onOk && onOk(allValues)
      form.resetFields()
      setAgreementFileList([])
      setRegisterFileList([])
      setOtherFileList([])
      setEnterpriseCategoryFileList([])
      setInvestmentPlans([])
    } catch (e) {
      // validation error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setAgreementFileList([])
    setRegisterFileList([])
    setOtherFileList([])
    setEnterpriseCategoryFileList([])
    setInvestmentPlans([])
    onCancel && onCancel()
  }

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }
  const colProps = { span: 12 }

  const gbCategoryOptions = GB_NATIONAL_INDUSTRY.map(item => ({
    label: item.label,
    value: item.value,
  }))

  const getGbMajorClassOptions = () => {
    if (!watchedGbCategory) return []
    const category = GB_NATIONAL_INDUSTRY.find(x => x.value === watchedGbCategory)
    if (!category || !category.children) return []
    return category.children.map(item => ({ label: item.label, value: item.value }))
  }

  const createUploadProps = (fileList, setFileList) => ({
    fileList,
    beforeUpload: (file) => {
      if (file.size > 20 * 1024 * 1024) {
        message.error(`${file.name} 超过20MB限制`)
        return Upload.LIST_IGNORE
      }
      setFileList(prev => [...prev, file])
      return false
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid))
    },
    multiple: true,
  })

  return (
    <Modal
      title="在谈转签约"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认提交"
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
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }]}>
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="申报时间" name="declarationDate" rules={[{ required: true, message: '请选择申报时间' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择申报时间" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="纳统项目名称" name="natongProjectName">
              <Input placeholder="统计部门入库纳统名称" maxLength={100} showCount />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="纳统计划总投资额" name="natongInvestAmount">
              <InputNumber style={{ width: '100%' }} placeholder="万元" min={0} precision={2} addonAfter="万元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="策划类型" name="planningType">
              <Select placeholder="请选择" options={PLANNING_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="立项属性" name="projectAttr">
              <Select placeholder="请选择" options={PROJECT_ATTR_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="建设性质" required labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Form.Item name="constructionNature" noStyle rules={[{ required: true, message: '请选择' }]}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="请选择"
                    options={CONSTRUCTION_NATURE_OPTIONS.map(v => ({ label: v, value: v }))}
                  />
                </Form.Item>
                <Form.Item name="constructionNatureLevel2" noStyle rules={[{ required: true, message: '请选择' }]}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="请选择"
                    options={CONSTRUCTION_NATURE_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))}
                  />
                </Form.Item>
              </div>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="项目建设地址" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input value="东湖高新区" disabled style={{ width: 140 }} />
                <Form.Item name="addressDetail" noStyle>
                  <Input placeholder="请输入详细地址" style={{ width: 'calc(100% - 140px)' }} />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="招商类型" name="merchantType" rules={[{ required: true, message: '请选择招商类型' }]}>
              <Select placeholder="请选择" options={MERCHANT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="招商类型说明" name="merchantTypeDesc" rules={[{ required: true, message: '请输入说明' }, { max: 100, message: '不超过100字' }]}>
              <Input placeholder="请输入说明" maxLength={100} showCount />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="申报人" name="reporter">
              <Input placeholder="请输入申报人" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否产业外溢" name="isOverflow" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否推送至省库" name="isPushToProvince" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="楚商类型" name="chushangType" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={CHUSHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="楚商基本信息" name="chushangInfo" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入楚商基本信息' }]}>
              <TextArea rows={3} placeholder="请输入楚商基本信息" maxLength={500} showCount />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否浙商" name="isZheshang" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ zheshangType: undefined, zheshangInfo: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isZheshang !== cur.isZheshang}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isZheshang')
              return val === '是' ? (
                <Col {...colProps}>
                  <Form.Item label="浙商类型" name="zheshangType" rules={[{ required: true, message: '请选择' }]}>
                    <Select placeholder="请选择" options={ZHESHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isZheshang !== cur.isZheshang}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isZheshang')
              return val === '是' ? (
                <Col span={24}>
                  <Form.Item label="浙商基本信息" name="zheshangInfo" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入浙商基本信息' }]}>
                    <TextArea rows={2} placeholder="请输入浙商基本信息" maxLength={500} showCount />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col span={24}>
            <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }]}>
              <TextArea rows={3} placeholder="请输入项目简介" maxLength={1000} showCount />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="项目分类指标信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={CAPITAL_NATURE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否FDI" name="isFdi" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ fdiAmount: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isFdi !== cur.isFdi}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isFdi')
              return val === '是' ? (
                <Col {...colProps}>
                  <Form.Item label="FDI金额" name="fdiAmount" rules={[{ required: true, message: '请输入金额' }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="万美元" min={0} precision={2} addonAfter="万美元" />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="内外贸" name="domesticForeignTrade">
              <Select placeholder="请选择" options={DOMESTIC_FOREIGN_TRADE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
              <Cascader options={DOMESTIC_REGION_OPTIONS} placeholder="请选择省份/城市" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否存量企业" name="isStock" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ stockEnterpriseType: undefined, stockEnterpriseOther: undefined, firstInvestYear: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isStock !== cur.isStock}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isStock')
              return val === '是' ? (
                <>
                  <Col {...colProps}>
                    <Form.Item label="存量企业类型" name="stockEnterpriseType" rules={[{ required: true, message: '请选择' }]}>
                      <Select
                        placeholder="请选择"
                        options={STOCK_ENTERPRISE_TYPE_FULL_OPTIONS.map(v => ({ label: v, value: v }))}
                        onChange={(v) => { if (v !== '其他') form.setFieldsValue({ stockEnterpriseOther: undefined }) }}
                      />
                    </Form.Item>
                  </Col>
                </>
              ) : null
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isStock !== cur.isStock || prev.stockEnterpriseType !== cur.stockEnterpriseType}>
            {({ getFieldValue }) => {
              const val = getFieldValue('stockEnterpriseType')
              const isStockVal = getFieldValue('isStock')
              return isStockVal === '是' && val === '其他' ? (
                <Col {...colProps}>
                  <Form.Item label="其他说明" name="stockEnterpriseOther" rules={[{ required: true, message: '请输入说明' }]}>
                    <Input placeholder="请输入说明" maxLength={100} />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isStock !== cur.isStock}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isStock')
              return val === '是' ? (
                <Col {...colProps}>
                  <Form.Item label="首次投资年份" name="firstInvestYear">
                    <YearPicker style={{ width: '100%' }} placeholder="请选择年份" />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="预计产值" name="expectedOutput">
              <InputNumber style={{ width: '100%' }} placeholder="万元" min={0} precision={2} addonAfter="万元" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="申报理由" name="declareReason" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={3} placeholder="请输入申报理由" maxLength={500} showCount />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择' }]}>
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="主类 / 子类" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="次要行业类别" name="secondaryIndustryCategory">
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="主类 / 子类（选填）" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="对应965产业链" name="chainType965" rules={[{ required: true, message: '请选择' }]}>
              <Cascader options={CHAIN_965_CASCADER_OPTIONS} placeholder="主链 / 子链" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="次要产业链类别" name="secondaryChain965" rules={[{ required: true, message: '请选择' }]}>
              <Cascader options={CHAIN_965_CASCADER_OPTIONS} placeholder="主链 / 子链" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="所属五谷产业集群" name="wuguCluster" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={WUGU_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="所属片区" name="belongArea" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={BELONG_AREA_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="用地情况" name="landSituation" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={LAND_SITUATION_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="用地/办公面积" required>
              <Input.Group compact>
                <Form.Item name="landAreaNum" noStyle rules={[{ required: true, message: '请输入面积' }]}>
                  <InputNumber style={{ width: 'calc(100% - 100px)' }} placeholder="面积" min={0} precision={2} />
                </Form.Item>
                <Form.Item name="landAreaUnit" noStyle rules={[{ required: true, message: '请选择单位' }]}>
                  <Select style={{ width: 100 }} placeholder="单位" options={LAND_AREA_UNIT_OPTIONS.map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否研发中心" name="isRdCenter" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否飞地园区" name="isEnclave">
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否先进制造业" name="isAdvancedMfg">
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否总部经济" name="isHqEconomy" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
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
                        <Select style={{ flex: 1 }} placeholder="请选择" options={HQ_ECONOMY_LEVEL1_OPTIONS.map(v => ({ label: v, value: v }))} />
                      </Form.Item>
                      <Form.Item name="hqEconomyLevel2" noStyle rules={[{ required: true, message: '请选择' }]}>
                        <Select style={{ flex: 1 }} placeholder="请选择" options={HQ_ECONOMY_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))} />
                      </Form.Item>
                    </div>
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="是否战略性新兴产业" name="isStrategicEmerging" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否为重点产业" name="isKeyIndustry" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ keyIndustryType: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isKeyIndustry !== cur.isKeyIndustry}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isKeyIndustry')
              return val === '是' ? (
                <Col {...colProps}>
                  <Form.Item label="重点产业" name="keyIndustryType" rules={[{ required: true, message: '请选择' }]}>
                    <Select placeholder="请选择" options={KEY_INDUSTRY_OPTIONS.map(v => ({ label: v, value: v }))} />
                  </Form.Item>
                </Col>
              ) : null
            }}
          </Form.Item>
        </Row>

        <div style={{
          border: '1px dashed #1677ff', borderRadius: 4, padding: 16, margin: '16px 0',
          background: '#f0f7ff',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: '#1677ff' }}>国家级行业分类（GB/T 4754-2017）</div>
          <Row gutter={24}>
            <Col {...colProps}>
              <Form.Item label="门类" name="gbCategory">
                <Select
                  placeholder="请选择门类"
                  options={gbCategoryOptions}
                  onChange={() => {
                    form.setFieldsValue({ gbMajorClass: undefined, gbMiddleClass: undefined, gbSmallClass: undefined })
                  }}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="大类" name="gbMajorClass">
                <Select
                  placeholder={watchedGbCategory ? '请选择大类' : '请先选择门类'}
                  options={getGbMajorClassOptions()}
                  disabled={!watchedGbCategory}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="中类" name="gbMiddleClass">
                <Select placeholder="请选择（简化）" disabled showSearch />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="小类" name="gbSmallClass">
                <Select placeholder="请选择（简化）" disabled showSearch />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="行业代码" name="gbIndustryCode">
                <Input placeholder="可直接输入行业代码" />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item label="次要门类" name="gbSecondaryCategory" rules={[{ required: true, message: '请选择' }]}>
                <Select
                  placeholder="请选择次要门类"
                  options={gbCategoryOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <SectionHeader title="项目投资信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="计划投资总额(亿元)" name="planInvestAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="备案证金额(亿元)" name="recordAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="固投金额(亿元)" name="fixedInvestAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资形态" name="investForm" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={INVEST_FORM_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="预计年产值(亿元)" name="expectedAnnualOutput" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="预计年税收(亿元)" name="expectedAnnualTax" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="当年到资情况(亿元)" name="currentYearArrival">
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="现阶段到资情况(亿元)" name="currentStageArrival">
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="到位资金用途说明" name="arrivalUseDesc" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <TextArea rows={2} placeholder="请说明到位资金用途" maxLength={500} showCount />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>年度计划投资安排</div>
          <Form.List name="plans">
            {(fields, { add, remove }) => (
              <>
                <Table
                  dataSource={fields}
                  columns={[
                    {
                      title: '年份',
                      dataIndex: 'year',
                      key: 'year',
                      width: 180,
                      render: (_, record) => (
                        <Form.Item name={[record.name, 'year']} rules={[{ required: true, message: '请选择年份' }]} style={{ margin: 0 }}>
                          <YearPicker style={{ width: '100%' }} placeholder="选择年份" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '投资金额(亿元)',
                      dataIndex: 'amount',
                      key: 'amount',
                      width: 200,
                      render: (_, record) => (
                        <Form.Item name={[record.name, 'amount']} rules={[{ required: true, message: '请输入金额' }]} style={{ margin: 0 }}>
                          <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="金额（亿元）" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '投资内容',
                      dataIndex: 'content',
                      key: 'content',
                      render: (_, record) => (
                        <Form.Item name={[record.name, 'content']} rules={[{ required: true, message: '请输入内容' }]} style={{ margin: 0 }}>
                          <Input placeholder="请输入投资内容" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: (_, record) => (
                        <Button type="link" danger onClick={() => remove(record.name)}>
                          删除
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  rowKey="key"
                  size="small"
                />
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  添加年度计划
                </Button>
              </>
            )}
          </Form.List>
        </div>

        <SectionHeader title="项目推进情况信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="协议签订时间" name="agreementSignDate" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="协议类型" name="agreementType" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={AGREEMENT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="协议凭证附件">
              <Upload {...createUploadProps(agreementFileList, setAgreementFileList)}>
                <Button icon={<UploadOutlined />}>点击上传</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否注册" name="isRegister" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({
                      registerDate: undefined, registeredCapital: undefined, capitalUnit: undefined,
                      registerCompanyName: undefined, socialCreditCode: undefined, registerFile: undefined,
                    })
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isRegister !== cur.isRegister}>
            {({ getFieldValue }) => {
              const val = getFieldValue('isRegister')
              return val === '是' ? (
                <>
                  <Col {...colProps}>
                    <Form.Item label="注册时间" name="registerDate" rules={[{ required: true, message: '请选择日期' }]}>
                      <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="注册资本" required>
                      <Input.Group compact>
                        <Form.Item name="capitalAmount" noStyle rules={[{ required: true, message: '请输入金额' }]}>
                          <InputNumber style={{ width: 'calc(100% - 100px)' }} placeholder="金额" min={0} precision={2} />
                        </Form.Item>
                        <Form.Item name="capitalUnit" noStyle rules={[{ required: true, message: '请选择单位' }]}>
                          <Select style={{ width: 100 }} placeholder="单位" options={CAPITAL_UNIT_OPTIONS.map(v => ({ label: v, value: v }))} />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="注册公司名称" name="registerCompanyName" rules={[{ required: true, message: '请输入' }]}>
                      <Input placeholder="请输入公司名称" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="社会信用代码" name="socialCreditCode">
                      <Input placeholder="请输入统一社会信用代码" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item label="工商注册凭证" name="registerFile" rules={[{ required: true, message: '请上传工商注册凭证' }]}>
                      <Upload {...createUploadProps(registerFileList, setRegisterFileList)}>
                        <Button icon={<UploadOutlined />}>点击上传</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </>
              ) : null
            }}
          </Form.Item>

          <Col {...colProps}>
            <Form.Item label="其它凭证">
              <Upload {...createUploadProps(otherFileList, setOtherFileList)}>
                <Button icon={<UploadOutlined />}>点击上传</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="投资主体及负责单位信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="签约主体" name="signSubject" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入签约主体（洽谈主体）" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="签约主体信用代码" name="signSubjectCreditCode" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入社会信用代码" />
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
            <Form.Item label="企业类别佐证">
              <Upload {...createUploadProps(enterpriseCategoryFileList, setEnterpriseCategoryFileList)}>
                <Button icon={<UploadOutlined />}>点击上传</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入投资主体" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="投资主体社会信用代码" name="investorCreditCode" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入社会信用代码" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="投资主体联系人" name="investorContactPerson" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="投资主体联系人电话" name="investorContactPhone" rules={[
              { required: true, message: '请输入电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}>
              <Input placeholder="11位手机号" maxLength={11} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="区投促局联系人" name="districtPromoContact" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="区投促局联系人电话" name="districtPromoPhone" rules={[
              { required: true, message: '请输入电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}>
              <Input placeholder="11位手机号" maxLength={11} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="市投促局联络人" name="cityPromoContact">
              <Input placeholder="请输入联络人（选填）" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="市投促局联络人电话" name="cityPromoPhone">
              <Input placeholder="11位手机号（选填）" maxLength={11} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
