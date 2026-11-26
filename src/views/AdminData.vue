<template>
  <main class="admin-page">
    <header class="admin-header">
      <div class="header-top">
        <div>
          <h1>数据管理中心</h1>
          <p class="mode-meta">
            当前模式：<strong>{{ modeLabel }}</strong>
            <span v-if="draft.updatedAt"> · 更新于 {{ formatTime(draft.updatedAt) }}</span>
          </p>
        </div>
        <div class="header-actions">
          <button class="btn ghost" type="button" @click="exitAdmin">
            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            <span>退出后台</span>
          </button>
          <button class="btn secondary refresh-btn" type="button" :disabled="refreshing" @click="handleRefreshData">
            <svg class="btn-icon refresh-icon" :class="{ spinning: refreshing }" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" />
            </svg>
            <span>{{ refreshing ? '同步中...' : '刷新同步' }}</span>
          </button>
          <button class="btn ghost icon-btn" type="button" aria-label="重新加载页面" title="重新加载页面" @click="reloadPage">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.66 5.66L4 15.5M4 20v-4.5h4.5" />
            </svg>
          </button>
          <button class="btn primary" type="button" :disabled="saving" @click="handleSave">
            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
            <span>{{ saving ? '保存中...' : '保存生效' }}</span>
          </button>
        </div>
      </div>

      <nav class="admin-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <section class="admin-body">
      <div v-if="dataError" class="banner-warn">{{ dataError }}</div>
      <div v-if="dataMode === 'remote-json'" class="banner-info">
        当前为静态 JSON 模式：点击「保存生效」仅更新本机预览缓存，如需多端同步请点击「导入/导出」导出 JSON 后覆盖发布文件。
      </div>

      <!-- 1. 个人信息 -->
      <div v-show="activeTab === 'profile'" class="panel">
        <h2>基础档案</h2>
        <div class="field-grid">
          <label class="field">
            <span>姓名</span>
            <input v-model.trim="draft.profile.name" type="text" placeholder="演示姓名" />
          </label>
          <label class="field">
            <span>纳税人识别号（演示占位）</span>
            <input v-model.trim="draft.profile.taxpayerId" type="text" placeholder="18位合成号码" />
          </label>
        </div>

        <h2 class="sub-heading">「我的」快捷卡片</h2>
        <div class="list-stack">
          <div v-for="(item, index) in draft.profile.quickItems" :key="index" class="row-card compact-row">
            <label class="field">
              <span>标题</span>
              <input v-model.trim="item.title" type="text" />
            </label>
            <label class="field">
              <span>状态标签</span>
              <input v-model.trim="item.value" type="text" />
            </label>
            <label class="checkbox-field">
              <input v-model="item.filled" type="checkbox" />
              <span>蓝色实心标签</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 2. 收入纳税明细 -->
      <div v-show="activeTab === 'tax'" class="panel">
        <div class="create-card">
          <div class="create-header">
            <h2>新增纳税明细</h2>
            <div class="mode-switch" role="tablist" aria-label="创建方式">
              <button
                type="button"
                role="tab"
                :aria-selected="taxCreateMode === 'single'"
                :class="{ active: taxCreateMode === 'single' }"
                @click="taxCreateMode = 'single'"
              >
                单月新增
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="taxCreateMode === 'batch'"
                :class="{ active: taxCreateMode === 'batch' }"
                @click="taxCreateMode = 'batch'"
              >
                批量生成
              </button>
            </div>
          </div>

          <div v-if="taxCreateMode === 'single'" class="create-body">
            <p class="create-desc">按单个所属月份新增记录，创建后可在下方列表展开微调各项数据。</p>
            <div class="single-create-row">
              <input v-model.trim="newMonthPeriod" class="month-input" type="text" placeholder="YYYY-MM（如 2026-10）" />
              <button class="btn primary" type="button" @click="addMonth">
                <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                <span>新增该月</span>
              </button>
            </div>
          </div>

          <div v-else class="create-body">
            <p class="create-desc">一次生成多月工资薪金并按累计预扣法自动算税，或将专项附加扣除同步到已有工资。</p>
            <div class="field-grid">
              <label class="field">
                <span>纳税年度</span>
                <input v-model.number="batchForm.year" type="number" min="2019" max="2035" />
              </label>
              <label class="field">
                <span>起始月份 (1-12)</span>
                <input v-model.number="batchForm.startMonth" type="number" min="1" max="12" />
              </label>
              <label class="field">
                <span>结束月份 (1-12)</span>
                <input v-model.number="batchForm.endMonth" type="number" min="1" max="12" />
              </label>
              <label class="field">
                <span>月度税前工资（元）</span>
                <input v-model.trim="batchForm.income" type="text" inputmode="decimal" />
              </label>
              <label class="field">
                <span>月度专项扣除/三险一金（元）</span>
                <input v-model.trim="batchForm.specialDeduction" type="text" inputmode="decimal" />
              </label>
              <label class="field">
                <span>月度专项附加扣除（元）</span>
                <input v-model.trim="batchForm.specialAdditionalDeduction" type="text" inputmode="decimal" placeholder="租房: 1500 / 1100 / 800" />
              </label>
              <label class="field">
                <span>专项附加扣除项目</span>
                <input v-model.trim="batchForm.specialAdditionalDeductionName" type="text" placeholder="如：住房租金" />
              </label>
              <label class="field">
                <span>月度个人养老金（元）</span>
                <input v-model.trim="batchForm.personalPension" type="text" inputmode="decimal" />
              </label>
              <label class="field">
                <span>月度其他扣除（元）</span>
                <input v-model.trim="batchForm.otherDeduction" type="text" inputmode="decimal" />
              </label>
              <label class="field">
                <span>扣缴义务人名称</span>
                <input v-model.trim="batchForm.withholdingAgent" type="text" />
              </label>
              <label class="field">
                <span>扣缴义务人识别号</span>
                <input v-model.trim="batchForm.withholdingAgentTaxId" type="text" />
              </label>
              <label class="field">
                <span>主管税务机关</span>
                <input v-model.trim="batchForm.taxAuthority" type="text" />
              </label>
            </div>
            <div class="batch-actions">
              <label class="checkbox-field">
                <input v-model="batchForm.replaceSameYearWage" type="checkbox" />
                <span>替换该年度已有工资薪金记录</span>
              </label>
              <div class="inline-actions">
                <button class="btn secondary" type="button" @click="applySpecialAdditionalToAllWages">
                  <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" /></svg>
                  <span>同步专项附加扣除</span>
                </button>
                <button class="btn primary" type="button" @click="generateBatchWages">
                  <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                  <span>批量生成并算税</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tax-list-section">
          <div class="tax-list-head">
            <h2>已录入明细（{{ draft.taxMonths.length }} 个月 / {{ totalRecordCount }} 条）</h2>
            <button class="btn small secondary" type="button" @click="recalculateAllTax">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" /></svg>
              <span>重算全部税额</span>
            </button>
          </div>
          <div class="auto-calc-bar">
            <label class="checkbox-field">
              <input v-model="autoRecalcOnSave" type="checkbox" />
              <span>保存时自动按现行个税政策（累计预扣法）重算税额</span>
            </label>
          </div>
        </div>

        <div v-if="draft.taxMonths.length === 0" class="empty-tip">暂无月份数据，请先通过上方新增。</div>

        <div v-for="(month, mIdx) in draft.taxMonths" :key="month.period + '-' + mIdx" class="month-block">
          <div class="month-head">
            <div class="month-title">
              <input v-model.trim="month.period" class="period-input" type="text" aria-label="所属月份" />
              <span class="badge-count">{{ month.records.length }} 条</span>
            </div>
            <div class="inline-actions">
              <button class="btn small secondary" type="button" @click="addRecordToMonth(month)">
                <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                <span>新增明细</span>
              </button>
              <button class="btn icon-btn danger" type="button" aria-label="删除月份" title="删除月份" @click="removeMonth(mIdx)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
              </button>
            </div>
          </div>

          <details v-for="(rec, rIdx) in month.records" :key="rec.id + '-' + rIdx" class="record-item">
            <summary>
              <span class="rec-summary-main">
                <strong>{{ rec.incomeType }}</strong> · {{ rec.withholdingAgent || '未填单位' }}
              </span>
              <span class="rec-summary-meta">收入 {{ rec.income }}元 / 税额 {{ rec.reportedTax }}元</span>
            </summary>

            <div class="record-form">
              <div class="field-grid">
                <label class="field">
                  <span>唯一 ID</span>
                  <input v-model.trim="rec.id" type="text" />
                </label>
                <label class="field">
                  <span>所得类型</span>
                  <select v-model="rec.incomeType">
                    <option v-for="t in allIncomeTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>
                <label class="field">
                  <span>所得项目小类</span>
                  <input v-model.trim="rec.incomeSubtype" type="text" />
                </label>
                <label class="field">
                  <span>扣缴义务人名称</span>
                  <input v-model.trim="rec.withholdingAgent" type="text" />
                </label>
                <label class="field">
                  <span>扣缴义务人识别号</span>
                  <input v-model.trim="rec.withholdingAgentTaxId" type="text" />
                </label>
                <label class="field">
                  <span>主管税务机关</span>
                  <input v-model.trim="rec.taxAuthority" type="text" />
                </label>
                <label class="field">
                  <span>申报渠道</span>
                  <input v-model.trim="rec.declarationChannel" type="text" />
                </label>
                <label class="field">
                  <span>申报日期</span>
                  <input v-model.trim="rec.declarationDate" type="text" placeholder="YYYY-MM-DD" />
                </label>
                <label class="field">
                  <span>收入（元）</span>
                  <input v-model.trim="rec.income" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>免税收入（元）</span>
                  <input v-model.trim="rec.taxExemptIncome" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>费用（元，工资薪金为0）</span>
                  <input v-model.trim="rec.expense" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>减除费用（元，工资默认5000）</span>
                  <input v-model.trim="rec.basicDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>专项扣除/三险一金（元）</span>
                  <input v-model.trim="rec.specialDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>专项附加扣除（元）</span>
                  <input v-model.trim="rec.specialAdditionalDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>专项附加扣除项目</span>
                  <input v-model.trim="rec.specialAdditionalDeductionName" type="text" placeholder="如：住房租金" />
                </label>
                <label class="field">
                  <span>个人养老金（元）</span>
                  <input v-model.trim="rec.personalPension" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>其他扣除（元）</span>
                  <input v-model.trim="rec.otherDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>准予扣除的捐赠额（元）</span>
                  <input v-model.trim="rec.donationDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>减免税额（元）</span>
                  <input v-model.trim="rec.taxRelief" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>累计应纳税所得额（自动算）</span>
                  <input v-model.trim="rec.taxableIncome" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>税率 / 预扣率（自动算）</span>
                  <input v-model.trim="rec.taxRate" type="text" />
                </label>
                <label class="field">
                  <span>速算扣除数（自动算）</span>
                  <input v-model.trim="rec.quickDeduction" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>累计应纳税额（自动算）</span>
                  <input v-model.trim="rec.taxDue" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>前期累计已缴税额（自动算）</span>
                  <input v-model.trim="rec.taxPaid" type="text" inputmode="decimal" />
                </label>
                <label class="field">
                  <span>本期已申报税额（自动算）</span>
                  <input v-model.trim="rec.reportedTax" type="text" inputmode="decimal" />
                </label>
              </div>
              <div class="record-footer">
                <button class="btn small secondary" type="button" @click="duplicateRecord(month, rec)">
                  <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  <span>复制一条</span>
                </button>
                <button class="btn icon-btn danger" type="button" aria-label="删除明细" title="删除明细" @click="removeRecord(month, rIdx)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- 3. 消息管理 -->
      <div v-show="activeTab === 'messages'" class="panel">
        <div class="panel-head">
          <h2>消息列表（{{ draft.messages.length }} 条）</h2>
          <div class="inline-actions">
            <button class="btn primary" type="button" @click="syncMessagesFromTax">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" /></svg>
              <span>按纳税明细同步</span>
            </button>
            <button class="btn secondary" type="button" @click="addMessage">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              <span>新增消息</span>
            </button>
          </div>
        </div>
        <div class="list-stack">
          <details v-for="(msg, index) in draft.messages" :key="msg.id + '-' + index" class="record-item message-record-item">
            <summary>
              <span class="msg-summary-main">
                <i v-if="msg.unread" class="msg-unread-dot" aria-label="未读"></i>
                <strong>{{ msg.title || '未命名消息' }}</strong>
                <span class="msg-kind-tag">{{ msg.kind === 'tax' ? '重要提醒' : '温馨提示' }}</span>
              </span>
              <span class="rec-summary-meta">{{ msg.date || '未填日期' }}</span>
            </summary>

            <div class="record-form">
              <div class="field-grid">
                <label class="field">
                  <span>标题</span>
                  <input v-model.trim="msg.title" type="text" />
                </label>
                <label class="field">
                  <span>日期</span>
                  <input v-model.trim="msg.date" type="text" placeholder="YYYY-MM-DD" />
                </label>
                <label class="field">
                  <span>图标类型</span>
                  <select v-model="msg.kind">
                    <option value="notice">温馨提示 (notice)</option>
                    <option value="tax">重要提醒 (tax)</option>
                  </select>
                </label>
                <label class="field field-wide">
                  <span>摘要文案</span>
                  <input v-model.trim="msg.preview" type="text" />
                </label>
              </div>
              <div class="record-footer">
                <label class="checkbox-field">
                  <input v-model="msg.unread" type="checkbox" />
                  <span>标记未读</span>
                </label>
                <button class="btn icon-btn danger" type="button" aria-label="删除消息" title="删除消息" @click="draft.messages.splice(index, 1)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- 4. 首页公告 -->
      <div v-show="activeTab === 'home'" class="panel">
        <div class="panel-head">
          <h2>首页滚动通知（{{ draft.home.notices.length }} 条）</h2>
          <button class="btn secondary" type="button" @click="draft.home.notices.push('')">
            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            <span>新增通知</span>
          </button>
        </div>
        <div class="list-stack">
          <div v-for="(_, index) in draft.home.notices" :key="index" class="notice-edit-row">
            <input v-model.trim="draft.home.notices[index]" type="text" placeholder="请输入公告内容" />
            <button class="btn icon-btn danger" type="button" aria-label="删除通知" title="删除通知" @click="draft.home.notices.splice(index, 1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 5. 完整数据导入/导出 -->
      <div v-show="activeTab === 'sync'" class="panel">
        <h2>完整数据导入 / 导出</h2>
        <p class="help-text">
          包含<strong>个人信息、全部月份收入纳税明细、消息列表、首页公告与政策内容</strong>的完整快照（<code>schema v{{ draft.version }}</code>），可用于跨设备迁移、演示存档或与后台服务协同。
        </p>

        <div class="summary-grid">
          <div class="summary-tile">
            <span>当前姓名</span>
            <strong>{{ draft.profile.name || '-' }}</strong>
          </div>
          <div class="summary-tile">
            <span>纳税明细</span>
            <strong>{{ draft.taxMonths.length }} 月 / {{ totalRecordCount }} 条</strong>
          </div>
          <div class="summary-tile">
            <span>消息列表</span>
            <strong>{{ draft.messages.length }} 条</strong>
          </div>
          <div class="summary-tile">
            <span>首页公告</span>
            <strong>{{ draft.home.notices.length }} 条</strong>
          </div>
        </div>

        <div v-if="dataMode === 'api'" class="field" style="margin-bottom: 14px;">
          <span>后台写入 Token（可选，随 Authorization Bearer 发送）</span>
          <input v-model.trim="apiToken" type="password" placeholder="如后端要求鉴权可填写" />
        </div>

        <div class="sync-card">
          <h3>导出完整数据</h3>
          <div class="sync-actions">
            <button class="btn primary" type="button" @click="downloadJson">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              <span>下载完整 JSON 文件</span>
            </button>
            <button class="btn secondary" type="button" @click="copyJson">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              <span>复制完整 JSON</span>
            </button>
            <button class="btn ghost" type="button" @click="downloadTemplateJson">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5" /></svg>
              <span>下载标准模板</span>
            </button>
            <button class="btn ghost" type="button" @click="showExportPreview = !showExportPreview">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
              <span>{{ showExportPreview ? '收起 JSON 预览' : '预览当前 JSON' }}</span>
            </button>
          </div>
          <pre v-if="showExportPreview" class="json-preview">{{ currentDraftJson }}</pre>
        </div>

        <div class="sync-card">
          <h3>导入完整数据</h3>
          <div class="sync-actions">
            <label class="btn secondary file-label">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              <span>选择 JSON 文件读取</span>
              <input type="file" accept="application/json,.json" hidden @change="handleFileSelect" />
            </label>
            <label class="checkbox-field">
              <input v-model="recalcOnImport" type="checkbox" />
              <span>导入后自动按个税政策重算税额</span>
            </label>
          </div>

          <label class="field" style="margin-top: 12px;">
            <span>粘贴或编辑待导入的完整 JSON</span>
            <textarea
              v-model="importText"
              rows="8"
              placeholder="选择 JSON 文件后会自动填充到此，也可直接粘贴完整 JSON 内容..."
              @input="importPreview = null; importErrors = []"
            ></textarea>
          </label>

          <div v-if="importErrors.length > 0" class="banner-warn" style="margin-top: 10px; margin-bottom: 0;">
            <div v-for="(err, idx) in importErrors" :key="idx">• {{ err }}</div>
          </div>

          <div v-if="importPreview" class="import-preview-box">
            <strong>校验通过，待导入数据摘要：</strong>
            <span>姓名 {{ importPreview.name }} · 纳税明细 {{ importPreview.months }} 个月 / {{ importPreview.records }} 条 · 消息 {{ importPreview.messages }} 条 · 公告 {{ importPreview.notices }} 条</span>
          </div>

          <div class="sync-actions" style="margin-top: 12px;">
            <button class="btn secondary" type="button" :disabled="!importText.trim()" @click="validateImportText">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></svg>
              <span>校验数据</span>
            </button>
            <button class="btn primary" type="button" :disabled="!importText.trim() || importing" @click="applyImportedText">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
              <span>{{ importing ? '导入中...' : '确认覆盖导入' }}</span>
            </button>
            <button v-if="importText" class="btn ghost" type="button" @click="clearImportInput">
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
              <span>清空</span>
            </button>
          </div>
        </div>

        <div class="sync-card danger-zone">
          <h3>数据重置</h3>
          <p class="help-text" style="margin-bottom: 10px;">将清除当前所有自定义修改并恢复为内置默认演示数据。</p>
          <button class="btn danger" type="button" @click="handleReset">
            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8M3 3v5h5" /></svg>
            <span>恢复默认数据</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { allIncomeTypes, cloneData, createDefaultAppData, createEmptyTaxRecord, normalizeAppData, syncMessagesFromTaxMonths, validateAppData } from '../data/schema'
import { recalculateTaxMonths } from '../utils/taxCalculator'
import {
  appData,
  dataError,
  dataMode,
  refreshAppData,
  resetAllData,
  saveAllData,
} from '../state/appStore'

const router = useRouter()
const allowExit = ref(false)
const activeTab = ref('home')
const taxCreateMode = ref('single')

onBeforeRouteLeave(() => {
  if (allowExit.value) return true
  return false
})

function exitAdmin() {
  allowExit.value = true
  router.replace('/home')
}
const saving = ref(false)
const refreshing = ref(false)
const importing = ref(false)
const autoRecalcOnSave = ref(true)
const recalcOnImport = ref(true)
const showExportPreview = ref(false)
const newMonthPeriod = ref('2026-10')
const importText = ref('')
const importErrors = ref([])
const importPreview = ref(null)
const apiToken = ref('')

const batchForm = reactive({
  year: new Date().getFullYear(),
  startMonth: 1,
  endMonth: 9,
  income: '15000.00',
  specialDeduction: '2500.00',
  specialAdditionalDeduction: '1500.00',
  specialAdditionalDeductionName: '住房租金',
  personalPension: '0.00',
  otherDeduction: '0.00',
  withholdingAgent: '示例科技有限公司',
  withholdingAgentTaxId: '91000000000000000X',
  taxAuthority: '国家税务总局示例市税务局',
  replaceSameYearWage: true,
})

const tabs = [
  { key: 'home', label: '公告' },
  { key: 'tax', label: '纳税明细' },
  { key: 'messages', label: '消息' },
  { key: 'profile', label: '个人' },
  { key: 'sync', label: '导入导出' },
]

const modeLabel = computed(() => {
  if (dataMode.value === 'api') return '后端 API 协同 (api)'
  if (dataMode.value === 'remote-json') return '静态 JSON 发布 (remote-json)'
  return '本地浏览器存储 (local)'
})

const draft = reactive(cloneData(appData))

function syncDraftFromStore() {
  const next = cloneData(appData)
  draft.version = next.version
  draft.updatedAt = next.updatedAt
  draft.profile = next.profile
  draft.taxMonths = next.taxMonths
  draft.messages = next.messages
  draft.home = next.home
}

function formatTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function addMonth() {
  const period = newMonthPeriod.value
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    showToast('月份格式应为 YYYY-MM')
    return
  }
  if (draft.taxMonths.some((m) => m.period === period)) {
    showToast('该月份已存在')
    return
  }
  const latestRecord = draft.taxMonths[0]?.records[0]
  const record = latestRecord
    ? { ...cloneData(latestRecord), id: `${period}-001`, declarationDate: `${period}-15` }
    : createEmptyTaxRecord(period, '001')
  draft.taxMonths.unshift({ period, records: [record] })
  showToast(`已新增 ${period}`)
}

function removeMonth(index) {
  draft.taxMonths.splice(index, 1)
}

function nextRecordId(month) {
  const seq = String(month.records.length + 1).padStart(3, '0')
  let candidate = `${month.period}-${seq}`
  let n = month.records.length + 1
  const existing = new Set(draft.taxMonths.flatMap((m) => m.records.map((r) => r.id)))
  while (existing.has(candidate)) {
    n += 1
    candidate = `${month.period}-${String(n).padStart(3, '0')}`
  }
  return candidate
}

function addRecordToMonth(month) {
  const id = nextRecordId(month)
  const seq = id.split('-').pop() || '001'
  month.records.push(createEmptyTaxRecord(month.period, seq))
}

function duplicateRecord(month, record) {
  month.records.push({
    ...cloneData(record),
    id: nextRecordId(month),
  })
}

function removeRecord(month, index) {
  month.records.splice(index, 1)
}

async function syncMessagesFromTax() {
  draft.messages = syncMessagesFromTaxMonths(draft.messages, draft.taxMonths)
  try {
    if (autoRecalcOnSave.value) {
      draft.taxMonths = recalculateTaxMonths(draft.taxMonths)
    }
    await saveAllData(cloneData(draft), { token: apiToken.value || undefined })
    syncDraftFromStore()
    const taxMsgCount = draft.messages.filter((item) => item.title === '扣缴申报温馨提示').length
    showToast(`已同步 ${taxMsgCount} 条扣缴申报温馨提示，前台已更新`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '同步保存失败')
  }
}

function addMessage() {
  const maxId = draft.messages.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  const today = new Date().toISOString().slice(0, 10)
  draft.messages.unshift({
    id: maxId + 1,
    kind: 'notice',
    title: '扣缴申报温馨提示',
    preview: '来自扣缴义务人的申报温馨提示...',
    date: today,
    unread: true,
  })
}

function recalculateAllTax() {
  draft.taxMonths = recalculateTaxMonths(draft.taxMonths)
  showToast('已按现行个税政策重算全部税额')
}

function applySpecialAdditionalToAllWages() {
  const amount = Number(batchForm.specialAdditionalDeduction)
  if (!Number.isFinite(amount) || amount < 0) {
    showToast('请输入有效的专项附加扣除金额')
    return
  }
  const formatted = amount.toFixed(2)
  const name = batchForm.specialAdditionalDeductionName || '住房租金'
  let count = 0
  draft.taxMonths.forEach((month) => {
    month.records.forEach((rec) => {
      if (rec.incomeType === '工资薪金') {
        rec.specialAdditionalDeduction = formatted
        rec.specialAdditionalDeductionName = name
        count += 1
      }
    })
  })
  if (count === 0) {
    showToast('当前没有工资薪金明细')
    return
  }
  draft.taxMonths = recalculateTaxMonths(draft.taxMonths)
  showToast(`已为 ${count} 条工资明细应用「${name} ${formatted}元/月」并重算税额`)
}

function generateBatchWages() {
  const year = Number(batchForm.year)
  const start = Math.max(1, Math.min(12, Number(batchForm.startMonth) || 1))
  const end = Math.max(start, Math.min(12, Number(batchForm.endMonth) || start))
  if (!Number.isInteger(year) || year < 2019 || year > 2035) {
    showToast('请输入有效年份 (2019-2035)')
    return
  }

  if (batchForm.replaceSameYearWage) {
    draft.taxMonths.forEach((month) => {
      if (String(month.period).startsWith(`${year}-`)) {
        month.records = month.records.filter((r) => r.incomeType !== '工资薪金')
      }
    })
    draft.taxMonths = draft.taxMonths.filter((month) => month.records.length > 0)
  }

  for (let m = start; m <= end; m += 1) {
    const mm = String(m).padStart(2, '0')
    const period = `${year}-${mm}`
    const nextMonthYear = m === 12 ? year + 1 : year
    const nextMonthStr = String(m === 12 ? 1 : m + 1).padStart(2, '0')
    const declarationDate = `${nextMonthYear}-${nextMonthStr}-11`

    let monthObj = draft.taxMonths.find((item) => item.period === period)
    if (!monthObj) {
      monthObj = { period, records: [] }
      draft.taxMonths.push(monthObj)
    }

    const id = nextRecordId(monthObj)
    monthObj.records.push({
      ...createEmptyTaxRecord(period, id.split('-').pop() || '001'),
      id,
      incomeType: '工资薪金',
      incomeSubtype: '正常工资薪金',
      withholdingAgent: batchForm.withholdingAgent || '示例科技有限公司',
      withholdingAgentTaxId: batchForm.withholdingAgentTaxId || '91000000000000000X',
      taxAuthority: batchForm.taxAuthority || '国家税务总局示例市税务局',
      declarationChannel: '其他',
      declarationDate,
      income: batchForm.income,
      expense: '0.00',
      basicDeduction: '5000.00',
      specialDeduction: batchForm.specialDeduction,
      specialAdditionalDeduction: batchForm.specialAdditionalDeduction,
      specialAdditionalDeductionName: batchForm.specialAdditionalDeductionName || '住房租金',
      personalPension: batchForm.personalPension,
      otherDeduction: batchForm.otherDeduction,
    })
  }

  draft.taxMonths = recalculateTaxMonths(draft.taxMonths)
  showToast(`已生成 ${year}年 ${start}-${end}月 工资明细并自动算税`)
}

async function handleRefreshData() {
  refreshing.value = true
  try {
    await refreshAppData()
    syncDraftFromStore()
    showToast('已同步最新全局数据')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '数据同步失败')
  } finally {
    refreshing.value = false
  }
}

function reloadPage() {
  allowExit.value = true
  window.location.reload()
}

async function handleSave() {
  saving.value = true
  try {
    if (autoRecalcOnSave.value) {
      draft.taxMonths = recalculateTaxMonths(draft.taxMonths)
    }
    await saveAllData(cloneData(draft), { token: apiToken.value || undefined })
    syncDraftFromStore()
    showToast('保存成功，前台已更新')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

const totalRecordCount = computed(() => draft.taxMonths.reduce((sum, m) => sum + (m.records?.length || 0), 0))
const currentDraftJson = computed(() => JSON.stringify(normalizeAppData(cloneData(draft)), null, 2))

function triggerJsonDownload(content, filename) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downloadJson() {
  const dateTag = new Date().toISOString().slice(0, 10)
  const filename = `tax-app-data-${dateTag}.json`
  triggerJsonDownload(currentDraftJson.value, filename)
  showToast(`已导出 ${filename}`)
}

function downloadTemplateJson() {
  const template = JSON.stringify(createDefaultAppData(), null, 2)
  triggerJsonDownload(template, 'tax-app-template.json')
  showToast('已下载标准数据模板')
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(currentDraftJson.value)
    showToast('已复制完整 JSON 到剪贴板')
  } catch {
    showExportPreview.value = true
    showToast('浏览器限制剪贴板，已展开下方 JSON 预览')
  }
}

function parseAndValidateImport(rawText) {
  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    importPreview.value = null
    importErrors.value = ['JSON 语法错误，请检查括号、引号或逗号格式']
    return null
  }
  const check = validateAppData(parsed)
  if (!check.valid) {
    importPreview.value = null
    importErrors.value = check.errors
    return null
  }
  const normalized = normalizeAppData(parsed)
  importErrors.value = []
  importPreview.value = {
    name: normalized.profile.name,
    months: normalized.taxMonths.length,
    records: normalized.taxMonths.reduce((sum, m) => sum + m.records.length, 0),
    messages: normalized.messages.length,
    notices: normalized.home.notices.length,
  }
  return normalized
}

function validateImportText() {
  const result = parseAndValidateImport(importText.value)
  if (result) {
    showToast('校验通过，可点击「确认覆盖导入」')
  } else {
    showToast('数据校验未通过，请查看错误提示')
  }
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    importText.value = String(reader.result || '')
    const result = parseAndValidateImport(importText.value)
    if (result) {
      showToast('已读取文件并校验通过，请确认导入')
    } else {
      showToast('文件校验未通过，请检查提示')
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

function clearImportInput() {
  importText.value = ''
  importErrors.value = []
  importPreview.value = null
}

async function applyImportedText() {
  const normalized = parseAndValidateImport(importText.value)
  if (!normalized) {
    showToast('数据校验未通过，无法导入')
    return
  }
  importing.value = true
  try {
    if (recalcOnImport.value) {
      normalized.taxMonths = recalculateTaxMonths(normalized.taxMonths)
    }
    await saveAllData(normalized, { token: apiToken.value || undefined })
    syncDraftFromStore()
    clearImportInput()
    showToast('完整数据导入成功，前台已同步更新')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '导入失败')
  } finally {
    importing.value = false
  }
}

async function handleReset() {
  if (!window.confirm('确定恢复为默认演示数据吗？当前未导出的修改将被清空。')) return
  try {
    await resetAllData({ token: apiToken.value || undefined })
    syncDraftFromStore()
    clearImportInput()
    showToast('已恢复默认演示数据')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '重置失败')
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f4f6fa;
  color: #1d2129;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
}
.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid #e5e8ef;
  padding: calc(14px + env(safe-area-inset-top)) 16px 0;
}
.header-top {
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.header-top h1 {
  font-size: 19px;
  font-weight: 600;
  color: #161b22;
}
.mode-meta {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}
.header-actions,
.inline-actions,
.sync-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.admin-tabs {
  max-width: 920px;
  margin: 12px auto 0;
  display: flex;
  justify-content: space-between;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.admin-tabs::-webkit-scrollbar {
  display: none;
}
.admin-tabs button {
  flex: 1 0 auto;
  padding: 10px 8px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #5c6470;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}
.admin-tabs button.active {
  color: #1e5fbf;
  border-bottom-color: #1e5fbf;
  font-weight: 600;
}
.admin-body {
  max-width: 920px;
  margin: 0 auto;
  padding: 16px 16px 64px;
}
.banner-info,
.banner-warn {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.banner-info {
  background: #e8f1fc;
  color: #1b4f9c;
}
.banner-warn {
  background: #fff2f0;
  color: #cf1322;
}
.panel {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(24, 48, 88, .05);
}
.panel h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}
.sub-heading {
  margin-top: 22px;
}
.panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.panel-head h2 {
  margin-bottom: 0;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-wide {
  grid-column: 1 / -1;
}
.field span {
  font-size: 12px;
  color: #5c6470;
}
.field input,
.field select,
.field textarea,
.month-input,
.period-input,
.notice-edit-row input {
  width: 100%;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid #d9dee7;
  border-radius: 6px;
  background: #fff;
  color: #1d2129;
  font-size: 14px;
  line-height: 1.4;
}
.field select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%235c6470' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 15px 15px;
  cursor: pointer;
}
.field textarea {
  min-height: 120px;
  resize: vertical;
}
.field input:focus,
.field select:focus,
.field textarea:focus,
.month-input:focus,
.period-input:focus,
.notice-edit-row input:focus {
  outline: none;
  border-color: #1e5fbf;
}
.month-input {
  flex: 1;
  min-width: 0;
}
.period-input {
  width: 104px;
  font-weight: 600;
}
.list-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row-card {
  padding: 14px;
  border: 1px solid #eaedf3;
  border-radius: 8px;
  background: #fafbfd;
}
.compact-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  align-items: end;
  gap: 12px;
}
.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.checkbox-field input {
  width: 16px;
  height: 16px;
  margin: 0;
  flex: none;
  accent-color: #1e5fbf;
}
.month-block {
  border: 1px solid #e5e8ef;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
  background: #fafbfd;
}
.create-card {
  border: 1px solid #d7e6fb;
  border-radius: 10px;
  background: #f5f9ff;
  overflow: hidden;
}
.create-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #e3eefc;
}
.create-header h2 {
  margin-bottom: 0;
  font-size: 15px;
  color: #164894;
}
.mode-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 8px;
  background: #e3eefc;
  gap: 2px;
}
.mode-switch button {
  padding: 5px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #46628a;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}
.mode-switch button.active {
  background: #fff;
  color: #1e5fbf;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(24, 58, 115, .12);
}
.create-body {
  padding: 12px 14px 14px;
  background: #fff;
}
.create-desc {
  margin-bottom: 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #6b7280;
}
.single-create-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tax-list-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #ebedf2;
}
.tax-list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.tax-list-head h2 {
  margin-bottom: 0;
  font-size: 15px;
}
.batch-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.auto-calc-bar {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f7f8fa;
}
.month-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.month-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge-count {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f1fc;
  color: #1e5fbf;
  font-size: 12px;
}
.record-item {
  border: 1px solid #e5e8ef;
  border-radius: 8px;
  background: #fff;
  margin-top: 8px;
  overflow: hidden;
}
.record-item summary {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 11px 36px 11px 12px;
  cursor: pointer;
  font-size: 14px;
  list-style: none;
}
.record-item summary::-webkit-details-marker {
  display: none;
}
.record-item summary::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translateY(-50%);
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%238c939d' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
  transition: transform .2s ease;
}
.record-item[open] summary::after {
  transform: translateY(-50%) rotate(180deg);
}
.rec-summary-meta {
  color: #6b7280;
  font-size: 13px;
}
.message-record-item {
  margin-top: 0;
}
.msg-summary-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.msg-unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff2419;
  flex: none;
}
.msg-kind-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: #f0f3f8;
  color: #5c6470;
  font-size: 11px;
  font-weight: 400;
  white-space: nowrap;
}
.record-form {
  padding: 12px;
  border-top: 1px solid #eef0f5;
}
.record-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.notice-edit-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.notice-edit-row input {
  flex: 1;
  min-width: 0;
}
.help-text {
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
}
.help-text code {
  padding: 1px 5px;
  border-radius: 4px;
  background: #f0f3f8;
  font-size: 12px;
}
.empty-tip {
  padding: 24px 0;
  text-align: center;
  color: #8c939d;
  font-size: 14px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-shrink: 0;
  height: 34px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .12s ease, filter .12s ease;
  -webkit-tap-highlight-color: transparent;
}
.btn:active:not(:disabled) {
  transform: scale(.97);
  filter: brightness(.94);
}
.btn-icon {
  width: 14px;
  height: 14px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.btn.small {
  height: 29px;
  padding: 0 10px;
  font-size: 12px;
}
.btn.icon-btn {
  width: 34px;
  height: 34px;
  padding: 0;
}
.btn.icon-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.refresh-btn {
  gap: 5px;
}
.refresh-icon {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.refresh-icon.spinning {
  animation: admin-spin .7s linear infinite;
}
@keyframes admin-spin {
  to { transform: rotate(360deg); }
}
.btn.primary {
  background: #1e5fbf;
  color: #fff;
}
.btn.secondary {
  background: #e8f1fc;
  color: #1e5fbf;
}
.btn.ghost {
  background: #fff;
  border-color: #d9dee7;
  color: #374151;
}
.btn.danger {
  background: #fff1f0;
  color: #d93025;
}
.file-label {
  user-select: none;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}
.summary-tile {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f8fd;
  border: 1px solid #e3ecf9;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-tile span {
  font-size: 12px;
  color: #6b7280;
}
.summary-tile strong {
  font-size: 14px;
  color: #161b22;
}
.sync-card {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid #e7ebf2;
  border-radius: 10px;
  background: #fafbfd;
}
.sync-card h3 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}
.danger-zone {
  border-color: #fde2e1;
  background: #fffafa;
}
.json-preview {
  margin: 12px 0 0;
  max-height: 260px;
  overflow: auto;
  padding: 10px 12px;
  border-radius: 6px;
  background: #161b22;
  color: #e6edf3;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
.import-preview-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #eef9f2;
  border: 1px solid #bfe6ce;
  color: #1d6f42;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
