# 项目全周期管理 · 开发交接文档（HANDOFF / SUMMARY）

> 面向后续接手 agent。本文只记录关键信息，背景详见各源码文件注释。

## 1. 项目概览

- 纯前端原型项目，无后端；数据全部来自 mock（`frontend/src/mock/data.json`）与组件内联假数据。
- 技术栈：React + Vite + Ant Design v5 + React Router v6（`frontend/` 子目录）。
- 代码入口：`frontend/src/main.jsx` → `App.jsx`（全部路由）→ `layouts/MainLayout.jsx`（菜单/面包屑/顶部铃铛）。
- 构建/校验：`cd frontend && npx vite build`（有未使用 import 等 lint 不报，但 `undefined` 引用 vite build 可能不报，见 §6）。

### 路由一览（App.jsx）

| 路由 | 页面 |
|---|---|
| /project/mouhua(+/detail/:id) | 谋划 |
| /project/zaitan(+/detail/:id) | 跟踪洽谈（在谈） |
| /project/qianyue(+/detail/:id) | 签约注册 |
| /project/luodi(+/detail/:id) | 落地 |
| /project/yanpan(+/detail/:id) | 重复研判 |
| /project/tuiku(+/detail/:id) | 项目退库（detail 为只读历史页） |
| /dashboard/project、/performance | 项目看板、绩效 |
| /system/{account,role,log,field,overdue,notice,profile} | 系统管理 |

## 2. 已实现功能要点（业务闭环）

- 阶段流：谋划 →（转在谈）→ 在谈 →（转签约）→ 签约 →（转落地）→ 落地；任一阶段可"标记退库"（签约/落地已去掉退库）。
- 每阶段列表 + 详情页（基础信息/进展信息/分派情况 Tab），详情页可编辑、进展汇报、分派协同（AssignModal/FeedbackModal）。
- 各详情页用 `ProgressTimeline` 统一展示进展；系统事件（新增项目/阶段变更/决策更新/退库）自动写入时间线，操作人用实际操作人（非"系统"）。
- 重复研判（Yanpan/YanpanDetail）：L1-L4 四级判重规则 + 置信度阈值配置；市级项目编码一致=同一项目；字段一致性绿色高亮（✓ 一致）；库中已有数据可"查看详情"（新标签打开，按阶段自动路由）。
- 导入判重闭环（ImportModal + importDemoData + importStore）：上传→四步检测→结果（9 成功/2 疑似/1 跳过）→疑似进研判池置顶→消息通知。
- 分派协同（在谈/签约详情）含"处理中/已完成"统计与反馈记录。
- 落地详情页：只读展示；落地为最终阶段不再新增进展（用 ProgressTimeline `summaryExtra` 注示）。
- 超期提醒（system/Overdue）：谋划(45天)→在谈(30天)→签约(20天)→汇报提醒(7天)。
- 消息中心（system/Notice）：单列表展示；有 `projectId+stage` 的点击跳对应阶段详情页并已读；无 projectId（纯系统公告）仅已读。

## 3. 关键文件 / 共享逻辑

| 文件 | 职责 |
|---|---|
| components/GenericProjectList.jsx | 通用项目列表：`hiddenFilters`(按 key 隐藏默认筛选)、`onImport`、退库弹窗、统计行、action-col-cell 样式 |
| components/ProgressTimeline.jsx | 进展时间线（normal/system/decision 三种卡样式，summaryExtra 扩展统计行） |
| constants/uiStyles.jsx | COLORS / sectionTitleStyle / descriptionsProps / pageCardStyle / detailHeader 系列 / progress* 系列 / boolTag / emptyTag |
| store/viewStore.js | 视角切换(useViewRole)+msgStore(消息)+importStore(导入结果跨页注入)；**消息必须带 projectId/stage 才能跳转** |
| constants/assignConfig.js | 单位树(findUnitByKey)；constants/projectEnums.js、importDemoData.js |
| pages/Tuiku.jsx | 导出 `buildTuikuList()`（列表与详情页共用，保证刷新详情页可重建数据） |

## 4. 工程约定（改动时务必遵守）

- 主色 `#1677ff`，**禁止紫色**（按钮描边、新项目标签、统计卡色条均主蓝）。
- 列表：序号列固定左 55px 居中；操作列 class `action-col-cell`、右 padding 16px；固定右列用 `ant-table-cell-fix-end`；`tableLayout="fixed"`、scroll.x=列宽和。
- 详情页：`page-container`+`table-card`+`detailHeaderStyle`；返回按钮 text 型 `marginLeft:-8`；分类标题=4px 蓝竖线+10px padding；Descriptions 统一用 `descriptionsProps`(4列 bordered small)。
- 表单弹窗：两列栅格、label 在左、宽 960px、间距 24px（最新规范：横向弹窗；详情 Tab 统计行单行）。
- 转签约/退库等业务弹窗已统一 500 字 TextArea（showCount），容器 `marginBottom: 20` 防与按钮重叠。

## 5. 近期已落地变更（2026-09-03，本会话）

1. 退库列表 Tuiku.jsx：隐藏承接状态/审核状态/预警/企业性质筛选（hiddenFilters），去掉恢复，仅"详情"。
2. 新建 TuikuDetail.jsx：只读，头部红"已退库"+原阶段；三个 Tab=退库信息/基础信息(谋划退库空字段灰`-`)、进展信息(含退库系统事件)、分派情况(未完成任务标灰"已终止")；App.jsx 注册路由。
3. 消息中心：删审核类消息(todo1，区级不涉审核)；去掉"协作消息/系统通知/待办事项"来源标签(保留业务类型标签)；点击跳转修复=给 viewStore 消息补 `projectId/stage`（sys2→zaitan-2、sys3→zaitan-3、todo2→zaitan-4+action:report、m1/m2/m3→zaitan-1）。
4. 个人中心 Profile.jsx：去掉编辑资料（只读），Descriptions padding 改 `16px 24px`。
5. 退库弹窗间距：5 处文件（GenericProjectList/Mouhua/MouhuaDetail/Zaitan/ZaitanDetail）TextArea 容器 `marginBottom 8→20`。
6. 签约注册列表去掉退库入口；Qianyue.jsx/Zaitan.jsx 补导入按钮；列表/菜单"跟踪洽谈"去"(在谈)"后缀；Yanpan"视为新项目"按钮改主蓝。
7. 签约模块删除开工/投产/注销字段（范围仅签约，落地模块保留）：Qianyue.jsx 去"项目状态"列/Tag/状态筛选（scrollX 1900→1810）；QianyueDetail.jsx 去头部状态标签、"签约状态"区 是否开工/开工时间/是否投产/投产时间/项目状态 行及 statusTag/相关映射；QianyueEditModal.jsx 去 是否已开工/开工开业类型/开工(开业)时间/项目状态下拉；ZhuanQianyueModal.jsx 去 是否开工开业/发改经信认定开工/是否投产/实际竣工投产时间/经信认定投产/是否注销/预计投产时间（口径：状态不展示、"项目状态"下拉一并移除、预计投产时间删除）；mock/data.json qianyue 区块删 `是否已开工`/`开工/业时间` 键（159 处），luodi 区块不动。
8. 新增"项目统计分析"（重构 DashboardProject.jsx，菜单/面包屑由"项目维度看板"改名）：时间区间筛选（起止年月+今年至今/上半年/全部）→ 7 张通报口径 KPI（区间签约数/金额/落地数/到位资金/FDI + 当月签约/当月落地）→ 月度趋势图 + 园区对比图(含表格) → 当月签约/落地明细（搜索、分页、导出 .xlsx、行跳详情）。落地：`src/utils/projectStats.js` 统计口径工具；口径为 签约审核通过时间/落地审核通过时间/投资金额(亿元)/负责单位；"当月"=区间末月。新增依赖 `xlsx`。设计稿：`docs/项目统计分析板块-需求设计.md`（目标完成率等 v1.1 待做）。

## 6. 经验教训 / 高频踩坑

- **空白页根因多为缺失 import**（IDE 文件回滚删掉了 import；`npx vite build` 有时不报运行时 undefined，如 `useImported is not a function`、`SearchOutlined is not defined`、`<Text>` 与原生构造冲突）。修完先 `vite build` 再让用户 `Cmd+Shift+R` 强刷。
- 详情页新增/改造后务必检查 Timeline/Empty/Popconfirm/图标是否已 import。
- Modal destroyOnClose + form：重置字段需手动 resetFields。
- 时间解析兼容 `"2026-9-2"` 与 `"2026-08-26"`（replace - /）。

## 7. 待办（下一步）

~~核心待办：签约项目去掉以下字段组（是否开工/开业、发改/经信认定开工、是否投产、投产时间、经信认定投产、是否注销、是否开工、开工时间）~~ —— **已于 2026-09-03 完成**，详见 §5-7。

遗留提示：
- 本次范围仅签约模块；落地模块同类字段（实际开工时间(发改/经信)、投产时间(经信) 等 in ZhuanLuodiModal/LuodiEditModal/LuodiDetail/Luodi.jsx）有意保留。若后续需联动删除需另行处理。
- 签约详情顶部/列表不再展示"项目状态"；mock qianyue 记录仍保留 `项目状态`/`是否已注册`/`注册时间` 等注册信息键（正常使用）。

其他可优化项：无明显阻塞。

## 8. 验证方式

- 编译：`cd frontend && npx vite build`（退出码 0）。
- 联调：`npm run dev`（5173），改完**强刷**（Cmd+Shift+R）。
- 视角切换影响可见性/权限（顶栏角色模拟）。
