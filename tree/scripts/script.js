
//	Scripts used by the HTML pages to show and hide text and anmiate a picture slideshow.
//
//	HISTORY
//	19-Jun-2005	GenoPro			Created and written the PV_*() routines.
//	23-Jul-2005	Ron Prior       	Added the "Explorer Tree"
//	23-Nov-2005	Ron Prior       	Added the hide/show map functions
//	13-Nov-2006	Ron Prior		Added Google Maps API functions & showGoogleMap
//	22-Feb-2007	Ron Prior		Replace 'top' with 'mytop' so that report can be embedded (e.g. in an iframe)
//	07-Apr-2007	Ron Prior		MIT Simile Timeline functionality
//
	// set mytop to point to report 'top' in case loaded via iframe

	var mytop = null;
	if (self.frames.length>2) mytop = self;
	try{if (!mytop && parent.frames["heading"]) mytop = parent;}catch(e){}
	try{if (!mytop && parent.parent.frames["heading"]) mytop = parent.parent;}catch(e){}
	try{if (!mytop && parent.parent.parent.frames["heading"]) mytop = parent.parent.parent;}catch(e){}
	if (!mytop) mytop = self; //give up!svgframe

// Common HTML page initialisation code
function PageInit(title,tree, fCacheToggles) {
	var i = arguments.length;
	if (self == parent) document.getElementById('divFrameset').style.display='block';
	if (i > 1 && (tree)) explorerTreeRefresh(tree);
	if (i < 3 || fCacheToggles) InitToggleTree();

        if (self == parent || self == mytop) {
		// redirect to the home page with the current page in query string
		var beginWebFileName = location.pathname.lastIndexOf('/');
		var beginFileName = location.pathname.lastIndexOf('\\');
		var fileName; 
		if (beginFileName < beginWebFileName) {
			fileName = location.pathname.substring(beginWebFileName + 1);
		} else {
			fileName = location.pathname.substring(beginFileName + 1);
 		}	
		
		mytop.location = 'default.htm?page=' + fileName;
	}
	showLastModified();
	if (i > 0) mytop.document.title = title;
}

//	Core routine for the Picture Viewer (PV) to animate the slideshow.
function PV_PickCore(id, nDirection)
	{
	var oPicker = document.getElementById("idPVs_" + id);
	var cPictures = oPicker.options.length;	
	var iSelected = (oPicker.selectedIndex + cPictures + nDirection) % cPictures; 
	var strValue = oPicker.options[iSelected].value;
	var ich = strValue.indexOf('\x1f');
	document.getElementById("idPVp_" + id).innerHTML = strValue.substring(0, ich);
	var strValue = strValue.substring(ich + 1, strValue.length);
	var ich = strValue.indexOf('\x1f');
	var oName = document.getElementById("idPVn_" + id);
 	if (oName) oName.innerHTML = (ich == -1)?strValue:strValue.substring(0, ich);
	if (ich > -1 ) {
		var strValue = strValue.substring(ich + 1, strValue.length);
		var ich = strValue.indexOf('\x1f');
		document.getElementById("idPVc_" + id).innerHTML = strValue.substring(0, ich);
		var strValue = strValue.substring(ich + 1, strValue.length);
		var ich = strValue.indexOf('\x1f');
		var strDescription = strValue.substring(ich + 1, strValue.length);

		var oVisibility = document.getElementById("idPVv_" + id);
		if (oVisibility) {
			if (strDescription) {
				elementRemoveClass(oVisibility, "hide");
				elementAddClass(oVisibility, "show");
			} else {
				elementRemoveClass(oVisibility, "show");
				elementAddClass(oVisibility, "hide");
			}
		}
		var oDescription = document.getElementById("idPVd_" + id);
		if (oDescription) oDescription.innerHTML = strDescription;
	}
	oPicker.selectedIndex = iSelected;
	} // PV_PickCore()

function PV_Info(id)
	{
	PV_PickCore(id, 0);
	}
function PV_Next(id)
	{
	PV_PickCore(id, +1);
	}
function PV_Prev(id)
	{
	PV_PickCore(id, -1);
	}

var g_idTimer;	// Global variable to store the id of the timer, so we can stop it later

function PV_Pause(id)
	{
	// The id is not used, but passed for code orthogonality
	if (g_idTimer != null)
		clearTimeout(g_idTimer);
	g_idTimer = null;
	}
 // Start the picture slideshow to display a new picture every 3 second
function PV_Play(id)
	{
	PV_Pause(id);
	PV_Next(id);
	// get picture interval from associated speed slider
	var nInterval=getSliderVal(document.getElementById("idPVslider_" + id));
	g_idTimer = setTimeout("PV_Play('" + id + "');", nInterval);
	}


// Set the text of the status bar
function ss(s){window.status=s;return true;}

// Clear the text of the status bar
function cs(){window.status='';}

/*

Explorer Tree 1.6
=================
by Andrew Gregory
http://www.scss.com.au/family/andrew/webdesign/explorertree/

This work is licensed under the Creative Commons Attribution License. To view a
copy of this license, visit http://creativecommons.org/licenses/by/1.0/ or send
a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
USA.

IMPORTANT NOTE:
Variables and functions with names starting with an underscore (_) are
'internal' and not to be used.

*/

// var explorerTreeAutoCollapse = {'names':true};
var explorerTreeAutoCollapse = {'names':false};
var explorerTreeBulletWidth = {'default':10};


// Expand all explorer trees
function explorerTreeExpandAll(group) {
  var li, c, lis = getElementsByClass('li','xT' + group + '-c');
  c = lis.length
  for (var lii = 0; lii < c; lii++) {
    li = lis[lii];
    if (li.nodeName.toLowerCase() == 'li') _explorerTreeOpen(li, group);
  }
}

// Collapse all explorer trees
function explorerTreeCollapseAll(group) {
  var li, lis = getElementsByClass('li','xT' + group + '-o');
  for (var lii = 0; lii < lis.length; lii++) {
    li = lis[lii];
    if (li.nodeName.toLowerCase() == 'li') _explorerTreeClose(li, group);
  }
}

// Refresh the specified explorer tree
function explorerTreeRefresh(id) {
  var obj= document.getElementById(id);
  if (obj) _explorerTreeInitUL(obj);
}

// Get the root element (<ul>) of the tree the given element is part of.
function _explorerTreeGetRoot(element) {
  for (var e = element; e != null; e = e.parentNode) {
    if (e.nodeName.toLowerCase() == 'ul' && elementHasClass(e, 'xT')) {
      break;
    }
  }
  return e;
}

// Get the ID of the tree the given element is part of. Returns the ID or
// 'default' if there is no ID.
function _explorerTreeGetId(element) {
  var e = _explorerTreeGetRoot(element);
  var id = e ? e.getAttribute('id') : '';
  return (!id || id == '') ? 'default' : id;
}

// Initialise the given list
function _explorerTreeInitUL(ul) {
  if (window.IE7) return;
  if (navigator.userAgent.indexOf('Gecko') != -1) {
    addEvent(ul, 'mousedown', _explorerTreeStopGeckoSelect, false);
  }
  if (!ul.childNodes || ul.childNodes.length == 0) return;
//  this function split and following line commented out in GenoPro.com code as all initialisation is preset to improve performance
//  _explorerTreeInit2(ul);
}
function _explorerTreeInit2(ul) {
  // Iterate LIs
  for (var itemi = 0; itemi < ul.childNodes.length; itemi++) {
    var item = ul.childNodes[itemi];
    if (item.nodeName.toLowerCase() == 'li') {
      addEvent(item, 'click', xTclk, false);
      // Iterate things in this LI
      var hassubul = false;
      for (var subitemi = 0; subitemi < item.childNodes.length; subitemi++) {
        var subitem = item.childNodes[subitemi];
        if (subitem.nodeName.toLowerCase() == 'a') {
          addEvent(subitem, 'click', xTclk, false);
        }
        if (subitem.nodeName.toLowerCase() == 'ul') {
          hassubul = true; 
          _explorerTreeInitUL(subitem);
        }
      }
      if (hassubul) {
        // item is expandable, but don't change it if it's already been set to
        // something else
        if (!elementHasClass(item, 'xT-o') &&
            !elementHasClass(item, 'xT-b')) {
          elementAddClass(item, 'xT-c');
        }
      } else {
        // item has no sub-lists, make sure it's non-expandable
        elementRemoveClass(item, 'xT-o');
        elementRemoveClass(item, 'xT-c');
        elementAddClass(item, 'xT-b');
      }
    }
  }
}

// Gecko selects text when bullets are clicked on - stop it!
function _explorerTreeStopGeckoSelect(evt) {
  if (!evt) var evt = window.event;
  if (evt.preventDefault) {
    evt.preventDefault();
  }
  return true;
}

// Handle clicking on LI and A elements in the tree.
function xTclk(evt, group) {
  var element = (evt.target) ? evt.target : evt.srcElement;
  // make li text within <span> element clickable.
  if (elementHasClass(element,"xT-i")) element = element.parentNode;

  if (element.nodeName.toLowerCase() == 'li') {
    // toggle open/closed state, if possible
    if (elementHasClass(element, 'xT'+group+'-o')) {
      elementRemoveClass(element, 'xT'+group+'-o');
      elementAddClass(element, 'xT'+group+'-c');
      if (elementHasClass(element, 'XT-clr')) {
	elementRemoveClass(element, 'clear');
	elementAddClass(element, 'clearleft');
      }
    } else if (elementHasClass(element, 'xT'+group+'-c')) {
      elementRemoveClass(element, 'xT'+group+'-c');
      elementAddClass(element, 'xT'+group+'-o');
      if (elementHasClass(element, 'XT-clr')) {
	elementRemoveClass(element, 'clearleft');
	elementAddClass(element, 'clear');
      }
    } else {
      return true;
    }
    if (explorerTreeAutoCollapse[_explorerTreeGetId(element)]) {
      _explorerTreeCollapseAllButElement(element);
    }

  } else if (element.nodeName.toLowerCase() == 'a') {
    // let hyperlinks work as expected
    // TO DO: target support untested!!!
    var href = element.getAttribute('href');
    if (href) {
      var target = element.getAttribute('target');
      if (!target) {
        var bases = document.getElementsByTagName('base');
        for (var i=0; i<bases.length;i++) {
          target=bases[i].getAttribute('target');
        }
       }
       if (!target) target='_self';
      switch (target) {
        case '_blank':
          window.open(href);
          break;
        case '_self':
          window.location.href = href;
          break;
        case '_parent':
          window.parent.location.href = href;
          break;
        case '_top':
          window.mytop.location.href = href;
          break;
        default:
          window.open(href, target);
          break;
      }
    }
  } else {
    return true;
  }
  // we handled the event - stop any default actions
  evt.returnValue = false;
  if (evt.preventDefault) {
    evt.preventDefault();
  }
  evt.cancelBubble = true;
  if (evt.stopPropagation) {
    evt.stopPropagation();
  }
  return false;
}

// User interface to open the specified tree branch
function explorerTreeOpen(id, group) {
	_explorerTreeOpen(document.getElementById(id), group);
	}

// Open the specified tree branch
function _explorerTreeOpen(li, group) {
  if (!elementHasClass(li, 'xT-b')) {
    elementRemoveClass(li, 'xT'+group+'-c');
    elementAddClass(li, 'xT'+group+'-o');
    if (elementHasClass(li, 'XT-clr')) {
	elementRemoveClass(li, 'clearleft');
	elementAddClass(li, 'clear');
    }
  }
}

// Close the specified tree branch
function _explorerTreeClose(li, group) {
  if (!elementHasClass(li, 'xT-b')) {
    elementRemoveClass(li, 'xT'+group+'-o');
    elementAddClass(li, 'xT'+group+'-c');
    if (elementHasClass(li, 'XT-clr')) {
	elementRemoveClass(li, 'clear');
	elementAddClass(li, 'clearleft');
    }
  }
}

// Collapse the specified tree
function explorerTreeCollapse(id) {
  _explorerTreeSetState(document.getElementById(id), true, null);
}

// Fully expand the specified tree
function explorerTreeExpand(id) {
  if (!explorerTreeAutoCollapse[id]) {
    _explorerTreeSetState(document.getElementById(id), false, null);
  }
}

// Collapse all the branches of tree except for those leading to the specified
// element. 
function _explorerTreeCollapseAllButElement(e, group) {
  var excluded = new Array();
  var tree = null;
  for (var element = e; element != null; element = element.parentNode) {
    if (element.nodeName.toLowerCase() == 'li') {
      excluded[excluded.length] = element;
    }
    if (element.nodeName.toLowerCase() == 'ul' && elementHasClass(element, 'xT')) {
      tree = element;
      break;
    }
  }
  if (tree) {
    _explorerTreeSetState(tree, true, excluded, group);
  }
}

// Set the open/closed state of all the LIs under the tree.
// The excludedElements parameter is used to implement the auto-collapse feature
// that automatically collapses tree branches other than the one actively being
// opened by the user.
function _explorerTreeSetState(ul, collapse, excludedElements, group) {
  if (window.IE7) return;
  if (!ul.childNodes || ul.childNodes.length == 0) return;
  // Iterate LIs
  for (var itemi = 0; itemi < ul.childNodes.length; itemi++) {
    var item = ul.childNodes[itemi];
    if (item.nodeName.toLowerCase() == 'li') {
      var excluded = false;
      if (excludedElements) {
        for (var exi = 0; exi < excludedElements.length; exi++) {
          if (item == excludedElements[exi]) {
            excluded = true;
            break;
          }
        }
      }
      if (!excluded) {
        if (collapse) {
          _explorerTreeClose(item, group);
        } else {
          _explorerTreeOpen(item, group);
        }
      }
      for (var subitemi = 0; subitemi < item.childNodes.length; subitemi++) {
        var subitem = item.childNodes[subitemi];
        if (subitem.nodeName.toLowerCase() == 'ul') {
          _explorerTreeSetState(subitem, collapse, excludedElements, group);
        }
      }
    }
  }
}

// Open the tree out so the list item with the link with the specified href or name is
// visible. Optionally scrolls so the item is visible. Optionally opens the
// found branch. Returns the LI that contains the specified HREF, or null if
// unsuccessful.
function explorerTreeOpenTo(win, id, href, scroll, expand, group) {
//  var li = _explorerTreeSearch(win.document.getElementById(id), _explorerTreeNormalizeHref(href));
  var li = _explorerTreeSearch(win.document.getElementById(id), href);
  if (li) {
    if (!win.IE7) {
      if (explorerTreeAutoCollapse[id]) {
        _explorerTreeCollapseAllButElement(li, group);
      }
      if (expand) {
// replaced following line with the for loop below it (Ron Jul 2006)
//       _explorerTreeOpen(li, group);
        for (var element = li; element != null; element = element.parentNode) {
          if (element.nodeName.toLowerCase() == 'li') {
            _explorerTreeOpen(element, group);
          }
          if (element.nodeName.toLowerCase() == 'ul' && elementHasClass(element, 'xT')) {
            break;
          }
        }
      }
    }
    if (scroll) {
      // get height of window we're in
      var h;
      if (win.innerHeight) {
        // Netscape, Mozilla, Opera
        h = win.innerHeight;
      } else if (win.document.documentElement && win.document.documentElement.clientHeight) {
        // IE6 in 'standards' mode
        h = win.document.documentElement.clientHeight;
      } else if (win.document.body && win.document.body.clientHeight) {
        // other IEs
        h = win.document.body.clientHeight;
      } else {
        h = 0;
      }
      // scroll so the list item is centered on the window
      win.scroll(0, li.offsetTop - h / 2);
    }
  }
  return li;
}

// Search the list (and sub-lists) for the given href. Returns the LI object if
// found, otherwise returns null.
function _explorerTreeSearch(ul, href) {
  if (!ul.childNodes || ul.childNodes.length == 0) return null;
  // Iterate LIs
  for (var itemi = 0; itemi < ul.childNodes.length; itemi++) {
    var item = ul.childNodes[itemi];
    if (item.nodeName.toLowerCase() == 'li') {
      for (var subitemi=0; subitemi < item.childNodes.length; subitemi++) {
        var subitem = item.childNodes[subitemi];
        if (subitem.nodeName.toLowerCase() == 'a') {
//         if (_explorerTreeNormalizeHref(subitem.getAttribute('href')) == href) {
          if (subitem.getAttribute('href') == href || subitem.getAttribute('name') == href) {
            return item;
          }
        }
        if (subitem.nodeName.toLowerCase() == 'ul') {
          var found = _explorerTreeSearch(subitem, href);
          if (found) {
            _explorerTreeOpen(item);
            return found;
          }
        }
      }
    }
  }
  return null;
}

// When Opera performs HTMLElement.getAttribute('href'), it *doesn't* actually
// return the raw HREF like it's supposed to. It 'normalizes' it, adding in any
// missing protocol, host name/port, and converts relative HREFs (eg
// '../../index.html') into absolute HREFs (eg '/index.html'). It does exactly
// the same thing in CSS generated content for the attr(href) function. If all
// browsers did that it would make URL comparisons trivial. Unfortunately, other
// browsers don't, and they're probably doing the right thing too by returning
// the href as it appears in the HTML.
// What this function does is normalize HREFs so we can do a meaningful
// comparison in *all* browsers.
function _explorerTreeNormalizeHref(href) {
  var i, h = href, l = window.location;
  // immediately return explicit protocols
  if (href.substring(0, 7) == 'telnet:') return href;
  if (href.substring(0, 7) == 'mailto:') return href;
  if (href.substring(0, 7) == 'gopher:') return href;
  if (href.substring(0, 5) == 'http:'  ) return href;
  if (href.substring(0, 5) == 'news:'  ) return href;
  if (href.substring(0, 5) == 'rtsp:'  ) return href;
  
  // handle absolute references
  if (h.charAt(0) == '/') {
    return l.protocol + '//' + l.host + h;
  }
  
  // strip off the filename (if any) of the location to leave the folder we're in
  l = l.toString();
  i = l.lastIndexOf('/');
  if (i != -1) {
    l = l.substring(0, i + 1);
  }
  
  // handle any relative directory references, i.e. '../'
  while (h.substring(0, 3) == '../') {
    h = h.substring(3);
    i = l.lastIndexOf('/', l.length - 2);
    if (i != -1) {
      l = l.substring(0, i + 1);
    }
  }
  return l + h;
}

/*
CSS Utilities
by Andrew Gregory
http://www.scss.com.au/family/andrew/

I have placed this code in the public domain. Feel free to use it however you
wish.

v1.4 26-Aug-2004 [GenoPro.com] Speed improvements.  The function getElementsByClass() takes more than 2 minutes on a 3.0 GHz machine with 10,000 nodes.
v1.3  6-Oct-2004 Added el.className checks
v1.2  5-Aug-2004 Simplified code by using regular expressions.
v1.1 12-Apr-2004 Fixed bug in elementRemoveClass() which removed partially matching classnames.
v1.0 29-Mar-2004 Initial version. Allows non-destructive setting and removal of CSS class names.
*/
// Test if an element has the given CSS class
function elementHasClass(el,cl){return (el.className&&el.className.search(new RegExp('\\b'+cl+'\\b'))>-1);}
// Ensure an element has the given CSS class
function elementAddClass(el,cl){var c=el.className;if(!c)c='';if(!elementHasClass(el,cl))c+=((c.length>0)?' ':'')+cl;el.className=c;}
// Ensure an element no longer has the given CSS class 
function elementRemoveClass(el,cl){if(el.className)el.className=el.className.replace(new RegExp('\\s*\\b'+cl+'\\b\\s*'),' ').replace(/^\s*/,'').replace(/\s*$/,'');}

function getElementsByClass(elem, classname)
	{
	var classes, rx, alltags, ctags, i, tag, classlist
	classes = new Array();
	rx = new RegExp('\\b' + classname + '\\b')
	alltags = document.getElementsByTagName(elem);
	cTags = alltags.length
	for (i=0; i<cTags; i++)
		{
		tag=alltags[i]
		if (tag.nodeName.toLowerCase() == elem)
			{
			if (tag.className)
				{
				if (tag.className.search(rx) >= 0)
					classes[classes.length] = tag;
				}
			}
		}
	return classes;
	}

// Cross-browser event handling
// by Scott Andrew LePera
// http://www.scottandrew.com/weblog/articles/cbs-events

// Modified 2004-08-10 by Andrew Grgeory to work around Konqueror bug
// Modified 2004-06-04 by Andrew Gregory to support legacy (NS3,4) browsers
// http://www.scss.com.au/family/andrew/

// eg. addEvent(imgObj, 'mousedown', processEvent, false);
function addEvent(obj, evType, fn, useCapture) {
  // work around Konqueror bug #57913 which prevents
  // window.addEventListener('load',...) from working
  var ua = navigator.userAgent;
  var konq = ua.indexOf('KHTML') != -1 && ua.indexOf('Safari') == -1 && obj == window && evType == 'load';
  // don't use addEventListener for Konq, have Konq fall back to the old
  // obj.onload method
  if (obj.addEventListener && !konq) {
    obj.addEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.attachEvent) {
    return obj.attachEvent('on' + evType, fn);
  } else {
    if (!obj.cb_events) {
      obj.cb_events = new Object();
      obj.cb_ftemp = null;
    }
    var events = obj.cb_events[evType];
    if (!events) {
      events = new Array();
      obj.cb_events[evType] = events;
    }
    var i = 0;
    while ((i < events.length) && (events[i] != fn)) {
      i++;
    }
    if (i == events.length) {
      events[i] = fn;
      obj['on' + evType] = new Function("var ret=false,e=this.cb_events['"+evType+"'];if(e){for(var i=0;i<e.length;i++){this.cb_ftemp=e[i];ret=this.cb_ftemp()||ret;}return ret;}");
    }
    return true;
  }
}

// eg. removeEvent(imgObj, 'mousedown', processEvent, false);
function removeEvent(obj, evType, fn, useCapture) {
  // work around Konqueror bug #57913 which prevents
  // window.addEventListener('load',...) from working
  var ua = navigator.userAgent;
  var konq = ua.indexOf('KHTML') != -1 && ua.indexOf('Safari') == -1 && obj == window && evType == 'load';
  // don't use addEventListener for Konq, have Konq fall back to the old
  // obj.onload method
  if (obj.removeEventListener && !konq) {
    obj.removeEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.detachEvent) {
    return obj.detachEvent('on' + evType, fn);
  } else {
    var ret = false;
    if (obj.cb_events) {
      var events = obj.cb_events[evType];
      if (events) {
        // remove any matching functions from the events array, shuffling items
        // down to fill in the space before truncating the array
        var dest = 0;
        for (var src = 0; src < events.length; src++) {
          if (dest != src) {
            events[dest] = events[src];
          }
          if (events[dest] == fn) {
            ret = true;
          } else {
            dest++;
          }
        }
        events.length = dest;
      }
    }
    return ret;
  }
}

// AutoSize - launch auto-sized, centred window
// Sources --
// http://www.therotunda.net/code/autosized-popup-window.html
// most code taken from above, with addition of code to fit on screen if image larger than window

// http://javascript.internet.com/page-details/auto-resizable-pop-up.html
// ~~~ AND ~~~
// open SCREEN-CENTERED window .. kudos to Doc JavaScript
// www.webreference.com/js
// however, his version called for image height and width as args...


function viewPic(img)
{ picfile=new Image(); picfile.src=(img); fileCheck(img); }

function fileCheck(img)
{ if((picfile.width!=0)&&(picfile.height!=0))
	{ makeWindow(img); }
	else {
		funzione="fileCheck('"+img+"')"; intervallo=setTimeout(funzione,10); }}

function makeWindow(img)
{ ht=picfile.height; wd=picfile.width; 
	if (window.screen) 
	{ var avht=screen.availHeight - 40; var avwd=screen.availWidth - 40;
                if (ht > avht) {
			wd=wd*avht/ht
                        ht=avht
		}
		if (wd > avwd) {
			ht=ht*avwd/wd
			wd=avwd
		}
		var xcen=(avwd-wd)/2; var ycen=(avht-ht)/2;
		var args="height="+(ht+40)+",innerHeight="+ht;
		args+=",width="+(wd+40) +",innerWidth="+wd;
		args+=",left="+xcen+",screenX="+xcen;
		args+=",top="+ycen+",screenY="+ycen+",resizable=1,scrollbars=1"; }
		return window.open(img, '', args); 
}


function CenterMap(x,y,hlight)
{
document.cookie='CenterMap='+x+','+y+','+hlight
}

function showPopUpFrame(percent,svg) {
 if (parent != self) { // ignore if not in a frameset
	if (!svg && mytop.popupToggleState != mytop.popupMaxButton.src) {
		mytop.document.getElementById('lower').cols = mytop.saveLower;
		mytop.document.getElementById('rhs').rows = mytop.saveRhs;
		mytop.popupToggleState = mytop.popupMaxButton.src;
	}
	var pc=percent;
	if(mytop.document.getElementById('rhs').rows=="*,0" || pc != "")      // don't change if already changed by user
	{	if(pc=='') pc='65%';
		mytop.document.getElementById('rhs').rows="*,"+pc;
	}
 }
}
function hidePopUpFrame(e, newpage) {
	mytop.document.getElementById('rhs').rows="*,0";
	if (mytop.popupToggleState != mytop.popupMaxButton.src) {
		mytop.document.getElementById('lower').cols = mytop.saveLower;
		mytop.popupToggleState = mytop.popupMaxButton.src;
	}
	mytop.gnoParam.popupTitle='';
	mytop.gnoParam.popupHTML='';
	mytop.frames["popup"].location = (newpage)?newpage:'popup.htm'
}
function hideGenoMapFrame(e) {
	if (!e && window.event) e=window.event;
	if (!e) return false;

	var button;
	if (e.target) button=e.target;
	if (e.srcElement) button=e.srcElement;
	button = button.previousSibling.previousSibling;
	if (button.src != mytop.popupMaxButton.src) {
		mytop.document.getElementById('lower').cols = mytop.saveLower;
		mytop.document.getElementById('rhs').rows = mytop.saveRhs;
		mytop.popupToggleState = mytop.popupMaxButton.src;
		button.src = mytop.popupToggleState;
	}
	hidePopUpFrame(e, '../popup.htm')
}

function tocHide() {
  		mytop.saveLower = mytop.document.getElementById('lower').cols;
		  mytop.document.getElementById('lower').cols = mytop.minLower;
}

function tocShow() {
		mytop.document.getElementById('lower').cols = mytop.saveLower;
}

function tocExit() {
         if (mytop.tocStateToggle.src == mytop.tocStateClose.src) tocHide();
         hidePopUpFrame();
}
function tocSetToggle() {
         var toggle = document.images["tocStateButton"];
         toggle.src = mytop.tocStateToggle.src;
         toggle.alt = mytop.tocStateToggle.alt;
         toggle.title = mytop.tocStateToggle.title;
}

function tocToggle() {
         mytop.tocStateToggle = (mytop.tocStateToggle.src == mytop.tocStateClose.src ? mytop.tocStateOpen : mytop.tocStateClose);
         tocSetToggle();
}

function initPopupToggle(button) {
	document.images[button].src = mytop.popupToggleState;
}

function togglePopUpFrame(button)
{
	if (mytop.popupToggleState == mytop.popupMaxButton.src) {

		mytop.saveLower = mytop.document.getElementById('lower').cols;
		mytop.saveRhs = mytop.document.getElementById('rhs').rows;
		mytop.document.getElementById('lower').cols = "0,*";
		mytop.document.getElementById('rhs').rows = "0,*";
		mytop.popupToggleState = mytop.popupResButton.src;
		document.images[button].src= mytop.popupToggleState;
	}
	else {
		mytop.document.getElementById('lower').cols = mytop.saveLower;
		mytop.document.getElementById('rhs').rows = mytop.saveRhs;
		mytop.popupToggleState = mytop.popupMaxButton.src;
		document.images[button].src= mytop.popupToggleState;
	}
}

function savePopupContent(div, subtitle) {
	mytop.gnoParam.popupHTML = document.getElementById(div).innerHTML;
	mytop.gnoParam.popupTitle = subtitle;
}

function loadPopupContent(div, subtitle) {
	document.getElementById(div).innerHTML = mytop.gnoParam.popupHTML;
	document.getElementById(subtitle).innerHTML = mytop.gnoParam.popupTitle;
}

function displayPopup() {
	mytop.frames['popup'].location='popup.htm';
	//mytop.frames['popup'].location.reload();
}

function getArgs(  ) {
    var args = new Object(  );
    var query = window.location.search.substring(1);     
      // Get query string
    var pairs = query.split(",");
     // Break at comma
    for(var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');
          // Look for "name=value"
        if (pos == -1) continue;
          // If not found, skip
        var argname = pairs[i].substring(0,pos);
          // Extract the name
        var value = pairs[i].substring(pos+1);
          // Extract the value
        args[argname] = decodeURI(value);
         // Store as a property
    }
    return args;     // Return the object
}

function ContactAuthor()
	{
	// Find which page the user is viewing.
	// This information may be useful to the author if contacted to correct an error. 
	if (parent != null && parent.detail != null)
		{
		window.open("http://familytrees.genopro.com/Contact-Author.aspx?url=" + parent.detail.location);
		return false;	// Stop further processing
		}
	return true;
	}

var flip = new Image(16, 16)
var flop = new Image(16, 16)
var flip2 = new Image(16, 16)
var flop2 = new Image(16, 16)

function InitToggleTree() {
	flip.src = 'images/collapse.jpg'
	flop.src = 'images/expand.jpg'
	flip2.src = 'images/collapse2.jpg'
	flop2.src = 'images/expand2.jpg'
}

function ToggleTree(img,group) {
	switch (group) {
	case '' : 
		if (document.images[img].src == flop.src) {
			explorerTreeExpandAll("");
			document.images[img].src = flip.src;
		} 
		else {
			explorerTreeCollapseAll("");
			document.images[img].src = flop.src;
		}
		break;
	case '2' : 
		if (document.images[img].src == flop2.src) {
			explorerTreeExpandAll("2");
			document.images[img].src = flip2.src;
		}
		else {
			explorerTreeCollapseAll("2");
			document.images[img].src = flop2.src;
		}
		break;
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
Slider control is partially based on http://www.arantius.com/article/lightweight+javascript+slider+control
so below is the associated copyright notice:-

Originally from:
  http://www.arantius.com/article/lightweight+javascript+slider+control

Copyright (c) 2006 Anthony Lieuallen, http://www.arantius.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var sliderKnob;
var sliderMax = 10000;
var sliderMin = 1000;
var sliderActive = false;

function drawSliderByVal(slider, val) {
	var p=(val-sliderMin)/(sliderMax-sliderMin);
	var x=-slider.width+(slider.width-sliderKnob.width)*p;
	sliderKnob.style.left=x + "px";
	var v=(Math.round((sliderMax+sliderMin-val)/100)/10)+'';
	sliderKnob.title=v;
	sliderKnob.alt=v;
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function setSliderByClientX(slider, clientX) {
	var p=(clientX-slider.offsetLeft-(sliderKnob.width/2))/(slider.width-sliderKnob.width);
	var v=(sliderMax-sliderMin)*p + sliderMin;
	if (v>sliderMax) v=sliderMax;
	if (v<sliderMin) v=sliderMin;
	drawSliderByVal(slider, v);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function getSliderVal(slider) {
	sliderKnob = slider.nextSibling;
	var p=(sliderKnob.offsetLeft-slider.offsetLeft-(sliderKnob.width)/2)/(slider.width-sliderKnob.width);
	return sliderMax-(sliderMax-sliderMin)*p;
}	
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderClick(e) {
	var el=sliderFromEvent(e);
	if (!el) return;
	setSliderByClientX(el, e.clientX);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderMouseMove(e) {
	var el=sliderFromEvent(e);
	if (!el) return;
	if (!sliderActive) return;
	setSliderByClientX(el, e.clientX);
	stopEvent(e);
}
function sliderMouseDown(e) {
//	sliderClick(e);
	sliderActive = true;
	var el=sliderFromEvent(e);
	if (!el) return;
	stopEvent(e);
}
function sliderMouseUpOut(e) {
	sliderActive=false;
	stopEvent(e);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderFromEvent(e) {
	if (!e && window.event) e=window.event;
	if (!e) return false;

	var slider;
	if (e.target) slider=e.target;
	if (e.srcElement) slider=e.srcElement;

	sliderKnob = slider;
	slider = slider.previousSibling;
	return slider;
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
//borrowed from prototype: http://prototype.conio.net/
function stopEvent(event) {
	if (event.preventDefault) {
		event.preventDefault();
		event.stopPropagation();
	} else {
		event.returnValue=false;
		event.cancelBubble=true;
	}
}
/*----------------------------------------------------------------------------*/
//
// Google Maps 
//
    // Some of the following script is based on code provided by the
    // Blackpool Community Church Javascript Team
    // on their excellent Google Maps API tutorial at  
    // http://www.econym.demon.co.uk/googlemaps/

var mapZoom, mapPlace, mapObj, geocoder;

function exitGoogleMap() {
	if(mapObj) mapObj = null;
	if (!gMap.inline) window.back();
}
function initGoogleMap() {
	var el=document.getElementById('GoogleMap');
	var ht=document.body.parentNode.clientHeight;
	if (!ht) ht=document.clientHeight;
	if ((ht-70)>0) el.style.height = (ht - 70) + 'px';
}
function addMarker(point, tooltip, html) {
		var marker = new google.maps.Marker({
      position: point,
      map: mapObj,
      title: tooltip
    });

   if (html) {
      var infowindow = new google.maps.InfoWindow({
          content: html
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(mapObj,marker);
      });
    }
        return marker;
}

function showGoogleMap(param) {
  if (param) {
    gMap.lat = getCoord(param.lat);
    gMap.lng = getCoord(param.lng);
    gMap.type = gMap.types[param.type];
    gMap.zoom = parseInt(param.zoom);
    gMap.place = param.place;
    if (param.inline) {
      gMap.inline = param.inline;
    } else {
      document.getElementById('subtitle').innerHTML = gMap.place;
    }
  }
  if (gMap.lat && gMap.lng ) {
    var gMapCenter = new google.maps.LatLng(gMap.lat, gMap.lng);
    var gMapOptions = {
      zoom:         gMap.zoom,
      center:       gMapCenter,
      mapTypeId:    gMap.type,
      navigationControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {style:google.maps.MapTypeControlStyle.DROPDOWN_MENU}
    };
    var gMapObj = new google.maps.Map(document.getElementById("GoogleMap"), gMapOptions);
    mapObj = gMapObj;
		var marker = new google.maps.Marker({
      position: gMapCenter,
      map: mapObj,
      title: gMap.place
    });
    var infowindow = new google.maps.InfoWindow({
        content: gMap.html
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(gMapObj,marker);
    });
    mapObj.enableKeyDragZoom({key: 'alt'});
    google.maps.event.trigger(mapObj, "resize");
	} else {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode({address: gMap.place}, addAddressToMap);
	}
}
function checkGoogleMap(strLat, strLng, strPlace, mapType, zoom, back, show) {
//	if (GBrowserIsCompatible()) {
 	  if (gMap.lat != '' && gMap.lng != '' ) {
			if (show) {
      	gMap.back = location;
    		gMap.zoom = zoom;
    		gMap.type = gMap.types[mapType];
    		gMap.place = strPlace;
    		gMap.show = show;
    		gMap.html = '';
    		var marker, gMap; 
    		if (back) gMap.back = back;
    		gMap.lat = getCoord(strLat);
    		gMap.lng = getCoord(strLng);
				showGoogleMap();
			} else {
				showPopUpFrame('', false);
				mytop.frames["popup"].location = 'gmap_place.htm';
			}
		} else {
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({address: strplace}, addAddressToMap);
		}
//	}
}
function getCoord(strAddr) {
	if (strAddr) {
		var dec=0, negate = 1, multiplier = 1;
		var coord = strAddr.replace(/[WSws]/,'-')
		if (coord.indexOf('-') > -1) negate = -1;
		coord = coord.replace(/[^\d\.]/g,' ')
		coord=coord.split(' ');
		for (var i=0; i<coord.length; i++) {
			if (coord[i]) {
				dec += coord[i] * multiplier;
				multiplier /= 60;
			}
		}
		return(dec * negate);
	} else {
		return('');
	}
}
function addAddressToMap(response, status) {
	if (!response || status != google.maps.GeocoderStatus.OK) {
		var reason="Code "+status;
		if (gMap.reasons[status]) {
			reason = gMap.reasons[status]
		} 
        	var el= document.getElementById("GoogleMapWrapper")
		if (el) {
			el.innerHTML = gMap.reasons['ErrorMessage'] + ' - ' + reason;
		} else {
			alert(gMap.reasons['ErrorMessage'] + '\n ' + reason);
		}
	} else {
		place = response[0];
		gMap.lat = place.geometry.location.lat();
		gMap.lng = place.geometry.location.lng();
		var address = [];
		for (var i=0; i<place.address_components.length; i++) {
        address[place.address_components[i].types[0]] = place.address_components[i].long_name;
    }
		gMap.html = place.formatted_address + '<br>' +
			'<g>Grid Reference:</b> ' + gMap.lat + '/' + gMap.lng;
//		if (gMap.show) {
			showGoogleMap();
//		} else {
//			mytop.frames["popup"].location = 'gmap_place.htm?';
//
//		}
	}
}


function makeGoogleMap() {
//	if (GBrowserIsCompatible()) {
    var gMapCenter = new google.maps.LatLng(0, 0);
    var gMapOptions = {
      zoom:         gMap.zoom,
      center:       gMapCenter,
      mapTypeId:    gMap.types[gMap.typeDefault],
      navigationControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {style:google.maps.MapTypeControlStyle.DROPDOWN_MENU}
    };
    var gMapObj = new google.maps.Map(document.getElementById("GoogleMap"), gMapOptions);
		mapObj = gMapObj;
    var mc = new MarkerClusterer(gMapObj);		showPopUpFrame('', false);
    var markers=[];
		var bounds = new google.maps.LatLngBounds();
		for (var i=0; i<gMapData.markers.length; i++) {
			var point = new google.maps.LatLng(getCoord(gMapData.markers[i].lat), getCoord(gMapData.markers[i].lng));
			var marker = addMarker(point, gMapData.markers[i].label, gMapData.markers[i].html);
			bounds.extend(point);
      markers.push(marker);
    }
		gMapObj.fitBounds(bounds);
    var markerCluster = new MarkerClusterer(gMapObj, markers, {maxZoom:6, gridSize:30});
    gMapObj.enableKeyDragZoom({key: 'alt'});
    var zoomfunc = zoomGoogleMapLater(gMapObj, bounds);
		setTimeout(zoomfunc, 1000)
//	}
}
function zoomGoogleMapLater(map, bounds) {
	return function () {
		if (map.getBounds()) {
			var clat = (bounds.getNorthEast().lat() + bounds.getSouthWest().lat()) /2;
			var clng = (bounds.getNorthEast().lng() + bounds.getSouthWest().lng()) /2;
			map.fitBounds(bounds);
			map.setCenter(new google.maps.LatLng(clat,clng));
		} else {
			var zoomfunc = zoomGoogleMapLater(map, bounds);
			setTimeout(zoomfunc, 1000)
		}
	}
}

/*

	TimeLine interfacing code from http://simile.mit.edu/timeline/docs/create-timelines.html

*/

function timeLineOnLoad() {

  var today = new Date();

  /* Variant of standard Timeline.loadJSON but store JSON data in global var
  Timeline.loadJSON = function(url, f) {
	var fError = function(statusText, status, xmlhttp) {
		alert("Failed to load json data from " + url + "\n" + statusText);
	};
	var fDone = function(xmlhttp) {
		eval('tlParam.json0 = ' + xmlhttp.responseText + '') 
		f(tlParam.json0, url);
	};
    	tlParam.url = url;
    	SimileAjax.XmlHttp.get(url, fError, fDone);
  };
*/
  // Override data/time info in bubble
  Timeline.DefaultEventSource.Event.prototype.fillTime = function() {};

  urlParam = getArgs();

  if ('unit' in urlParam) urlParam.unit = parseInt(urlParam.unit);
  for (prop in urlParam) {
	tlParam[prop] = urlParam[prop];
  }

  tlParam.eventSource0 = new Timeline.DefaultEventSource();

  tlParam.theme = Timeline.ClassicTheme.create();
  tlParam.theme.autoWidth = true;
  tlParam.theme.event.bubble.width = 360;
  tlParam.theme.event.bubble.height = 104;
  tlParam.theme.event.track.offset = 20;
  tlParam.theme.event.track.height = 18;
  tlParam.theme.event.tape.height = 1;
  tlParam.theme.event.track.gap = 5;
  tlParam.theme.event.label.width = 500;
  tlParam.theme.event.instant.impreciseOpacity = 40;
  tlParam.theme.event.instant.iconWidth = 16;
  tlParam.theme.event.instant.iconHeight = 16;
  tlParam.theme.mouseWheel = "zoom";

  if (! ('duration'	in tlParam)) tlParam.duration = true;
  if (! ('trackHeight'	in tlParam)) tlParam.trackHeight = 1.5;
  if (! ('trackGap'	in tlParam)) tlParam.trackGap = 0.2;
  if (! ('help'		in tlParam)) tlParam.help = true;
  if (! ('url'		in tlParam)) tlParam.url = "";
  if (! ('div'		in tlParam)) tlParam.div = document.getElementById("timeline0");
  if (! ('wrapEvents'	in tlParam)) tlParam.wrapEvents = true;

//for (prop in tlParam) { alert(prop+'='+tlParam[prop]);};
	
  if (tlParam.data) {
  	tlParam.constrained = document.getElementById("constrainer");
	Timeline.loadJSON(tlParam.data, function(json, url) {  
    tlParam.json0=json;
		document.getElementById("subtitle").innerHTML = json.subtitle;
		if (('date' in tlParam) && tlParam.help) {
			// put help next to target event (help is last event in json data)
			tlParam.json0.events[tlParam.json0.events.length-1].start = tlParam.date;
		} else {
			tlParam.date = json.date;
		}
		tlParam.nowTag = json.nowTag;
		tlParam.eventSource0.loadJSON(json, url);
		timeLineDraw(tlParam.date)
	});
  } else {
	// personal & family timelines - data already loaded in html script so just load into eventSource

	tlParam.eventSource0.loadJSON(tlParam.json0, tlParam.url);

	// suppress bubbles

 	Timeline.OriginalEventPainter.prototype._showBubble = function() {};

	if (! ('date' in tlParam)) {
		var startdate = new Date(), thisdate;
		tlParam.date = startdate;
		for (var i=0; i < tlParam.json0.events.length; i++) {
			thisdate = Date.parse(tlParam.json0.events[i].start);
			if (thisdate < startdate) {
				startdate = thisdate;
				tlParam.date = tlParam.json0.events[i].start;
			}
		}
	};
	tlParam.help = false;
	if ('constrained' in tlParam) delete tlParam.constrained;
	timeLineDraw(tlParam.date);
	tl.getBand(0).setMinVisibleDate(Timeline.DateTime.parseGregorianDateTime(tlParam.date) - (365 * 24 * 60 * 60 * 1000))
  }
}
function timeLineDraw(date) {
  	var bandInfos = [
		Timeline.createBandInfo({
//  		trackHeight:    tlParam.trackHeight,
//   	  trackGap:       tlParam.trackGap,
  		align:		      'Top',
    	eventSource:    tlParam.eventSource0,
    	date:           Timeline.DateTime.parseGregorianDateTime(date),
   	 	width:          "100%", 
//    	intervalUnit:   tlParam.unit, 
//    	intervalPixels: tlParam.pixels,
      intervalUnit:   Timeline.DateTime.DECADE,
      intervalPixels: 81,
//    	eventPainter:   Timeline.DetailedEventPainter,
      zoomIndex:      13,
      zoomSteps:      new Array(
        {pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
        {pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
        {pixelsPerInterval: 175,  unit: Timeline.DateTime.WEEK},
        {pixelsPerInterval:  87,  unit: Timeline.DateTime.WEEK},
        {pixelsPerInterval: 175,  unit: Timeline.DateTime.MONTH},
        {pixelsPerInterval:  87,  unit: Timeline.DateTime.MONTH},
        {pixelsPerInterval: 525,  unit: Timeline.DateTime.YEAR},
        {pixelsPerInterval: 262,  unit: Timeline.DateTime.YEAR},
        {pixelsPerInterval: 131,  unit: Timeline.DateTime.YEAR},
        {pixelsPerInterval:  65,  unit: Timeline.DateTime.YEAR},
        {pixelsPerInterval: 325,  unit: Timeline.DateTime.DECADE},
        {pixelsPerInterval: 325,  unit: Timeline.DateTime.DECADE},
        {pixelsPerInterval: 162,  unit: Timeline.DateTime.DECADE},
        {pixelsPerInterval:  81,  unit: Timeline.DateTime.DECADE},
        {pixelsPerInterval: 410,  unit: Timeline.DateTime.CENTURY},
        {pixelsPerInterval: 410,  unit: Timeline.DateTime.CENTURY},
        {pixelsPerInterval: 205,  unit: Timeline.DateTime.CENTURY},
        {pixelsPerInterval: 102,  unit: Timeline.DateTime.CENTURY},
        {pixelsPerInterval: 510,  unit: Timeline.DateTime.MILLENNIUM}),
      wrapEvents:     tlParam.wrapEvents,
      theme:		tlParam.theme}
   	)
/*     ,
		Timeline.createBandInfo({
        	eventSource:    tlParam.eventSource1,
        	date:           Timeline.DateTime.parseGregorianDateTime(date),
       	 	width:          "100%", 
          intervalUnit:   Timeline.DateTime.DECADE,
          intervalPixels: 81,
		      theme:		tlParam.theme
    	})
   */
      ];
//   bandInfos[1].syncWith = 0;
	var d = new Date();
        bandInfos[0].decorators = [
                    new Timeline.SpanHighlightDecorator({
                        startDate:  d.setHours(12),
                        endDate:    d.setHours(100*24), // add one week
                        color:      "#D3D3D3",
                        opacity:    30,
                        startLabel: "",
                        endLabel:   tlParam.nowTag,
                        theme:      tlParam.theme
                    }),
                    new Timeline.PointHighlightDecorator({
                        date:  	    d.setHours(12),
                        color:      "#D3D3D3",
                        opacity:    30,
                        theme:      tlParam.theme
                    })
        ];
	tl = Timeline.create(tlParam.div, bandInfos);
	tl.layout();
	timeLineOnResize();
}
function timeLineZoom(zoomIn) {
	var l = Timeline.DateTime.gregorianUnitLengths;
	var u = tlParam.unit;
	if (!zoomIn) {
		tlParam.pixels /= 2;
		if (tlParam.pixels < 50) {
			if (tlParam.unit < 10) {
				tlParam.pixels = tlParam.pixels * l[u+1] / l[u];
				tlParam.unit++;
			} else {
				tlParam.pixels *= 2;
			}
		}
	} else {
		tlParam.pixels *= 2;
		if (tlParam.pixels > 300) {
			if (tlParam.unit > 4) {
				tlParam.pixels = tlParam.pixels * l[u-1] / l[u];
				tlParam.unit--;
			} else {
				tlParam.pixels /=2;
			}
		}
	} 
	timeLineRedraw();
}
function timeLineRedraw() {

	// remove help event if still present
	if (tlParam.help) {
		tlParam.json0.events.splice(tlParam.json0.events.length-1,1);
		tlParam.help = false;
	}
//	Timeline.XmlHttp._onReadyStateChange = function() {};
	tlParam.eventSource0.clear();
	tlParam.eventSource0.loadJSON(tlParam.json0, tlParam.url);
	if(tl) timeLineDraw(tl.getBand(0).getCenterVisibleDate())
}
function timeLineToggleDuration() {
	for (var i=0; i < tlParam.json0.events.length; i++) {
		if (tlParam.duration) {
			// move any 'end' dates out of the way so that Timeline doesn't see them
			tlParam.json0.events[i].finish = tlParam.json0.events[i].end;
			delete tlParam.json0.events[i].end;
			// swop colors
			tlParam.json0.events[i].textColor = tlParam.json0.events[i].color;
			delete tlParam.json0.events[i].color;
		} else {
			// put any 'end' dates back
			tlParam.json0.events[i].end = tlParam.json0.events[i].finish;
			// swop colors
			tlParam.json0.events[i].color = tlParam.json0.events[i].textColor;
			delete tlParam.json0.events[i].textColor;
		}
	}
	tlParam.duration = ! tlParam.duration;
	timeLineRedraw();
}

var resizeTimerID = null;
function timeLineOnResize() {
    var ht = getInnerHeight();
    //var ht = document.documentElement.clientHeight;
    if (ht > 0 && tlParam.constrained) tlParam.constrained.style.height=(ht - 65) + 'px';
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
             if (tl) tl.layout();
        }, 500);
    }
}
function getInnerHeight() {
	return self.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight); 
}
function showLastModified() {
    var out = document.getElementById('lastModified');
    if (out) {
       try{ 
        var d = new Date(document.lastModified);
        out.innerHTML = d.toLocaleDateString();
       } catch(e) {
        out.innerHTML = document.lastModified;
       }
    }
}
// Handle GenoMap SVG/PDF images
//

function setSvgPdfFrame(flip) {
  if (!flip) {
    var param = getArgs();
    // normalise coordinates
    var dX = -mapInfo.Bounds[0];
    var dY = -mapInfo.Bounds[1];
    mapInfo.Bounds[2] += dX;
    mapInfo.Bounds[3] += dY;
    mapInfo.Bounds[0] = 0;
    mapInfo.Bounds[1] = 0;
    mapInfo.X=(param.x ? parseInt(param.x) + dX : (mapInfo.Bounds[2] - mapInfo.Bounds[0]) / 2);
    mapInfo.Y=(param.y ? parseInt(param.y) + dY : (mapInfo.Bounds[3] - mapInfo.Bounds[1]) / 2);
    mapInfo.Highlight = (param.highlight ? param.highlight=="true" : false);
    mapInfo.Toggle=(param.toggle ? param.toggle : 'SVG');
    pdfparam='#zoom=100&navpanes=0'
    if (mapInfo.ZoomExtent) pdfparam = '#view=Fit&navpanes=0';
    if (mapInfo.Highlight) pdfparam = '#navpanes=0&zoom=100,'+mapInfo.X+','+mapInfo.Y+'&highlight='+(mapInfo.X-30)+','+(mapInfo.X+30)+','+(mapInfo.Y-30)+','+(mapInfo.Y+30)+'&search="'+param.name+'"';
    pdfparam = pdfparam + '&toolbar='+(mapInfo.PdfToolbar ? "1" : "0");
  }
	if (mapInfo.SVG && mapInfo.PDF) {
    if (flip) mapInfo.Toggle = (mapInfo.Toggle=='SVG' ? 'PDF' : 'SVG');
    	var texts=[mapInfo.SvgTip,mapInfo.PdfTip];
  		if (mapInfo.Toggle == 'PDF') {
  			document.images['toggleSvgPdfImg'].src = imgSvg.src;
  			document.images['toggleSvgPdfImg'].title = texts[0];
  		} else {
  			document.images['toggleSvgPdfImg'].src = imgPdf.src;
  			document.images['toggleSvgPdfImg'].title = texts[1];
  		}
		}
    if (mapInfo.Toggle=='SVG') {
    	checkAndGetSVGViewer();
    	emitSVG(document.getElementById("svgpdf"), 'src="' + mapInfo.File + '" id="svgEmbed" height="100%" width="100%" type="image/svg+xml" border="2"');
      embed = document.getElementById('svgEmbed');
      waitForSvgLoad(mapInfo, 0);
    } else {
    	document.getElementById("svgpdf").innerHTML = "<iframe width='100%' height='100%' src='" + mapInfo.File.substring(0,mapInfo.File.lastIndexOf('.')) + ".pdf"  +pdfparam+ "'/>";
    }
    if (mapInfo.ExpandFrame && (mytop.popupToggleState == mytop.popupMaxButton.src)) togglePopUpFrame('togglePopUp');
}
function waitForSvgLoad(info, counter) {
        try {
          svgdoc = embed.getSVGDocument();
          if (svgdoc && svgdoc.defaultView)  {// try the W3C standard way first
              svgwin = svgdoc.defaultView;
              svgwin.init(info)
          } else if (embed.window && embed.window.init) {
              svgwin = embed.window;
              svgwin.init(info)
          } else {
              svgwin = embed.getWindow();
              svgwin.init(info)
          }
        } catch(exception) {
          if (! counter || counter < 59) { // wait for 30 secs max
             setTimeout(function () {waitForSvgLoad(info, ++counter);}, 500);
             return;
          } else {
            alert('GenoMaps may not display correctly as the required SVG interface does not appear to be supported by this browser');
          }
        }
}