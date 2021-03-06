/*
	Util
*/
var $ = function(selector, node){
	return (node || document.body).querySelector(selector);
}
/*
	根据参考的代码，自己写一次
	** 参考的代码，给了我很大启示：
	1、将数据、方法、节点本身作为一个模型存在dom中，需要进行操作的时候直接调用目标dom内的方法就可以
	2、深度、广度遍历：使用栈队列（stack）和 while 循环，提供一个可行的遍历搜索算法
*/

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

//----------------------------------------------------------------------------

var component = (function(){

	function TreeNode(obj){
		this.parent = obj.parent;
		this.selfElement = obj.selfElement;
		this.childs = obj.childs || [];
		this.text = obj.text || "new Node";
		this.selfElement.treeNode = this;	//绑定数据和dom
	}

	TreeNode.prototype = {
		constructor : TreeNode,
		//判断是否为叶节点
		isLeaf : function(){
			return this.childs.length == 0;
		},
		//判断是否折叠
		isFolded : function(){
			if(this.isLeaf()){
				return false;
			}
			if(this.childs[0].selfElement.className.indexOf("hide") < 0){
				return false;
			}
			return true;
		},
		//添加子节点
		addChild : function(text){
			if(!text){
				alert("请输入子节点内容");
				return;
			}
			//先展开父节点
			if(!this.isLeaf() && this.isFolded()){
				this.toggleFolder();
			}

			var text = text || "一个新节点";

			//编写新节点的dom
			var newNode = document.createElement("div");
			newNode.className = "show"
			newNode.innerHTML = "<i class='arrow arrow-none'></i>"
							  + "<label>" + text + "</label>"
							  + "<i class='addBtn'>+</i>"
							  + "<i class='delBtn'>x</i>";

			//插入dom
			this.selfElement.appendChild(newNode);
			//向父节点的数据中插入新数据
			this.childs.push(new TreeNode({parent: this, text: text, child: [], selfElement: newNode}));

			this.render(true, false)
			return this;
		},
		//删除节点
		delChild : function(){
			//删除dom
			this.parent.selfElement.removeChild(this.selfElement);
			//删除数据
			if(this.parent.childs){
				var childs = this.parent.childs;
				for(var i = 0, len = childs.length; i < len; i++){
					if(childs[i] == this){
						this.parent.childs.splice(i, 1);
						break;
					}
				}
			}
			
			//调整父节点箭头样式
			this.parent.render(true)
		},
		//折叠/展开子节点
		toggleFolder: function(){
			if(!this.childs.length){
				return;
			}
			//仅改变可见性，不改变颜色
			for(var i = 0, len = this.childs.length; i < len; i++){
				this.childs[i].render(false, true);
			}
			this.render(true, false)
			return this;
		},
		//渲染节点样式(折叠箭头等)
		render: function(arrow, visible, toHighlight, deHighlignt){
			if(arrow){
				if(this.isLeaf()){
					$(".arrow", this.selfElement).className = "arrow arrow-none";
				}
				else if(this.isFolded()){
					$(".arrow", this.selfElement).className = "arrow arrow-right";
				}
				else{
					$(".arrow", this.selfElement).className = "arrow arrow-down";
				}
			}
			if(visible){
				//replace会返回新的字符串。。。
				var className = this.selfElement.className;
				this.selfElement.className = className.indexOf("hide") >= 0 ? className.replace("hide", "show") : className.replace("show", "hide");
			}
			//对于样式显示，要分为3种情况（红色、黑色、不改变），因此用两个变量
			if(toHighlight){
				// $("label", this.selfElement).style.cssText = "color: red"
				$("label", this.selfElement).className = "mark";
			}
			if(deHighlignt){
				$("label", this.selfElement).className = "";
			}
		}

	}

	return function(selector, rootNodeText){
		var rootNode = $(selector);

		//添加搜索功能
		var searchBox = document.createElement("p");
		searchBox.innerHTML = "<p>"
							+ "		<input type='text' id='searchInput'/>"
							+ "		<button id='searchBtn'>搜索</button>"
							+ "</p>";
		rootNode.appendChild(searchBox);

		var treeComponent = new TreeNode({text: rootNodeText || "rootNode", selfElement: rootNode});

		EventUtil.addHandler(rootNode, "click", clickHandler)
		function clickHandler(e){
			var target = EventUtil.getTarget(e), treeNode = target.parentNode.treeNode, resultList = [];
			//点击了箭头或label，折叠/展开
			if(target.className.indexOf("arrow") >= 0 || target.nodeName == "LABEL"){
				treeNode.toggleFolder()
			}
			//添加节点
			if(target.className.indexOf("addBtn") >= 0){
				treeNode.addChild(prompt("请输入子节点的内容"))
			}
			//删除节点
			if(target.className.indexOf("delBtn") >= 0){
				treeNode.delChild()
			}

			//搜索功能
			if(target.id == "searchBtn"){
				var text = $("#searchInput", rootNode).value.trim();
				if(!text){
					alert("请输入搜索内容");
					return;
				}

				//开始遍历搜索
				var resultList = search(text, treeComponent);
				console.log(resultList)

				//对找到的节点改成红色
				var pathNode;
				for(var i = 0, len = resultList.length; i < len; i++){
					var item = resultList[i];
					//$("label", item.selfElement).style.cssText = "color: red;"
					pathNode = item;
					

					//展开沿途的父节点
					while(pathNode.parent != treeComponent){
						if(!pathNode.parent.isLeaf() && pathNode.parent.isFolded()){
							pathNode.parent.toggleFolder()
						}
						pathNode = pathNode.parent
					}
					item.render(false, false, true)
				}
			}

			//深度优先搜索
			// function search(text, child){
			// 	for(var i = 0 , len = child.childs.length; i < len; i++){
			// 		var item = child.childs[i];
			// 		//重置所有节点的颜色
			// 		$("label", item.selfElement).style.cssText = "";
			// 		if(item.text.indexOf(text) >= 0){
			// 			resultList.push(item);
			// 		}
			// 		search(text, item)
			// 	}
			// }
			//深度优先搜索2
			function search(text, node){
				var resultList = [],
					stack = [],
					item;
				stack.push(node);
				while(stack.length){
					item = stack.shift();
					item.render(false, false, false, true)
					// item.text == text && item.render(false,false,true)
					item.text == text && resultList.push(item)
					//将子节点加入栈
					if(item.childs && item.childs.length){
						for(var len = item.childs.length; len; len--){
							stack.unshift(item.childs[len - 1])
						}
					}
				}
				return resultList;
			}
			//广度优先搜索
			// function search(text, node){
			// 	var resultList = [], 	//存放结果
			// 		queue = [],			//存放待处理队列
			// 		current = node;
			// 	queue.push(node);
			// 	while(queue.length){
			// 		current = queue.shift();	//获取队首节点
			// 		current.render(false, false, true)	//处理颜色
			// 		if(current.text = text){
			// 			resultList.push(current)
			// 		}
			// 		//将所有子节点加入待处理队列
			// 		for(var i = 0, len = current.childs.length; i < len; i++){
			// 			queue.push(current.childs[i]);
			// 		}
			// 	}
			// }
		}

		return treeComponent;
	}
})()

//-----------------生成dom的demo--------------------------
var tree = component("#rootNode", "rootNode");
tree.addChild("list1-1").addChild("list1-2");
tree.childs[0].addChild("list1-1-1")
tree.childs[0].childs[0].addChild("list1-1-2")


//这里可以作为对外调用接口
// var rootNode = $("#rootNode");
// var treeComponent = new TreeNode({text: "rootNode", selfElement: rootNode});

//-----------------------------------事件绑定
// EventUtil.addHandler(rootNode, "click", clickHandler)
// function clickHandler(e){
// 	var target = EventUtil.getTarget(e), treeNode = target.parentNode.treeNode;
// 	//点击了箭头或label，折叠/展开
// 	if(target.className.indexOf("arrow") >= 0 || target.nodeName == "LABEL"){
// 		treeNode.toggleFolder()
// 	}
// 	//添加节点
// 	if(target.className.indexOf("addBtn") >= 0){
// 		treeNode.addChild(prompt("请输入子节点的内容"))
// 	}
// 	//删除节点
// 	if(target.className.indexOf("delBtn") >= 0){
// 		treeNode.delChild()
// 	}
// }

// //-----------------------------------demo
// treeComponent.addChild("list1-1").addChild("list1-2");
// treeComponent.childs[0].addChild("list1-1-1")
// treeComponent.childs[0].childs[0].addChild("list1-1-2")