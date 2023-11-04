<template>


    <g class = 'square'>
        <!-- <text class="maintitle" x="1.5em" y="1.5em" style="color: white;">全球地铁线路发展历史</text> -->
    </g>

  </template>


<script>
import { ref, onMounted, watch, computed } from 'vue'
import { mapMutations, mapState } from 'vuex'
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
    ...mapMutations([
      'updateTimeRange', //传入timeRange方法
    ]),

      drawSquare(){
        console.log(this.cities)
        console.log(this.cityCoordinates)
        if (!this.cities || !this.$el || !this.cityCoordinates) {
            return;
        }

        // 更新城市数据，添加面积、经纬度信息
        this.cities.forEach(city => {
          const cityName = city.name;
          const thiscity = Object.values(city.lines);
          const cityData = this.cityCoordinates.find(d => d.城市 === cityName);
          if (cityData) {
            city.gdp = cityData.GDP_per_capita;
            city.loc_num = cityData.loc_num;
            city.面积 = cityData.面积;
            city.城市名称 = cityData.城市;
            city.城市英文 = cityData.城市英文;
            city.经度 = cityData.经度;
            city.纬度 = cityData.纬度;
          }
        }); 

        // 根据城市位置序号从大到小排序
        // this.cities.sort((a, b) => a.loc_num - b.loc_num);
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

        // 计算每个矩形的中心点坐标
        const cityLocations = {};
        this.cities.forEach(city => {
          const cityName = city.name;
          const cityData = this.cityCoordinates.find(d => d.城市 === cityName);
          //console.log(11111)
          //console.log(cityData)
          if (cityData) {
            const longitude = cityData.经度;
            const latitude = cityData.纬度;
            cityLocations[cityName] = { longitude, latitude };
          }
        });
   
        const cityCenterX = rectWidth / 2;
        const cityCenterY = rectWidth / 2;


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
          console.log(this.cities)
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
            .range([rectWidth/6,rectWidth/2,rectWidth/1.5]); // 映射到半径范围

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


        // 定义缩放比例尺
        //返回真实长度
        function getMaxDistance(cityData, cityCenterLongitude, cityCenterLatitude) {
            let maxDistance = 0;
                for (const line of cityData) {
                    const startLongitude = line["起点站经度"];
                    const startLatitude = line["起点站纬度"];
                    const endLongitude = line["终点站经度"];
                    const endLatitude = line["终点站纬度"];
                    const startDistance = Math.sqrt(
                        Math.pow(startLongitude - cityCenterLongitude, 2) +
                        Math.pow(startLatitude - cityCenterLatitude, 2)
                    );
                    const endDistance = Math.sqrt(
                        Math.pow(endLongitude - cityCenterLongitude, 2) +
                        Math.pow(endLatitude - cityCenterLatitude, 2)
                    );
                    maxDistance = Math.max(maxDistance, startDistance, endDistance);
            }
            return maxDistance;
        }


    // 定义线条
    squares.selectAll('.line')
        // .data(d => Object.values(d.lines))
        .data(d => {
          const cityName = d.name;
          const thiscity = Object.values(d.lines);
          return Object.values(d.lines).map(line => ({ ...line, cityName, thiscity }));
        })
        .enter()
        .each(function(d) {
            const thiscity = d.thiscity;
            const cityName = d.cityName;
            const cityLocation = cityLocations[cityName];
            if (cityLocation) {
              const longitude = cityLocation.longitude;
              const latitude = cityLocation.latitude;
 
              const maxDistance = getMaxDistance(thiscity, longitude, latitude);
              const cityScale = rectWidth / maxDistance;
              //console.log(cityName)
              //console.log(cityScale)

            const startX = cityCenterX-(d["起点站经度"]-longitude)*cityScale;
            const startY = cityCenterY+(d["起点站纬度"]-latitude)*cityScale;
            const endX = cityCenterX-(d["终点站经度"]-longitude)*cityScale;
            const endY = cityCenterY+(d["终点站纬度"]-latitude)*cityScale;



              //三角函数定义线长
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
            //画线
            //加长线保证一定会超出正方形
            //环线 length = 0
            if (length > 0) {
                const extension = 600;
                const extendedLength = length + extension;
                const extendedStartX = startX - (deltaX / length) * extension / 2;
                const extendedStartY = startY - (deltaY / length) * extension / 2;
                const extendedEndX = startX + (deltaX / length) * extendedLength;
                const extendedEndY = startY + (deltaY / length) * extendedLength;

                d3.select(this)
                  .append("line")   
                  .attr("x1", extendedStartX)
                  .attr("y1", extendedStartY)
                  .attr("x2", extendedEndX)
                  .attr("y2", extendedEndY)
                  .style("stroke", d => d.color || "white")
                  .style("stroke-opacity", d => 0.9)
                  .style("stroke-width", d => {
                      const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                      // console.log(`归一化覆盖率: ${d["归一化覆盖率"]}, stroke width: ${strokeWidth}`);
                      return strokeWidth;
                  })
                  .attr("clip-path", "url(#city-square-clip)");

                // 合并四个元素为一个字符串
                // var textContent = "线路名称："+d.线路 +"车型编组："+d.车型编组+"车站数："+d.车站数+"首发时间："+d.首发时间;
                // var textContent = d.线路 +"："+d.车型编组

                // // 计算线路长度
                // var lineLength = Math.sqrt(Math.pow(extendedEndX - extendedStartX, 2) + Math.pow(extendedEndY - extendedStartY, 2));

                // // 创建一个线性比例尺
                // var scale_text = d3.scaleLinear()
                //     .domain([0, lineLength])
                //     .range([0, 1]);

                // // 计算文本数量
                // var numTexts = Math.floor(lineLength / 10); // 根据需要调整文本数量

                // for (var i = 0; i < numTexts; i++) {
                //     // 使用比例尺计算文本位置
                //     var x = extendedStartX + (extendedEndX - extendedStartX) * scale_text(i * 50);
                //     var y = extendedStartY + (extendedEndY - extendedStartY) * scale_text(i * 50);

                //     d3.select(this)
                //         .append("text")
                //         .attr("x", x)
                //         .attr("y", y)
                //         .attr("dy", "0em")
                //         .attr("transform", `rotate(${Math.atan2(deltaY, deltaX) * 180 / Math.PI} ${x} ${y})`)
                //         .attr("text-anchor", "middle")
                //         .style("font-size", "5px")
                //         .style("fill", "white")
                //         .text(textContent)
                //         .style("visibility", "hidden") 
                //         // .attr("clip-path", "url(#city-square-clip)");
                // }

            //如果是环线
            } else {
                  const radius = radiusScale(d["归一化覆盖率"]);

                  d3.select(this)
                      .append("circle")
                      .attr("cx", cityCenterX)
                      .attr("cy", cityCenterY)
                      .attr("r", radius)
                      .style("fill", "none")
                      .style("stroke", d => d.color || "white")
                      .style('stroke-opacity', d => 0.9)
                      .style("stroke-width", d => strokeWidthScale(d["归一化覆盖率"]));
                      // .attr("clip-path", "url(#city-square-clip)");

                // 定义一个路径元素，并将其设置为圆周的形状
                // d3.select(this)
                //     .append("path")
                //     .attr("id", "circlePath")
                //     .attr("d", `M ${cityCenterX - radius} ${cityCenterY} A ${radius} ${radius} 0 1 1 ${cityCenterX + radius} ${cityCenterY}`)
                //     .style("fill", "none")
                //     .style("stroke", d => d.color || "white")
                //     .style('stroke-opacity', d => 0)
                //     .style("stroke-width", d => strokeWidthScale(d["归一化覆盖率"]));

                // // 在SVG中添加一个文本元素
                // var text = d3.select(this)
                //     .append("text")
                //     .style("font-size", "3px")
                //     .style("fill", "white");

                // // 在文本元素中添加一个文本路径元素，并将其href属性设置为路径元素的ID
                // text.append("textPath")
                //     .attr("href", "#circlePath")
                //     .attr("startOffset", "50%")
                //     .style("text-anchor", "middle")
                //     .html(`线路名称：${d.线路}<br>车型编组：${d.车型编组}<br>车站数：${d.车站数}<br>首发时间：${d.首发时间}`)
                //     // .style("visibility", "hidden") // 添加这一行

              }

        //开始写展开界面
          //点某条线会加文本
          // 定义一个变量来保存当前显示的文本元素
          let currentText = null;
          let currentPath = null;

          squares.selectAll('line')
            .on('click', function(event, d) {
              if (squareClicked) {
              // 获取当前点击的square
              const currentSquare = d3.select(this.parentNode);
              // 还原上一条线路的样式
              currentSquare.selectAll('line')
                .style("stroke", d => d.color || "white")
                .style('opacity', '0.15')
                .style("stroke-width", d => {
                  const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                  // console.log(`归一化覆盖率: ${d["归一化覆盖率"]}, stroke width: ${strokeWidth}`);
                  return strokeWidth;
              });
              currentSquare.selectAll('circle')
                    .style("stroke", d => d.color || "white")
                    .style('opacity', '0.15')
                    .style("stroke-width", d => {
                      const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                      return strokeWidth;
                    });
              // 更改当前线路的样式
              d3.select(this)
                // .style('stroke', '#FF37B7')
                // .style('stroke-width', '16px');
                .style('opacity', '0.9')
                .style("stroke-width", d => {
                  const strokeWidth = strokeWidthScale(d["归一化覆盖率"])+3;
                  // console.log(`归一化覆盖率: ${d["归一化覆盖率"]}, stroke width: ${strokeWidth}`);
                  return strokeWidth;
              });

              // 删除上一条线路的文本
              if (currentText) {
                currentText.remove();
                currentText = null;
              }
              if (currentPath) {
                currentPath.remove();
              }

              // 计算与当前线段相同的path
              const line = d3.select(this);
              let x1 = +line.attr('x1');
              let y1 = +line.attr('y1');
              const x2 = +line.attr('x2');
              const y2 = +line.attr('y2');

              // 更新pathData
              const pathData = `M ${x1},${y1} L ${x2},${y2}`;


              // 在SVG中添加一个path元素，并为其设置一个ID
              currentPath = currentSquare.append('path')
                .attr('id', 'linePath')
                .attr('d', pathData)
                .style("fill", "none")
                .style("stroke", d => d.color || "white")
                .style('stroke-opacity', d => 0)
                .style("stroke-width", d => strokeWidthScale(d["归一化覆盖率"]));

              // 在SVG中添加一个文本元素
              currentText = currentSquare.append("text")
                  .style("font-size", "5px")
                  .style("fill", "white")
                  .style("font-weight", "bold")  //不加粗用5px
                  ;

              // 在文本元素中添加一个文本路径元素，并将其href属性设置为路径元素的ID
              currentText.append("textPath")
                  .attr("xlink:href", "#linePath")
                  .attr("startOffset", "50%")
                  .style("text-anchor", "middle")
                  .html(`线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;`)

              }
            });


            squares.selectAll('circle')
                .on('click', function(event, d) {
                  if (squareClicked) {
                   // 获取当前点击的square
                  const currentSquare = d3.select(this.parentNode);
                  // 还原上一条线路和圆形元素的样式
                  currentSquare.selectAll('line')
                    .style("stroke", d => d.color || "white")
                    .style('opacity', '0.15')
                    .style("stroke-width", d => {
                      const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                      return strokeWidth;
                    });
                    currentSquare.selectAll('circle')
                    .style("stroke", d => d.color || "white")
                    .style('opacity', '0.15')
                    .style("stroke-width", d => {
                      const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                      return strokeWidth;
                    });
                  // 更改当前圆形元素的样式
                  d3.select(this)
                    // .style('stroke', '#FF37B7')
                    // .style('stroke-width', '10px');
                    .style('opacity', '0.9')
                    .style("stroke-width", d => {
                        const strokeWidth = strokeWidthScale(d["归一化覆盖率"])+3;
                        // console.log(`归一化覆盖率: ${d["归一化覆盖率"]}, stroke width: ${strokeWidth}`);
                        return strokeWidth;
                    });
                  // 删除上一条线路的文本
                  if (currentText) {
                    currentText.remove();
                    currentText = null;
                  }
                  if (currentPath) {
                    currentPath.remove();
                  }

                  const circle = d3.select(this);
                  const cx = +circle.attr('cx');
                  const cy = +circle.attr('cy');
                  const r = +circle.attr('r');
                  const pathData = `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;

                  // 在SVG中添加一个path元素，并为其设置一个ID
                  currentPath = currentSquare.append('path')
                    .attr('id', 'circlePath')
                    .attr('d', pathData)
                    .style("fill", "none")
                    .style("stroke", d => d.color || "white")
                    .style('stroke-opacity', d => 0)
                    .style("stroke-width", d => strokeWidthScale(d["归一化覆盖率"]));
    
                    // 在SVG中添加一个文本元素
                  currentText = currentSquare.append("text")
                      .style("font-size", "3px")
                      .style("fill", "white")
                      .style("font-weight", "bold") 
                      ;

                  // 在文本元素中添加一个文本路径元素，并将其href属性设置为路径元素的ID
                  currentText.append("textPath")
                      .attr("xlink:href", "#circlePath")
                      .attr("startOffset", "50%")
                      .style("text-anchor", "middle")
                      .html(`线路名称 Line Name: ${d.线路}&nbsp;&nbsp;&nbsp;<br>车型编组 Train Formation: ${d.车型编组}&nbsp;&nbsp;&nbsp;<br>车站数 Number of Stations: ${d.车站数}&nbsp;&nbsp;&nbsp;<br>首发时间 Departure Time: ${d.首发时间}&nbsp;&nbsp;&nbsp;`)

                  }
                });


// 悬浮小放大 点击大放大
          let clicked = false;
          squares.on("mouseover", function() {
            if (!clicked) {
              d3.select(this)
                .transition()
                .duration(80)
                .attr("transform", function() {
                  const currentTransform = d3.select(this).attr("transform");
                  const scaleIndex = currentTransform.indexOf("scale");
                  if (scaleIndex !== -1) {
                    return currentTransform.slice(0, scaleIndex) + "scale(1.2)";
                  } else {
                    return currentTransform + " scale(1.2)"; //不变位置，只放大1.2倍
                  }
                });
            }
          });

          squares.on("mouseout", function() { //悬浮才会放大
            if (!clicked) {
              d3.select(this)
                .transition()
                .duration(80)
                .attr("transform", function() {
                  const currentTransform = d3.select(this).attr("transform");
                  const scaleIndex = currentTransform.indexOf("scale");
                  if (scaleIndex !== -1) {
                    return currentTransform.slice(0, scaleIndex) + "scale(1)";
                  } else {
                    return currentTransform;
                  }
                });
            }
          });


          let squareClicked = false;

          squares.on("click", function(event, d) {
              const clickedSquare = d3.select(this);
              const clickedIndex = squares.nodes().indexOf(this);
              console.log(`Clicked square index: ${clickedIndex}`);
              // this.$refs.legend.dim();
              

              if (!clicked) {
                // 将被点击的方格移动到左上角并放大
                const cross = clickedSquare
                  .append('path')
                  // .attr('d', 'M5 5 L15 15 M15 5 L5 15')  //左上角
                  // .attr('d', 'M85 5 L95 15 M95 5 L85 15') //右上角
                  .attr('d', 'M157.5 -10 L162.5 -5 M162.5 -10 L157.5 -5') // 右上角，大小减半
                  .attr('stroke', 'white')
                  .attr('stroke-width', 1)
                  .attr('opacity', 0)
                  .classed('cross', true);

                // 在点击 cross 时，将大方块返回到原始位置和大小，显示其他方块
                cross.on("click", function() {
                  
                   // 在更新 clicked 变量之前输出它的值
                  console.log("Before update: clicked =", clicked);
                  // 将被点击的方格返回到原始位置和大小
                  clickedSquare
                    .transition()
                    .duration(500)
                    .attr("transform", (d, i) => {
                      // console.log(clicked)
                      let x = (clickedIndex % columns) * (rectWidth + totalMargin);
                      let y = parseInt(clickedIndex / columns) * (rectWidth + totalMargin);
                      return `translate(${x},${y}) scale(1)`;
                    });


                  // 显示其他方块
                  squares.filter((d, j) => j !== clickedIndex)
                    .transition()
                    .duration(500)
                    .style("opacity", 1);

                  // 更新 clicked 变量的值
                  clicked = false;
                  squareClicked = false;
                    // 在更新 clicked 变量之后输出它的值
                  console.log("After update: clicked =", clicked);
                  cross.remove();
                      // 阻止事件冒泡
                  // event.stopPropagation();
                });
                // 将大方块中的线返回到原始粗细和颜色，删除线路信息
                squares.selectAll('line')
                  .style("stroke", d => d.color || "white")
                  .style("opacity","0.9")
                  .style("stroke-width", d => {
                        const strokeWidth = strokeWidthScale(d["归一化覆盖率"]);
                        // console.log(`归一化覆盖率: ${d["归一化覆盖率"]}, stroke width: ${strokeWidth}`);
                        return strokeWidth;
                    });
                if (currentText) {
                  currentText.remove();
                }

                // clickedSquare.select("city-square-clip").remove();


                clickedSquare
                  .transition()
                  .duration(500)
                  .attr("transform", `translate(100,0) scale(5.5)`)
                  .on("end", function() {
                    // 禁用其他方格的点击事件
                    console.log("Transition ended. Applying new clip-path.");
                    // d3.select(this).on("click", null);
                    // clickedSquare.selectAll("line").attr("clip-path", "url(#page-square-clip)");
                    clickedSquare.selectAll("line").attr("clip-path", null);
                    // 在放大完成后显示文本
                    // 在左上角显示城市名称
                    // clickedSquare.append("text")
                    //     .attr("x", 137.2)   // -3
                    //     .attr("y", 15)
                    //     .text(d.name)
                    //     .style("fill", "white")
                    //     .style("font-size", "4px")
                    //     ;
                  });

                // 隐藏其他方块
                squares.filter((d, j) => j !== clickedIndex)
                  .transition()
                  .duration(500)
                  .style("opacity", 0.03)
                  .on("end", function() {
                    // 禁用其他方格的点击事件
                    // console.log("Transition ended. Applying new clip-path.");
                    // d3.select(this).on("click", null);
                  });
                squares.filter((d, j) => j !== clickedIndex)
                  .selectAll("line")
                  .on("click", null);
                  

                // 更新 clicked 变量的值
                clicked = true;
                squareClicked = true;

                // console.log("final: clicked =", clicked);
              }
            });



            }

        });

  
      },


    },

    watch: {
    timeRange: {
        handler(newVal, oldVal) {
            // 每次timeRange更新时，重新绘制图形
            d3.selectAll("line, circle")  
            .style("stroke-opacity", d => {
              if (d && '首发时间' in d) {
                  if (newVal === null) {
                      return 0.9;
                  } else if (new Date(d["首发时间"]) <= new Date(newVal)) {
                      return 0.9
                  } else {
                      return 0
                  }
              } else {
                  // handle the case where d is undefined or '首发时间' does not exist in d
                  // for example, you can return a default value
                  return 0.9;
              }
          })

                // .style("stroke-opacity", d => {
                //     if (newVal === null) {
                //         return 0.9;
                //     } else if (new Date(d["首发时间"]) <= new Date(newVal)) {
                //         return 0.9
                //     } else {
                //         return 0
                //     }
                // })
            
        },
    },
},

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