

/*
	2017/09/15	思路不好，参考作业第一个。
*/

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

/*
	菜单dom结构为
	<div class="level-1">
		<label>
			<i class="arrow-down"></i>
			text
			<i class="addBtn"></i>
			<i class="delBtn"></i>
		</label>
		<div></div>		// children
	</div>
*/

var app = {
	util: {
		$ : $,
		EventUtil: EventUtil
	}
};

var listComponent = (function listComponent(util){
	var $ = util.$,
		EventUtil = util.EventUtil;

	function fns(option, parentNode){
		var option = option || {},
			structure = option.structure || {},
			parentNode = parentNode || document.body,
			rootNode = document.createElement("div"),
			fragment = document.createDocumentFragment();

		rootNode.id = "nodeTree"

		//插入输入框和查找按钮
		var searchBox = document.createElement("div");
		searchBox.innerHTML = "<input type='text' id='searchText'/><button id='searchBtn'>搜索</button>";
		rootNode.appendChild(searchBox);

		//创建树形列表dom
		fragment.className = "level-0";
		this.buildNodeTree(structure, fragment);

		//插入页面
		rootNode.appendChild(fragment)
		parentNode.appendChild(rootNode)

		//事件监听
		this.initEvent(rootNode)
	}

	//构建nodetree
	fns.prototype.buildNodeTree = function(structure, parentNode){
		for(var i = 0, len = structure.length; i < len; i++){
			var item = structure[i],
				structure = structure || {};

			var node = buildNewDiv(item.text, parentNode, "", item.children)

			if(item.children && item.children.length){
				//递归
				fns.prototype.buildNodeTree.call(this, item.children, node);
			}
		}
	}

	//构建一个新的div节点
	function buildNewDiv(text, parentNode, operateMark, children){
		var node = document.createElement("div"),
			title = document.createElement("label");

		//添加title
		title.innerText = text || "";
		node.appendChild(title);

		//添加classname
		var levelStr = parentNode.className.match(/level\-\d/g), levelNum;
		if(levelStr){
			levelNum = parseInt(levelStr[0].split("-")[1]) + 1;
			node.className = "level-" + levelNum;
			node.style.cssText = "margin-left: " + 30*levelNum + "px";
		}

		//添加添加按钮
		var addBtn = document.createElement("i");
		addBtn.className = "addBtn";
		addBtn.innerText = "添加子节点";
		title.appendChild(addBtn);

		//添加删除按钮
		var delBtn = document.createElement("i");
		delBtn.className = "delBtn";
		delBtn.innerText = "删除节点";
		title.appendChild(delBtn);

		parentNode.appendChild(node);

		//处理有children的情况
		if(children && children.length){
			//添加折叠展开箭头
			var arrow = document.createElement("i");
			arrow.className = "arrow-down";
			title.insertBefore(arrow, title.childNodes[0])
		}
		//假如新添加节点，则要给父节点添加箭头
		if(operateMark == "add" && !($(".arrow-down", parentNode)) || $(".arrow-right", parentNode)){
			//添加折叠展开箭头
			var arrow = document.createElement("i");
			arrow.className = "arrow-down";
			parentNode.childNodes[0].insertBefore(arrow, parentNode.childNodes[0].childNodes[0])
		}

		return node;
	}

	//事件监听
	fns.prototype.initEvent = function(rootNode){

		//搜索节点内容
		var searchBtn = $("#searchBtn", rootNode);
		EventUtil.addHandler(searchBtn, "click", searchHandler)

		function searchHandler(e){
			var searchText = $("#searchText", rootNode).value;

			var labels = rootNode.querySelectorAll("label");
			for(var i = 0, len = labels.length; i < len; i++){
				var label = labels[i];
				// console.log(label.innerText);
				if(searchText && label.innerText.indexOf(searchText) >= 0){
					label.style.cssText = "color: red;"
					searchText && toggleParentNode(label)
				}
				else{
					label.style.cssText = null;
				}
			}

			if(!searchText){
				alert("请输入搜索内容")
			}
		}

		//折叠/展开节点、增加节点、删除节点
		EventUtil.addHandler(rootNode, "click", toggleNodeHandler)

		function toggleNodeHandler(e){
			var target = EventUtil.getTarget(e);
			if(target.nodeName != "I"){
				return;
			}
			switch(target.className){
				case "arrow-right": 
					toggleNode(target); 
					break;
				case "arrow-down" : 
					toggleNode(target);
					break;
				case "addBtn" : 
					addBtnHandler(target);
					break;
				case "delBtn" : 
					delBtnHandler(target);
					break;
			}
		}
	}

	//折叠/展开某一个节点
	function toggleNode(node){
		if(node.nodeName != "I"){
			return;
		}
		var arrow = node,
			label = arrow.parentNode,
			parentDiv = label.parentNode;

		arrow.className = arrow.className.indexOf("arrow-down") >= 0 ? "arrow-right" : "arrow-down";

		//从一个节点开始向所有子节点递归展开/折叠
		for(var i = 1, len = parentDiv.children.length; i < len; i++){
			var childDivNode = parentDiv.children[i];
			childDivNode.style.display = childDivNode.style.display == "none" ? "block" : "none";
			if(!childDivNode.children.length){
				toggleNode(childDivNode.querySelector("i"))
			}
		}
	}

	//让父节点展开/折叠(通过label标签查找)
	function toggleParentNode(label){
		if(!label){
			return;
		}
		var parentDivNode = label.parentNode.parentNode;	//上一级的div节点

		for(var i = 1, len = parentDivNode.children.length; i < len; i++){
			var childDivNode = parentDivNode.children[i];
			childDivNode.style.display = "block";
		}

		if(parentDivNode.id != "nodeTree"){
			toggleParentNode($("label", parentDivNode));
		}
	}

	function addBtnHandler(node){
		var text = prompt("请输入新节点的内容", "一个新节点"),
			parentNode;
		if(node && text){
			parentNode = node.parentNode.parentNode;
			buildNewDiv(text, parentNode, "add")
		}
		else{
			!text && alert("请输入节点内容")
		}
	}

	function delBtnHandler(node){
		var labelNode = node.parentNode,
			divNode = labelNode.parentNode;
		divNode.parentNode.removeChild(divNode)
	}

	return fns;
	
})(app.util)


var option = {
	structure : [
		{
			text: "tab1",
			children: [
				{
					text: "tab2-1",
					children : [
						{
							text: "tab3-1"
						},
						{
							text: "tab3-2"
						},
						{
							text: "tab3-3"
						}
					]
				},
				{
					text: "tab2-2",
					children : [
						{
							text: "tab3-1"
						},
						{
							text: "tab3-2"
						},
						{
							text: "tab3-3"
						},
						{
							text: "tab3-4"
						}
					]
				}
			]
		}
	]
}

var listComponent1 = new listComponent(option);
