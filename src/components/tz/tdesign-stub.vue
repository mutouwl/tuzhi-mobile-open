<!--
  TDesign 组件桩文件。
  在微信小程序中，TDesign 组件通过 usingComponents 注册为原生小程序组件，
  由微信运行时直接渲染，不需要 Vue 的 render 函数。
  但 easycom 会生成异步 Vue 组件注册，Vue 尝试挂载时报
  "template or render function not defined" 错误。
  本桩组件提供一个空的 render 函数，满足 Vue 的要求，
  实际渲染由原生小程序运行时处理。
-->
<script>
export default {
  render(h) {
    return h('view', this.$slots.default)
  }
}
</script>
