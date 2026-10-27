<!--
  公司印章：正式报价单落款用
  纯 SVG 绘制，不依赖图片资源，打印与截图均清晰
-->
<template>
  <svg
    class="company-seal"
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    role="img"
    aria-label="吉安鑫戬科技有限公司 报价专用章"
  >
    <!-- 外圈与内圈 -->
    <circle cx="100" cy="100" r="90" fill="none" stroke="#c8332b" stroke-width="5" />
    <circle cx="100" cy="100" r="81" fill="none" stroke="#c8332b" stroke-width="1.6" />

    <!-- 公司名称沿上半圈环绕：半圆弧保证文字居中不被截断 -->
    <defs>
      <path :id="arcId" d="M 30,100 A 70,70 0 0 1 170,100" />
    </defs>
    <text fill="#c8332b" font-size="18" font-weight="700" letter-spacing="2">
      <textPath :href="'#' + arcId" startOffset="50%" text-anchor="middle">
        吉安鑫戬科技有限公司
      </textPath>
    </text>

    <!-- 五角星 -->
    <polygon
      fill="#c8332b"
      points="100,79 104,90.5 116.2,90.7 106.5,98.1 110,109.8 100,102.8 90,109.8 93.5,98.1 83.8,90.7 96,90.5"
    />

    <!-- 章别 -->
    <text
      x="100"
      y="148"
      text-anchor="middle"
      fill="#c8332b"
      font-size="19"
      font-weight="700"
      letter-spacing="4"
    >
      报价专用章
    </text>
  </svg>
</template>

<script>
export default {
  name: "CompanySeal",
  props: {
    // 印章显示边长（px）
    size: { type: Number, default: 120 },
  },
  data() {
    // 同一页面可能放多个印章，textPath 需要唯一 id
    return { arcId: "seal-arc-" + Math.random().toString(36).slice(2, 9) }
  },
}
</script>

<style>
.company-seal {
  display: block;
  opacity: 0.92;
  transform: rotate(-8deg);
}
</style>
