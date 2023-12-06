<template>
  <svg class="home">
    <defs>
      <filter id="Gaussian_Blur">
        <feGaussianBlur in="SourceGraphic">
          <animate attributeName="stdDeviation" values="0;0.5;2;4" :dur="`${duration/1000}s`" calcMode="paced" fill="freeze" />
        </feGaussianBlur>
      </filter>
      <filter id="Initial_Blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0" />
      </filter>
    </defs>

    <Title
      :filter="citySelected === null ? 'url(#Initial_Blur)' : 'url(#Gaussian_Blur)'"
      :opacity="citySelected === null ? 1 : 0.5"
      :transform='`translate(${paddingX}, ${paddingY})`'
      :width="innerWidth"
      :height="titleHeight"
      :totalHeight="height"
      :totalWidth="width"
    ></Title>

    <template v-if="data !== null"> <!-- template实际上不会渲染到页面上，这里的作用主要是把两个部分组合起来适用v-if-->
      <Timeline
        v-if="citySelected === null"
        :transform='`translate(${paddingX}, ${paddingY + titleHeight + timelineHeight * 0.5})`'
        :width="innerWidth"
        :height="timelineHeight * 0.5"
        :paddingX="paddingX"
      />

      <Squares
        :filter="citySelected === null ? 'url(#Initial_Blur)' : 'url(#Gaussian_Blur)'"
        :transform='`translate(${paddingX}, ${paddingY + titleHeight + timelineHeight})`'
        :width="innerWidth"
        :height="squaresHeight"
        :globalX="paddingX"
        :globalY="paddingY + titleHeight + timelineHeight"
        :globalWidth="width"
        :globalHeight="height"
      />
    </template>
    
    <foreignObject v-else
      :x="paddingX"
      :y="paddingY + titleHeight"
      :width="innerWidth"
      :height="timelineHeight + squaresHeight"
    >
      <div v-loading="true" :style="{ width: '100%', height: titleHeight + timelineHeight + squaresHeight + 'px'}"></div>
    </foreignObject>

    <rect id="mask" v-if="citySelected !== null"
      :x=0
      :y=0
      :width="innerWidth*2"
      :height="innerHeight*2"
      fill="black"
      opacity="0.8"
    ></rect>
    <g id="singleCity"
       :transform='`translate(${paddingX}, ${paddingY + titleHeight + timelineHeight})`'
    ></g>
    <Timeline v-if="citySelected !== null && lineSelected === null"
        :transform='`translate(${paddingX}, ${paddingY + titleHeight + timelineHeight * 0.5})`'
        :width="innerWidth"
        :height="timelineHeight * 0.5"
        :paddingX="paddingX"
    />
  </svg>
</template>

<script>
import Title from "@/components/Title.vue"
import Timeline from "@/components/Timeline.vue"
import Squares from "@/components/Squares.vue"
import { mapState } from "vuex"

const getWidth = () => document.getElementById("app").clientWidth;
const getHeight = () => document.getElementById("app").clientHeight;

export default {
  name: 'HomeView',
  components: {
    Title,
    Timeline,
    Squares,
  },
  data () {
    return {
      width: getWidth(),
      height: getHeight(),
    }
  },
  computed: {
    ...mapState([
      "data",
      "citySelected",
      "duration",
      "lineHovered",
      "lineClicked",
    ]),
    lineSelected() {
      return this.lineHovered ?? this.lineClicked;
    },
    paddingX() {
      return this.width * 45 / 1080;
    },
    paddingY() {
      return this.height * 54 / 1080;
    },
    titleHeight() {
      return this.height * 146 / 1080;
    },
    timelineHeight() {
      return this.height * 54 / 1080;
    },
    squaresHeight() {
      return this.height - this.paddingY * 2 - this.titleHeight - this.timelineHeight;
    },
    innerWidth() {
      return this.width - this.paddingX * 2;
    },
    innerHeight() {
      return this.height - this.paddingY * 2;
    },
  },
  methods: {
    resize() {
      this.width = getWidth();
      this.height = getHeight();
    },
  },
  mounted() {
    window.addEventListener('resize', this.resize.bind(this));
  },
}
</script>
<style>
.home {
  width: 100%;
  height: 100%;
}
.el-loading-mask {
  background-color: transparent !important;
}
</style>
