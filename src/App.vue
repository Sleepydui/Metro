<template>
  <router-view/> <!-- 把路由对应过来，router/index.js中定义的当前的页面 -->
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: min(100vw, calc(100vh / 9 * 16));
  height: min(100vh, calc(100vw / 16 * 9)); /* css中不同单位也可以做计算，但是符号左右两边要空格，是规范，如calc(100vh - 16px)🐱 */
}
body {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  margin: 0; /* 浏览器默认会有边距，在这里去掉🐱 */
  background-color: #000;
  overflow: hidden;
}
@font-face {
  font-family: 'HelveticaNeue';
  src: url('@/assets/fonts/HelveticaNeue.ttc');
}
@font-face {
  font-family: 'SourceHanSansCN';
  src: url('@/assets/fonts/SourceHanSansCN-Normal.otf');
}

</style>
