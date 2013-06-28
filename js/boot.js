var getVars = {};
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
  fbApp.init(getVars.access_token);
}

$("#likeAndComment").bind({
  "submit": function(e) {
    e.preventDefault();
    fbApp.likeAndComment();
}
});

function gotoAuthPage() {
  byId('content').innerHTML = "Click <a href='./accessToken.php'>here</a>"
  + " to authenticate your account";
}

function getProperty(obj, list) {
  var next;
  while(next=list.shift()) {
    if(!obj) return "";
    obj = obj[next];
  }
  return obj;
}
