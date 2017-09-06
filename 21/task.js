
/*
	toTrim： 清除字符串左右两侧的非数据字符
*/
// String.prototype.toTrim = function(){
// 	return this.replace(/(^\s|\s$)*/gm, '')
// }
String.prototype.toTrim = function(){
	return this.replace(/^([^0-9a-zA-Z\u4e00-\u9fa5]*)|([^0-9a-zA-Z\u4e00-\u9fa5]*)$/gm, '')
}
Array.prototype.every = Array.prototype.every || function(fn, thisObj){
	for(var k = 0, length = this.length; k < length; k++){
		if(!fn.call(thisObj, this[k], k, this)){
			return false;
		}
	}
	return true;
}
Array.prototype.indexOf = Array.prototype.indexOf || function(searchElement, fromIndex){
	var fromIndex = fromIndex * 1 || 0;		// 乘以1转换为数字类型
	for(var k = fromIndex, length = this.length; k < length; k++){
		if(this[k] === searchElement){
			return fromIndex;
		}
	}
	return -1;
}
//组件
var app = {
	util: {}
}

app.util = {
	$ : function(selector, node){
		return (node || document).querySelector(selector);
	},
	/* 判断一个值是否数字 */
	isNumber : function(value){
		// return typeof value == "number" && isFinite(value);
		var numberReg = /^(-?\d+)(\.\d+)?$/;
		return numberReg.test(value);
	},

	/*
		绑定事件的组件
	*/
	addHandler: function(element, event, handler){
		if(element.addEventListener){
			element.addEventListener(event, handler, false)
		}
		else if(element.attachEvent){
			element.attachEvent("on" + event, handler)
		}
		else{
			element["on" + event] = handler
		}
	},
	removeHandler: function(element, event, handler){
		if(element.removeEventListener){
			element.removeEventListener(event, handler, false)
		}
		else if(element.detachEvent){
			element.detachEvent("on" + event, handler)
		}
		else{
			element["on" + event] = null;
		}
	},
	getEvent: function(event){
		return event ? event : window.event;
	},
	getTarget: function(event){
		return event.target || event.srcElement;
	}
}

/*
	----------------------------------------------------------------------------
	具体逻辑
*/
//封装为一个类
var createTagsComponent = (function(util){
	var $ = util.$;
	var EventUtil = {
		addHandler : util.addHandler,
		removeHandler : util.removeHandler,
		getEvent : util.getEvent,
		getTarget : util.getTarget
	}
	
	var componentTpl = "<div id='tagsComponent'>"
					+ "		<textarea type='text'></textarea>"
					+ "		<button>插入新标签</button>"
					+ "		<ul></ul>"
					+ "</div>";

	//构造函数
	function fns(btnText, areaText){
		//作为model的数组
		this.modelQueue = [];

		//创建container
		var component = document.createElement("div");
		component.innerHTML = componentTpl;

		document.body.appendChild(component);

		//使用输入的文字代替默认的文字
		if(btnText){
			$("button", component).innerText = btnText;
		}
		if(areaText){
			$("textarea", component).placeholder = areaText;
		}

		this.node = component;
		this.addListener();
	}

	fns.prototype.getInput = function(){
		var value = $("textarea", this.node).value, array = [], result;
		if(value){
			/*result = [];
			array = value.toTrim().split(/[^0-9a-zA-Z\u4e00-\u9fa5]+/);
			//去重
			array.every(function(item){
				if(result.indexOf(item) < 0){
					result.push(item)
				}
				return true;
			})*/
			result = value.toTrim().split(/[^0-9a-zA-Z\u4e00-\u9fa5]+/);

		}
		return result;
	}

	//增加tags
	fns.prototype.addTags = function(){
		var addBtns = $("button", this.node), 
			ul = $("ul", this.node), 
			lis = ul.querySelectorAll("li"),
			fragment = document.createDocumentFragment(),
			inputArr = filterSame(this.getInput(), this.modelQueue);	//先检查去重,得到新增加的项
			//inputArr = this.getInput();

		this.modelQueue = this.modelQueue.concat(inputArr)	//将新增加的项加进数据模型数组中

		//假如tag超过10个，从前面开始删除多出来的
		if(this.modelQueue.length > 10){
			//一次输入超过10个，截取输入数组的最后10个
			inputArr.splice(0, inputArr.length - 10)
			//总数超过10个，从头开始删除
			var delLen = this.modelQueue.length - 10;
			this.modelQueue.splice(0, delLen);
			if(lis.length){	//以防直接输入了10个以上，找不到li
				for(var i = 0; i < delLen; i++){
					ul.removeChild(lis[i])
				}
			}
		}

		//重新渲染
		for(var i = 0, len = inputArr.length; i < len; i++){
			var item = inputArr[i];
			
			var li = document.createElement("li");
			li.innerText = item;
			li.style.cssText = "animation: rightFadeIn 0.2s ease forwards";
			fragment.appendChild(li);
			//console.log(this.modelQueue)
		}

		console.log(this.modelQueue)
		ul.appendChild(fragment);
	}

	//数组去重函数
	function filterSame(array, modelQueue){
		var result = [];
		array.forEach(function(item){
			if(modelQueue.indexOf(item) < 0){
				result.push(item)
			}
		})
		return result;
	}
	
	//添加监听
	fns.prototype.addListener = function(){
		var self = this;
		var addBtn = $("button", this.node);
		var ul = $("ul", this.node);

		//对btn的操作
		EventUtil.addHandler(addBtn, "click", btnClickHandler);
		function btnClickHandler(){
			self.addTags()
		}

		//对tag列表的操作
		EventUtil.addHandler(ul, "click", ulClickHandler);
		EventUtil.addHandler(ul, "mouseover", ulMouseOverHandler);
		EventUtil.addHandler(ul, "mouseout", ulMouseOutHandler);

		function ulClickHandler(e){
			var target = EventUtil.getTarget(e);
			if(target && target.nodeName == "LI"){
				target.style.cssText = "animation: fadeOutTop 0.2s ease forwards";

				setTimeout(() => {
					target.parentNode.removeChild(target);

					// 点击删除节点后，重新获取数组
					var lis = ul.querySelectorAll("li");
					self.modelQueue = [];
					for(var i = 0, len = lis.length; i < len; i++){
						self.modelQueue.push(lis[i].innerText)
					}
					console.log(self.modelQueue);

				}, 200)
			}
		}

		function ulMouseOverHandler(){

		}
		function ulMouseOutHandler(){

		}
	}

	return fns;
})(app.util);

var a = new createTagsComponent();
var b = new createTagsComponent("添加爱好", "在此处填写需要添加的爱好吧");