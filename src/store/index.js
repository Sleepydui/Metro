import { createStore } from 'vuex'
import * as d3 from 'd3';

const store = createStore({
  state: {
    data: null,
    countrySelected: null, // 选中国家
    citySelectedButton: null, // 选中城市
    cityHovered: null, // 鼠标悬浮的城市
    citySelected: null, // 选中城市
    timeRange: null, // 选中的时间范围
    duration: 1000, // 动画时长
    lineHovered: null, // 鼠标悬浮的线路
    lineClicked: null,  // 选中的线路
    timelineOnDrag: false, // 是否在拖拽时间轴
    isBlackClicked: false, // 白or彩切换
    //全局的状态变量
  },
  getters: {
    cities(state) {
      return state.data.filter(d => {
        if (state.countrySelected === null && state.citySelectedButton === null) {
          return true;
        }
        if (state.countrySelected !== null && state.countrySelected === d["城市名称"].split(" ")[0]) {
          console.log(state.countrySelected, d["城市名称"]);
          return true;
        }
        if (state.citySelectedButton !== null && state.citySelectedButton === d["城市"].split(" ")[0]) {
          console.log(state.citySelectedButton, d["城市"]);
          return true;
        }
        return false; //filter决定是否保留元素
      });
    },
  },
  
  mutations: { //同步的修改state的操作，只有在这里才能修改state
    updateData(state, payload) {
      state.data = payload; //payload是传入的参数
    },
    updateCountrySelected(state, payload) {
      state.countrySelected = payload;
    },
    updateCitySelectedButton(state, payload) {
      state.citySelectedButton = payload;
    },
    updateCityHovered(state, payload) {
      state.cityHovered = payload;
    },
    updateCitySelected(state, payload) {
      state.citySelected = payload;
    },
    updateTimeRange(state, payload) {
      state.timeRange = payload;
    },
    updateLineHovered(state, payload) {
      state.lineHovered = payload;
    },
    updateLineClicked(state, payload) {
      state.lineClicked = payload;
    },
    updateTimelineOnDrag(state, payload) {
      state.timelineOnDrag = payload;
    },
    updateIsBlackClicked(state, payload) {
      state.isBlackClicked = payload;
    },
  },
  actions: { //允许异步操作
    updateData({ commit }, payload) {
      commit('updateData', payload);
    },
    updateCountrySelected({ commit }, payload) {
      commit('updateCountrySelected', payload);
    },
    updateCitySelectedButton({ commit }, payload) {
      commit('updateCitySelectedButton', payload);
    },
    updateCityHovered({ commit }, payload) {
      commit('updateCityHovered', payload);
    },
    updateCitySelected({ commit }, payload) {
      commit('updateCitySelected', payload);
    },
    updateTimeRange({ commit }, payload) {
      commit('updateTimeRange', payload);
    },
    updateLineHovered({ commit }, payload) {
      commit('updateLineHovered', payload);
    },
    updateLineClicked({ commit }, payload) {
      commit('updateLineClicked', payload);
    },
    updateTimelineOnDrag({ commit }, payload) {
      commit('updateTimelineOnDrag', payload);
    },
    updateIsBlackClicked({ commit }, payload) {
      commit('updateIsBlackClicked', payload);
    },
  },
  modules: {
  }
})

d3.json('./data.json').then(data => {
  data = data.filter(d => d["地铁线路"] !== undefined);
  store.dispatch('updateData', data); //更新数据，传给updateData 给 action 再给mutation
});

export default store;


 
