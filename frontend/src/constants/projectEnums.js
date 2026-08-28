// 项目分类
export const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']

// 内外资
export const CAPITAL_NATURE_OPTIONS = ['内资', '外资']

// 产业类别
export const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

// 企业性质
export const ENTERPRISE_NATURE_OPTIONS = ['国企（央企）', '国企（地方）', '民企', '外企（独资）', '外企(合资或合伙)']

// 企业类别
export const ENTERPRISE_CATEGORY_OPTIONS = [
  '省级高新技术企业', '国家级高新技术企业', '国家级专精特新', '省级专精特新',
  '省级瞪羚企业', '国家级瞪羚企业', '金种子', '省级独角兽', '国家级独角兽企业',
  '潜在独角兽', '世界500强', '中国500强', '中国民营500强', '中国服务业500强',
  '国家级专精特新"小巨人"', '省级专精特新"小巨人"', '中国制造业500强', '新经济500强', '其它'
]

// 是否存量企业
export const STOCK_ENTERPRISE_TYPE_OPTIONS = ['为存量企业新项目投资', '为存量企业技改投资', '其他']

// 注册资本单位
export const CAPITAL_UNIT_OPTIONS = ['万元', '亿元']

// 所属"五谷"优势产业集群
export const WUGU_OPTIONS = ['光谷优势产业集群', '车谷优势产业集群', '网谷优势产业集群', '星谷优势产业集群', '药谷优势产业集群', '不涉及']

// 所属片区
export const BELONG_AREA_OPTIONS = ['临空港片区', '阳逻港片区', '不涉及']

// 建设性质
export const CONSTRUCTION_NATURE_OPTIONS = ['新建', '扩建', '改建', '技改', '开业', '其它']

// 招商类型
export const MERCHANT_TYPE_OPTIONS = ['产业链招商', '资本链招商（股权融资）', '科创链招商', '场景招商', '央地合作', '人才招引（楚商校友）', '其它']

// 交办层级
export const ASSIGNED_LEVEL_OPTIONS = ['书记', '市长', '副市长', '非领导交办', '区主要领导', '区分管领导', '区投促局领导']

// 电话核实情况暂无枚举值，使用文本输入

// 楚商类型
export const CHUSHANG_TYPE_OPTIONS = ['湖北籍企业家', '武汉校友', '武大校友', '华科校友', '非楚商', '泛楚商']

// 问题类型（多选）
export const ISSUE_TYPE_OPTIONS = ['资金', '土地', '政策', '审批', '其他']

// 外溢来源（武汉各区）
export const OVERFLOW_SOURCE_OPTIONS = [
  '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区',
  '蔡甸区', '江夏区', '黄陂区', '新洲区', '东湖高新区', '武汉经开区',
  '武汉临空港', '长江新区'
]

// 国内省份/城市（简化版，用于来源地）
export const DOMESTIC_REGION_OPTIONS = [
  { value: '北京', label: '北京', children: [{ value: '北京市', label: '北京市' }] },
  { value: '上海', label: '上海', children: [{ value: '上海市', label: '上海市' }] },
  { value: '天津', label: '天津', children: [{ value: '天津市', label: '天津市' }] },
  { value: '重庆', label: '重庆', children: [{ value: '重庆市', label: '重庆市' }] },
  { value: '广东', label: '广东', children: [
    { value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' },
    { value: '珠海市', label: '珠海市' }, { value: '佛山市', label: '佛山市' },
    { value: '东莞市', label: '东莞市' }, { value: '中山市', label: '中山市' }
  ]},
  { value: '江苏', label: '江苏', children: [
    { value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' },
    { value: '无锡市', label: '无锡市' }, { value: '常州市', label: '常州市' },
    { value: '南通市', label: '南通市' }
  ]},
  { value: '浙江', label: '浙江', children: [
    { value: '杭州市', label: '杭州市' }, { value: '宁波市', label: '宁波市' },
    { value: '温州市', label: '温州市' }, { value: '嘉兴市', label: '嘉兴市' }
  ]},
  { value: '安徽', label: '安徽', children: [
    { value: '合肥市', label: '合肥市' }, { value: '芜湖市', label: '芜湖市' },
    { value: '蚌埠市', label: '蚌埠市' }
  ]},
  { value: '湖北', label: '湖北', children: [
    { value: '武汉市', label: '武汉市' }, { value: '宜昌市', label: '宜昌市' },
    { value: '襄阳市', label: '襄阳市' }, { value: '黄冈市', label: '黄冈市' }
  ]},
  { value: '湖南', label: '湖南', children: [
    { value: '长沙市', label: '长沙市' }, { value: '株洲市', label: '株洲市' }
  ]},
  { value: '四川', label: '四川', children: [
    { value: '成都市', label: '成都市' }, { value: '绵阳市', label: '绵阳市' }
  ]},
  { value: '山东', label: '山东', children: [
    { value: '济南市', label: '济南市' }, { value: '青岛市', label: '青岛市' },
    { value: '烟台市', label: '烟台市' }
  ]},
  { value: '河南', label: '河南', children: [
    { value: '郑州市', label: '郑州市' }, { value: '洛阳市', label: '洛阳市' }
  ]},
  { value: '福建', label: '福建', children: [
    { value: '福州市', label: '福州市' }, { value: '厦门市', label: '厦门市' },
    { value: '泉州市', label: '泉州市' }
  ]},
  { value: '河北', label: '河北', children: [
    { value: '石家庄市', label: '石家庄市' }, { value: '唐山市', label: '唐山市' }
  ]},
  { value: '陕西', label: '陕西', children: [{ value: '西安市', label: '西安市' }] },
  { value: '辽宁', label: '辽宁', children: [
    { value: '沈阳市', label: '沈阳市' }, { value: '大连市', label: '大连市' }
  ]},
]

// 国外国家列表（简化版）
export const FOREIGN_COUNTRY_OPTIONS = [
  '美国', '加拿大', '英国', '法国', '德国', '意大利', '西班牙', '荷兰', '比利时',
  '瑞士', '瑞典', '挪威', '丹麦', '芬兰', '日本', '韩国', '新加坡', '澳大利亚', '新西兰'
]

// 行业类别级联（门类→大类）
export const INDUSTRY_CASCADER_OPTIONS = [
  { value: '民生保障类', label: '民生保障类', children: [] },
  { value: '基础设施建设类', label: '基础设施建设类', children: [] },
  { value: '"光芯屏端网"新一代信息技术', label: '"光芯屏端网"新一代信息技术', children: [
    { value: '光通信', label: '光通信' }, { value: '高性能集成电路', label: '高性能集成电路' },
    { value: '新型显示', label: '新型显示' }, { value: '未来显示', label: '未来显示' },
    { value: '激光', label: '激光' }, { value: '信息通信设备及智能终端', label: '信息通信设备及智能终端' },
    { value: '大数据与云计算', label: '大数据与云计算' }, { value: '先进半导体', label: '先进半导体' },
    { value: '其他', label: '其他' }
  ]},
  { value: '软件和网络安全', label: '软件和网络安全', children: [
    { value: '网络安全', label: '网络安全' }, { value: '未来网络', label: '未来网络' },
    { value: '物联网', label: '物联网' }, { value: '自主可控软件', label: '自主可控软件' },
    { value: '软件信息服务', label: '软件信息服务' }, { value: '其他', label: '其他' },
    { value: '数字经济', label: '数字经济' }, { value: '网游电竞', label: '网游电竞' },
    { value: '直播电竞', label: '直播电竞' }
  ]},
  { value: '量子科技', label: '量子科技', children: [
    { value: '光量子芯片与通信', label: '光量子芯片与通信' }, { value: '量子感知', label: '量子感知' },
    { value: '量子计算', label: '量子计算' }, { value: '其他', label: '其他' }
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '3D打印与激光加工装备', label: '3D打印与激光加工装备' },
    { value: '海洋工程装备及高技术船舶', label: '海洋工程装备及高技术船舶' },
    { value: '飞机装备制造', label: '飞机装备制造' },
    { value: '轨道交通装备', label: '轨道交通装备' },
    { value: '高端舰船制造', label: '高端舰船制造' },
    { value: '智能家居', label: '智能家居' }, { value: '其他', label: '其他' },
    { value: '高速轨道交通', label: '高速轨道交通' }
  ]},
  { value: '大健康和生物技术', label: '大健康和生物技术', children: [
    { value: '生物医药', label: '生物医药' }, { value: '医疗器械', label: '医疗器械' },
    { value: '医药流通', label: '医药流通' }, { value: '健康服务', label: '健康服务' },
    { value: '健康食品', label: '健康食品' }, { value: '生物制造', label: '生物制造' },
    { value: '脑机接口', label: '脑机接口' }, { value: '其他', label: '其他' }
  ]},
  { value: '汽车制造和服务', label: '汽车制造和服务', children: [
    { value: '新能源汽车', label: '新能源汽车' },
    { value: '智能出行(含无人驾驶和网联汽车)', label: '智能出行(含无人驾驶和网联汽车)' },
    { value: '关键零部件', label: '关键零部件' },
    { value: '新型储能电池', label: '新型储能电池' },
    { value: '氢能', label: '氢能' }, { value: '其他', label: '其他' }
  ]},
  { value: '数字创意', label: '数字创意', children: [
    { value: '创意设计', label: '创意设计' }, { value: '网络文学', label: '网络文学' },
    { value: '影视音乐', label: '影视音乐' }, { value: '线上演播', label: '线上演播' },
    { value: '动漫游戏', label: '动漫游戏' }, { value: '数字出版', label: '数字出版' },
    { value: '元宇宙', label: '元宇宙' }, { value: '其他', label: '其他' }
  ]},
  { value: '深地深海深空', label: '深地深海深空', children: [
    { value: '地球深部勘探开发', label: '地球深部勘探开发' },
    { value: '深海装备', label: '深海装备' },
    { value: '传感网络开发', label: '传感网络开发' },
    { value: '深空对地探测', label: '深空对地探测' },
    { value: '其他', label: '其他' }
  ]},
  { value: '超级计算和人工智能', label: '超级计算和人工智能', children: [
    { value: '高性能计算', label: '高性能计算' },
    { value: '操作系统', label: '操作系统' },
    { value: '云服务和人工智能大模型', label: '云服务和人工智能大模型' },
    { value: '智能机器人', label: '智能机器人' },
    { value: '人形状机器人', label: '人形状机器人' },
    { value: '虚拟现实', label: '虚拟现实' },
    { value: '机器视觉', label: '机器视觉' },
    { value: '其他', label: '其他' }
  ]},
  { value: '绿色环保', label: '绿色环保', children: [
    { value: '高效节能', label: '高效节能' }, { value: '先进节能', label: '先进节能' },
    { value: '资源循环利用', label: '资源循环利用' }, { value: '其他', label: '其他' }
  ]},
  { value: '航空航天和空天信息', label: '航空航天和空天信息', children: [
    { value: '其他', label: '其他' }, { value: '低空经济', label: '低空经济' },
    { value: '北斗', label: '北斗' },
    { value: '地球空间信息应用服务', label: '地球空间信息应用服务' },
    { value: '地球空间信息产品开发', label: '地球空间信息产品开发' },
    { value: '地球空间信息平台建设', label: '地球空间信息平台建设' },
    { value: '航空装备', label: '航空装备' }, { value: '航天装备', label: '航天装备' }
  ]},
  { value: '电磁能', label: '电磁能', children: [
    { value: '电磁装备与制造', label: '电磁装备与制造' }, { value: '其他', label: '其他' }
  ]},
  { value: '文化旅游', label: '文化旅游', children: [
    { value: '文化', label: '文化' }, { value: '旅游', label: '旅游' },
    { value: '体育', label: '体育' }, { value: '教育', label: '教育' },
    { value: '其他', label: '其他' }
  ]},
  { value: '智能建造', label: '智能建造', children: [
    { value: '房建', label: '房建' }, { value: '市政', label: '市政' },
    { value: '水利', label: '水利' }, { value: '公路', label: '公路' },
    { value: '建筑服务', label: '建筑服务' }, { value: '其他', label: '其他' }
  ]},
  { value: '现代金融', label: '现代金融', children: [
    { value: '银行', label: '银行' }, { value: '保险', label: '保险' },
    { value: '证券', label: '证券' }, { value: '保理', label: '保理' },
    { value: '基金', label: '基金' }, { value: '其他', label: '其他' }
  ]},
  { value: '商贸物流', label: '商贸物流', children: [
    { value: '商务商贸', label: '商务商贸' }, { value: '商务会展', label: '商务会展' },
    { value: '商贸流通', label: '商贸流通' }, { value: '电子商务', label: '电子商务' },
    { value: '现代物流', label: '现代物流' }, { value: '航运物流', label: '航运物流' },
    { value: '港口物流', label: '港口物流' }, { value: '其他', label: '其他' }
  ]},
  { value: '新能源类', label: '新能源类', children: [
    { value: '海洋核能', label: '海洋核能' }, { value: '光伏发电', label: '光伏发电' },
    { value: '风能', label: '风能' }, { value: '生物质能', label: '生物质能' },
    { value: '其他', label: '其他' }
  ]},
]

// 965产业链类别级联（主链→子链）
export const CHAIN_965_CASCADER_OPTIONS = [
  { value: '光电子信息', label: '光电子信息', children: [
    { value: '光通信', label: '光通信' }, { value: '集成电路', label: '集成电路' },
    { value: '新型显示', label: '新型显示' }, { value: '智能终端', label: '智能终端' },
    { value: '激光', label: '激光' }
  ]},
  { value: '新能源与智能网联汽车', label: '新能源与智能网联汽车', children: [
    { value: '新能源汽车', label: '新能源汽车' },
    { value: '智能网联汽车', label: '智能网联汽车' },
    { value: '动力电池', label: '动力电池' }, { value: '车规芯片', label: '车规芯片' }
  ]},
  { value: '生命健康', label: '生命健康', children: [
    { value: '生物医药', label: '生物医药' }, { value: '高端医疗器械', label: '高端医疗器械' },
    { value: '精准医疗', label: '精准医疗' }, { value: '脑科学', label: '脑科学' }
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '航空航天', label: '航空航天' }, { value: '海洋装备', label: '海洋装备' },
    { value: '轨道交通', label: '轨道交通' }, { value: '智能装备', label: '智能装备' }
  ]},
  { value: '北斗和空天信息', label: '北斗和空天信息', children: [
    { value: '卫星导航', label: '卫星导航' }, { value: '地理信息', label: '地理信息' },
    { value: '遥感应用', label: '遥感应用' }
  ]},
  { value: '人工智能', label: '人工智能', children: [
    { value: '大模型与算法', label: '大模型与算法' },
    { value: 'AI芯片', label: 'AI芯片' },
    { value: '智能机器人', label: '智能机器人' }
  ]},
  { value: '数字经济', label: '数字经济', children: [
    { value: '云计算与大数据', label: '云计算与大数据' },
    { value: '网络安全', label: '网络安全' },
    { value: '区块链', label: '区块链' }
  ]},
  { value: '新材料', label: '新材料', children: [
    { value: '先进半导体材料', label: '先进半导体材料' },
    { value: '新能源材料', label: '新能源材料' },
    { value: '生物医用材料', label: '生物医用材料' }
  ]},
  { value: '新能源', label: '新能源', children: [
    { value: '氢能', label: '氢能' }, { value: '光伏', label: '光伏' },
    { value: '储能', label: '储能' }, { value: '智慧能源', label: '智慧能源' }
  ]},
]

// 核心决策节点选项（按项目分类+投资额联动）
export const CORE_DECISION_OPTIONS = {
  policy: ['投委会', '常务会'],
  investLarge: ['国企投决会', '投委会', '常务会'],
  investSmall: ['不涉及'],
  land: ['投委会', '常务会', '供地会'],
  other: ['不涉及'],
}
