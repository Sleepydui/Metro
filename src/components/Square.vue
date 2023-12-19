<template>
    <Teleport :disabled="!popout" to="#singleCity">
      <g class="square-wrapper"
         :id="datum['城市名称']"
         :transform="transform"
         ref="wrapper"
      >
        <g class="back" ref="back"></g>
        <g class="square-unit" ref="unit"></g>
        <g class="button" ref="button"></g>
      </g>
    </Teleport>
</template>

<script>
import * as d3 from 'd3';
import { geoMercator } from 'd3-geo';
import {Line, LineSegment, Point} from "@/requirements/geometry";
import SVGTextLength from "@/requirements/SVGTextLength";
import {mapActions, mapState} from "vuex";

export default {
    name: 'Square',
    data() {
      return {
        svgTextLength: new SVGTextLength(),
        hoverLock: false,
      };
    },
    props: {
        datum: {
            type: Object,
            default: () => {},
        },
        width: {
            type: Number,
            default: 0,
        },
        height: {
            type: Number,
            default: 0,
        },
        textSize: {
            type: Number,
            default: 0,
        },
        transform: {
            type: String,
            default: "",
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
        popout: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState([
            "timeRange",
            "duration",
            "lineHovered",
            "lineClicked",
            "timelineOnDrag",
        ]),
        lineSelected() {
          if (!this.popout) return null;
          return this.lineHovered ?? this.lineClicked;
        },
        size() {
          return {
            width: this.width,
            height: this.height,
          };
        },
        realWidth() {
          return this.popout ? this.globalWidth : this.width;
        },
        realHeight() {
          return this.popout ? this.globalHeight : this.height;
        },
        innerSize() {
          return Math.min(this.realWidth, this.realHeight);
        },
        strokeWidthScale() {
          const size = this.innerSize;
          return d3.scaleLinear()
              // .domain([0, 0.001,0.005, 0.05, 0.3, 0.7,1])
              // .range([size/40,size/35,size/15, size/10, size/4,size/2, size/1.5])
              .domain([0,0.0002,0.005,0.05,0.5, 1]) 
              .range([size/65,size/45,size/20,size/4, size/8*3, size/3]); 
          // 定义线条宽度的比例尺
          // 根据“归一化覆盖率”的值定义线条的宽度。这个比例尺将覆盖率映射到一系列的宽度值。
        },
        radiusScale() {
          const size = this.innerSize;
          return d3.scaleLinear()
              .domain([0,0.001,0.005,0.05,  0.3, 1])
              .range([size/10,size/8,size/4,size/3, size/2.5, size/2]);
          // 定义圆的半径比例尺
          // 类似于线宽比例尺，这个比例尺根据覆盖率来确定圆的半径大小。
        },
        isBlackClicked() {
          return this.$store.state.isBlackClicked;
        },
    },
    methods: {
        ...mapActions([
           "updateCityHovered",
           "updateCitySelected",
           "updateLineHovered",
           "updateLineClicked",
        ]),
        select(parent, class_, type) {
          let elem = parent.select("." + class_);
          if (elem.empty()) {
            elem = parent.append(type)
                .classed(class_, true);
          }
          return elem;
        },
        getExitIcon(size, color) {
          return `
            <svg viewBox="0 0 1024 1024" width="${size}" height="${size}">
                <path d="M143.616 47.104l830.08 830.08c26.24 26.24 26.24 69.888 0 96.128-26.24 26.24-69.888 26.24-96.128 0L47.488 143.232c-17.536-26.24-17.536-69.888 0-96.128 26.24-26.24 69.888-26.24 96.128 0z m0 0" fill="${color}"></path>
                <path d="M982.528 143.232L152.32 973.312c-26.24 26.24-69.888 26.24-96.128 0-26.24-26.24-26.24-69.888 0-96.128L886.4 47.104c26.24-26.24 69.888-26.24 96.128 0 17.408 26.24 17.408 69.888 0 96.128z m0 0" fill="${color}"></path>
            </svg>
          `;
        },
        draw(width, height, duration=0) {
            if (this.innerSize === 0) return;
            this.calculateLines(width, height);
            this.drawLines(width, height, duration);
            this.drawBorder(width, height, duration);

            if (this.popout) {
              this.hoverLock = true;
              setTimeout(() => {
                this.drawExitButton(width, height);
                this.hoverLock = false;
              }, duration);
            }
            else {
              this.hoverLock = true;
              this.drawExitButton(width, height);
              this.updateLineHovered(null);
              this.updateLineClicked(null);
            }
        },
        /**
         * 绘制边界，包括下方的文字
         * @returns {void}
         */
        drawBorder(width, height, duration=0) {
          const datum = this.datum;
          const textSize = this.textSize;
          const square = d3.select(this.$refs.unit);
          const select = (parent, class_, type) => {
            let elem = parent.select("." + class_);
            if (elem.empty()) {
              elem = parent.append(type)
                  .classed(class_, true);
            }
            return elem;
          }

          // 添加方块
          if (this.popout) {
            select(square, "border", "rect")
                .remove();
          }
          else {
            select(square, "border", "rect")
                .attr('width', width) // (xScale(117) - xScale(115))*0.5
                .attr('height', height) //  (yScale(39) - yScale(41))*0.5
                .style('fill', 'white')
                .style('opacity', '0')
                .style('stroke-opacity', '0')
                .style('stroke', 'white')
                .style('cursor', 'pointer')
                .on('mouseover', () => {
                  this.updateCityHovered(datum["城市名称"]);
                  square.transition()
                      .duration(200)
                      .attr("transform", `translate(${-width * 0.1}, ${-height * 0.1}) scale(1.2)`);
                })
                .on('mouseout', () => {
                  this.updateCityHovered(null);
                  square.transition()
                      .duration(200)
                      .attr("transform", `translate(0, 0) scale(1)`);
                })
                .on('click', () => {
                  this.updateCitySelected(datum["城市名称"]);
                });
          }

          // 添加下面的文字
          const fontsize = this.popout ? (height * 0.04) : (textSize * 0.2);
          const marginY = (textSize - fontsize * 2) / 3;
          const x0 = this.popout ? this.globalX : 0;
          const y0 = this.popout ? fontsize : (height + marginY);
          const lineHeight = this.popout ? fontsize * 1.2 : (fontsize + marginY);
          const cityName = select(square, "city-name", "text")
              .attr("dominant-baseline", "hanging")
              .attr("fill", "white")
              .text(datum["城市名称"])
              .style("font-family", "SourceHanSansCN")
              .style("font-weight", "bold");
          const cityNameEn = select(square, "city-nameen", "text")
              .attr("dominant-baseline", "hanging")
              .attr("fill", "white")
              .text(datum["城市英文"])
              .style("font-family", "HelveticaNeue");
          if (duration > 0) {
            cityName.transition()
                .duration(duration)
                .attr("font-size", fontsize)
                .attr("x", x0)
                .attr("y", y0);
            cityNameEn.transition()
                .duration(duration)
                .attr("font-size", fontsize)
                .attr("x", x0)
                .attr("y", y0 + lineHeight);
          }
          else {
            cityName
                .attr("font-size", fontsize)
                .attr("x", x0)
                .attr("y", y0);
            cityNameEn
                .attr("font-size", fontsize)
                .attr("x", x0)
                .attr("y", y0 + lineHeight/1.8);
          }
        },
        /**
         * 计算所有线路的绘制位置，并直接放在数据上
         * @returns {void}
         */
         calculateLines(width, height) {
            const datum = this.datum;
            const size = Math.min(width, height);

            // 地理位置实际中心点
            const realCenter = new Point(
                parseFloat(datum["经度"]),
                parseFloat(datum["纬度"]),
            );
            // 绘制中心点
            const center = new Point(
                width * 0.5,
                height * 0.5,
            );
            // 绘制矩形边框的角点（初始是正方形）
            const corners = [
              new Point(0, 0),
              new Point(width, 0),
              new Point(width, height),
              new Point(0, height),
            ];
            // 绘制矩形边框的边
            const borders = corners.map((c, i) => {
              const next = corners[(i + 1) % corners.length];
              return new LineSegment(c, next);
            });

            // 计算缩放比例：保证所有的线路都可以显示在矩形边界框内
            const lines = this.datum["地铁线路"];
            lines.forEach((line, i) => {
              line.idx = i;
            });
            const r = lines.length <= 1 ? 0.1 : 0.8;

            // 对线路进行排序，使得半径较小的线路后绘制
            lines.sort((a, b) => {
              const radiusA = a["归一化覆盖率"];
              const radiusB = b["归一化覆盖率"];
              return radiusB - radiusA;
            });

            // 计算一个初始的 lineScale
            let initialLineScale = 4000;

            // 创建一个投影
            const projection = d3.geoMercator()
                .center([parseFloat(datum["经度"]), parseFloat(datum["纬度"])]) // 设置中心为地图的中心
                .scale(initialLineScale * size) // 使用 lineScale 设置比例尺
                .translate([width / 2, height / 2]); // 设置平移，使得地图居中

            // 使用 projection 更新 lineScale
            let lineScale = lines.reduce((acc, l) => {
              const realStartCoordinates = projection([parseFloat(l["起点站经度"]), parseFloat(l["起点站纬度"])]);
              const realEndCoordinates = projection([parseFloat(l["终点站经度"]), parseFloat(l["终点站纬度"])]);
              const realStart = new Point(realStartCoordinates[0], realStartCoordinates[1]);
              const realEnd = new Point(realEndCoordinates[0], realEndCoordinates[1]);
              l.realStart = realStart;
              l.realEnd = realEnd;

              if (realEnd.distanceToPoint(realStart) === 0) {
                l.isCircle = true;
                l.legendCorner = corners[3];
                return acc;
              }

            const realLine = Line.createFromPoints(realStart, realEnd);
            const realDist = realCenter.distanceToLine(realLine);

            // 找到在保证线路不超出矩形边界框的情况下，线路与中心距离最小的情况
            let corner;
            let proj = realCenter.projectionOnLine(realLine);
            if (proj.x < realCenter.x && proj.y < realCenter.y) {
              corner = corners[0];
            }
            else if (proj.x >= realCenter.x && proj.y < realCenter.y) {
              corner = corners[1];
            }
            else if (proj.x >= realCenter.x && proj.y >= realCenter.y) {
              corner = corners[2];
            }
            else {
              corner = corners[3];
            }
            let line = Line.createParallelLineThroughPoint(realLine, corner);

            l.isCircle = false;
            l.realLine = realLine;
            l.legendCorner = (corner === corners[0] || corner === corners[3]) ? corners[2] : corners[3];

            return Math.min(acc, center.distanceToLine(line) * r / realDist);
          }, Infinity);

          if (lineScale === Infinity) {
            lineScale = 1;
          }

          lines.forEach(d => {
            if (d.isCircle) {
              d.center = center;
            }
            else {
              const realLine = d.realLine;
              const realP = realCenter.projectionOnLine(realLine);
              const p = new Point(
                  center.x + (realP.x - realCenter.x) * lineScale,
                  center.y + (realP.y - realCenter.y) * lineScale,
              );
              const line = Line.createParallelLineThroughPoint(realLine, p);

              // 计算线路直线与矩形边界的交点
              const intersectionPoints = borders
                  .map(b => b.intersectionWithLine(line))
                  .filter(p => p !== null);

              // 把求得的线段延伸一点，不然会看出来线段端点
              d.lineSegment = new LineSegment(...intersectionPoints)
                  .extension(size * 0.5);
            }
          });
        },

        /**
         * 绘制线路
         * @returns {void}
         */
        drawLines(width, height, duration=0) {
          const datum = this.datum;
          const id = datum['城市名称'].replace(' ', '-');
          const select = this.select;
          const timeRange = this.timeRange;

          // 添加裁剪路径
          const clipPathId = `square-clip-path-${id}`; // 裁剪路径的唯一 ID
          const square = d3.select(this.$refs.unit);
          const back = d3.select(this.$refs.back);
          const defs = select(square, "clip-path-defs", "defs") // 选择或创建 <defs> 元素
          const clipPath = select(defs, "clip", "clipPath") // 在 <defs> 内添加 <clipPath>
              .attr("id", clipPathId) // 设置裁剪路径的 ID

          const clipPathRect = select(clipPath, "rect", "rect");
          if (duration > 0) {
            clipPathRect.transition()
                .duration(duration)
                .attr('width', width) // 设置 <rect> 的宽度
                .attr('height', height); // 设置 <rect> 的高度
          }
          else {
            clipPathRect
                .attr('width', width)
                .attr('height', height);
          }
          // 这部分代码在每个正方形中添加一个裁剪路径，用于确保在正方形内绘制的图形不会超出其边界。

          // 获得比例尺
          const strokeWidthScale = this.strokeWidthScale;
          const radiusScale = this.radiusScale;

          // 绘制路线
          square.selectAll(".line")
              .data(datum["地铁线路"], d => d.idx)
              .join("g")
              .classed("line", true)
              .each((d, i, elements) => {
                const g = d3.select(elements[i])
                    .attr("id", `${id}-${d["线路"]}-${d.idx}`);

                let inTimeRange;
                if (d['首发时间'] !== undefined) {
                  const start = new Date(d["首发时间"]);
                  if (timeRange === null) {
                    inTimeRange = true;
                  } else if (timeRange[0] <= start && start <= timeRange[1]) {
                    inTimeRange = true;
                  } else {
                    inTimeRange = false;
                  }
                } else {
                  inTimeRange = true;
                }

                let opacity = inTimeRange ? 0.95 : 0;

                if (d.isCircle) {
                  const radius = radiusScale(d["归一化覆盖率"]);
                  const circle = select(g, "circle-extension", "circle")
                      // .attr('id', `${id}-${d["线路"]}-line`)
                      .style("fill", "none")
                      .style("stroke", this.isBlackClicked ? "white" : d.color || "white")
                      .style("stroke-opacity", opacity === 0 ? 0 : (this.isBlackClicked ? 0.85 : opacity))
                      .attr("clip-path", `url(#square-clip-path-${id})`);

                  if (duration > 0) {
                    circle.transition()
                        .duration(duration)
                        .attr("cx", d.center.x)
                        .attr("cy", d.center.y)
                        .attr("r", radius)
                        .style("stroke-width", strokeWidthScale(d["归一化覆盖率"]));
                  }
                  else {
                    circle
                        .attr("cx", d.center.x)
                        .attr("cy", d.center.y)
                        .attr("r", radius)
                        .style("stroke-width", strokeWidthScale(d["归一化覆盖率"]));
                  }
                }
                else {
                  // 计算实际绘制的线路的直线方程
                  const lineSegment = d.lineSegment;
                  const start = lineSegment.start.x < lineSegment.end.x ? lineSegment.start : lineSegment.end;
                  const end = lineSegment.start.x < lineSegment.end.x ? lineSegment.end : lineSegment.start;

                  // 绘制线路线段
                  const line = select(g, "line-extension", "line")
                      // .attr('id', `${id}-${d["线路"]}-line`)
                      .style("stroke", this.isBlackClicked ? "white" : d.color || "white")
                      .style("stroke-opacity", opacity === 0 ? 0 : (this.isBlackClicked ? 0.85 : opacity))
                      .style("stroke-linecap", "round")
                      .attr("clip-path", `url(#square-clip-path-${id})`);

                  if (duration > 0) {
                    line.transition()
                        .duration(duration)
                        .attr("x1", start.x)
                        .attr("y1", start.y)
                        .attr("x2", end.x)
                        .attr("y2", end.y)
                        .style("stroke-width", strokeWidthScale(d["归一化覆盖率"]))
                  }
                  else {
                    line
                        .attr("x1", start.x)
                        .attr("y1", start.y)
                        .attr("x2", end.x)
                        .attr("y2", end.y)
                        .style("stroke-width", strokeWidthScale(d["归一化覆盖率"]))
                  }
                }

                if (this.popout) {
                  g.style("cursor", inTimeRange ? "pointer" : null)
                      .on("mouseover", () => {
                        if (this.hoverLock || !inTimeRange || this.timelineOnDrag) return;
                        this.updateLineHovered(d.idx);
                      })
                      .on("mouseout", () => {
                        if (this.hoverLock || !inTimeRange || this.timelineOnDrag) return;
                        this.updateLineHovered(null);
                      })
                      .on("click", () => {
                        if (this.hoverLock || !inTimeRange || this.timelineOnDrag) return;
                        this.updateLineClicked(this.lineClicked === d.idx ? null : d.idx);
                      });
                }
                else {
                  g.style("cursor", null)
                      .on("mouseover", null)
                      .on("mouseout", null)
                      .on("click", null);
                }
              });
        },
        drawExitButton(width, height) {
          const size = Math.min(width, height) * 0.03;
          const select = this.select;
          const g = d3.select(this.$refs.button)
              .attr("transform", `translate(${width - size * 2.5}, ${size})`);

          const exit = select(g, 'exit', 'g')
          if (this.popout) {
            exit.style('cursor', 'pointer')
                .on('mouseover', () => {
                  exit.selectAll('path')
                      .transition()
                      .duration(300)
                      .attr('fill', '#aaa');
                })
                .on('mouseout', () => {
                  exit.selectAll('path')
                      .transition()
                      .duration(300)
                      .attr('fill', '#fff');
                })
                .on('click', () => {
                  this.updateCitySelected(null);
                });
            select(exit, 'back', 'rect')
                .attr('width', size)
                .attr('height', size)
                .attr('opacity', 0);
            select(exit, 'exit-icon', 'g')
                .html(this.getExitIcon(size, '#fff'))
                .style('opacity', 0.8);
          }
          else {
            exit.remove();
          }
        },
        updateTransform(duration) {
          let transform;
          if (this.popout) {
            transform = `translate(${-this.globalX}, ${-this.globalY})`;
          }
          else {
            transform = this.transform;
          }
          this.$refs.unit.setAttribute("transform", '');
          d3.select(this.$refs.wrapper)
              .transition()
              .duration(duration)
              .attr("transform", transform);
        },
        updateLines(width, height) {
          const square = d3.select(this.$refs.unit);
          const back = d3.select(this.$refs.back);
          const lineSelected = this.lineHovered ?? this.lineClicked;
          const dehighlightOpacity = 0.5;
          const select = this.select;
          const strokeWidthScale = this.strokeWidthScale;
          const radiusScale = this.radiusScale;
          const datum = this.datum;
          const id = datum['城市名称'].replace(' ', '-');
          const svgTextLength = this.svgTextLength;
          const self = this;

          if (lineSelected === null) {
            square.selectAll(".line")
                .style("opacity", 1);
            select(square, "detail", "text").remove();
            select(back, "detail-path", "path").remove();
            select(square, "info", "text").remove();
          }
          else {
            square.selectAll(".line")
                .style("opacity", (d) => {
                  return d.idx === lineSelected ? 1 : dehighlightOpacity;
                })
                .each((d) => {
                  if (d.idx === lineSelected) {
                    //const text = `线路名称 Line Name: ${d["线路"]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;线路覆盖率 Line Coverage: ${d["归一化覆盖率"]}`;
                    const text = `线路名称 Line Name: ${d["线路"]}`;
                    const fontsize = Math.min(width, height) * 0.03;
                    const infoFontsize = Math.min(width, height) * 0.016;
                    const length = svgTextLength.visualWidth(text, fontsize);
                    const totalLength = d.isCircle ? length : d.lineSegment.length();
                    const dy = d.isCircle ? -fontsize * 0.5 : (-fontsize * 0.5 - strokeWidthScale(d["归一化覆盖率"]) * 0.5);
                    let path = select(back, "detail-path", "path")
                        .attr('opacity', 0)
                        .attr('id', `${id}-${d.idx}-line`);
                    if (d.isCircle) {
                      const radius = radiusScale(d["归一化覆盖率"]) + strokeWidthScale(d["归一化覆盖率"]) * 0.5;
                      const center = d.center;
                      const dR = length * 0.5 / radius;
                      const dx = radius * Math.sin(dR);
                      const dy = radius * Math.cos(dR);
                      const x0 = center.x - dx;
                      const y0 = center.y - dy;
                      const x1 = center.x + dx;
                      const y1 = center.y + dy;
                      path.attr('d', `M${x0} ${y0} A${radius} ${radius} 0 0 1 ${x1} ${y1} A${radius} ${radius} 0 0 1 ${x0} ${y0}`);
                    }
                    else {
                      const start = d.lineSegment.start.x < d.lineSegment.end.x ? d.lineSegment.start : d.lineSegment.end;
                      const end = d.lineSegment.start.x < d.lineSegment.end.x ? d.lineSegment.end : d.lineSegment.start;
                      path.attr('d', `M${start.x} ${start.y} L${end.x} ${end.y}`);
                    }
                    const textElement = select(square, "detail", "text")
                        .attr("font-size", fontsize)
                        .attr("dy", dy)
                        .attr("fill", "#fff");
                    select(textElement, "detail-path", "textPath")
                        .attr("xlink:href", `#${id}-${lineSelected}-line`)
                        .attr("startOffset", (totalLength - length) / 2)
                        .html(text)
                        .style("font-family", "HelveticaNeue");

                    const list = ["线路", "首发时间", "延长线时间", "起点站", "终点站", "车站数", "长度（千米）", "车型编组", "行驶时间（分钟）", "换乘站数目", "峰值车速", "配车数量"];
                    const info = {};
                    for (let k of list) {
                      info[k] = d[k];
                    }
                    const texts = JSON.stringify(info, null, 4)
                        .split('\n')
                        .map(t => t.replaceAll(' ', '&nbsp;'));
                    const textWidth = Math.max(...texts.map(t => svgTextLength.visualWidth(t, infoFontsize))) + infoFontsize * 2;
                    const textHeight = texts.length * infoFontsize * 1.2 + infoFontsize * 2;
                    const textX = d.legendCorner.x === 0 ? infoFontsize * 2 : d.legendCorner.x - textWidth;
                    const textY = d.legendCorner.y - textHeight;

                    select(square, "info", "text")
                        .selectAll("tspan")
                        .data(texts)
                        .join("tspan")
                        .attr("x", textX)
                        .attr("y", (d, i) => textY + infoFontsize * i * 1.2)
                        .attr("font-size", infoFontsize)
                        .attr("dominant-baseline", "hanging")
                        .attr("fill", "#fff")
                        .html(d => d)
                        .style("font-family", "HelveticaNeue");
                  }
                })
          }
        },
    },
    mounted() {
        this.draw(this.realWidth, this.realHeight);
    },
    watch: {
        size: {
            handler() {
                this.draw(this.realWidth, this.realHeight);
                this.updateTransform(0);
            }
        },
        timeRange: {
            handler() {
              this.drawLines(this.realWidth, this.realHeight);
            },
        },
        popout: {
            handler() {
              this.draw(this.realWidth, this.realHeight, this.duration);
              this.updateTransform(this.duration);
            },
        },
        lineSelected() {
          setTimeout(() => {
            this.updateLines(this.realWidth, this.realHeight);
          }, 0);
        },
        isBlackClicked: {
          handler() {
            this.drawLines(this.realWidth, this.realHeight);
          },
          immediate: true,
        },
    }
}
</script>