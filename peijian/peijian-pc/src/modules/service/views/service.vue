<!--
  页面：服务与支持（service.vue）
  路由：/service ｜ 分组：内容与服务
  作用：面向企业客户的售前选型、交付实施与售后维保全周期服务说明
  数据：serviceApi.support() 取 {hotline, hours, email, channels}
-->
<template>
  <div class="sv-page">
    <!-- 服务头图：定位、简介与关键数据 -->
    <section class="sv-hero">
      <div class="sv-hero-copy">
        <p class="sv-eyebrow">SERVICE &amp; SUPPORT · 企业级服务</p>
        <h1>从选型到维保，<br />全周期服务随设备同行</h1>
        <p class="sv-lead">
          鑫戩为激光打标与工业自动化客户提供选型咨询、方案设计、安装调试、操作培训与备件供应，
          由专属服务顾问跟进每一张采购订单。
        </p>
        <div class="sv-hero-actions">
          <router-link class="btn primary" to="/support">联系服务顾问</router-link>
          <router-link class="btn ghost" to="/goods">浏览配件</router-link>
        </div>
      </div>
      <ul class="sv-stats">
        <li v-for="s in stats" :key="s.label">
          <strong>{{ s.value }}</strong>
          <small>{{ s.label }}</small>
        </li>
      </ul>
    </section>

    <!-- 服务热线 -->
    <section class="card sv-hotline">
      <div class="sv-hotline-main">
        <small>全国服务热线</small>
        <strong>{{ info.hotline || "400-880-1688" }}</strong>
        <span>{{ info.hours || "工作日 8:30 - 18:00" }}</span>
      </div>
      <div class="sv-hotline-item">
        <small>服务邮箱</small>
        <span>{{ info.email || "service@xinjian.com" }}</span>
      </div>
      <div class="sv-hotline-item">
        <small>响应时效</small>
        <span>工作时间内 30 分钟响应</span>
      </div>
      <div class="sv-hotline-item">
        <small>服务范围</small>
        <span>全国发货 · 远程指导 · 上门调试</span>
      </div>
    </section>

    <!-- 微信入口：添加服务顾问微信，便于发送现场照片与图纸 -->
    <section class="card sv-wechat">
      <QrCode :seed="7" :size="104" label="服务顾问微信二维码" />
      <div class="sv-wechat-copy">
        <h2>微信客户支持</h2>
        <p>
          扫描二维码添加专属服务顾问，发送设备型号与现场照片，可获得更快的远程支持。
        </p>
        <p class="sv-wx-id">微信号：{{ wechatId }}</p>
      </div>
      <button class="btn primary" @click="copyWechat">复制微信号</button>
    </section>

    <!-- 服务项目 -->
    <section class="sv-section">
      <header class="sv-sec-head">
        <h2>服务项目</h2>
        <p>覆盖采购前、中、后的六个标准化服务环节</p>
      </header>
      <div class="sv-grid">
        <article v-for="s in services" :key="s.no" class="card sv-item">
          <span class="sv-no">{{ s.no }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
          <ul>
            <li v-for="p in s.points" :key="p">{{ p }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 服务流程 -->
    <section class="sv-section">
      <header class="sv-sec-head">
        <h2>服务流程</h2>
        <p>需求确认后 1 个工作日内给出服务安排</p>
      </header>
      <ol class="sv-flow">
        <li v-for="(f, i) in flow" :key="f.title">
          <i>{{ i + 1 }}</i>
          <div>
            <strong>{{ f.title }}</strong>
            <small>{{ f.desc }}</small>
          </div>
        </li>
      </ol>
    </section>

    <!-- 服务承诺 + 常见问题 -->
    <div class="sv-split">
      <section class="card sv-commit">
        <h2>服务承诺</h2>
        <ul>
          <li v-for="c in commitments" :key="c.title">
            <strong>{{ c.title }}</strong>
            <span>{{ c.desc }}</span>
          </li>
        </ul>
      </section>

      <section class="card sv-faq">
        <h2>常见问题</h2>
        <details v-for="q in faqs" :key="q.q">
          <summary>{{ q.q }}</summary>
          <p>{{ q.a }}</p>
        </details>
      </section>
    </div>

    <!-- 底部行动区 -->
    <section class="sv-cta">
      <div>
        <h2>还没确定选型？让顾问帮你配一套</h2>
        <p>提供工艺需求与产能目标，我们给出配件清单与预算区间。</p>
      </div>
      <div class="sv-cta-actions">
        <router-link class="btn gold" to="/diy">开始一站式选购</router-link>
        <router-link class="btn" to="/support">查看支持渠道</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import serviceApi from "@/modules/service/api";
// 二维码占位组件：正式上线替换为后台下发的顾问微信二维码
import QrCode from "@/components/QrCode.vue";

export default {
  name: "Service",
  components: { QrCode },
  data() {
    return {
      // 客服联系信息（来自 catalog.json 的 support）
      info: {},
      // 服务顾问微信号（后续可由 serviceApi.support() 下发）
      wechatId: "xinjian-service",
      stats: [
        { value: "12 年", label: "激光装备服务经验" },
        { value: "30 min", label: "工作时间内响应" },
        { value: "全国", label: "发货与上门调试" },
        { value: "12 个月", label: "整机质保周期" },
      ],
      services: [
        {
          no: "01",
          title: "选型咨询",
          desc: "按材质、幅面与产能匹配机型与配件，避免过度配置。",
          points: ["工艺需求梳理", "机型与功率建议"],
        },
        {
          no: "02",
          title: "方案设计",
          desc: "输出配件清单、接口匹配与场地布置建议。",
          points: ["BOM 清单与报价", "光路与接口校核"],
        },
        {
          no: "03",
          title: "安装调试",
          desc: "远程指导或工程师上门完成组装与首件打样。",
          points: ["上门安装", "参数标定与首件确认"],
        },
        {
          no: "04",
          title: "操作培训",
          desc: "面向产线操作与设备管理人员的基础与进阶培训。",
          points: ["开机与日常操作", "常见异常处理"],
        },
        {
          no: "05",
          title: "质保维修",
          desc: "整机与核心配件质保期内免费维修，超期提供成本价服务。",
          points: ["质保内免费维修", "返厂检测与报告"],
        },
        {
          no: "06",
          title: "备件供应",
          desc: "镜片、喷嘴、打标卡等常用备件常备库存，快速补货。",
          points: ["常用件现货", "紧急件优先发运"],
        },
      ],
      flow: [
        { title: "提交需求", desc: "在线提交或致电服务热线" },
        { title: "需求确认", desc: "顾问核对工艺与交期" },
        { title: "方案报价", desc: "给出配置清单与价格" },
        { title: "交付实施", desc: "发货、安装与调试" },
        { title: "回访维保", desc: "交付后回访与备件支持" },
      ],
      commitments: [
        { title: "明码标价", desc: "配件单价与套装价公开，无隐藏费用。" },
        { title: "原厂正品", desc: "所售配件均为原厂或授权渠道供货。" },
        { title: "交付可查", desc: "订单、合同、物流与发票全流程可追溯。" },
        { title: "售后闭环", desc: "每笔售后有受理编号与处理时限。" },
      ],
      faqs: [
        {
          q: "配件是否提供技术资料？",
          a: "常用型号提供规格书、接线图与安装说明，可在商品详情页查看，也可联系服务顾问索取。",
        },
        {
          q: "支持上门安装调试吗？",
          a: "支持。整机及成套方案默认包含上门安装调试，具体服务范围与差旅费用在报价单中列明。",
        },
        {
          q: "质保期如何计算？",
          a: "自签收之日起计算，整机质保 12 个月，易损件按品类单独约定，质保条款随合同提供。",
        },
        {
          q: "发票与合同如何获取？",
          a: "订单完成后可在「发票管理」申请增值税专用发票，采购合同可在「采购合同」中在线预览与回传。",
        },
      ],
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        this.info = (await serviceApi.support()) || {};
      } catch (e) {
        this.info = {};
      }
    },
    // 复制微信号：剪贴板不可用时提示手动复制
    copyWechat() {
      const done = () =>
        this.$store.commit("setNotice", "微信号已复制：" + this.wechatId);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.wechatId).then(done, () =>
          this.$store.commit("setNotice", "请手动复制微信号：" + this.wechatId)
        );
        return;
      }
      this.$store.commit("setNotice", "请手动复制微信号：" + this.wechatId);
    },
  },
};
</script>

<style scoped>
.sv-page {
  padding-bottom: 24px;
}
.sv-page h1,
.sv-page h2,
.sv-page h3 {
  margin: 0;
}

/* 头图 */
.sv-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: center;
  padding: 38px 40px;
  border-radius: 18px;
  color: #fff;
  background: radial-gradient(
      120% 140% at 100% 0%,
      #2a6bdd 0%,
      rgba(21, 84, 199, 0) 55%
    ),
    linear-gradient(135deg, #0d3678 0%, #1554c7 62%, #1a63d8 100%);
  box-shadow: 0 18px 40px -24px #0d3678cc;
}
.sv-eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: #bcd3f7;
}
.sv-hero h1 {
  font-size: 34px;
  line-height: 1.32;
  letter-spacing: -0.01em;
}
.sv-lead {
  max-width: 560px;
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.9;
  color: #dbe7fa;
}
.sv-hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.sv-hero-actions .btn.primary {
  background: #fff;
  color: #1554c7;
  border-color: #fff;
}
.sv-hero-actions .btn.primary:hover {
  background: #eef4ff;
}
.sv-hero-actions .btn.ghost {
  background: transparent;
  color: #fff;
  border-color: #ffffff73;
}
.sv-hero-actions .btn.ghost:hover {
  background: #ffffff1a;
  border-color: #ffffffb3;
}
.sv-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #ffffff26;
  border: 1px solid #ffffff2e;
  border-radius: 14px;
  overflow: hidden;
}
.sv-stats li {
  padding: 18px 16px;
  background: #123a7a;
}
.sv-stats strong {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}
.sv-stats small {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #bcd3f7;
}

/* 热线条 */
.sv-hotline {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1.2fr;
  gap: 18px;
  align-items: center;
  margin-top: 16px;
  padding: 20px 24px;
}
.sv-hotline-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 18px;
  border-right: 1px solid var(--line);
}
.sv-hotline-main small,
.sv-hotline-item small {
  font-size: 12px;
  color: var(--muted);
}
.sv-hotline-main strong {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--blue);
}
.sv-hotline-main span,
.sv-hotline-item span {
  font-size: 13px;
  color: var(--ink);
}
.sv-hotline-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 微信入口：二维码 + 说明 + 复制按钮 */
.sv-wechat {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
  padding: 20px 24px;
}
.sv-wechat-copy {
  flex: 1 1 auto;
  min-width: 0;
}
.sv-wechat h2 {
  font-size: 18px;
}
.sv-wechat p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}
.sv-wx-id {
  color: var(--ink) !important;
  font-weight: 600;
}

/* 区块 */
.sv-section {
  margin-top: 30px;
}
.sv-sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}
.sv-sec-head h2 {
  font-size: 20px;
}
.sv-sec-head p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.sv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.sv-item {
  position: relative;
  padding: 22px 22px 20px;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease;
}
.sv-item:hover {
  transform: translateY(-2px);
  border-color: #c9dbf7;
  box-shadow: 0 14px 28px -22px #0d367899;
}
.sv-no {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--gold);
}
.sv-item h3 {
  font-size: 16px;
  margin-bottom: 8px;
}
.sv-item p {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--muted);
}
.sv-item ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sv-item li {
  padding: 3px 9px;
  font-size: 12px;
  color: var(--blue2);
  background: #eef4fd;
  border-radius: 999px;
}

/* 流程 */
.sv-flow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 22px 24px;
  list-style: none;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
}
.sv-flow li {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.sv-flow i {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: var(--blue);
  border-radius: 50%;
}
.sv-flow strong {
  display: block;
  font-size: 14px;
  color: var(--ink);
}
.sv-flow small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

/* 承诺 + FAQ */
.sv-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 14px;
  margin-top: 30px;
}
.sv-commit,
.sv-faq {
  padding: 22px 24px;
}
.sv-commit h2,
.sv-faq h2 {
  font-size: 18px;
  margin-bottom: 14px;
}
.sv-commit ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}
.sv-commit li {
  padding-left: 14px;
  border-left: 3px solid #dbe7fb;
}
.sv-commit strong {
  display: block;
  font-size: 14px;
  color: var(--ink);
}
.sv-commit span {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}
.sv-faq details {
  padding: 12px 0;
  border-bottom: 1px dashed var(--line);
}
.sv-faq details:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.sv-faq summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  list-style: none;
}
.sv-faq summary::-webkit-details-marker {
  display: none;
}
.sv-faq summary::before {
  content: "＋";
  margin-right: 8px;
  color: var(--blue);
  font-weight: 700;
}
.sv-faq details[open] summary::before {
  content: "－";
}
.sv-faq p {
  margin: 8px 0 0 22px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--muted);
}

/* 底部行动区 */
.sv-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 26px;
  padding: 26px 30px;
  border-radius: 16px;
  background: linear-gradient(100deg, #f4f8ff, #eaf1fd);
  border: 1px solid #d9e6fa;
}
.sv-cta h2 {
  font-size: 18px;
  color: var(--blue2);
}
.sv-cta p {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
}
.sv-cta-actions {
  display: flex;
  gap: 10px;
  flex: none;
}

@media (max-width: 1100px) {
  .sv-hero {
    grid-template-columns: 1fr;
  }
  .sv-hotline {
    grid-template-columns: 1fr 1fr;
  }
  .sv-hotline-main {
    border-right: 0;
    padding-right: 0;
  }
  .sv-grid {
    grid-template-columns: 1fr 1fr;
  }
  .sv-flow {
    grid-template-columns: 1fr 1fr;
  }
  .sv-split {
    grid-template-columns: 1fr;
  }
}
</style>
