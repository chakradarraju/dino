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

$("#likeAndComment").bind({
  "submit": function(e) {
    e.preventDefault();
    fbApp.likeAndComment();
  }
});

function gotoAuthPage() {
  byId('content').innerHTML = "<big><big>Click <a href='./accessToken.php'>here</a> to authenticate your account</big></big><br/><small>Dino needs your permission to post on your behalf, when Facebook asks for giving permission press Okay.<br/>Don't worry the permission will be used only for liking and commenting on the post that you manually select.<br/>No spam certified by <a href='http://www.facebook.com/chakradarraju/'>Chakradar Raju</a> :)</small>";
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

$("#datePicker").datepicker();