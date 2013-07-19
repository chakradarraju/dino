mixpanel.track("Loaded page");

var getVars = {},
    data = [];
function byId(id) {
  return document.getElementById(id);
}

function parseForGetVars() {
  var getPart =
  window.location.href.substring(0,window.location.href.indexOf('#'));
  getPart.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      getVars[key] = value;
    });
}

parseForGetVars();
if(!getVars.access_token) {
  gotoAuthPage();
} else {
  mixpanel.track("Got access_token");
  fbApp.init(getVars.access_token);
}

$("#applyBtn").click(function(e) {
	var shouldLike = isChecked("likeCheckbox"),
		comments = filterEmptyStrings($("#commentBox").val().split("\n"));
	fbApp.applyForSelectedPosts(shouldLike,comments);
});

$("#postBtn").click(function(e) {
	fbApp.postPendingChanges();
});

function isChecked(id) {
  return !!$("#"+id).is(':checked');
}

function gotoAuthPage() {
  window.location.href = "index.html";
}

function getProperty(obj, list) {
  var next;
  while(next=list.shift()) {
    if(!obj) return "";
    obj = obj[next];
  }
  return obj;
}

function previousDay(date) {
  var ret = new Date(date);
  ret.setDate(ret.getDate()-1);
  return ret;
}

function nextDay(date) {
  var ret = new Date(date);
  ret.setDate(ret.getDate()+1);
  return ret;
}

function dateEquals(d1, d2) {
  return d1.toString().substring(0,15) === d2.toString().substring(0,15);
}

function rand(n) {
	return Math.floor(Math.random()*n);
}

$("#datePicker").datepicker();

function filterEmptyStrings(arr) {
	var filtered = [];
	for(var i=0;i<arr.length;i++) {
		if(arr[i]&&arr[i] != "") filtered.push(arr[i]);
	}
	return filtered;
}
