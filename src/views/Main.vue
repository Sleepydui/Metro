<template>
    <div :style="{background: bgcolor}">
      <svg
        class="main"
        :width="size.width"
        :height="size.height"
        :style="{
          position: 'absolute',
          left:'0px',
          background: bgcolor,
        }"
        v-if="rawdata !== null"
      >

      <text class="maintitle" x="1.5em" y="1.5em">中国地铁线路发展历史</text>
      <text class="subtitle" x="3em" y="4.7em">Evolution of Urban Metro Lines Across the Globe</text>

      <g class="legend" :transform="`translate(${0},${0})`">
          <Legend></Legend>
        </g>

        <g class = "square"
          :transform="`translate(${0},${this.size.height*0.2})`"
        >
            <Square
              :width="size.width"
              :height="size.height"
            >
            </Square>
        </g>

        <g class = "timeline"
          :transform="`translate(${50}, ${this.size.height*0.145})`"
        >
            <Timeline
              :width="size.width"
              :height="size.height * 0.15"
              :bgcolor="bgcolor"
       
            >
            </Timeline>
        </g>


      </svg>
    <div class="loading"
      v-else
    >
      <h1>Loading</h1>
    </div>
  </div>
</template>


<script>
// @ is an alias to /src
//import DataController from '@/components/DataController.vue'
import Square from '@/components/Square.vue'
import Legend from '@/components/Legend.vue'
import Timeline from '@/components/Timeline.vue'
import { computed } from "vue";
import { mapMutations, mapState } from 'vuex'
import { color, map } from 'd3';

export default {
  name: 'Main',

  data(){
    return {
      size: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      color: 'black',
      bgcolor: 'black',
      appcolor: 'green',
    }
  },
  provide() {
    return {
      cities: computed(() => this.cities),
      cityCoordinates:  computed(() => this.cityCoordinates),
    }
  },

  computed: {
    ...mapState({
      rawdata: (state) => state.rawdata,
      cityCoordinates: (state) => state.cityCoordinates,
    }),

    cities() {
      if (this.rawdata === null) return null; //一定要判断
      const cities = Object.keys(this.rawdata).map(city => {
        const lines = {}
        this.rawdata[city].forEach(line => {
          lines[line.线路] = line;
        });
        return {
          name: city,
          lines:lines,
        }
      })
      return cities;
    },

  },

  watch: {

  },

  components: {
    Square,
    Legend,
    Timeline,
  },


  mounted() {
    //console.log(this.cities)
    console.log(this.cityCoordinates);
  }


}
</script>

<style>
  .maintitle,
  .subtitle {
    fill: white;
  }
</style>
