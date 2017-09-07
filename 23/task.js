/*
	Util
*/
var $ = function(selector, node){
	return (node || document).querySelector(selector);
}
/*
	绑定事件的组件
*/
var EventUtil = {
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
//------------------------------------------------------------------------

/*
	绑定3个按钮的事件
*/
function init(){
	var btnBox = $("p"),
		frontBtn = $(".front", btnBox),
		middleBtn = $(".middle", btnBox),
		backBtn = $(".back", btnBox),
		searchBtn = $("#searchBtn", btnBox),
		timer;

	EventUtil.addHandler(frontBtn, "click", clickHandler("front"));
	//EventUtil.addHandler(middleBtn, "click", clickHandler("middle"))
	//EventUtil.addHandler(backBtn, "click", clickHandler("back"))
	EventUtil.addHandler(searchBtn, "click", clickHandler("search"))

	var textList = [], 	//改为装div内的text的列表
		timerList = [], //装定时器的列表
		timer,			//装interval的变量
		box_1 = $(".grade-1");
	//前序排列
	function clickHandler(target){
		return function(){
			/*
				看了两个改变颜色的写法，都是用定时器
				方法1：最后执行timeInterval，逐个node执行一次，将前后node样式改变
				方法2：向list中添加node的步骤  改为--> 每次向数组中添加一个highLight定时器，最后开始遍历的时候逐一触发
			*/
			if(timerList.length){
				clearInterval(timer);
				timerList = [];
			}
			if(target == "front"){
				preOrder(box_1);
			}
			/*if(target == "middle"){
				inOrder(box_1);
			}
			if(target == "back"){
				postOrder(box_1);
			}*/
			if(target == "search"){
				var searchInput = $("#searchText", btnBox),
					text = searchInput.value;
				if(!text){
					return;
				}
				widthOrder(box_1, "root");
			}

			//开始逐一运行定时器
			timer = setInterval(function(){
				if(!timerList.length){
					clearInterval(timer)
					return;
				}
				timerList.shift()()
			}, 500)
			console.log(textList)
		}


		//前序遍历算法
		function preOrder(node){
			if(!node){
				return;
			}
			textList.push(node.innerText)
			timerList.push(function(){
				highLight(node)
			})
			for(var i = 0, len = node.children.length; i < len; i++){
				preOrder(node.children[i]);
			}
		}
		//广度遍历搜索
		function widthOrder(node, mark){
			if(!node){
				return;
			}
			if(mark == "root"){
				textList.push(node)
				timerList.push(function(){
					highLight(node)
				})
				widthOrder(node)
				return
			}
			var children = node.children, len = children.length;
			for(var i = 0; i < len; i++){
				textList.push(node.innerText)
				timerList.push(function(){
					highLight(node)
				})
				widthOrder(children[i])
			}
		}

	}

	function highLight(node){
		node.style.cssText = "background: #39c;"
		setTimeout(() => {
			node.style.cssText = ""
		}, 500)
	}

}

init();