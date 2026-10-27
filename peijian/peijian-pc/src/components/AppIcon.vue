<!--
  组件：线性图标（AppIcon）
  用途：统一的内联 SVG 图标，避免依赖外部图标库与图片资源
  Props：name 图标名（未匹配时回退为 box）
  说明：class 会由 Vue 自动合并到根 svg 上，可直接用 class 控制尺寸与颜色
-->
<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="path"
  ></svg>
</template>

<script>
const icons = {
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  cart: '<path d="M2 3h3l3 13h11l3-10H6"/><circle cx="10" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  company:
    '<path d="M5 21V3h14v18M2 21h20M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  zap: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  lens: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/>',
  power: '<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M7 4l10 5"/>',
  tool: '<path d="M21 4a6 6 0 0 1-8 8l-8 9-3-3 9-8a6 6 0 0 1 8-8l-4 4 3 3z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v10h14V12M12 8v14"/><path d="M12 8c-8 1-8-7-3-6 3 0 3 6 3 6Zm0 0c8 1 8-7 3-6-3 0-3 6-3 6Z"/>',
  book: '<path d="M12 5C8 2 3 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-1-1-6-2-10 1ZM12 5v16"/>',
  service:
    '<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 11h3v8H3zM18 11h3v8h-3zM19 19c0 3-4 3-7 3"/>',
  truck:
    '<path d="M1 5h13v13H1zM14 9h5l4 4v5h-9"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  file: '<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
  pin: '<path d="M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 1 1 16 0Z"/><circle cx="12" cy="9" r="3"/>',
  coin: '<circle cx="12" cy="12" r="10"/><path d="m8 7 4 5 4-5M12 12v7M8 13h8M8 16h8"/>',
  share:
    '<circle cx="18" cy="4" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="20" r="3"/><path d="m8 10 7-4M8 14l7 4"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3M12 15v3"/>',
  bell: '<path d="M4 17h16l-2-4V8A6 6 0 0 0 6 8v5zM9 21h6"/>',
  upload: '<path d="M12 16V2m-5 5 5-5 5 5M3 15v7h18v-7"/>',
  download: '<path d="M12 2v14m-5-5 5 5 5-5M3 18v4h18v-4"/>',
  play: '<path d="m7 3 14 9-14 9z"/>',
  phone: '<path d="M5 2H2c0 11 9 20 20 20v-4l-6-3-3 3a17 17 0 0 1-7-7l3-3-4-6Z"/>',
  message: '<path d="M3 3h18v14H9l-6 5zM7 7h10M7 11h7"/>',
  settings:
    '<path d="m9 2 6 0 1 3 3 2 3 1v7l-3 1-3 2-1 4H9l-1-4-3-2-3-1V8l3-1 3-2z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 3"/>',
  wallet: '<path d="M3 5h17v16H3zM3 5V2h14v3M15 10h7v7h-7z"/><path d="M18 13h1"/>',
  table:
    '<rect x="2" y="3" width="20" height="18" rx="1"/><path d="M2 9h20M2 15h20M9 3v18M16 3v18"/>',
  plus: '<path d="M12 3v18M3 12h18"/>',
};

export default {
  props: { name: { type: String, required: true } },
  computed: {
    path() {
      return icons[this.name] || icons.box;
    },
  },
};
</script>
