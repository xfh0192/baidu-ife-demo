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

//试一下获取下一个兄弟元素的写法
/*var li = $(".grade-3"), result = getNextElement(li)
console.log(result)
function getNextElement(node){
	var nextNode = node.nextSibling;
	if(nextNode.nodeType == 1){
		return nextNode;
	}
	else if(nextNode){
		return getNextElement(nextNode)
	}
	else{
		return;
	}
}*/
//------------------------------------------------------------------------


//遍历相关操作的绑定
/*
	绑定3个按钮的事件
*/
function traversalInit(){
	var btnBox = $("#traversalBtnBox"),
		frontBtn = $(".front", btnBox),
		middleBtn = $(".middle", btnBox),
		backBtn = $(".back", btnBox),
		widthSearchBtn = $("#widthSearchBtn", btnBox),
		depthSearchBtn = $("#depthSearchBtn", btnBox),
		timer;

	EventUtil.addHandler(frontBtn, "click", clickHandler("front"));
	//EventUtil.addHandler(middleBtn, "click", clickHandler("middle"))
	//EventUtil.addHandler(backBtn, "click", clickHandler("back"))
	EventUtil.addHandler(widthSearchBtn, "click", clickHandler("widthSearch"))
	EventUtil.addHandler(depthSearchBtn, "click", clickHandler("depthSearch"))

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
			textList = [];
			if(timerList.length){
				clearInterval(timer);
				timerList = [];
			}
			if(target == "front"){
				preOrder(box_1);
			}
			if(target == "widthSearch"){
				var searchInput = $("#searchText", btnBox),
					text = searchInput.value;
				if(!text){
					alert("请输入搜索内容")
					return;
				}
				widthOrder(box_1, text, "root");
			}
			if(target == "depthSearch"){
				var searchInput = $("#searchText", btnBox),
					text = searchInput.value;
				if(!text){
					alert("请输入搜索内容")
					return;
				}
				depthOrder(box_1, text);
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
			textList.push(node)
			timerList.push(function(){
				highLight(node)
			})
			for(var i = 0, len = node.children.length; i < len; i++){
				preOrder(node.children[i]);
			}
		}
		//广度优先遍历
		function widthOrder(node, searchText, mark){
			if(!node){
				return;
			 }
			 //先加入根节点
			if(mark == "root"){
				var nodeText = node.innerText.split(/\s+/)[0];
				//textList.push(nodeText)
				timerList.push(function(){
					var matched = false;
					if(nodeText && nodeText == searchText){
						matched = true;
					}
					highLight(node, matched)
				})
				widthOrder(node, searchText)
				return;
			}
			//将当前节点的子节点全加入数组
			var children = node.children, len = children.length;
			for(var i = 0; i < len; i++){
				var nodeText = children[i].innerText.split(/\s+/)[0];
				//textList.push(nodeText)
				//这里要用闭包
				timerList.push((function(node, nodeText){
					//var nodeText = node.innerText.split(/\s+/)[0], matched = false;
					var matched = false;
					return function(){
						if(nodeText && nodeText == searchText){
							matched = true;
						}
						highLight(node, matched)
					}
				})(children[i], nodeText))
			}
			//再分别对每个子节点遍历
			for(var i = 0; i < len; i++){
				widthOrder(children[i], searchText)
			}
		}

		//深度优先遍历
		function depthOrder(node, searchText, nodeText){
			if(!node){
				return;
			}
			//var textList = []
			var nodeText = node.innerText.split(/\s+/)[0];
			//textList.push(nodeText)
			timerList.push((function(node, searchText, nodeText){
				var matched = false;
				return function(){
					if(nodeText && nodeText == searchText){
						matched = true;
					}
					highLight(node, matched)
				}
			})(node, searchText, nodeText))

			var children = node.children, len = children.length;
			for(var i = 0; i < len; i++){
				depthOrder(children[i], searchText, nodeText)
			}
		}

	}

	function highLight(node, matched){
		if(!node){
			return;
		}
		node.style.cssText = "background: #39c;"
		if(!matched){
			setTimeout(() => {
				node.style.cssText = ""
			}, 500)
		}
		
	}
}

//增删的操作绑定
function modifyInit(){
	var divContainer = $("#div-container"),
		modifyBtnBox = $("#modifyBtnBox"),
		delNodeBtn = $("#delNodeBtn", modifyBtnBox),
		addNodeBtn = $("#addNodeBtn", modifyBtnBox),
		selectedNode;

	EventUtil.addHandler(divContainer, "click", selectDivHandler())
	EventUtil.addHandler(delNodeBtn, "click", delDivHandler)
	EventUtil.addHandler(addNodeBtn, "click", addDivHandler)

	//select一个div的逻辑
	function selectDivHandler(){
		var ctrlMark;
		return function(e){
			var target = EventUtil.getTarget(e);
			if(target.nodeName == "DIV"){
				if(ctrlMark){
					return;
				}
				ctrlMark = true;
				changeSelectedNode(target)

				setTimeout(() => {
					ctrlMark = false;
				}, 200)
			}
		}
	}
	function changeSelectedNode(target){
		//当选中与上一次相同的节点时
		if(selectedNode == target){
			if(selectedNode.style.cssText){
				selectedNode.style.cssText = ""
			}
			else{
				selectedNode.style.cssText = "background: #ffac44";
			}
		}
		//当选中与上一次不同的节点时
		else{
			target.style.cssText = "background: #ffac44";
			if(selectedNode){
				selectedNode.style.cssText = "";
			}
			selectedNode = target;
		}
	}
	//删除一个div的逻辑
	function delDivHandler(){
		if(!selectedNode){
			alert("请先选择一个节点")
			return;
		}
		selectedNode.parentNode.removeChild(selectedNode)
	}
	//添加一个div的逻辑
	function addDivHandler(){
		if(!selectedNode){
			alert("请先选择一个节点");
			return;
		}
		var text = $("#addNodeInput", modifyBtnBox).value;
		if(!text){
			alert("请输入新节点的内容");
			return;
		}

		var newNode = document.createElement("div");
		newNode.innerText = text;
		selectedNode.appendChild(newNode);
	}
}

function init(){
	traversalInit()
	modifyInit()
}

init();