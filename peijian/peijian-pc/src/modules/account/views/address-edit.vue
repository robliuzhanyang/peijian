<!--
  页面：新增/编辑收货地址（address-edit.vue）
  路由：/address-edit ｜ 分组：企业与账号
  作用：录入收货人、手机号、省市区与详细地址；支持粘贴整段收货信息自动识别；
        校验通过后新增或更新地址并返回列表
  数据：route.query.id 存在则为编辑模式，回填对应地址；保存走 addAddress / updateAddress
-->
<template>
  <div>
    <div class="page-title"><h1>{{ isEdit ? '编辑收货地址' : '新增收货地址' }}</h1></div>
    <section class="card form">
      <!-- 智能识别：粘贴姓名/电话/地址，一键拆分 -->
      <div class="paste-box">
        <label>粘贴识别地址</label>
        <textarea
          v-model.trim="pasteText"
          placeholder="粘贴收货信息，如：张三 13800000000 广东省深圳市南山区科技园 1 栋 201"
        ></textarea>
        <div class="paste-actions">
          <small
            >自动识别姓名、手机号与省市区
            <a class="link" href="#" @click.prevent="pasteFromClipboard"
              >从剪贴板读取</a
            ></small
          >
          <button class="btn sm primary" type="button" @click="recognize">
            识别并填入
          </button>
        </div>
      </div>

      <div class="review-field">
        <label>收货人</label><input v-model.trim="name" placeholder="姓名" />
      </div>
      <div class="review-field">
        <label>手机号码</label><input v-model.trim="phone" placeholder="11 位手机号" />
      </div>

      <!-- 省 / 市 / 区 三级联动 -->
      <div class="region-row">
        <div class="review-field">
          <label>省份</label>
          <select v-model="province" @change="onProvinceChange">
            <option value="">请选择</option>
            <option v-for="p in regions" :key="p.name" :value="p.name">
              {{ p.name }}
            </option>
          </select>
        </div>
        <div class="review-field">
          <label>城市</label>
          <select v-model="city" :disabled="!province" @change="onCityChange">
            <option value="">请选择</option>
            <option v-for="c in cities" :key="c.name" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="review-field">
          <label>区 / 县</label>
          <select v-model="district" :disabled="!city">
            <option value="">请选择</option>
            <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <div class="review-field">
        <label>详细地址</label
        ><textarea
          v-model.trim="detail"
          placeholder="街道、门牌号、楼层等"
        ></textarea>
      </div>
      <button class="btn primary block" @click="save">
        {{ isEdit ? '保存修改' : '保存地址' }}
      </button>
    </section>
  </div>
</template>
<script>
import regions from '@/modules/account/domain/regions'
import { parseAddress, shortName } from '@/modules/account/domain/addressParse'

export default {
  data() {
    return {
      pasteText: '',
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.query.id
    },
    regions() {
      return regions
    },
    // 当前省份下的城市
    cities() {
      const p = this.regions.find((x) => x.name === this.province)
      return p ? p.cities : []
    },
    // 当前城市下的区县
    districts() {
      const c = this.cities.find((x) => x.name === this.city)
      return c ? c.districts : []
    },
  },
  created() {
    if (!this.isEdit) return
    const a = this.$store.state.addresses.find((x) => x.id === this.$route.query.id)
    if (!a) return
    this.name = a.name
    this.phone = a.phone
    // 兼容旧数据：从完整地址中拆出省市区
    const parsed = parseAddress(a.full, regions)
    if (parsed.region) {
      this.province = parsed.region.province
      this.city = parsed.region.city
      this.district = parsed.region.district
      this.detail = parsed.detail || ''
    } else {
      this.detail = a.full
    }
  },
  methods: {
    // 切换省份后重置市与区
    onProvinceChange() {
      this.city = ''
      this.district = ''
    },
    // 切换城市后重置区
    onCityChange() {
      this.district = ''
    },
    // 从系统剪贴板读取文本（未授权时提示手动粘贴）
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          this.pasteText = text
          this.recognize()
          return
        }
      } catch (e) {
        // 浏览器未授权或非安全上下文，退回手动粘贴
      }
      this.$store.commit('setNotice', '无法读取剪贴板，请手动粘贴后识别')
    },
    // 识别粘贴内容：姓名、手机号、省市区与详细地址
    recognize() {
      if (!this.pasteText) {
        this.$store.commit('setNotice', '请先粘贴收货信息')
        return
      }
      const r = parseAddress(this.pasteText, regions)
      if (r.name) this.name = r.name
      if (r.phone) this.phone = r.phone
      if (r.region) {
        this.province = r.region.province
        this.city = r.region.city
        this.district = r.region.district
      }
      if (r.detail) this.detail = r.detail
      this.$store.commit(
        'setNotice',
        r.region ? '已识别并填入地址' : '已识别姓名/电话，请手动选择省市区'
      )
    },
    save() {
      if (
        !this.name ||
        !/^1\d{10}$/.test(this.phone) ||
        !this.province ||
        !this.city ||
        !this.district ||
        !this.detail
      ) {
        this.$store.commit('setNotice', '请填写姓名、有效手机号、省市区和详细地址')
        return
      }
      // 直辖市 / 特别行政区：省市同名时不重复拼接
      const sameCity =
        this.city === this.province || shortName(this.city) === shortName(this.province)
      const regionText = sameCity
        ? `${this.province}${this.district}`
        : `${this.province}${this.city}${this.district}`
      const payload = {
        name: this.name,
        phone: this.phone,
        full: `${regionText}${this.detail}`,
        province: this.province,
        city: this.city,
        district: this.district,
        detail: this.detail,
      }
      let savedId = this.$route.query.id
      if (this.isEdit) {
        this.$store.commit('updateAddress', {
          id: this.$route.query.id,
          patch: payload,
        })
      } else {
        savedId = this.$store.commit('addAddress', payload)
      }
      // 从确认订单进入时回到结算页，并自动选中刚保存的地址
      this.$router.push(
        this.$route.query.from === 'checkout'
          ? { path: '/checkout', query: { addressId: savedId } }
          : '/addresses'
      )
    },
  },
}
</script>

<style>
/* 粘贴识别区 */
.paste-box {
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px dashed #c9d9ed;
  border-radius: 8px;
  background: #f7fafd;
}
.paste-box > label {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 12px;
}
.paste-box textarea {
  width: 100%;
  min-height: 62px;
}
.paste-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}
.paste-actions small {
  color: var(--light);
  font-size: 11px;
}
/* 省市区三级联动 */
.region-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.region-row select {
  width: 100%;
}
.region-row select:disabled {
  color: #aab4c1;
  background: #f6f8fb;
}
</style>
