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


    data() {
      return {
        carPath: "M27.996 13.6625C27.9833 13.5238 27.6603 10.2281 25.8078 6.89257C24.7025 4.90295 23.2814 3.31251 21.5832 2.16616C19.4549 0.728822 16.9044 0 14.003 0H3.31819C1.49185 0 0.00596582 1.45921 0.00596582 3.25236V6.6754C0.00198861 6.70978 0 6.74454 0 6.7793C0 6.81406 0.00198861 6.84882 0.00596582 6.8828V13.7457C0.00596582 15.5392 1.49185 16.9984 3.31819 16.9984H5.63572C5.65321 16.9992 5.67071 17 5.68821 17C5.70571 17 5.72321 16.9992 5.74032 16.9984H24.6882C26.5145 16.9984 28 15.5392 28 13.7457C28 13.718 27.9988 13.6902 27.996 13.6625Z M23.7141 7.02538H13.7822V5.27598H22.2831C22.311 5.27598 22.338 5.27441 22.3655 5.27246C22.8535 5.79857 23.3037 6.38405 23.7141 7.02578V7.02538Z M1.88086 13.7456V7.7002H4.75042V15.1568H3.31823C2.52557 15.1568 1.88126 14.5236 1.88126 13.7456H1.88086Z M24.6878 15.1565H6.62528V6.77892C6.62528 6.27039 6.20568 5.85833 5.68785 5.85833H1.88086V3.25199C1.88086 2.47395 2.52517 1.84082 3.31783 1.84082H14.0026C16.34 1.84082 18.3994 2.37631 20.1315 3.43282H12.8449C12.327 3.43282 11.907 3.84528 11.907 4.35381V7.94481C11.907 8.45334 12.3266 8.8654 12.8449 8.8654H24.6274C24.6552 8.8654 24.6822 8.86384 24.7089 8.86189C25.8046 11.2683 26.0866 13.461 26.1236 13.7867C26.1009 14.5456 25.4654 15.1557 24.6874 15.1557L24.6878 15.1565Z", // 完整的SVG路径字符串
      };
    },

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
        console.log(this.parsedCities);
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
      .clamp(true)
      .nice();


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
        .attr('cy', 1)  
        .style('fill', 'black')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
    }

    slider.attr('cx', xScale(maintimeRange[0]))  // update position of the circle slider
      .call(d3.drag()
        .on('drag', (event) => {  // Use event object here
          let x = d3.pointer(event, this.$el.parentNode)[0];  // 当前鼠标位置
          let time = xScale.invert(x); // 将位置转换为时间

          // 获取时间轴的范围（即最小和最大时间对应的像素值）
          const [minX, maxX] = [xScale.range()[0], xScale.range()[1]];

           // 检查x坐标是否在时间轴的范围内
          if (x < minX) {
            x = minX;  // 如果小于最小值，则设置为最小值
            time = xScale.invert(minX);  // 更新时间为对应的最小时间
          } else if (x > maxX) {
            x = maxX;  // 如果大于最大值，则设置为最大值
            time = xScale.invert(maxX);  // 更新时间为对应的最大时间
          }

          slider.attr('cx', x);  // update position of the circle slider
          this.updateTimeRange(time);  // update the global variable
        })
        .on('end', () => {
        })
      )

      }
    },

    mounted() {
     this.drawTimeline()
      }
    }

</script>

