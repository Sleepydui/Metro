<template>
    <g class="timeline">
    </g>
</template>
  
<script>
import { ref, onMounted, watch, computed } from 'vue'
import { mapMutations, mapState } from 'vuex'
import * as d3 from 'd3'

export default {
    name: 'Timeline',
    props: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    inject: ['cities'],

    computed: {
      ...mapState({
        rawdata:(state) => state.rawdata,
        timeRange: (state) => state.timeRange, //传入timeRange
      }),

      parsedCities() {
        return this.cities.map(city => {
          const lines = Object.values(city.lines);
          return lines.map(line => {
            return {
              name: line.线路,
              date: new Date(line.首发时间)
            };
          });
        }).flat().sort((a, b) => a.date - b.date);
      },

      //定义timeRangeWhole()
      timeRangeWhole() {
        //console.log(this.parsedCities);
        return [
          d3.min(this.parsedCities, (d) => new Date(d.date)),
          d3.max(this.parsedCities, (d) => new Date(d.date))
        ];
      },

    },

    methods: {
    ...mapMutations([
      'updateTimeRange', //传入timeRange方法
    ]),

    drawTimeline(){
    const maintimeRange = this.timeRange ?? this.timeRangeWhole;
    console.log(this.timeRange);
    console.log(maintimeRange);

    // 定义比例尺
    const xScale = d3.scaleTime()
      .domain(maintimeRange)
      .range([0, this.width*0.93])
      .clamp(true);


    // 定义轴
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y"))
      .tickValues([xScale.domain()[0]].concat(
        d3.timeYear.every(5).range(xScale.domain()[0], xScale.domain()[1])
      ).concat(xScale.domain()[1])) 
      // .tickValues(xScale.domain()) 

    // 绘制轴
    let axisGroup = d3.select(this.$el).selectAll('.axis')
    if (axisGroup.node() === null){
      axisGroup = d3.select(this.$el)
        .append('g')
        .classed('axis', true)
        .attr('color', 'white')
      }
    axisGroup.call(xAxis)

    // 定义圆形滑块
    let slider = d3.select(this.$el).selectAll('.slider')
    if (slider.node() === null) {
      slider = d3.select(this.$el)
        .append('circle')
        .classed('slider', true)
        .attr('r', 7) 
        .attr('cx', xScale(maintimeRange[0]))
        .attr('cy', 1)  
        .style('fill', 'black')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .call(d3.drag()
          .on('drag', (event) => {  // Use event object here
            let x = d3.pointer(event, this.$el)[0];  // Use d3.pointer to get the mouse coordinates
            let time = xScale.invert(x);
            slider.attr('cx', x);  // update position of the circle slider
            this.updateTimeRange(time);  // update the global variable
          })
          .on('end', () => {
          })
        )
    }

      }
    },

    mounted() {
     this.drawTimeline()
      }
    }

</script>

