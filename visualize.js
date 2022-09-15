/*
	Circular Graph Visualizer
	Unfinished - 3/15/2012
*/

var Visualize = function(parent, w, h){
	this.stepObjects = [];
	this.stepObjIndex = [];
	this.Surface;
	this.Width  = w || window.innerWidth  || document.body.offsetWidth  || 800;
	this.Height = h || window.innerHeight || document.body.offsetHeight || 600;
	this.ParentElement = parent;
};

Visualize.prototype.initCanvas = function(element){
	if(typeof element == 'string'){
		if(typeof document.getElementById(element) == 'undefined')
			return;
		this.Surface = document.getElementById(element).getContext('2d');
	}else if(typeof element == 'object'){
		this.Surface = element.getContext('2d');
	}
	return this;
};

Visualize.prototype.setStyle = function(faded){
	if(faded){
		this.Surface.strokeStyle = 'rgb(48,48,48)';
	}else{
		this.Surface.strokeStyle = "#FFFFFF";
	}
	return;
};

Visualize.prototype.drawOutPin = function(x, y, drawBefore, faded){
	this.Surface.save();
		this.Surface.beginPath();
		if(!!faded){
			this.Surface.fillStyle = 'rgb(48,48,48)';
		}else{
			this.Surface.fillStyle = 'rgb(255,0,0)';
		}
		this.Surface.arc(x+(drawBefore ? -4 : 4), y, 3, 0, Math.PI*2, true);
		this.Surface.fill();
	this.Surface.restore();
	return;
};

Visualize.prototype.drawInPin = function(x, y, drawBefore){
	this.Surface.save();
		this.Surface.beginPath();
		this.Surface.fillStyle = 'rgb(0,0,255)';
		this.Surface.arc(x+4, y, 3, 0, Math.PI*2, true);
		this.Surface.fill();
	this.Surface.restore();
	return;
};

Visualize.prototype.drawBezierLink = function(x1, y1, x2, y2, drawBefore, faded){
	this.Surface.save();
		this.setStyle(!!faded);
		
		// Bezier Curve Stuff
		var CurveOut = (x1 > x2 ? x1-((x1-x2)/2) : x1+((x2-x1)/2)),
		    CurveIn  = (x2 > x1 ? x2-((x2-x1)/2) : x2+((x1-x2)/2));
		
		this.Surface.beginPath();
		this.Surface.moveTo(x1, y1);
		this.Surface.bezierCurveTo(CurveOut, y1, CurveIn, y2, x2, y2); 		// pretty curve
		
		// Arrow head
		this.Surface.lineTo(x2-(drawBefore ? -8.66025 : 8.66025),y2-(-5));							// precalculated
		this.Surface.moveTo(x2, y2);
		this.Surface.lineTo(x2-(drawBefore ? -8.66025 : 8.66025),y2-(5)); 							// precalculated
		this.Surface.stroke();
	this.Surface.restore();	
	return;
};

Visualize.prototype.drawQuadCurveLink = function(x1, y1, x2, y2, faded){
	this.Surface.save();
		this.setStyle(!!faded);
				
		this.Surface.beginPath();
		this.Surface.moveTo(x1, y1);
		this.Surface.quadraticCurveTo(y2,x1,x2,y2);			// ugly curve
		
		// Arrow Head
		this.Surface.lineTo(x2-(8.66025),y2-(-5));			// precalculated
		this.Surface.moveTo(x2, y2);
		this.Surface.lineTo(x2-(8.66025),y2-(5)); 			// precalculated
		this.Surface.stroke();
	this.Surface.restore();	
	return;
};

Visualize.prototype.drawArrowLink = function(x1, y1, x2, y2, faded){
	this.Surface.save();
		this.setStyle(!!faded);
		
		// Arrowhead stuff
		var angle = Math.atan2(y2-y1,x2-x1);		// arrow head's angle
		var headlen = 10;								// Length of arrow head
				
		this.Surface.beginPath();
		this.Surface.moveTo(x1, y1);
		this.Surface.lineTo(x2,y2);							// no curve
		
		// Arrow Head
		this.Surface.lineTo(x2-headlen*Math.cos(angle-Math.PI/6),y2-headlen*Math.sin(angle-Math.PI/6));
		this.Surface.moveTo(x2, y2);
		this.Surface.lineTo(x2-headlen*Math.cos(angle+Math.PI/6),y2-headlen*Math.sin(angle+Math.PI/6));
		this.Surface.stroke();
	this.Surface.restore();	
	return;
};

Visualize.prototype.render = function(){
	var inPinX, inPinY, outPinX, outPinY;
	
	// Clear the screen
	this.Surface.clearRect(0,0,this.Width, this.Height);
	
	// For each Step
	for(var x = 0; x < this.stepObjects.length; x++) 
	{
		// For each linked step
		for(var y = 0; y < this.stepObjects[x].link.length; y++)
		{
			this.stepObjects[x].link[y].stepX > this.stepObjects[x].stepX
			
			outPinX  = this.stepObjects[x].stepX + (this.stepObjects[x].link[y].stepX < this.stepObjects[x].stepX ? 0 : this.stepObjects[x].stepW);
			outPinY  = this.stepObjects[x].stepY + ((this.stepObjects[x].stepH / (this.stepObjects[x].link.length + 1)) * (y + 1));
			inPinX   = this.stepObjects[x].link[y].stepX + (this.stepObjects[x].link[y].stepX > this.stepObjects[x].stepX ? 0 : this.stepObjects[x].link[y].stepW);
			inPinY   = this.stepObjects[x].link[y].stepY + (this.stepObjects[x].link[y].stepH / 2);
			
			// Draw pins
			if(this.stepObjects[x].link[y].obj.isClear == "true"){
				this.drawOutPin(outPinX, outPinY, (this.stepObjects[x].link[y].stepX < this.stepObjects[x].stepX), true);
				this.drawArrowLink(outPinX, outPinY, inPinX, inPinY, true);
			}else{
				this.drawOutPin(outPinX, outPinY, (this.stepObjects[x].link[y].stepX < this.stepObjects[x].stepX));
				this.drawBezierLink(outPinX, outPinY, inPinX, inPinY, (this.stepObjects[x].link[y].stepX < this.stepObjects[x].stepX));
			}
		}	
	}
	var that = this;
	setTimeout(function(){that.render()}, 33); // ~30fps if the computer can keep up with the canvas drawing
};

Visualize.prototype.addStep = function(element, id, level){
	var ele;
	if(typeof element == 'string'){
		if(typeof document.getElementById(element) == 'undefined')
			return;
		ele = document.getElementById(element);
	}else if(typeof element == 'object'){
		ele = element;
	}
	// Add it to the array
	var t = this.createStepObj(ele, level);
	this.stepObjects.push(t);
	this.stepObjIndex.push(id);
	return t;
};

Visualize.prototype.orderPath = function(){
	var PathLength = this.stepObjects.length - 1;
	var centerX = (this.Width/2);
	var centerY = (this.Height/2);
	var radius = Math.min(centerX, centerY) - 50;
	
	// Root Path Node is centered
	this.stepObjects[0].stepX = centerX - (this.stepObjects[0].stepW / 2);
	this.stepObjects[0].stepY = centerY - (this.stepObjects[0].stepH / 2);
	this.stepObjects[0].obj.style.left = this.stepObjects[0].stepX + 'px';
	this.stepObjects[0].obj.style.top = this.stepObjects[0].stepY + 'px';
	
	for(var x = 1; x < this.stepObjects.length; x++){
		var cx = (centerX + radius * Math.cos(2 * Math.PI * (x-1) / PathLength)) - (this.stepObjects[x].stepW / 2),
		    cy = (centerY + radius * Math.sin(2 * Math.PI * (x-1) / PathLength)) - (this.stepObjects[x].stepH / 2);
		this.stepObjects[x].obj.SineIn(cx, cy, 550);
	}
};

// This only orders the immediate children of a Root
Visualize.prototype.orderPartialPath = function(rootid){
	// path is an array of IDs, the first ID in the path is the root
	var loc = this.stepObjIndex.indexOf(rootid);
	if(loc == -1) { return; }
	var path = this.stepObjects[loc].linkId;
	var PathLength = path.length;
	var centerX = (this.Width/2);
	var centerY = (this.Height/2);
	var radius = Math.min(centerX, centerY) - 50;
	
	// Root Path Node is centered
	if(this.stepObjects[loc].obj.isClear == "true"){
		this.stepObjects[loc].obj.FadeIn(250, 0, 100);
	}
	this.stepObjects[loc].obj.SineIn(centerX - (this.stepObjects[loc].stepW / 2), 
		centerY - (this.stepObjects[loc].stepH / 2), 550);
	this.stepObjects[loc].obj.style.zIndex = 500;
	
	
	// FadeOut Non-Children
	var uu = 0;
	for(var x = 0; x < this.stepObjects.length; x++){
		if(path.indexOf(this.stepObjIndex[x]) == -1 && x != loc){
			var cx = (centerX + (radius-50) * Math.cos(2 * Math.PI * uu / (this.stepObjects.length - PathLength - 1))) - (this.stepObjects[x].stepW / 2),
				cy = (centerY + (radius-50) * Math.sin(2 * Math.PI * uu / (this.stepObjects.length - PathLength - 1))) - (this.stepObjects[x].stepH / 2);
			if(this.stepObjects[x].obj.isClear == "false"){
				this.stepObjects[x].obj.FadeOut(250, 0, 10);
			}
			this.stepObjects[x].obj.SineIn(cx, cy, 550);
			uu++;
		}
	}
	
	// Order Children Around Root
	for(var x = 0; x < path.length; x++){
		if(path[x] == rootid)
			continue;
		var lc = this.stepObjIndex.indexOf(path[x]);
		var cx = (centerX + radius * Math.cos(2 * Math.PI * x / PathLength)) - (this.stepObjects[lc].stepW / 2),
		    cy = (centerY + radius * Math.sin(2 * Math.PI * x / PathLength)) - (this.stepObjects[lc].stepH / 2);
		if(this.stepObjects[lc].obj.isClear == "true"){
			this.stepObjects[lc].obj.FadeIn(250, 0, 100);
		}
		this.stepObjects[lc].obj.SineIn(cx, cy, 550);
	}
};

Visualize.prototype.processPath = function(nodeList){
	for(x in nodeList){
		this.processNodeList(nodeList[x], 0);
	}
	for(x in nodeList){
		this.processPathLinks(nodeList[x]);
	}
};

Visualize.prototype.processNodeList = function(nodeList, level){
	var pnode = this.addStep(this.createStepNode(nodeList.id, nodeList.name), nodeList.id, level);
	for(x in nodeList.children){
		this.processLinkIdNodeList(nodeList.children[x], pnode, level+1);
	}
	pnode.data = nodeList.data;
	return pnode;
};

Visualize.prototype.processLinkIdNodeList = function(nodeId, parent, level){
	parent.addLinkId(nodeId);
};

Visualize.prototype.processPathLinks = function(nodeId){
	var currentPathNode = this.stepObjects[this.stepObjIndex.indexOf(nodeId.id)];
	for(x in currentPathNode.linkId){		
		currentPathNode.addLink(this.stepObjects[this.stepObjIndex.indexOf(currentPathNode.linkId[x])]);
	}
};

Visualize.prototype.createStepNode = function(nodeId, innerhtml){
	var newStepDiv = document.createElement('DIV');
	var centerX = (this.Width/2);
	var centerY = (this.Height/2);
	newStepDiv.style.position = "absolute";
	newStepDiv.style.width = "50px";
	newStepDiv.style.height = "50px";
	newStepDiv.style.border = "1px solid #AAA";
	newStepDiv.style.backgroundColor = "#FFF";
	newStepDiv.style.color = "#000";
	newStepDiv.id = nodeId;
	newStepDiv.innerHTML = innerhtml;	
	newStepDiv.style.left = centerX - (50 / 2) + 'px';
	newStepDiv.style.top = centerY - (50 / 2) + 'px';
	newStepDiv.style.zIndex = 10;
	newStepDiv.isClear = "false";
	this.ParentElement.appendChild(newStepDiv);
	return newStepDiv;
};

Visualize.prototype.createStepObj = function(element, level){
	var that = this;
	element.obj = {
		obj: element,
		myId: element.id,
		stepX: element.offsetLeft, 
		stepY: element.offsetTop, 
		stepW: element.offsetWidth, 
		stepH: element.offsetHeight, 
		link: [],
		linkId: [],
		data: [],
		nodeLevel: level,
		addLink: function(e1){
			this.link.push(e1);
		},
		addLinkId: function(e1){
			this.linkId.push(e1);
		},
		mommy: that
	};
	element.saveX = 150;
	element.saveY = 100;
	element.tempMx = 0;
	element.tempMy = 0;
	element.onclick = function(e){
		console.log(this.obj);
		this.obj.mommy.orderPartialPath(this.obj.myId);
		document.getElementById("details_id").innerHTML =  this.obj.myId;
		document.getElementById("details_name").innerHTML = this.obj.myId;
		return;
	};
	element.onmouseover = function(e){
		this.style.borderColor = "#F00";
	};
	element.onmouseout = function(e){
		this.style.borderColor = "#AAA";
	};
	element.SineIn = function(cx, cy, time, from, delay, func){
		var obj = this;
		var sx = obj.offsetLeft, sy = obj.offsetTop,
			dx = cx - sx, dy = cy - sy,
			hz = (Math.PI / (2 * time)),
			sTime = new Date().getTime();
		if(cx == sx && cy == sy){ return; }
		if(typeof obj.revertLeft == 'undefined' || typeof obj.revertTop == 'undefined'){ obj.revertLeft = sx; obj.revertTop = sy;}
		var startDelay = (!!delay ? delay : 10);
		if(!!from){dx = cx;  dy = cy; cx = sx+cx; cy = sy+cy;} // From Current Location
		var sin = function(){
			var dTime = new Date().getTime() - sTime;
			if(dTime < time){
				var f = Math.abs(Math.sin(dTime * hz)),
				    gx = Math.round(f * dx + sx),
					gy = Math.round(f * dy + sy);				
				obj.style.left = gx + "px";
				obj.style.top = gy + "px";
				obj.obj.stepX = gx;
				obj.obj.stepY = gy;
				timer = setTimeout(function(){sin();}, 10);
			}else{
				clearTimeout(timer);
				obj.style.left = cx + "px";
				obj.style.top = cy + "px";
				obj.obj.stepX = cx;
				obj.obj.stepY = cy;
				if(typeof func == "function"){ func(); }
			}
		}
		var timer = setTimeout(function(){ sTime = new Date().getTime(); sin();}, startDelay);
		return this;
	};	
	element.FadeOut = function(delay, startDel, finishOpac, startopacity, func){
		var obj = this;					
		var u = this.browser;			
		var hz = (Math.PI / (2 * delay)),
			sTime = new Date().getTime(),
			fnOpac = (typeof finishOpac == 'undefined' ? 0 : finishOpac),
			stOpac = (typeof startopacity == 'undefined' ? 100 : startopacity);
		obj.style.filter = "alpha(opacity=" + stOpac + ")";
		obj.style.opacity = (stOpac / 100);
		var startDelay = (typeof startDel == 'undefined' ? 10 : startDel);
		var fde = function(){
			var dTime = new Date().getTime() - (sTime+startDel);
			if(dTime < delay){
				var f = Math.abs(Math.cos(dTime * hz));
				var ttttt = Math.round(stOpac - Math.round(f * -stOpac + (stOpac)));				
				obj.style.filter = "alpha(opacity=" + ttttt + ")";
				obj.style.opacity = ttttt / 100;
				timer = setTimeout(function(){fde();}, 10);
			}else{
				clearTimeout(timer);
				obj.style.filter = "alpha(opacity=" + fnOpac + ")";
				obj.style.opacity = fnOpac/100;
				obj.isClear = "true";
				obj.style.zIndex = 5;
				if(typeof func == "function"){ func(); }
			}
		};
		var timer = setTimeout(function(){fde();}, startDelay);
		return this;
	};	
	element.SetClear = function(){
		this.style.filter = "alpha(opacity=0)";
		this.style.opacity = "0";
		this.isClear = "true";
		return this;
	};	
	element.FadeIn = function(delay, startDel, finalopacity, func){
		var obj = this;		
		var u = this.browser;
		obj.style.filter = "alpha(opacity=0)";
		obj.style.opacity = "0";
		var hz = (Math.PI / (2 * delay)),
			sTime = new Date().getTime(),
			finOpac = (typeof finalopacity == 'undefined' ? 100 : finalopacity);
		var startDelay = (typeof startDel == 'undefined' ? 10 : startDel);
		var fde = function(){
			var dTime = new Date().getTime() - (sTime+startDel);
			if(dTime < delay){
				var f = Math.abs(Math.cos(dTime * hz));
				var ttttt = ~~(f * -finOpac + (finOpac));
				obj.style.filter = "alpha(opacity=" + ttttt + ")";
				obj.style.opacity = ttttt / 100;
				timer = setTimeout(function(){fde();}, 10);
			}else{
				clearTimeout(timer);
				obj.style.filter = "alpha(opacity=" + finOpac + ")";
				obj.style.opacity = (finOpac/100); //"1.0";
				obj.isClear = "false";
				obj.style.zIndex = 400;
				if(typeof func == "function"){ func(); }				
			}
		};
		var timer = setTimeout(function(){fde();}, startDelay);
		return this;
	};
	
	return element.obj;
};


Visualize.prototype.extend = function(destination, source) {
  for (var property in source){
		try{
			if(typeof destination[property] == 'undefined'){
				destination[property] = source[property];
			}
		}catch(ex){
			// Do nothing
		}
  }
  return destination;
};