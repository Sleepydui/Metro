<template>
    <g id="title">
        <!-- <rect
            :width="width"
            :height="height"
            fill="red"
        ></rect> -->
        <text class="maintitle"
            :y="titleFontsize * 0.15"
            dominant-baseline="hanging"
            :font-size="titleFontsize"
            font-family="SourceHanSansCN"
            font-weight="bold"
            style="fill: white;"
        >全球地铁线路发展历史</text>
        <foreignObject
            :y="searchY"
            :width="searchWidth  + buttonWidth + marginSearchButton"
            :height="searchHeight"
        >
            <el-autocomplete
                class="search-box"
                v-model="searchText"
                :fetch-suggestions="getCountries"
                placeholder="Country"
                @select="select"
                :trigger-on-focus="true"
                :style="{width: searchWidth + 'px', height: searchHeight + 'px'}"
            >
                <template #suffix>
                    <el-icon class="el-input__icon"><Search/></el-icon>
                </template>
                <template #default="{ item }">
                    <div>{{ item }}</div>
                </template>
            </el-autocomplete>
            <!-- <button class="button" :style="{ width: buttonWidth + 'px', height: searchHeight + 'px' }" @click="toggleLineColor">Line Color</button> -->
            <el-button
                class="el-button"
                @click="toggleLineColor"
                :style="{width: buttonWidth + 'px', height: searchHeight + 'px', marginLeft: marginSearchButton + 'px'}"
            >
                Color
            </el-button>



        </foreignObject>

        <text class="subtitle" 
            :y="subtitleY"
            dominant-baseline="hanging"
            :font-size="subtitleFontsize"
            font-family="HelveticaNeue"
            font-weight="bold"
            style="fill: white;"
        >Global Cities Subway Route Maps</text>
        
        <!-- <image 
            :x="legendX"
            :href="legend"
            :height="legendHeight"
            :width="legendWidth"
        ></image> -->

        <image 
            :x="legendX1"
            :href="legendone"
            :height="legendHeight1"
            :width="legendWidth1"
        ></image>

        <image 
            :x="legendX2"
            :href="legendtwo"
            :height="legendHeight2"
            :width="legendWidth2"
        ></image>

        <image 
            :x="legendX3"
            :href="legendthree"
            :height="legendHeight3"
            :width="legendWidth3"
        ></image>

        <image 
            :x="legendX4"
            :href="legendfour"
            :height="legendHeight4"
            :width="legendWidth4"
        ></image>

        <image 
            :x="legendX5"
            :href="legendfive"
            :height="legendHeight5"
            :width="legendWidth5"
        ></image>
       
    </g>
</template>
<script>
import { Search } from '@element-plus/icons-vue';
import { reactive } from 'vue';
import { mapState, mapActions } from 'vuex';
import { ElButton } from 'element-plus';
const legendone = require('@/assets/legendone.svg'); //330 x 103
const legendtwo = require('@/assets/legendtwo.svg'); //111 x 103
const legendthree = require('@/assets/legendthree.svg'); //172 x 103
const legendfour = require('@/assets/legendfour.svg'); //178 x104
const legendfive = require('@/assets/legendfive.svg'); //171 x 101

export default {
    name: 'Title',
    data() {
        return {
            legendone: legendone,
            legendtwo: legendtwo,
            legendthree: legendthree,
            legendfour: legendfour,
            legendfive: legendfive,
            searchText: "",
            isButtonClicked: false, 
        }
    },
    components: {
    Search,
    ElButton,
    reactive
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
        totalWidth: {
            type: Number,
            default: 0,
        },
        totalHeight: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        ...mapState([
            "data",
            "countrySelected",
        ]),
        countries() {
            return Array.from(
                new Set(this.data.map(d => d["城市名称"].split(" ")[0]))
            );
        },
        titleFontsize() {
            return this.totalHeight * 25.45 / 1080;
        },
        subtitleY() {
            return this.totalHeight * 27 / 1080;
        },
        subtitleFontsize() {
            return this.totalHeight * 23.36 / 1080;
        },

        legendX1() {
            return this.totalWidth * 600 / 1920;
        },
        legendHeight1() {
            return this.totalHeight * 103 / 1080;
        },
        legendWidth1() {
            return this.totalWidth * 330 / 1920;
        },

        legendX2() {
            return this.totalWidth * 996 / 1920;
        },
        legendHeight2() {
            return this.totalHeight * 103 / 1080;
        },
        legendWidth2() {
            return this.totalWidth * 111 / 1920;
        },

        legendX3() {
            return this.totalWidth * 1194 / 1920;
        },
        legendHeight3() {
            return this.totalHeight * 103 / 1080;
        },
        legendWidth3() {
            return this.totalWidth * 172 / 1920;
        },

        legendX4() {
            return this.totalWidth * 1392 / 1920;
        },  
        legendHeight4() {
            return this.totalHeight * 104 / 1080;
        },
        legendWidth4() {
            return this.totalWidth * 178 / 1920;
        },

        legendX5() {
            return this.totalWidth * 1589 / 1920;
        },
        legendHeight5() {
            return this.totalHeight * 101 / 1080;
        },
        legendWidth5() {
            return this.totalWidth * 171 / 1920;
        },

        searchY() {
            return this.totalHeight * 67 / 1080;
        },
        searchHeight() {
            return this.totalHeight * 34 / 1080;
        },
        searchWidth() {
            return this.totalWidth * 344 / 1920;
        },
        buttonWidth(){
            return this.totalWidth * 100 / 1920;
        },
        marginSearchButton(){
            return this.totalWidth * 20 / 1920;
        }
    },
    methods: {
        ...mapActions([
            "updateCountrySelected",
        ]),
        getCountries(queryString, cb) {
            const countries = this.countries;
            const result = queryString === '' ?
                countries : countries.filter(c => c.includes(queryString));
            cb(result);
        },
        select(country) {
            this.searchText = country;
            this.updateCountrySelected(country);
        },
        toggleLineColor() {
            this.$store.dispatch('updateIsBlackClicked', !this.$store.state.isBlackClicked);
        },
    },
    watch: {
        searchText: {
            handler(val) {
                if (val === "") {
                    this.updateCountrySelected(null);
                }
            }
        },
    },
}
</script>
<style>
.el-input {
    height: v-bind(searchHeight - 2 + 'px');
}
.el-input .el-input__wrapper {
    background-color: #000;
}
/*
.el-input__inner:focus {
    outline: none !important;  
    border-color: rgba(255, 255, 255, 0.8) !important;  
}
*/
.el-scrollbar__wrap {
    background-color: #000 !important;
    border: 0 !important;  /* 设置边框宽度为 0 */
    margin: 0 !important;  /* 设置边距为 0 */
    padding: 0 !important;  /* 设置填充为 0 */
}

.el-scrollbar__view li {
    color: rgba(255, 255, 255, 0.8) !important;
    border: 0.5px solid rgba(255, 255, 255, 0.5) !important;
}
.el-scrollbar__view li:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
}


.el-button {
    height: v-bind(searchHeight - 2 + 'px') !important;
    background-color: #000 !important;
    border: 1px solid rgba(255, 255, 255, 0.9) !important;
    color: rgba(255, 255, 255, 0.7) !important;
}

.el-button:active {
    border-color: rgba(255, 255, 255, 0.5) !important;
    color: rgba(255, 255, 255, 0.5) !important;
}

</style>
