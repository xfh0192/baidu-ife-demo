/*
*	 先往字符串类中添加方法
*/
	//去除左右两端的空格
	String.prototype.trim = String.prototype.trim || function(){
		return this.replace(/(^\s*)|(\s*$)/gm, "");
	}
	//去除左边的空格
	String.prototype.ltrim = String.prototype.ltrim || function(){
		return this.replace(/^\s*/gm, "");
	}
	//去除右边的空格
	String.prototype.rtrim = String.prototype.rtrim || function(){
		return this.replace(/\s*$/gm, "");
	}
	//去除所有空格
	String.prototype.allTrim = String.prototype.allTrim || function(){
		return this.replace(/\s*/gm, "");
	}
/*
*	规定一些校验的正则表达式
*/
	var validate = {
		name: /^[\u4e00-\u9fa5a-zA-Z]+$/,
		int: /^[\d]+$/
	}
/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
	//0.获取dom和值
	var cityInput = document.querySelector("#aqi-city-input"),
		city = cityInput.value.trim(),								//只清楚左右空格，中间空格可能用来间隔单词
		numInput = document.querySelector("#aqi-value-input"),
		num = numInput.value.allTrim(),								//空格全部清除，一般来说数字中带空格无意义
		success = false;											//标记是否成功添加有效数据
	//1.进行简单校验
	if(!validate.name.test(city)){
		alert("城市名必须为中英文字符")
	}
	else if(!validate.int.test(num)){
		alert("空气质量指数必须为正整数")
	}
	else{
		success = true												//假如都没有出错，那就将成功标记为true
	}
	aqiData[city] = num;

	//添加完毕，清除input
	cityInput.value = numInput.value = ""
	//返回最新添加的一条，渲染的时候只需要渲染这一条即可
	return {name: city || "", num: num || "0", success: success}
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList(item) {
	var table = document.querySelector("table");
	addTr()

	function addTr(){
		var tr = document.createElement("tr");
		for(var i = 0; i < 3; i++){
			var td = document.createElement("td");
			if(i == 0){
				td.innerHTML = item.name
			}
			if(i == 1){
				td.innerHTML = item.num
			}
			if(i == 2){
				td.innerHTML = "<button>删除</button>"
			}
			tr.appendChild(td)
		}
		table.appendChild(tr)
	}
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  var item = addAqiData();
  if(item.success){
  	delete item.success;
  	renderAqiList(item);
  }
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(target) {
  // do sth.
  var tr = target.parentNode.parentNode;
  var city = tr.querySelector("td").innerText;
  delete aqiData[city];
  tr.parentNode.removeChild(tr);

  //renderAqiList();
  console.log(aqiData);
}

function init() {

  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
  var addBtn = document.querySelector("#add-btn");
  addBtn.addEventListener("click", addBtnHandle);
  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  var table = document.querySelector("table");
  table.addEventListener("click", function(event){
  	if(event.target && event.target.nodeName == "BUTTON"){
  		delBtnHandle(event.target);
  	}
  })
}

init();