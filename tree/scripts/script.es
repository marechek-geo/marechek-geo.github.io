//	Scripts used by the SVG graphics
//
//	HISTORY
//	23-Nov-2005	Ron Prior       	Created
//  12-Oct-2010 Ron Prior        Major changes to zoom & pan for Google Chrome and other webkit browsers
//	Aug 2006 	Ron Prior		Added 'tooltip' code with acknowledgements to
//						Doug Schepers at www.svg-whiz.com
//
var r, loop, genomap;
var myparent = window.parent||window.__parent__		// work-around for 'parent' being broken in ASV6

      var SVGDocument = null;
      var SVGRoot = null;
      var SVGViewBox = null;
      var svgns = 'http://www.w3.org/2000/svg';
      var xlinkns = 'http://www.w3.org/1999/xlink';
      var toolTip = null;
      var TrueCoords = null;
      var tipBox = null;
      var tipText = null;
      var tipTitle = null;
      var tipDesc = null;

      var lastElement = null;
      var titleText = '';
      var titleDesc = '';
      var tipping = false;
      var genopro = null;
	
  var map;
	var loaded = true;



function init(info)
{
  if (! myparent) alert('svg init: orphaned!');
  map = info;
	r = document.rootElement;
	if (r == null) {
		alert("Your SVG Viewer does not support scripting. Please consider upgrading it.");
		return;
	}
	 genomap=document.getElementById("genomap")

  toolTip = document.getElementById('ToolTip');
  tipBox =  document.getElementById('tipbox');
  tipText = document.getElementById('tipText');
  tipTemp = document.getElementById('tipTemp');
  genopro = document.getElementById('GenoPro');
  centermap(map.X, map.Y, map.Highlight);
  if (map.ZoomExtent) zoomextent(); 
	setAll();
}
function centermap(x,y,hlight)
{
	var w=getInnerWidth();
	var h=getInnerHeight();
	var matrix = genomap.getCTM();
	var matrix1 = matrix.translate(-x + w / 2,-y + h / 2);
	//alert('w='+w+',h='+h+'; x='+x+',y='+y+'; '+matrix.e+'/'+matrix1.e+''+matrix.f+'/'+matrix1.f);
	setCTM(genomap, matrix.translate(-x + w / 2,-y + h / 2));
	var hl=document.getElementById("highlight");
  if (hlight) {
  	hl.setAttribute("visibility","visible");
  	hl.setAttribute("cx", x);
  	hl.setAttribute("cy", y);
	} else {
	  hl.setAttribute("visibility","hidden");
	}
	
}
function displaylink(href,target)
{
	try {
		window.open(href,target);
	} catch(e) {
		browserEval('window.open("'+href+'",target="'+target+'")');
	}
}
function panmap(evt,x,y)
{
		pan(x,y,5);
}
function pan(x,y,speed)
{
	var matrix = genomap.getCTM();
  setCTM(genomap, matrix.translate(x/matrix.a,y/matrix.d));
}
function ZoomMap(factor) {
  var p=r.createSVGPoint();
  p.x = getInnerWidth()/2;
  p.y = getInnerHeight()/2;
 	p = p.matrixTransform(genomap.getCTM().inverse());
	var k = root.createSVGMatrix().translate(p.x, p.y).scale(factor).translate(-p.x, -p.y);
  setCTM(genomap, genomap.getCTM().multiply(k));
}
function ZoomIn() {
         ZoomMap(2)
}
function ZoomOut() {
         ZoomMap(0.5)
}

function ZoomPanReset()
{
	genomap.currentScale = 1;
	genomap.currentTranslate.x = initX;
	genomap.currentTranslate.y = initY;
	setAll();
}
function zoomextent()
{
	var s;
	w=getInnerWidth();
	h=getInnerHeight();
	wImg=map.Bounds[2]-map.Bounds[0];
	hImg=map.Bounds[3]-map.Bounds[1];
	if(w/wImg < h/hImg) {
		s = w / wImg;
	} else {
		s = h / hImg;
	}
	x=map.Bounds[0]+wImg/2;
	y=map.Bounds[1]+hImg/2;
	setCTM(genomap, genomap.getCTM().translate(-x*s + w/2, -y*s + h/2).scale(s)) ;
}
	
function setStatic(id, xoffset, yoffset)
{
// undo effects of any pan, zoom or resize on element specified in 'id'
	var e=document.getElementById(id);
//	var s = 1/r.currentScale;
//	e.setAttribute( "transform", "scale(" + s + "," + s + ")" );
	e.setAttribute( "x", -r.currentTranslate.x + xoffset );
	e.setAttribute( "y", -r.currentTranslate.y + yoffset );
}
function setAll()
{
//
// negate effects of pan, zoom or resize on panning arrows
//
	w=getInnerWidth();
	h=getInnerHeight();
	setStatic("controls", 10, 10)
	setStatic("GenoPro", 10, 40);
	if (r.currentTranslate.x==0 && r.currentTranslate.y==0 && r.currentScale == 1) {
		//centermap(map.X, map.Y, map.Highlight);
	}
}	
function getInnerHeight() {
	if (window.innerHeight) { return window.innerHeight; } // netscape behavior
	else if (document.body && document.body.offsetHeight) { return  document.body.offsetHeight; } // IE behavior
	else if (document.documentElement.offsetHeight) { return  document.documentElement.offsetHeight; } // IE behavior
	else { return null; }
}

function getInnerWidth() {
	if (window.innerWidth) { return window.innerWidth; } // netscape behavior
	else if (document.body && document.body.offsetWidth) { return  document.body.offsetWidth; } // IE behavior
	else if (document.documentElement.offsetWidth) { return  document.documentElement.offsetWidth; } // IE behavior
	else { return null; }
}

      
    // Following is from Holger Will since ASV3 and O9 do not support getScreenTCM()
    // See http://groups.yahoo.com/group/svg-developers/message/50789
    function getScreenCTM(doc){
        if(doc.getScreenCTM) { return doc.getScreenCTM(); }
        
        var root=doc
        var sCTM= root.createSVGMatrix()
 
        var tr= root.createSVGMatrix()
        var par=root.getAttribute("preserveAspectRatio")
        if (par==null || par=="") par="xMidYMid meet"//setting to default value
        parX=par.substring(0,4) //xMin;xMid;xMax
        parY=par.substring(4,8)//YMin;YMid;YMax;
        ma=par.split(" ")
        mos=ma[1] //meet;slice
 
        //get dimensions of the viewport
        sCTM.a= 1
        sCTM.d=1
        sCTM.e= 0
        sCTM.f=0
 
 
        w=root.getAttribute("width")
        if (w==null || w=="") w=innerWidth
 
        h=root.getAttribute("height")
        if (h==null || h=="") h=innerHeight
 
        // Jeff Schiller:  Modified to account for percentages - I'm not 
        // absolutely certain this is correct but it works for 100%/100%
        if(w.substr(w.length-1, 1) == "%") {
            w = (parseFloat(w.substr(0,w.length-1)) / 100.0) * innerWidth;
        }
        if(h.substr(h.length-1, 1) == "%") {
            h = (parseFloat(h.substr(0,h.length-1)) / 100.0) * innerHeight;
        }
 
        // get the ViewBox
        vba=root.getAttribute("viewBox")
        if(vba==null) vba="0 0 "+w+" "+h
        var vb=vba.split(" ")//get the viewBox into an array
 
        //--------------------------------------------------------------------------
        //create a matrix with current user transformation
        tr.a= root.currentScale
        tr.d=root.currentScale
        tr.e= root.currentTranslate.x
        tr.f=root.currentTranslate.y
 
 
        //scale factors
        sx=w/vb[2]
        sy=h/vb[3]
 
 
        //meetOrSlice
        if(mos=="slice"){
        s=(sx>sy ? sx:sy)
        }else{
        s=(sx<sy ? sx:sy)
        }
 
        //preserveAspectRatio="none"
        if (par=="none"){
            sCTM.a=sx//scaleX
            sCTM.d=sy//scaleY
            sCTM.e=- vb[0]*sx //translateX
            sCTM.f=- vb[0]*sy //translateY
            sCTM=tr.multiply(sCTM)//taking user transformations into acount
 
            return sCTM
        }
 
 
        sCTM.a=s //scaleX
        sCTM.d=s//scaleY
        //-------------------------------------------------------
        switch(parX){
        case "xMid":
        sCTM.e=((w-vb[2]*s)/2) - vb[0]*s //translateX
 
        break;
        case "xMin":
        sCTM.e=- vb[0]*s//translateX
        break;
        case "xMax":
        sCTM.e=(w-vb[2]*s)- vb[0]*s //translateX
        break;
        }
        //------------------------------------------------------------
        switch(parY){
        case "YMid":
        sCTM.f=(h-vb[3]*s)/2 - vb[1]*s //translateY
        break;
        case "YMin":
        sCTM.f=- vb[1]*s//translateY
        break;
        case "YMax":
        sCTM.f=(h-vb[3]*s) - vb[1]*s //translateY
        break;
        }
        sCTM=tr.multiply(sCTM)//taking user transformations into acount
 
        return sCTM
    }


      function HideTooltip( evt )
      {
         if (toolTip) toolTip.setAttributeNS(null, 'visibility', 'hidden');
         children = tipText.childNodes;
         for (var i=0; i<children.length; i++) {
             tipText.removeChild(children.item(i));
         }
         return ! tipText.hasChildNodes;
       };


      function ShowTooltip( evt )
      {
          // there is a problem with Firefox in that occaionally not all tspan elements are removed
          // this hack seems to fix it!
          	 var isEmpty = HideTooltip(evt);
          if ( ! isEmpty ) {
          	isEmpty = HideTooltip(evt);
          }
          if ( ! isEmpty ) {
          	isEmpty = HideTooltip(evt);
          }
          if ( ! isEmpty ) {
          	isEmpty = HideTooltip(evt);
          }
          var tipScale = 1/r.currentScale;

          tipBox.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );
          tipText.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );


          var titleValue = '';
          var descValue = '';

	        var box = new Object();
    	    box.maxWidth = getInnerWidth();
    	    box.textWidth = 0;
    	    box.lineHeight = 10;

         var targetElement = evt.target;
         if ( lastElement != targetElement )
         {
            var targetTitle = targetElement.getElementsByTagName('title').item(0);
            if ( ! targetTitle ) targetTitle = targetElement.parentNode.getElementsByTagName('title').item(0);

            if ( targetTitle )
            {
               // if there is a 'title' element, use its contents for the tooltip title
               if (targetTitle.hasChildNodes()) titleValue = targetTitle.firstChild.nodeValue;
            }

            var targetDesc = targetElement.getElementsByTagName('desc').item(0);
            if ( ! targetDesc) targetDesc = targetElement.parentNode.getElementsByTagName('desc').item(0);
            if ( targetDesc )
            {
               // if there is a 'desc' element, use its contents for the tooltip desc
               if (targetDesc.hasChildNodes()) descValue = targetDesc.firstChild.nodeValue;

               if ( '' == titleValue )
               {
                  // if there is no 'title' element, use the contents of the 'desc' element for the tooltip title instead
 //                 titleValue = descValue;
 //                 descValue = '';
               }
            }

            // if there is still no 'title' element, use the contents of the 'id' attribute for the tooltip title
            if ( '' == titleValue )
            {
//               titleValue = targetElement.getAttributeNS(null, 'id');
            }

            // selectively assign the tooltip title and desc the proper values,
            //   and hide those which don't have text values
            //

            if ( '' != titleValue ) AddTipText(tipText, titleValue, 'black', box);

            if ( '' != descValue ) AddTipText(tipText, descValue, 'blue', box);
         }

         // if there are tooltip contents to be displayed, adjust the size and position of the box
         if ( tipText.hasChildNodes )
         {
           var p=r.createSVGPoint();
           p.x = evt.clientX;
           p.y = evt.clientY;
 	         p = p.matrixTransform(r.getCTM().inverse());
           var xPos = p.x + (10 * tipScale);
           var yPos = p.y + (10 * tipScale);


            //return rectangle around text as SVGRect object
	          // but getBBox() seems to be broken with Adobe so...
	          box.Height = tipText.childNodes.length * box.lineHeight

          	if (box.Height > 0 && box.textWidth > 0 ) {   
          	    if ((evt.clientX + box.textWidth + 10 ) > getInnerWidth())  xPos = ((getInnerWidth()  - box.textWidth -10)  - r.currentTranslate.x) * tipScale;
          	    if ((evt.clientY + box.Height + 20 ) > getInnerHeight()) yPos = ((getInnerHeight() - box.Height - 10) - r.currentTranslate.y) * tipScale;
          
                      tipBox.setAttributeNS(null, 'width', Number(box.textWidth + 10));
                      tipBox.setAttributeNS(null, 'height', Number(box.Height + 5));
          
                      // update position
                      toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos + ',' + yPos + ')');
                      toolTip.setAttributeNS(null, 'visibility', 'visible');
          	}
         }
      };

function AddTipText(textNode, tip, col, tipbox)
{
	var tipLines = tip.split('\n'), tspanNode, newNode, childNode, len;
	for (var i=0; i<tipLines.length; i++) {
		newNode = document.createElementNS(svgns, 'tspan');
		tspanNode = textNode.appendChild(newNode);
		tspanNode.setAttributeNS(null, 'style', 'fill:'+col+';stroke:none;');
		tspanNode.setAttributeNS(null, 'x', '5');
		tspanNode.setAttributeNS(null, 'dy', Number(tipbox.lineHeight));
		childNode = document.createTextNode(tipLines[i] != ''?tipLines[i]:' ');
// Adobe's getComputedTextLength() returns total length of all tspan elements , so determine max length from each tspan
		newNode = tipTemp.appendChild(childNode);
		len = tipTemp.getComputedTextLength();
		childNode = tipTemp.removeChild(newNode);
		if (len > tipbox.textWidth ) tipbox.textWidth = len;
		newNode = tspanNode.appendChild(childNode);
	}
}
	