<template>
    <g class='squares'>
        <Square
            v-for="(city, i) in sortedCities"
            :key="city['城市名称']"
            :datum="city"
            :width="squareSize"
            :height="squareSize"
            :textSize="textSize"
            :transform="getTransform(i)"
            :globalX="globalX"
            :globalY="globalY"
            :globalWidth="globalWidth"
            :globalHeight="globalHeight"
            :popout="citySelected === city['城市名称']"
        ></Square>
    </g>
</template>


<script>
import { ref, onMounted, watch, computed } from 'vue'
import { mapMutations, mapState, mapGetters } from 'vuex'
import Square from '@/components/Square.vue';
import * as d3 from 'd3'

export default {
  name: 'Squares',
  components: {
    Square,
  },
  data() {
    return {
        rows: 0,
        columns: 0,
        squareSize: 0,
        textSize: 0,
        marginX: 0,
        marginY: 0,
    }
  },
  props: {
    width: {
        type: Number,
        default: 0,
    },
    height: {
        type: Number,
        default: 0,
    },
    globalX: {
        type: Number,
        default: 0,
    },
    globalY: {
        type: Number,
        default: 0,
    },
    globalWidth: {
        type: Number,
        default: 0,
    },
    globalHeight: {
        type: Number,
        default: 0,
    },
  },
  computed: {
    ...mapState({
        timeRange: (state) => state.timeRange,
        countrySelected: (state) => state.countrySelected,
        cityHovered: (state) => state.cityHovered,
        citySelected: (state) => state.citySelected,
        data: (state) => state.data,
    }),
    ...mapGetters([
        'cities',
    ]),
    sortedCities() {
        // 假设 getCities 是一个 getter，它返回一个包含所有城市的数组
        let cities = this.cities;

        // 对城市数组进行排序
        cities.sort((a, b) => {
            // 假设我们要根据 'loc_num' 进行排序
            // 如果 'loc_num' 是空的，我们将它们视为0
            const locNumA = a['loc_num'] || 0;
            const locNumB = b['loc_num'] || 0;

            return locNumA - locNumB;
        });

        return cities;
    },
    size() {
        return {
            width: this.width,
            height: this.height,
        }
    }
  },

  methods: {
    layout() {
        // 计算容器的大小和总的间距
        // x * x / w * h / 1.2 = totalNumber

        const width = this.width;
        const height = this.height;
        const textMarginRate = 0.2;
        const marginRate = 0.1;
        // let columns = Math.ceil(Math.sqrt(this.data.length * width * (1 + textMarginRate) / height));
        // let rows = Math.ceil(this.data.length / columns);
        let columns = 26
        let rows = 9
        // const size = Math.min(width / columns, height / rows / (1 + textMarginRate)) * (1 - marginRate);
        const size = width * 0.031;
        // const marginX = (width - columns * size) / (columns - 1);
        const marginY = (height - rows * size) / rows;
        const marginX = width * 0.0078125;
        // const marginY = height * 0.02962963;

        this.rows = rows;
        this.columns = columns;
        this.squareSize = size;
        this.textSize = marginY;
        this.marginX = marginX;
        this.marginY = marginY;
    },
    getTransform(i) {
        if (this.columns === 0) {
            return `translate(0, 0)`;
        }
        let x = (i % this.columns) * (this.squareSize + this.marginX);
        let y = Math.floor(i / this.columns) * (this.squareSize + this.marginY);
        return `translate(${x}, ${y})`;
    },
    hoverEvent(cityName) {
      if (cityName === null) {
        d3.select(this.$el)
            .selectAll('.square-wrapper')
            .order();
      }
      else {
        d3.select(this.$el)
            .selectAll('.square-wrapper')
            .filter(function() {
              return this.getAttribute('id') === cityName;
            })
            .raise();
      }
    }
  },
  mounted() {
    this.layout();
  },
  watch: {
    size() {
        this.layout();
    },
    cityHovered() {
        this.hoverEvent(this.cityHovered);
    },
  },
}
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>