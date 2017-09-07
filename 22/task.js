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
		timer;

	EventUtil.addHandler(frontBtn, "click", clickHandler("front"));
	EventUtil.addHandler(middleBtn, "click", clickHandler("middle"))
	EventUtil.addHandler(backBtn, "click", clickHandler("back"))

	var divList = [], 
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
			if(target == "middle"){
				inOrder(box_1);
			}
			if(target == "back"){
				postOrder(box_1);
			}

			//开始逐一运行定时器
			timer = setInterval(function(){
				if(!timerList.length){
					clearInterval(timer)
					return;
				}
				timerList.shift()()
			}, 500)
			console.log(divList)
		}


		//前序遍历算法
		function preOrder(node){
			if(!node){
				return;
			}
			divList.push(node)
			timerList.push(function(){
				highLight(node)
			})
			preOrder(node.firstElementChild);
			preOrder(node.lastElementChild);
		}
		//中序遍历
		function inOrder(node){
			if(!node){
				return;
			}
			inOrder(node.firstElementChild)
			divList.push(node)
			timerList.push(function(){
				highLight(node)
			})
			inOrder(node.lastElementChild)
		}
		//后序遍历
		function postOrder(node){
			if(!node){
				return
			}
			postOrder(node.firstElementChild)
			postOrder(node.lastElementChild)
			divList.push(node)
			timerList.push(function(){
				highLight(node)
			})
		}

		// 错误的思路-----------------------------------
		/*//先排序
		frontSort(box_1);
		console.log(divList)

		divList.forEach(function(node){
			highLight(node);
		})

		function frontSort(node){
			divList.push(node)

			var divs = node.children;
			if(divs.length){
				for(var i = 0, len = divs.length; i < len; i++){
					frontSort(divs[i])
				}
			}
		}*/
	}

	function highLight(node){
		node.style.cssText = "background: #39c;"
		setTimeout(() => {
			node.style.cssText = ""
		}, 500)
	}
}

init();