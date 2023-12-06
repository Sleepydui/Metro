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
            :width="searchWidth"
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
        </foreignObject>

        <text class="subtitle" 
            :y="subtitleY + subtitleFontsize * 0.15"
            dominant-baseline="hanging"
            :font-size="subtitleFontsize"
            font-family="HelveticaNeue"
            font-weight="bold"
            style="fill: white;"
        >Evolution of Urban Metro Lines Across the Globe</text>
        
        <image 
            :x="legendX"
            :href="legend"
            :height="legendHeight"
            :width="legendWidth"
        ></image>
    </g>
</template>
<script>
import { Search } from '@element-plus/icons-vue';
import { mapState, mapActions } from 'vuex';
const legend = require('@/assets/legend.svg'); // 957.2 x 71.13
const legendone = require('@/assets/legendone.svg'); //330 x 103
const legendtwo = require('@/assets/legendtwo.svg'); //111 x 103
const legendthree = require('@/assets/legendthree.svg'); //173 x 104
const legendfour = require('@/assets/legendfour.svg'); //178 x104
const legendfive = require('@/assets/legendfive.svg'); //171 x 101

export default {
    name: 'Title',
    data() {
        return {
            legend: legend,
            searchText: "",
        }
    },
    components: {
        Search,
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
            return this.height * 0.26;
        },
        subtitleY() {
            return this.titleFontsize + this.height * 0.15;
        },
        subtitleFontsize() {
            return this.height * 0.22;
        },

        legendX() {
            return this.width - this.legendWidth;
        },
        legendHeight() {
            return this.height;
        },
        legendWidth() {
            return this.legendHeight * 957.2 / 71.13;
        },

        searchY() {
            return this.subtitleY + this.subtitleFontsize + this.height * 0.05;
        },
        searchHeight() {
            return this.height - this.searchY;
        },
        searchWidth() {
            return this.titleFontsize * 7;
        },
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
</style>