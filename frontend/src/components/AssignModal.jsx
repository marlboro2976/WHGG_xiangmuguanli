import { useState } from 'react'
import { Modal, Form, Select, Input, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { ALL_UNITS } from '../constants/assignConfig'

const { TextArea } = Input

// 文件图标
function getFileIcon(name) {
  if (!name) return '📄'
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '🖼️'
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (ext === 'pdf') return '📕'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
  return '📄'
}

// 自定义Option渲染：显示名称+接口人信息
function renderUnitOption(u) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{u.shortName || u.name}</span>
      {u.contact && <span style={{ fontSize: 12, color: '#bfbfbf' }}>{u.contact}</span>}
    </div>
  )
}

export default function AssignModal({ open, projectName, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const { units = [], content = '' } = values
      if (units.length === 0) {
        message.warning('请至少选择一个接收单位')
        return
      }
      setLoading(true)
      const selected = units.map(key => {
        const u = ALL_UNITS.find(x => x.key === key)
        return { unitKey: key, unitName: u.name, contact: u.contact }
      })
      const attachments = fileList.map(f => ({
        uid: f.uid,
        name: f.name,
        url: f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : ''),
        isImage: ['jpg','jpeg','png','gif','bmp','webp'].includes((f.name||'').split('.').pop().toLowerCase()),
      }))
      onOk && onOk({
        targets: selected,
        content,
        attachments,
      })
      form.resetFields()
      setFileList([])
    } catch (e) {
      // validate error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setFileList([])
    onCancel && onCancel()
  }

  const uploadProps = {
    multiple: true,
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
    accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt',
  }

  // 按关键字过滤组织（匹配名称、简称、接口人）
  const filterOption = (input, option) => {
    const keyword = (input || '').toLowerCase()
    const u = ALL_UNITS.find(x => x.key === option.value)
    if (!u) return false
    return (
      (u.name || '').toLowerCase().includes(keyword) ||
      (u.shortName || '').toLowerCase().includes(keyword) ||
      (u.contact || '').toLowerCase().includes(keyword)
    )
  }

  return (
    <Modal
      title={`新增协作分派 · ${projectName || ''}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认分派"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          label="接收单位"
          name="units"
          rules={[{ required: true, message: '请选择接收单位' }]}
          tooltip="从OA组织架构中选择，支持按部门名称、接口人搜索，可多选"
        >
          <Select
            mode="multiple"
            placeholder="请选择接收单位（可搜索、可多选）"
            allowClear
            showSearch
            filterOption={filterOption}
            options={ALL_UNITS.map(u => ({
              label: u.shortName || u.name,
              value: u.key,
              labelRender: renderUnitOption(u),
            }))}
            optionRender={(opt) => renderUnitOption(ALL_UNITS.find(u => u.key === opt.value))}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item
          label="协同事项说明"
          name="content"
          rules={[{ max: 500, message: '说明不能超过500字' }]}
        >
          <TextArea
            placeholder="请说明需要协同的具体事项，如：请协助对接高企认定政策，评估该企业入选光谷英才计划可能性"
            autoSize={{ minRows: 3, maxRows: 6 }}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="附件">
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
              支持图片、Word、Excel、PDF、压缩包等常见格式，单个不超过20MB，最多9个
            </p>
          </Upload.Dragger>
          {fileList.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileList.map(f => (
                <div key={f.uid} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 12,
                }}>
                  <span>{getFileIcon(f.name)}</span>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
      <div style={{
        marginTop: 4, padding: '8px 12px', background: '#e6f4ff', borderRadius: 4,
        fontSize: 12, color: '#1677ff',
      }}>
        💡 提示：选择多个接收单位后，系统将自动拆分为多条分派记录，每个单位独立跟踪处理进度。
      </div>
    </Modal>
  )
}
