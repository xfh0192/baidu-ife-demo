
/*
	判断一个值是否数字
*/
function isNumber(value){
	// return typeof value == "number" && isFinite(value);
	var numberReg = /^(-?\d+)(\.\d+)?$/;
	return numberReg.test(value);
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
/*
	----------------------------------------------------------------------------
	具体逻辑
*/
/*
	定义一个数据队列的数组
*/
var modelQueue = [];
//根据dom重新获取数组
function resetQueue(){
	var ul = document.querySelector("#queue"), nodes = ul.childNodes;
	modelQueue = [];
	for(var i = 0, len = nodes.length; i < len; i++){
		modelQueue.push(nodes[i].innerText)
	}
	console.log(modelQueue);
}
/*
	获取input中的数字
*/
function getInput(){
	var input = document.querySelector("#num"), value = input.value, result;
	if(isNumber(value)){
		result = value;
	}
	input.value = "";
	return result;
}
/*
	更新queue的数组（model）
*/
function updateQueue(value, operate){
	var output;
	switch(operate){
		case "leftInput":
			modelQueue.unshift(value);
			break;
		case "rightInput": 
			modelQueue.push(value);
			break;
		case "leftOutput":
			output = modelQueue.shift();
			alert(output);
			break;
		case "rightOutput":
			output = modelQueue.pop();
			alert(output);
			break;
	}
	console.log(modelQueue)
	renderQueue(value, operate)
}

/*
	渲染队列（view）
*/
/*function renderQueue(){
	var ul = document.querySelector("#queue"), fragment = document.createDocumentFragment();
	ul.innerHTML = ""
	for(var i = 0, len = modelQueue.length; i < len; i++){
		var li = document.createElement("li");
		li.innerText = modelQueue[i];
		fragment.appendChild(li)
	}
	ul.appendChild(fragment);
}*/
//考虑对单项进行操作
function renderQueue(value, operate){
	var ul = document.querySelector("#queue"), nodes = ul.childNodes, li = document.createElement("li"), node;
	switch(operate){
		case "leftInput":
			inputOpe(li)
			ul.insertBefore(li, nodes[0])		//对每一项添加事件
			break;
		case "rightInput":
			inputOpe(li)
			ul.appendChild(li);
			break;
		case "leftOutput":
			node = nodes[0]
			outputOpe(node)
			break;
		case "rightOutput":
			node = nodes[nodes.length - 1]
			outputOpe(node)
			break;
	}

	function clickHandler(event){
		var target = EventUtil.getTarget(event);
		target.style.cssText = "animation: fadeOutTop 0.2s ease forwards"
		setTimeout(function(){
			target.parentNode.removeChild(target)

			// 点击删除节点后，重新获取数组
			resetQueue()
		}, 200)
	}
	//对输入的li包装
	function inputOpe(li){
		li.innerText = value
		li.style.cssText = "animation: rightFadeIn 0.2s ease;height:" + (parseInt(value,10)+30) + "px;"
		EventUtil.addHandler(li, "click", clickHandler)
	}
	//对弹出的node处理
	function outputOpe(node){
		node.style.cssText = "animation: fadeOutTop 0.2s ease forwards"
		EventUtil.removeHandler(li, "click", clickHandler)
		setTimeout(function(){
			node.parentNode.removeChild(node)
		}, 200)
	}
}

/*
	绑定按钮事件
*/
function initButton(){
	var leftInput = document.querySelector("#leftInput"),
		rightInput = document.querySelector("#rightInput"),
		leftOutput = document.querySelector("#leftOutput"),
		rightOutput = document.querySelector("#rightOutput");
	EventUtil.addHandler(leftInput, "click", clickHandler("leftInput"))
	EventUtil.addHandler(rightInput, "click", clickHandler("rightInput"))
	EventUtil.addHandler(leftOutput, "click", clickHandler("leftOutput"))
	EventUtil.addHandler(rightOutput, "click", clickHandler("rightOutput"))

	function clickHandler(target){
		return function(){
			var value = getInput(), text = "";
			if(!value && target.indexOf("Input") >= 0){
				alert("请输入数字")
			}
			else if(modelQueue.length > 60 && target.indexOf("Input") >= 0){
				alert("队列最多保存60个数字")
			}
			else if(!modelQueue.length && target.indexOf("Output") >= 0){
				alert("队列已经是空的了")
			}
			else if(value < 10 || value > 100){
				alert("请输入10-100之间的数字")
			}
			else if((value && target.indexOf("Input") >= 0) || (modelQueue.length && target.indexOf("Output") >= 0)){
				updateQueue(value, target);
			}
			 
		}
	}

	/*
		增加冒泡排序逻辑
	*/
	var sortBtn = document.querySelector("#sort");
	EventUtil.addHandler(sortBtn, "click", sortHandler)
	function sortHandler(){
		// var lis = document.querySelectorAll("li");
		//var lis = [9,8,7,6,5,4,3,2,1]
		var arr = modelQueue;
		var i = arr.length, temp;
		while(i > 0){
			for(var j = 0; j < i - 1; j++){
				if(arr[j] > arr[j + 1]){
					temp = arr[j]
					arr[j] = arr[j + 1]
					arr[j + 1] = temp
				}
			}
			i--;
		}
		console.log(arr)
		var ul = document.querySelector("#queue"), fragment = document.createDocumentFragment();
		ul.innerHTML = "";
		for(var i = 0; i < arr.length; i++){
			var li = document.createElement("li")
			li.innerText = arr[i]
			li.style.cssText = "height:" + (30+parseInt(arr[i],10)) + "px"
			fragment.appendChild(li)
		}
		ul.appendChild(fragment)
	}
}
/*
	绑定函数
*/
function init(){
	initButton();
	// initQueue();
}

init()