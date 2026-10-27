<!--
  合同专用章：采购合同落款乙方位置自动盖入
  纯 SVG 绘制，不依赖图片资源，打印与截图均清晰
  与报价单 CompanySeal 区分（"合同专用章"），归属 billing 模块
-->
<template>
  <svg
    class="contract-seal"
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    role="img"
    aria-label="鑫戩智能装备（苏州）有限公司 合同专用章"
  >
    <!-- 外圈与内圈 -->
    <circle cx="100" cy="100" r="90" fill="none" stroke="#c8332b" stroke-width="5" />
    <circle cx="100" cy="100" r="81" fill="none" stroke="#c8332b" stroke-width="1.6" />

    <!-- 公司名称沿上半圈环绕：名称 14 字，用更大弧半径并收窄字号避免首尾截断 -->
    <defs>
      <path :id="arcId" d="M 22,100 A 78,78 0 0 1 178,100" />
    </defs>
    <text fill="#c8332b" font-size="14" font-weight="700" letter-spacing="1">
      <textPath :href="'#' + arcId" startOffset="50%" text-anchor="middle">
        鑫戩智能装备（苏州）有限公司
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
      letter-spacing="3"
    >
      合同专用章
    </text>
  </svg>
</template>

<script>
export default {
  name: "ContractSeal",
  props: {
    // 印章显示边长（px）
    size: { type: Number, default: 150 },
  },
  data() {
    // textPath 需要唯一 id
    return { arcId: "contract-seal-arc-" + Math.random().toString(36).slice(2, 9) };
  },
};
</script>
<style>
.contract-seal {
  display: block;
  opacity: 0.92;
  transform: rotate(-8deg);
}
</style>
