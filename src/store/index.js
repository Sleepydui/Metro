import { createStore } from 'vuex'
import * as d3 from 'd3';

const store = createStore({
  state: {
    data: null,
    rawdata: null,
    timeRange: null,
    cityCoordinates: null,
  },
  getters: {
  },
  mutations: {
    updateTimeRange(state, payload) {
      state.timeRange = payload;
    },
  },
  actions: {
  },
  modules: {
  }
})

d3.json("./city_areas_3_with_coordinates.json").then(d => {
  //console.log(d)
  store.state.cityCoordinates = d;
  //console.log('Data loaded:', store.state.cityCoordinates);
})

d3.json("./metro_2.json").then(data => {
  // 打印data
  // console.log('Data loaded:', data)
   store.state.data = data;
   store.state.rawdata = data;

  //console.log('Data loaded:', store.state.rawdata);
  //console.log('Data loaded:', store.state.data);
})



// console.log('Data loaded:', store.state.rawdata)
// console.log('Data loaded:', store.state.data)

export default store;


 
