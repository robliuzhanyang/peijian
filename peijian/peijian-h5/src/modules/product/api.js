/**
 * 商品域 API（product 模块）
 * - mock：products / categories / packages 读 catalog.json
 * - 真实接口：GET /products、/products/:id、/categories、/packages
 * 调用方：Vuex store（目录 bootstrap、分页查询、详情）
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "@/mock/catalog.json";

export const productsApi = {
  /**
   * 商品列表（分页查询）
   * @param {{q?:string,cat?:string,page?:number,pageSize?:number}} query 关键词 / 分类 / 分页
   * @returns {Promise<{items:Array,total:number}>}
   */
  list(query = {}) {
    return IS_MOCK
      ? Promise.resolve({
          items: catalog.products.filter(
            (p) =>
              (!query.q ||
                [p.name, p.model, p.code, p.series].some(
                  (x) => x && x.toLowerCase().includes(query.q.toLowerCase()),
                )) &&
              (!query.cat || p.cat === query.cat),
          ),
          total: catalog.products.length,
        })
      : http.get("/products", { params: query }).then((r) => r.data);
  },

  /** 商品详情：找不到返回 null */
  detail(id) {
    return IS_MOCK
      ? Promise.resolve(catalog.products.find((p) => p.id === id) || null)
      : http.get("/products/" + encodeURIComponent(id)).then((r) => r.data);
  },

  /** 分类树 */
  categories() {
    return IS_MOCK
      ? Promise.resolve(catalog.categories)
      : http.get("/categories").then((r) => r.data);
  },

  /** 套装列表 */
  packages() {
    return IS_MOCK
      ? Promise.resolve(catalog.packages)
      : http.get("/packages").then((r) => r.data);
  },
};

export default productsApi;
