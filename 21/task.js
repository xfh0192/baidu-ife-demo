
/*
	toTrim： 清除字符串左右两侧的非数据字符
*/
// String.prototype.toTrim = function(){
// 	return this.replace(/(^\s|\s$)*/gm, '')
// }
String.prototype.toTrim = function(){
	return this.replace(/^([^0-9a-zA-Z\u4e00-\u9fa5]*)|([^0-9a-zA-Z\u4e00-\u9fa5]*)$/gm, '')
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
var createTagsComponent = (function(){

	var modelQUeue = [];	//作为model的数组
	
	var componentTpl = "<div id='tagsComponent'>"
					+ "		<textarea type='text'></textarea>"
					+ "		<button>插入新标签</button>"
					+ "		<ul></ul>"
					+ "</div>";

	function fns(){
		//创建container
		var component = document.createElement("div");
		div.innerHTML = componentTpl;

		this.node = component;
	}

	fns.prototype.getInput = function(){
		var value = $("textarea", this.node).value, result;
		if(value){
			result = value.toTrim().split(/[^0-9a-zA-Z\u4e00-\u9fa5]*/);
		}
		return result;
	}

	fns.prototype.addTags = function(){
		var addBtns = $("button", this.node);
		
	}
	
	

	return fns;
})();

var a = new createTagsComponent();