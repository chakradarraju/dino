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

$("#likeCheckbox").change(likeCommentChange);
$("#commentCheckbox").change(likeCommentChange);

function likeCommentChange() {
  var state = 0,
      strings = ["Choose Like or Comment", "Like", "Comment", "Like & Comment"];
  if(isChecked('likeCheckbox')) state += 1;
  if(isChecked('commentCheckbox')) state += 2;
  $("#applyBtn").val(strings[state]);
  $("#applyBtn").removeAttr('disabled');
  if(state === 0) $("#applyBtn").attr('disabled','disabled');
}

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
	return Math.floor(Math.random()*(n+1));
}

$("#datePicker").datepicker();
