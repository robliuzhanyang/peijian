<!--
  组件：二维码占位图（QrCode）
  用途：页脚公众号 / 小程序 / 视频号二维码位置，演示环境用确定性点阵绘制
  说明：正式上线时替换为后台下发的真实二维码图片即可
-->
<template>
  <svg
    class="qr-code"
    :width="size"
    :height="size"
    viewBox="0 0 21 21"
    role="img"
    :aria-label="label || '二维码'"
  >
    <rect width="21" height="21" fill="#ffffff" />
    <!-- 数据区点阵 -->
    <path :d="modulePath" fill="#1d2329" />
    <!-- 三个定位角 -->
    <g v-for="corner in corners" :key="corner.x + '-' + corner.y">
      <rect :x="corner.x" :y="corner.y" width="7" height="7" fill="#1d2329" />
      <rect
        :x="corner.x + 1"
        :y="corner.y + 1"
        width="5"
        height="5"
        fill="#ffffff"
      />
      <rect
        :x="corner.x + 2"
        :y="corner.y + 2"
        width="3"
        height="3"
        fill="#1d2329"
      />
    </g>
  </svg>
</template>

<script>
// 点阵边长（含定位角）
const GRID = 21

// 定位角位置：左上 / 右上 / 左下
const CORNERS = [
  { x: 0, y: 0 },
  { x: GRID - 7, y: 0 },
  { x: 0, y: GRID - 7 },
]

// 固定种子的伪随机：保证同一种子每次渲染图案一致
function makePath(seed) {
  let state = seed || 1
  const random = () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 1000) / 1000
  }
  let path = ""
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      // 定位角及其分隔带留白，避免与数据点重叠
      const inCorner =
        (x < 8 && y < 8) ||
        (x > GRID - 9 && y < 8) ||
        (x < 8 && y > GRID - 9)
      if (inCorner) continue
      if (random() > 0.52) path += `M${x} ${y}h1v1h-1z`
    }
  }
  return path
}

export default {
  name: "QrCode",
  props: {
    // 图案种子：不同种子生成不同点阵
    seed: { type: Number, default: 1 },
    // 显示边长（px）
    size: { type: Number, default: 76 },
    // 无障碍说明
    label: { type: String, default: "" },
  },
  computed: {
    corners() {
      return CORNERS
    },
    modulePath() {
      return makePath(this.seed)
    },
  },
}
</script>

<style>
.qr-code {
  display: block;
  border-radius: 4px;
  background: #fff;
}
</style>
