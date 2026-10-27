/**
 * Vuex 状态仓库（H5 端）
 * 集中管理：商品目录、购物车、订单、收藏、地址、积分、认证状态与全局提示
 * 持久化：购物车/订单/收藏/地址/选配方案/合同/发票/售后/企业/消息/资料/积分 写入
 *         localStorage（键 xinjian-h5-v3），刷新不丢失。
 *
 * 数据归属与后端迁移：
 *   - 目录类（products / categories / packages）：启动时 bootstrap 拉取，不落盘。
 *   - 交易类（cart / orders / contracts / invoices / aftersales）：当前为本地 CRUD + persist；
 *     接后端后由接口负责读写，前端只保留购物车等必要的交互状态。
 *   - 账号类（profile / companies / authStatus / points / pointsLedger / messages）：
 *     同理逐步迁到接口；迁移完成前 persist() 的白名单是唯一落盘口径。
 *   - 一站式方案（selected / selectedScheme）：属于前端交互态，可继续本地保存。
 *
 * 接后端推荐顺序：只读列表 → 写操作（下单/合同/发票/售后/兑换）→ 删除种子合并与本地 CRUD。
 * 前端 CRUD 约定：合同、发票、售后、企业、资料、消息统一存于 Vuex，
 * 各业务模块 api 在 mock 模式下直接读 state，保证增删改查响应式并持久化。
 */
import Vue from "vue";
import Vuex from "vuex";
import { productsApi } from "@/modules/product/api";
import { ordersApi } from "@/modules/trade/api";
import { money } from "@/domain/productFields";
import catalog from "@/mock/catalog.json";
import { oneStopProducts } from "@/modules/selection/domain/oneStopCatalog";

Vue.use(Vuex);

// localStorage 存储键名（与 PC 端隔离，避免数据互相覆盖）
const KEY = "xinjian-h5-v3";

// 读取本地持久化数据；解析失败时静默回退为空对象，避免阻断启动
function saved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
}
const initial = saved();

// 一站式选购商品并入通用商品索引，确保确认页、报价单可继续按 id 取商品。
function withOneStop(items) {
  const map = new Map();
  [...(items || []), ...oneStopProducts].forEach((item) =>
    map.set(item.id, item)
  );
  return Array.from(map.values());
}

// 初始种子数据：首次打开即有完整业务数据
const SEED = {
  cart: catalog.seedCart || [],
  orders: catalog.orders || [],
  favorites: catalog.seedFavorites || [],
  addresses: catalog.seedAddresses || [],
  contracts: catalog.contracts || [],
  invoices: catalog.invoices || [],
  aftersales: catalog.aftersales || [],
  companies: catalog.companies || [],
  messages: (catalog.messages || []).map((m) => ({ read: false, ...m })),
  profile: catalog.profile || {},
  pointsLedger: catalog.pointsLedger || [],
};
// 按 id 合并两个数组（种子在前，本地同 id 项不重复追加；同 id 按字段合并，本地字段覆盖种子，缺失字段回退种子）
function mergeById(seed, local) {
  const map = new Map();
  [...(seed || []), ...(local || [])].forEach((item) => {
    if (item && item.id != null) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  });
  return Array.from(map.values());
}
// 已完成种子合并的老用户完全尊重本地数据；首次（含旧版无标记数据）做一次性合并
const useLocal = initial.seeded === true;
// 合并本地资料（对象）：本地字段覆盖种子同名字段，未填字段回退种子
function mergeProfile(seed, local) {
  return { ...(seed || {}), ...(local || {}) };
}
// 统一时间戳：YYYY-MM-DD HH:mm，供工单 / 消息 / 积分流水复用
function stamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}
// 追加一条站内消息（支付、合同、发票、售后、兑换等动作统一触发）
function appendMessage(s, msg) {
  s.messages.unshift({
    id: "M" + Date.now() + Math.random().toString(36).slice(2, 6),
    read: false,
    time: stamp(),
    ...msg,
  });
}

const state = {
  products: [], // 商品目录（bootstrap 从接口或 mock 载入）
  categories: [], // 商品分类树
  packages: [], // 套装列表
  // 购物车行项（持久化）
  cart: useLocal
    ? initial.cart || []
    : mergeById(SEED.cart, initial.cart || []),
  // 订单列表（持久化）
  orders: useLocal
    ? initial.orders || []
    : mergeById(SEED.orders, initial.orders || []),
  // 收藏的商品 id 列表（持久化）
  favorites: useLocal
    ? initial.favorites || []
    : mergeById(
        SEED.favorites.map((id) => ({ id })),
        (initial.favorites || []).map((id) => ({ id }))
      ).map((x) => x.id),
  // 收货地址（持久化）
  addresses: useLocal
    ? initial.addresses || []
    : mergeById(SEED.addresses, initial.addresses || []),
  // 合同列表（持久化 CRUD）
  contracts: useLocal
    ? initial.contracts || []
    : mergeById(SEED.contracts, initial.contracts || []),
  // 发票列表（持久化 CRUD）
  invoices: useLocal
    ? initial.invoices || []
    : mergeById(SEED.invoices, initial.invoices || []),
  // 售后工单（持久化 CRUD）
  aftersales: useLocal
    ? initial.aftersales || []
    : mergeById(SEED.aftersales, initial.aftersales || []),
  // 可切换企业列表（持久化 CRUD）：始终与目录按字段合并，补齐新增字段（如归属业务员）
  companies: mergeById(SEED.companies, initial.companies || []),
  // 当前选中的企业 id（持久化）
  currentCompanyId:
    initial.currentCompanyId ||
    (SEED.companies.find((c) => c.current) || {}).id ||
    null,
  // 消息通知（持久化，已读状态保留）
  messages: useLocal
    ? initial.messages || []
    : mergeById(SEED.messages, initial.messages || []),
  // 个人/企业资料（持久化可编辑）
  profile: useLocal
    ? initial.profile || {}
    : mergeProfile(SEED.profile, initial.profile || {}),
  points:
    initial.points != null
      ? initial.points
      : catalog.profile
      ? catalog.profile.points
      : 2300, // 积分余额（持久化，兑换后扣减）
  // 积分流水（持久化，兑换后新增记录；种子与本地按 id 合并）
  pointsLedger: mergeById(SEED.pointsLedger, initial.pointsLedger || []),
  authStatus:
    initial.authStatus || (catalog.profile ? catalog.profile.authStatus : "待认证"), // 企业认证状态（持久化）
  search: "", // 搜索关键词（预留）
  selected: initial.selected || [], // 模块化选配选中的商品 id（持久化）
  selectedScheme: initial.selectedScheme || null, // 当前选定的成套方案对象
  checkoutItems: [], // 进入结算时的行项快照（不持久化）
  lastOrder: null, // 最近一次下单结果
  notice: "", // 全局轻提示文案（App.vue 监听并 3 秒后清空）
  listQuery: { q: "", cat: "", page: 1, pageSize: 20 }, // PC 商品列表的分页查询条件
  loggedIn: initial.loggedIn === true, // 登录态（演示环境：点击登录直接置真并持久化）
};

// 将需要保留的数据写回 localStorage；seeded 标记表示种子已合并
function persist(s) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      cart: s.cart,
      orders: s.orders,
      favorites: s.favorites,
      addresses: s.addresses,
      selected: s.selected,
      selectedScheme: s.selectedScheme,
      contracts: s.contracts,
      invoices: s.invoices,
      aftersales: s.aftersales,
      companies: s.companies,
      currentCompanyId: s.currentCompanyId,
      messages: s.messages,
      profile: s.profile,
      points: s.points,
      pointsLedger: s.pointsLedger,
      authStatus: s.authStatus,
      loggedIn: s.loggedIn,
      seeded: true,
    })
  );
}

export default new Vuex.Store({
  state,
  getters: {
    product: (s) => (id) => s.products.find((p) => p.id === id),
    cartTotal: (s) =>
      s.cart.reduce((n, l) => n + l.unitPriceFen * l.quantity, 0),
    cartCount: (s) => s.cart.reduce((n, l) => n + l.quantity, 0),
    money: () => money,
    // 当前企业（按 currentCompanyId 取，找不到时回退第一个）
    currentCompany: (s) =>
      s.companies.find((c) => c.id === s.currentCompanyId) ||
      s.companies[0] ||
      null,
  },
  mutations: {
    // —— 目录数据 ——
    setProducts(s, v) {
      s.products = v;
    },
    setCategories(s, v) {
      s.categories = v;
    },
    setPackages(s, v) {
      s.packages = v;
    },
    setSearch(s, v) {
      s.search = v;
    },
    setListQuery(s, v) {
      s.listQuery = { ...s.listQuery, ...v };
    },
    // —— 全局提示 ——
    setNotice(s, v) {
      s.notice = v;
    },
    // —— 登录态（演示环境：种子资料已就位，登录仅切换状态并持久化）——
    login(s) {
      s.loggedIn = true;
      persist(s);
    },
    logout(s) {
      s.loggedIn = false;
      persist(s);
    },
    // —— 购物车 ——
    addCart(s, { product, quantity = 1, sku = null }) {
      if (!product.buyable || product.priceFen == null || !product.skuCode) {
        s.notice = "该商品尚未提供可售 SKU、价格或库存，请咨询报价";
        return;
      }
      const id = product.id + ":" + (sku ? sku.id : product.skuCode),
        price = sku ? sku.priceFen : product.priceFen;
      if (price == null || (sku && sku.stock < 1)) {
        s.notice = "所选规格暂不可购买";
        return;
      }
      let line = s.cart.find((x) => x.id === id);
      if (line) line.quantity += quantity;
      else
        s.cart.push({
          id,
          productId: product.id,
          name: product.name,
          model: product.model || null,
          skuCode: sku ? sku.id : product.skuCode,
          unitPriceFen: price,
          quantity,
          image: product.image,
        });
      persist(s);
      s.notice = "已加入购物车";
    },
    // 一站式选购方案加入购物车：同一方案只保留一条，重复加入时刷新为最新配置与价格
    addSchemeCart(s, scheme) {
      if (!scheme) return;
      const id = "scheme:" + (scheme.id || Date.now());
      const parts = scheme.parts || [];
      const count = parts.reduce((n, p) => n + (p.qty || 1), 0);
      const cabinetPart = parts.find((p) => p.module === "机柜") || parts[0];
      const cabinetProduct =
        cabinetPart && s.products.find((p) => p.id === cabinetPart.id);
      const line = {
        id,
        kind: "scheme",
        productId: null,
        schemeId: scheme.id,
        name: scheme.name,
        model: scheme.model || null,
        skuCode: "一站式选购 · 共 " + count + " 件配置",
        unitPriceFen: scheme.packagePriceFen || 0,
        quantity: 1,
        image: (cabinetProduct && cabinetProduct.image) || "machine.svg",
        scheme,
      };
      const index = s.cart.findIndex((x) => x.id === id);
      if (index >= 0) s.cart.splice(index, 1, line);
      else s.cart.push(line);
      persist(s);
    },
    updateQty(s, { id, quantity }) {
      const l = s.cart.find((x) => x.id === id);
      // 一站式方案按整套计价，数量固定为 1
      if (l && l.kind !== "scheme")
        l.quantity = Math.max(1, Number(quantity) || 1);
      persist(s);
    },
    removeCart(s, id) {
      s.cart = s.cart.filter((x) => x.id !== id);
      persist(s);
    },
    setCheckout(s, v) {
      s.checkoutItems = v;
    },
    addOrder(s, v) {
      s.orders.unshift(v);
      s.lastOrder = v;
      s.cart = [];
      s.checkoutItems = [];
      persist(s);
    },
    // —— 选配方案 ——
    setSelected(s, v) {
      s.selected = v;
      persist(s);
    },
    setSelectedScheme(s, v) {
      s.selectedScheme = v;
      persist(s);
    },
    // —— 收货地址 CRUD ——
    addAddress(s, v) {
      const id = "a" + Date.now();
      s.addresses.push({
        id,
        primary: !s.addresses.length,
        ...v,
      });
      persist(s);
      return id;
    },
    updateAddress(s, { id, patch }) {
      const a = s.addresses.find((x) => x.id === id);
      if (a) Object.assign(a, patch);
      persist(s);
    },
    removeAddress(s, id) {
      const wasPrimary = (s.addresses.find((x) => x.id === id) || {}).primary;
      s.addresses = s.addresses.filter((x) => x.id !== id);
      // 删除默认地址后，把第一条补为默认，避免列表与结算无默认地址
      if (wasPrimary && s.addresses.length) s.addresses[0].primary = true;
      persist(s);
    },
    setDefaultAddress(s, id) {
      s.addresses.forEach((a) => (a.primary = a.id === id));
      persist(s);
    },
    // —— 收藏 ——
    toggleFavorite(s, id) {
      s.favorites = s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [...s.favorites, id];
      persist(s);
    },
    // —— 认证与订单状态 ——
    setAuth(s, v) {
      s.authStatus = v;
      s.profile = { ...s.profile, authStatus: v };
      persist(s);
    },
    setOrderStatus(s, { id, status, payMethod }) {
      const o = s.orders.find((x) => x.id === id);
      if (!o) return;
      o.status = status;
      if (payMethod) {
        o.payMethod = payMethod;
        appendMessage(s, {
          type: "order",
          title: status === "待核款" ? "对公打款待核款" : "订单支付成功",
          content:
            status === "待核款"
              ? `订单 ${o.id} 已提交对公打款凭证，财务将在 1 个工作日内完成核款。`
              : `订单 ${o.id} 已完成支付，正在安排备货与发货。`,
        });
      }
      persist(s);
    },
    // 取消订单：仅待付款可取消，记录取消原因
    cancelOrder(s, { id, reason = "用户主动取消" }) {
      const o = s.orders.find((x) => x.id === id);
      if (o && o.status === "待付款") {
        o.status = "已取消";
        o.cancelReason = reason;
        persist(s);
      }
    },
    // 确认收货：仅待收货可确认
    confirmReceipt(s, id) {
      const o = s.orders.find((x) => x.id === id);
      if (o && o.status === "待收货") {
        o.status = "已完成";
        persist(s);
      }
    },
    // 催发货：仅待发货，写入提示（不真实通知）
    remindShip(s, id) {
      const o = s.orders.find((x) => x.id === id);
      if (o && o.status === "待发货") {
        o.reminded = true;
        persist(s);
      }
    },
    // —— 合同 CRUD ——
    // 为订单生成合同（若已存在则直接返回）
    createContract(s, { orderId, title, amountFen, buyer, buyerTaxId }) {
      const exist = s.contracts.find((c) => c.orderId === orderId);
      if (exist) return exist;
      const c = {
        id: "HT" + Date.now(),
        orderId,
        title: title || "采购合同",
        amountFen,
        buyer,
        buyerTaxId,
        seller: "鑫戩智能装备（苏州）有限公司",
        status: "待买方签署",
        createdAt: new Date().toISOString().slice(0, 10),
        signedAt: null,
        terms: "合同金额含 13% 增值税及运费；质保期 12 个月，自签收之日起算。",
      };
      s.contracts.unshift(c);
      appendMessage(s, {
        type: "contract",
        title: "采购合同待签署",
        content: `订单 ${orderId} 的采购合同已生成，可在「采购合同」中预览并回传盖章件。`,
      });
      persist(s);
      return c;
    },
    // 买方签署合同：状态→已生效，记录签署时间
    signContract(s, id) {
      const c = s.contracts.find((x) => x.id === id);
      if (c && c.status !== "已生效") {
        c.status = "已生效";
        c.signedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
        persist(s);
      }
    },
    // —— 发票 CRUD ——
    // 提交开票申请（同一订单仅允许一张；重复提交覆盖为新申请）
    createInvoice(s, { orderId, type, title, taxId, email, amountFen }) {
      const exist = s.invoices.find((v) => v.orderId === orderId);
      if (exist) {
        Object.assign(exist, {
          type,
          title,
          taxId,
          email,
          status: "审核中",
          issuedAt: null,
        });
        appendMessage(s, {
          type: "invoice",
          title: "开票资料已更新",
          content: `订单 ${orderId} 的开票信息已重新提交，等待平台审核。`,
        });
        persist(s);
        return exist;
      }
      const v = {
        id: "INV" + Date.now(),
        orderId,
        type,
        title,
        taxId,
        email,
        amountFen,
        status: "审核中",
        appliedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        issuedAt: null,
      };
      s.invoices.unshift(v);
      appendMessage(s, {
        type: "invoice",
        title: "开票申请已提交",
        content: `订单 ${orderId} 的${type}申请已提交，审核通过后发送至 ${email}。`,
      });
      persist(s);
      return v;
    },
    // 驳回的发票可重提：状态回到审核中
    resubmitInvoice(s, id) {
      const v = s.invoices.find((x) => x.id === id);
      if (v && v.status === "已驳回") {
        v.status = "审核中";
        v.rejectReason = null;
        persist(s);
      }
    },
    // —— 售后 CRUD ——
    // 提交售后工单；关联订单状态→售后中
    createAftersale(s, { orderId, type, reason }) {
      const exist = s.aftersales.find(
        (a) =>
          a.orderId === orderId &&
          a.status !== "已完成" &&
          a.status !== "已拒绝"
      );
      if (exist) return exist;
      const a = {
        id: "AS" + Date.now(),
        orderId,
        type,
        reason,
        status: "待审核",
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        steps: [
          {
            title: "提交申请",
            desc: "客户在线提交售后申请。",
            time: new Date().toISOString().slice(0, 16).replace("T", " "),
            state: "done",
          },
          {
            title: "客服审核",
            desc: "售后客服正在审核。",
            time: null,
            state: "active",
          },
          {
            title: "处理中",
            desc: "审核通过后安排处理。",
            time: null,
            state: "todo",
          },
          {
            title: "完成",
            desc: "处理完成后工单关闭。",
            time: null,
            state: "todo",
          },
        ],
      };
      s.aftersales.unshift(a);
      const o = s.orders.find((x) => x.id === orderId);
      if (o && o.status !== "售后中") o.status = "售后中";
      appendMessage(s, {
        type: "aftersale",
        title: "售后申请已提交",
        content: `${type}申请已受理（工单 ${a.id}），客服将在 1 个工作日内审核。`,
      });
      persist(s);
      return a;
    },
    // 撤回售后工单：仅待审核可撤回
    cancelAftersale(s, id) {
      const a = s.aftersales.find((x) => x.id === id);
      if (a && a.status === "待审核") {
        a.status = "已撤回";
        persist(s);
      }
    },
    // —— 积分 ——
    // 积分兑换：校验余额后立即扣减，并写入一条支出流水与站内消息
    exchangePoints(s, { productId, name, points: cost }) {
      const amount = Number(cost) || 0;
      if (!amount || amount > s.points) {
        s.notice = "积分不足，无法兑换";
        return null;
      }
      s.points -= amount;
      const row = {
        id: "P" + Date.now(),
        type: "exchange",
        title: "积分兑换 · " + (name || "积分好物"),
        points: -amount,
        time: stamp(),
        balance: s.points,
        productId,
      };
      s.pointsLedger.unshift(row);
      appendMessage(s, {
        type: "system",
        title: "积分兑换已提交",
        content: `已使用 ${amount} 积分兑换「${
          name || "积分好物"
        }」，兑换后余额 ${s.points} 积分。`,
      });
      persist(s);
      return row;
    },
    // —— 企业切换 / 资料 ——
    // 提交企业认证：写入企业列表、资料摘要与认证状态，并登记录入一条站内消息
    registerCompany(s, { name, taxId, contact, phone }) {
      const exist = s.companies.find((c) => c.taxId === taxId);
      let company = exist;
      if (exist) {
        Object.assign(exist, { name, contact, phone, status: "审核中" });
      } else {
        company = {
          id: "C" + Date.now(),
          name,
          taxId,
          contact,
          phone,
          role: "管理员",
          salesman: "待分配",
          status: "审核中",
          current: true,
        };
        s.companies.unshift(company);
      }
      s.currentCompanyId = company.id;
      s.companies.forEach((c) => (c.current = c.id === company.id));
      s.authStatus = "审核中";
      s.profile = {
        ...s.profile,
        companyId: company.id,
        companyName: name,
        companyTaxId: taxId,
        name: contact,
        mobile: phone,
        role: company.role || "管理员",
        authStatus: "审核中",
      };
      // 注册即登录，避免提交后仍显示未登录
      s.loggedIn = true;
      appendMessage(s, {
        type: "system",
        title: "企业认证申请已提交",
        content: `${name} 的认证资料已提交，预计 1-2 个工作日完成审核。`,
      });
      persist(s);
      return company;
    },
    switchCompany(s, id) {
      const c = s.companies.find((x) => x.id === id);
      if (!c) return;
      s.currentCompanyId = id;
      s.companies.forEach((x) => (x.current = x.id === id));
      s.authStatus = c.status || "待认证";
      // 切换企业时资料摘要跟随当前企业（联系人 / 手机号 / 企业名 / 角色）
      if (c) {
        s.profile = {
          ...s.profile,
          companyId: c.id,
          companyName: c.name,
          companyTaxId: c.taxId,
          name: c.contact || s.profile.name,
          mobile: c.phone || s.profile.mobile,
          role: c.role || s.profile.role,
        };
      }
      persist(s);
    },
    // 更新个人/企业资料（合并写入）
    updateProfile(s, patch) {
      s.profile = { ...s.profile, ...patch };
      persist(s);
    },
    // —— 消息 ——
    markMessageRead(s, id) {
      const m = s.messages.find((x) => x.id === id);
      if (m && !m.read) {
        m.read = true;
        persist(s);
      }
    },
    markAllMessagesRead(s) {
      s.messages.forEach((m) => (m.read = true));
      persist(s);
    },
    // 内部追加一条消息（开票/售后/合同等操作后触发）
    pushMessage(s, msg) {
      appendMessage(s, msg);
      persist(s);
    },
  },
  actions: {
    async bootstrap({ commit }) {
      const [p, c, b] = await Promise.all([
        productsApi.list(),
        productsApi.categories(),
        productsApi.packages(),
      ]);
      commit("setProducts", withOneStop(p.items));
      commit("setCategories", c);
      commit("setPackages", b);
    },
    async reloadProducts({ state, commit }) {
      const r = await productsApi.list(state.listQuery);
      commit("setProducts", withOneStop(r.items));
      return r.total;
    },
    async productDetail({ state }, id) {
      return (
        state.products.find((p) => p.id === id) ||
        oneStopProducts.find((p) => p.id === id) ||
        productsApi.detail(id)
      );
    },
    async submitOrder({ state, commit }, payload) {
      const items = state.checkoutItems.length
        ? state.checkoutItems
        : state.cart;
      if (!items.length) throw Error("请先选择商品");
      const result = await ordersApi.submit({
        items: items.map((l) => ({
          productId: l.productId,
          name: l.name,
          kind: l.kind || "product",
          model: l.model,
          skuCode: l.skuCode,
          quantity: l.quantity,
          unitPriceFen: l.unitPriceFen,
        })),
        totalFen: items.reduce((n, l) => n + l.unitPriceFen * l.quantity, 0),
        ...payload,
      });
      commit("addOrder", result);
      return result;
    },
  },
});
