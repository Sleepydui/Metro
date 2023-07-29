<template>


    <g class = 'square'>
        <!-- <text class="maintitle" x="1.5em" y="1.5em" style="color: white;">全球地铁线路发展历史</text> -->
    </g>

  </template>


<script>
import { ref, onMounted, watch, computed } from 'vue'
import { mapState } from 'vuex';
import * as d3 from 'd3'

export default {
  name: 'Square',
  props: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  inject: ['cities', 'cityCoordinates'],

  computed: {
    ...mapState({
      rawdata:(state) => state.rawdata,
      timeRange: (state) => state.timeRange, // 导入 timeRange
    }),
  },

  methods: {
    prepareData() {
    return this.cities.map(city => {
      const cityName = city.name;
      const thiscity = Object.values(city.lines);
      const cityData = this.cityCoordinates.find(d => d.城市 === cityName);

      if (cityData && cityData.GDP_per_capita) {
        city.gdp = cityData.GDP_per_capita;
        city.面积 = cityData.面积;
        city.城市名称 = cityData.城市;
        city.城市英文 = cityData.城市英文;
        city.经度 = cityData.经度;
        city.纬度 = cityData.纬度;
      }

      const cityCenterLongitude = city.纬度;
      const cityCenterLatitude = city.经度;
      const maxDistance = this.getDistance(thiscity, cityCenterLongitude, cityCenterLatitude);

      const cityCenterX = rectWidth / 2;
      const cityCenterY = rectWidth / 2;

      const cityScale = rectWidth / maxDistance;

      const startX = cityCenterX+(d["起点站经度"]-cityCenterLongitude)*cityScale;
      const startY = cityCenterY+(d["起点站纬度"]-cityCenterLatitude)*cityScale;
      const endX = cityCenterX+(d["终点站经度"]-cityCenterLongitude)*cityScale;
      const endY = cityCenterY+(d["终点站纬度"]-cityCenterLatitude)*cityScale;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      return { ...city, thiscity, cityData, maxDistance, cityScale, startX, startY, endX, endY, length };
    });
  },

      drawSquare(){
        const preparedData = this.prepareData();
        console.log(this.cities)
        console.log(this.cityCoordinates)
        if (!this.cities || !this.$el || !this.cityCoordinates) {
            return;
        }

        // 根据城市面积从大到小排序
        this.cities.sort((a, b) => b.面积 - a.面积);
        // this.cities.sort((a, b) => b.gdp - a.gdp);
        //console.log(this.cities)


        // 计算容器的大小和总的间距
        let containerWidth = this.width * 1.04;
        let containerHeight = this.height; // 考虑到只占画布的 85%
        let containerArea = containerWidth * containerHeight;
        let totalMargin = containerWidth * 0.025;

        // 首先根据数据集的大小计算出矩形的宽度
        let rectWidth = Math.sqrt(containerArea / (this.cities.length)) - totalMargin;

        // 计算一行最多可以放置多少个矩形
        let columns = Math.floor(containerWidth / (rectWidth + totalMargin)) + 2 ;
        let rows = Math.floor(this.cities.length / columns);
        let rest = this.cities.length % columns;

        // 根据 rows 和 rest 调整矩形的宽度
        if (rest <= rows) {
            rectWidth = containerWidth / (columns + 1) - totalMargin;
        } else if (rest > rows) {
            rectWidth = containerWidth / (columns + 2) - totalMargin;
        }


        //编组
        let squareGroup = d3.select(this.$el).selectAll('.drawSquare')
        if (squareGroup.node() === null){
          squareGroup = d3.select(this.$el)
            .append('g')
            .classed('drawSquare', true)
            .attr('transform', `translate(${this.height*0.07},${0})`)
        }
        
        const squares = squareGroup.selectAll('.square')
          .data(this.cities)
          .join('g')
          .attr('class', 'square')
          .attr("transform", (d, i) => {
            let x = (i % columns) * (rectWidth + totalMargin);
            let y = parseInt(i / columns) * (rectWidth + totalMargin);
            return `translate(${x},${y})`;
          });

        // 添加矩形
        squares.append("rect")
            .attr("class", "border")
            .attr('width', rectWidth) // (xScale(117) - xScale(115))*0.5
            .attr('height', rectWidth) //  (yScale(39) - yScale(41))*0.5
            .style('fill', 'white')
            .style('opacity', '0')
            .style('stroke-opacity', '0')
            .style('stroke', 'white');

          // 添加下面的文字
            squares.append("text")
            .attr("class", "city-name")
            .attr("x", rectWidth/9)
            .attr("y", rectWidth + 17)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .text(d => d.城市名称);

            squares.append("text")
            .attr("class", "city-nameen")
            .attr("x", rectWidth/10 - 10)
            .attr("y", rectWidth + 31)
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .text(d => d.城市英文);


        // 定义宽度
        const strokeWidthScale = d3.scaleLinear()
            .domain([0, 0.3, 1]) // assuming "归一化覆盖率" is between 0 and 1
            .range([1, 14, 15]); // map to a range of stroke widths
        
        // 定义圆的半径比例尺
        const radiusScale = d3.scaleLinear()
            .domain([0,0.1,0.3, 1]) // 假设 "归一化覆盖率" 在 0 和 1 之间
            .range([rectWidth/7,rectWidth/3,rectWidth/2, rectWidth/1.5]); // 映射到半径范围

        // 定义小正方形的蒙版 定义 clipPath
        squares.append("clipPath")
            .attr("id", "city-square-clip")
            .append("rect")
            .attr("transform", (d, i) => {
              let x = (i % columns) * (rectWidth + totalMargin);
              let y = parseInt(i / columns) * (rectWidth + totalMargin);
              return `translate(${x},${y})`;
            })
            .attr("width", rectWidth) // (xScale(117) - xScale(115))*0.5
            .attr("height", rectWidth);  //(yScale(39) - yScale(41))*0.5
        
        // 定义打开界面的蒙版 clipPath
        // const pageClipPath = squares.append("clipPath")
        // .attr("id", "page-square-clip")
        //     .append("rect")
        //     .attr("x", -100)
        //     .attr("y", 0)
        //     .attr("width", this.width + 200)
        //     .attr("height", this.height * 0.6);



      // 定义线条
      squares.append('line')
        .attr('class', 'line')



            

  

  
      },


    },

  //   watch: {
  //     timeRange: {
  //     handler(newVal, oldVal) {
  //       this.drawSquare()
  //     },
  //     },
  // },

  mounted() {
    this.drawSquare()
  }
}
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style>
.maintitle {
  font-size: 2em;
  font-weight: bold;
  color:white;
}

</style>