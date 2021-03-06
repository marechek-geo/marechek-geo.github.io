/**
 *  SVGPan library 1.2
 * ====================
 *
 * Given an unique existing element with id "genomap", including the
 * the library into any SVG adds the following capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dargging
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *	Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *	Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *	First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

var root = document.rootElement;

var state = 'none', stateTarget, stateOrigin, stateTf, stateStamp;
var zoomScale = 0.5;
var allowMove = false;

setupHandlers(root);

/**
 * Register handlers
 */
/*
  if (content.attachEvent) {
    content.attachEvent('onmousedown',svgOnMouseDown);
    //content.attachEvent('onmousewheel',svgZoom);
    content.attachEvent('onkeypress',svgZoom);
  } else {
    content.addEventListener('mousedown',svgOnMouseDown,false);
    //content.addEventListener('DOMMouseScroll',svgZoom,false);
    content.addEventListener('onkeypress',svgZoom,false);
  }
*/
function setupHandlers(root){
	setAttributes(root, {
		"onmouseup" : "add(evt)"
		,"onmousedown" : "handleMouseDown(evt)"
		,"onmousemove" : "handleMouseMove(evt)"
		,"onmouseup" : "handleMouseUp(evt)"
		//,"onkeypress" : "handleKeyPress(evt)"
		//,"onmouseout" : "handleMouseUp(evt)" // Decomment this to stop the pan functionality when dragging out of the SVG element
	});

	if(navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
		root.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
	else if (window.ActiveXObject && new ActiveXObject("Adobe.SVGCtl"))
         myparent.document.getElementById("svgpdf").onmousewheel= handleMouseWheel;
       else
		       root.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
}

/**
 * Configure the sensitivity of zooming
 */
function setZoomScale(value) {
	zoomScale = value;
}

/**
 * Configure whether individual elements can be moved
 */
function setAllowMove(value) {
	allowMove = value;
}

/**
 * Instance an SVGPoint object with given event coordinates.
 */
function getEventPoint(evt) {
	var p = root.createSVGPoint();

	p.x = evt.clientX;
	p.y = evt.clientY;

	return p;
}

/**
 * Sets the current transform matrix of an element.
 */
function setCTM(element, matrix) {
	var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

	element.setAttribute("transform", s);
}

/**
 * Dumps a matrix to a string (useful for debug).
 */
function dumpMatrix(matrix) {
	var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "\n  0, 0, 1 ]";

	return s;
}

/**
 * Sets attributes of an element.
 */
function setAttributes(element, attributes){
	for (i in attributes)
		element.setAttributeNS(null, i, attributes[i]);
}

/**
 * Handle mouse move event.
 */
function handleMouseWheel(evt) {
  if (!evt) var evt = window.event;
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var delta;

	if(evt.wheelDelta)
		delta = evt.wheelDelta / 360; // Chrome/Safari
	else
		delta = evt.detail / -9; // Mozilla

  var z = Math.pow(1 + zoomScale, delta);

	var g = svgDoc.getElementById("genomap");
	
	var p = getEventPoint(evt);

	p = p.matrixTransform(g.getCTM().inverse());

	// Compute new scale matrix in current mouse position
	var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

        setCTM(g, g.getCTM().multiply(k));

	stateTf = stateTf.multiply(k.inverse());
}

/**
 * Handle mouse move event.
 */
function handleMouseMove(evt) {
	if(evt.preventDefault)
		evt.preventDefault();
	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var g = svgDoc.getElementById("genomap");

	if(state == 'pan') {
		// Pan mode
		if (! evt.timeStamp || (evt.timeStamp - stateStamp > 50)) { //avoid unecessary redraw
      stateStamp = evt.timeStamp;
  		var p = getEventPoint(evt).matrixTransform(stateTf);
  		setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
		}
	} else if(state == 'move') {
		// Move mode
		var p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

		setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

		stateOrigin = p;
	}
}

/**
 * Handle click event.
 */
function handleMouseDown(evt) {
//	if(evt.preventDefault)
//		evt.preventDefault();

//	evt.returnValue = false;
	var svgDoc = evt.target.ownerDocument;

	var g = svgDoc.getElementById("genomap");

	if(evt.target.tagName == "svg" || !allowMove) {
		// Pan mode
		state = 'pan';

		stateTf = g.getCTM().inverse();

		stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
		
		stateStamp = 0;
	} else {
		// Move mode
		state = 'move';

		stateTarget = evt.target;

		stateTf = g.getCTM().inverse();

		stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
	}
}

/**
 * Handle mouse button release event.
 */
function handleMouseUp(evt) {
	if(evt.preventDefault)
		evt.preventDefault();
	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	if(state == 'pan' || state == 'move') {

		// Quit pan mode
		state = '';
	}
}

/**
 * Handle key press event.
 */
function handleKeyPress(evt) {
  if (evt.AltKey) {
     alert(evt.getCharCode());
  }
}
