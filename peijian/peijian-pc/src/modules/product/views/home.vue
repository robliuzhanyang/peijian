<!--
  页面：商城首页（home.vue · PC 版）
  路由：/home ｜ 分组：采购入口
  作用：按原型还原 PC 首页：左分类导航 + 中部主视觉与功能入口 + 右栏企业卡/快速报价/权益，
        下接常备配件商品墙、全品类楼层、选型与装配指南、服务承诺条
  数据：state.categories / state.products / state.points / state.authStatus；
        学习内容读取 catalog.json 的 contents（与学习专区同源）
-->
<template>
  <div>
    <!-- 首屏三栏：分类导航 / 主视觉 + 功能入口 / 企业卡与权益 -->
    <div class="home-hero-grid">
      <!-- 左栏：全部商品分类 + 热销 TOP + 快速报价入口 -->
      <aside class="home-cats" @mouseleave="closeFlyout">
        <div class="home-cats-head">全部商品分类</div>
        <div class="home-cat-list">
          <div
            v-for="c in categories"
            :key="c.id"
            class="home-cat"
            @mouseenter="openFlyout(c.id)"
          >
            <router-link
              class="home-cat-main"
              :to="{ path: '/goods', query: { cat: c.id } }"
            >
              <AppIcon :name="c.icon" /><span>{{ c.name }}</span
              ><AppIcon name="chevron" />
            </router-link>
          </div>
        </div>

        <!-- 悬浮分类面板：一级分类 / 二级分类 / 该二级下的商品 -->
        <div v-if="flyoutCat" class="cat-mega">
          <aside class="mega-level1">
            <button
              v-for="c in categories"
              :key="c.id"
              type="button"
              :class="{ on: c.id === flyoutCatId }"
              @mouseenter="openFlyout(c.id)"
              @click="openFlyout(c.id)"
            >
              {{ c.name }}
            </button>
          </aside>
          <div class="mega-level2">
            <h3>{{ flyoutCat.name }}</h3>
            <button
              v-for="t in flyoutCat.children"
              :key="t"
              type="button"
              :class="{ on: t === flyoutChild }"
              @mouseenter="flyoutChild = t"
              @click="flyoutChild = t"
            >
              {{ t }}
            </button>
          </div>
          <div class="mega-products">
            <div class="mega-products-head">
              <strong>{{ flyoutChild || flyoutCat.name }}</strong>
              <small>{{ flyoutProducts.length }} 件商品</small>
            </div>
            <div class="mega-grid">
              <router-link
                v-for="p in flyoutProducts"
                :key="p.id"
                class="mega-prod"
                :to="{ path: '/detail', query: { id: p.id } }"
              >
                <img :src="asset(p.image)" :alt="p.name" />
                <span>{{ p.name }}</span>
                <em v-if="p.buyable">{{ money(p.priceFen) }}</em>
                <em v-else class="quote">待报价</em>
              </router-link>
            </div>
            <p v-if="!flyoutProducts.length" class="mega-empty">
              该分类暂无现货，可查看全部{{ flyoutCat.name }}。
            </p>
            <router-link
              class="mega-more"
              :to="
                flyoutChild
                  ? { path: '/goods', query: { cat: flyoutCatId, q: flyoutChild } }
                  : { path: '/goods', query: { cat: flyoutCatId } }
              "
              >查看全部{{ flyoutChild || flyoutCat.name }} →</router-link
            >
          </div>
        </div>
        <!-- 热销配件 TOP 3 -->
        <div class="cat-rank">
          <div class="cat-rank-head"><AppIcon name="zap" /><b>热销配件 TOP</b></div>
          <router-link
            v-for="(p, i) in topHot"
            :key="p.id"
            class="rank-row"
            :to="{ path: '/detail', query: { id: p.id } }"
          >
            <em class="rank-no" :class="{ top: i === 0 }">{{ i + 1 }}</em>
            <span class="rank-name">{{ p.name }}</span>
          </router-link>
        </div>
        <router-link class="home-cats-foot" to="/quote">
          <span><AppIcon name="zap" /></span>
          <div>
            <strong>快速报价 / 非标定制</strong>
            <small>选型 · 适配 · 贴牌咨询</small>
          </div>
          <AppIcon name="chevron" />
        </router-link>
      </aside>

      <!-- 中栏：主视觉横幅 + 三大功能入口 -->
      <div class="home-center">
        <div class="hero">
          <section class="hero-banner">
            <div class="eyebrow">ENGINEERED FOR YOUR PRODUCTION</div>
            <h1>从一颗配件，<br />到一套方案。</h1>
            <p>激光器 / 光路 / 立柱 / 电源<br />让选型更准确，让采购更简单。</p>
            <router-link class="btn" to="/diy">一站式采购　→</router-link>
            <img :src="asset('machine.svg')" alt="激光打标设备示意" />
            <div class="dots"><i class="on"></i><i></i><i></i></div>
            <div class="hero-stat">
              <span>工厂直供</span><span>适配选型</span><span>技术支持</span>
            </div>
          </section>
        </div>
        <div class="home-features">
          <router-link to="/search">
            <span class="feat-ic"><AppIcon name="search" /></span>
            <div>
              <strong>型号精准搜索</strong>
              <small>型号 / 功率 / 品牌，快速定位配件</small>
            </div>
            <AppIcon name="chevron" />
          </router-link>
          <router-link to="/diy">
            <span class="feat-ic"><AppIcon name="grid" /></span>
            <div>
              <strong>一站式套装采购</strong>
              <small>整机成套配置，模块可替换</small>
            </div>
            <AppIcon name="chevron" />
          </router-link>
          <router-link to="/learning">
            <span class="feat-ic"><AppIcon name="file" /></span>
            <div>
              <strong>技术资料下载</strong>
              <small>工程图 · 3D 装配 · 操作手册</small>
            </div>
            <AppIcon name="chevron" />
          </router-link>
        </div>
      </div>

      <!-- 右栏：企业卡 / 快速报价 / 积分与学习入口 / 采购权益 -->
      <aside class="home-right">
        <!-- 未登录：认证引导 -->
        <div v-if="!loggedIn" class="card rail-company">
          <div class="company-avatar"><AppIcon name="company" /></div>
          <h3>欢迎来到鑫戩配件商城</h3>
          <p class="tiny">认证企业，开启批发采购</p>
          <router-link class="btn primary sm block" to="/register"
            >立即注册 / 认证</router-link
          >
        </div>
        <!-- 已登录：当前企业卡 -->
        <div v-else class="card rail-company">
          <div class="flex" style="gap: 10px; align-items: flex-start">
            <div class="company-avatar"><AppIcon name="company" /></div>
            <div class="grow">
              <div class="flex" style="gap: 7px">
                <b>{{ companyShort }}</b
                ><span class="badge green">{{ authStatus }}</span>
              </div>
              <small class="tiny"
                >统一信用代码 {{ company.taxId || "待补充" }}</small
              >
            </div>
          </div>
          <div class="rail-points between">
            <span class="tiny">配件商城积分</span>
            <b class="gold num">{{ points.toLocaleString() }}</b>
          </div>
          <p class="tiny rail-sales">
            <AppIcon name="service" /> 归属业务员：待分配
          </p>
          <div class="between rail-links panel-line">
            <router-link class="tiny blue" to="/orders">我的订单 →</router-link>
            <router-link class="tiny blue" to="/favorites"
              >常用套装 →</router-link
            >
          </div>
        </div>

        <!-- 快速报价与非标定制 -->
        <div class="rail-quote">
          <router-link class="btn orange" to="/quote"
            ><AppIcon name="zap" />快速报价</router-link
          ><router-link class="btn soft" to="/support">非标定制</router-link>
        </div>

        <!-- 积分商城与学习专区 -->
        <div class="promo-tiles">
          <router-link class="tile-gold" to="/points-mall">
            <b>积分商城</b><small>配件积分 · 全额兑换</small><AppIcon name="gift" />
          </router-link>
          <router-link class="tile-blue" to="/learning">
            <b>学习专区</b><small>操作视频 · 技术手册</small><AppIcon name="book" />
          </router-link>
        </div>

        <!-- 企业采购权益 -->
        <div class="benefit-grid">
          <span><AppIcon name="company" />认证批发价</span>
          <span><AppIcon name="coin" />积分兑换</span>
          <span><AppIcon name="user" />专属业务员</span>
          <span><AppIcon name="service" />售后技术支持</span>
        </div>
      </aside>
    </div>

    <!-- 常备配件：热销优先，取 8 个 -->
    <div class="section-title">
      <h2>常备配件，快速直采</h2>
      <router-link class="link" to="/goods">全部配件 →</router-link>
    </div>
    <div class="product-grid">
      <ProductCard v-for="p in picks" :key="p.id" :product="p" />
    </div>

    <!-- 全品类楼层 -->
    <div class="section-title">
      <h2>激光配件全品类</h2>
      <router-link class="link" to="/categories">查看全部分类 →</router-link>
    </div>
    <div class="cat-floor-grid">
      <router-link
        v-for="c in categories"
        :key="c.id"
        class="cat-floor-card"
        :to="{ path: '/goods', query: { cat: c.id } }"
      >
        <div class="cat-floor-img">
          <img
            v-if="floorImage(c.id)"
            :src="asset(floorImage(c.id))"
            :alt="c.name"
          />
        </div>
        <div class="cat-floor-info">
          <div class="cat-floor-name">
            <AppIcon :name="c.icon" /><strong>{{ c.name }}</strong>
          </div>
          <small class="tiny">{{ c.children.slice(0, 3).join(" · ") }}</small>
          <span class="cat-floor-more">查看全部 <AppIcon name="chevron" /></span>
        </div>
      </router-link>
    </div>

    <!-- 选型与装配指南：取前 3 篇学习内容 -->
    <div class="section-title">
      <h2>选型与装配指南</h2>
      <router-link class="link" to="/learning">进入学习专区 →</router-link>
    </div>
    <div class="learning-grid">
      <router-link
        v-for="x in guides"
        :key="x.id"
        class="card learning-card"
        :to="{ path: '/article', query: { id: x.id } }"
      >
        <div class="learning-cover">
          <img :src="asset(x.image)" :alt="x.title" />
          <span class="cover-tag">{{ x.tag }}</span>
        </div>
        <div class="learning-body">
          <span class="badge blue">{{ x.cat }}</span>
          <h3 style="margin-top: 8px">{{ x.title }}</h3>
          <p class="tiny">{{ x.desc }}</p>
          <div class="between panel-line">
            <span class="tiny">{{ x.date }}</span>
            <span class="tiny">{{ x.read }} 次阅读</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 服务承诺条 -->
    <div class="service-strip">
      <div class="ss-item">
        <span class="ss-ic"><AppIcon name="company" /></span>
        <div><b>工厂直供</b><small>激光配件源头供应</small></div>
      </div>
      <div class="ss-item">
        <span class="ss-ic"><AppIcon name="check" /></span>
        <div><b>适配选型</b><small>机型参数精准匹配</small></div>
      </div>
      <div class="ss-item">
        <span class="ss-ic"><AppIcon name="file" /></span>
        <div><b>参数资料</b><small>工程图 · 3D 装配</small></div>
      </div>
      <div class="ss-item">
        <span class="ss-ic"><AppIcon name="service" /></span>
        <div><b>技术支持</b><small>专属业务员跟进</small></div>
      </div>
      <div class="ss-item">
        <span class="ss-ic"><AppIcon name="wallet" /></span>
        <div><b>合同发票</b><small>对公交易闭环</small></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ProductCard from "@/components/ProductCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import { asset, money } from "@/domain/productFields";
import catalog from "@/mock/catalog.json";

export default {
  components: { ProductCard, AppIcon },
  data() {
    return {
      // 悬浮分类面板：当前一级分类与选中的二级分类
      flyoutCatId: "",
      flyoutChild: "",
    };
  },
  computed: {
    ...mapState(["categories", "products", "loggedIn", "points", "authStatus"]),
    ...mapGetters(["currentCompany"]),
    // 面板当前一级分类
    flyoutCat() {
      return this.categories.find((c) => c.id === this.flyoutCatId) || null;
    },
    // 面板商品：按二级分类名称做关键词匹配，无匹配时回退该一级分类全部商品
    flyoutProducts() {
      const list = this.products.filter((p) => p.cat === this.flyoutCatId);
      const child = this.flyoutChild;
      if (!child) return list.slice(0, 9);
      const tokens = child.split(/[\/、\s]+/).filter(Boolean);
      const hit = list.filter((p) =>
        tokens.some((t) =>
          [p.name, p.model, p.skuCode, p.series].some(
            (x) => x && x.toLowerCase().includes(t.toLowerCase())
          )
        )
      );
      return (hit.length ? hit : list).slice(0, 9);
    },
    // 热销配件 TOP 3（左栏榜单）
    topHot() {
      return this.products.filter((p) => p.hot).slice(0, 3);
    },
    // 常备配件：热销优先，非热销补齐，取 8 个
    picks() {
      return [
        ...this.products.filter((p) => p.hot),
        ...this.products.filter((p) => !p.hot),
      ].slice(0, 8);
    },
    // 学习内容：与学习专区同源，取前 3 篇
    guides() {
      return catalog.contents.slice(0, 3);
    },
    // 当前企业（无数据时给空对象，避免模板取值报错）
    company() {
      return this.currentCompany || {};
    },
    // 企业简称：去掉「有限公司」后缀，便于右栏紧凑展示
    companyShort() {
      return (this.company.name || "企业采购").replace(/有限公司$/, "");
    },
  },
  methods: {
    asset,
    money,
    // 打开/切换悬浮面板：一级分类变化时默认选中第一个二级分类
    openFlyout(id) {
      if (this.flyoutCatId === id) return;
      this.flyoutCatId = id;
      const cat = this.categories.find((c) => c.id === id);
      this.flyoutChild = cat && cat.children.length ? cat.children[0] : "";
    },
    closeFlyout() {
      this.flyoutCatId = "";
      this.flyoutChild = "";
    },
    // 楼层图：取该分类首个商品的图片
    floorImage(catId) {
      const p = this.products.find((x) => x.cat === catId && x.image);
      return p ? p.image : "";
    },
  },
};
</script>
