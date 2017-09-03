/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
  var chart = document.querySelector(".aqi-chart-wrap"),
      title = document.createElement("h1"),
      fragment = document.createDocumentFragment(),
      count = 0;
  //先清空子节点
  chart.innerHTML = ""

  //写标题
  title.innerHTML = pageState.nowSelectCity + pageState.nowGraTime + "平均空气质量";
  fragment.appendChild(title)

  //加class
  chart.className = "aqi-chart-wrap " + pageState.nowGraTime;

  //编辑数据
  var renderData = chartData[pageState.nowGraTime][pageState.nowSelectCity];
  //
  var len = Object.keys(renderData).length, width = chart.clientWidth / (len*2);
  for(var key in renderData){
    var bar = document.createElement("div"), hint = document.createElement("div"), item = parseInt(renderData[key], 10);
    //柱形
    bar.className = "bar"
    bar.style.cssText = "height: " + item + "px; background: #" + Math.floor(Math.random() * 0xFFFFFF).toString(16) + ";width: " + width + "px;" 
                      + "margin-right: " + 0.8*width + "px;left: " + (count*1.8*width+50) + "px;";
    
    //提示 
    hint.className = "hint"
    hint.style.cssText = "left: " + (count*1.8*width + 50) + "px;bottom: " + (item+10) + "px;";
    // hint.innerHTML = pageState.nowSelectCity + key + "：" + renderData[key];
    hint.innerHTML = renderData[key];
    count++
    fragment.appendChild(bar)
    fragment.appendChild(hint)
    // bar.style.height = item + "px";

  }
  chart.appendChild(fragment);
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(row) {
  // 确定是否选项发生了变化 
  if(row.value == pageState.nowGraTime){
    return;
  }
  // 设置对应数据
  pageState.nowGraTime = row.value
  // 调用图表渲染函数
  renderChart()
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange(selectDOM) {
  // 确定是否选项发生了变化 
  if(selectDOM.value == pageState.nowSelectCity){
    return;
  }
  // 设置对应数据
  pageState.nowSelectCity = selectDOM.value
  // 调用图表渲染函数
  renderChart()
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  var radios = document.querySelectorAll("#form-gra-time input");
  radios.forEach(function(row, index){
    row.addEventListener("click", function(){
      graTimeChange(row);
    })
  })
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var data = aqiSourceData,
      cityList = [],
      selectDOM = document.querySelector("#city-select");
  for(var key in data){
    var temp = "<option>" + key + "</option>";
    cityList.push(temp);
  }
  selectDOM.innerHTML = cityList.join("");

  //默认选择第一个城市
  var cityArr = Object.getOwnPropertyNames(aqiSourceData);                //获取keys
  pageState.nowSelectCity = cityArr[0];

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  selectDOM.addEventListener("change", function(){
    citySelectChange(selectDOM)
  })
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 这里的处理从月->周->日的顺序处理
  var result = {}, month = {}, week = {}, singleMonth = {}, singleWeek = {},
      cityList = Object.getOwnPropertyNames(aqiSourceData);

  for(var city in aqiSourceData){
    var data = aqiSourceData[city],                                     //获取某城市的数据
        dateList = Object.getOwnPropertyNames(data),
        monthMark = "01",
        weekMark = 1;
    week[city] = {};
    month[city] = {};
    for(var date in data){
      var key = date, value = data[key], nowDate = new Date(key),
          monthStr = key.slice(5, 7), dateStr = key.slice(8, 10), day = nowDate.getDay();   //获取月份、日期
      //console.log(month, date, day)

      //下面分开计算周和月
      //周
      singleWeek[key] = value;
      if(monthMark != monthStr){    //当月份与上一条数据的月份不一样时，重置周数
        weekMark = 1;
      }
      monthMark = monthStr          //记录这条数据的月份，与下一条数据对比计算周数

      if(day == 0 || (new Date(key.slice(0,4), monthStr, 0)).getDate() == parseInt(dateStr, 10)){   //当为周日或当前日期为当月最后一天，则马上计算当前周的平均值并重置weekMark
        week[city][key.slice(0, 7) + "第" + weekMark + "周"] = getAverage(singleWeek)
        weekMark++
        singleWeek = {}
      }

      //月
      singleMonth[key] = value;
      if((new Date(key.slice(0,4), monthStr, 0)).getDate() == parseInt(dateStr, 10)){
        month[city][key.slice(0,7)] = getAverage(singleMonth)
        singleMonth = {}
      }
    }
  }
  
  // 处理好的数据存到 chartData 中
  result.day = aqiSourceData;
  result.week = week;
  result.month = month;
  chartData = result;
  renderChart()
  console.log(result);

  function getAverage(data){
    var result = 0, count = 0;
    if(data instanceof Object){
        for(var key in data){
          count++
          result += parseInt(data[key], 10)
      }
      result = (result / count).toFixed(2);
    }
    return result;
  }
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
}

init();