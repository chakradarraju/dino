var getVars = {}, user, commentCount = 0, likeCount = 0, alreadyCommentedCount =
0, alreadyLikedCount = 0, flikeCount = 0, fcommentCount = 0, pageCount = 0;
var glbdata = {};
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

function isToday(d) {
  var n = new Date();
  return n.getDate()===d.getDate()&&n.getMonth()===d.getMonth()&&n.getYear()===d.getYear();
}

function gotoAuthPage() {
  byId('content').innerHTML = "Click <a href='./accessToken.php'>here</a>"
  + " to authenticate your account";
}

function incrementLiked() {
  byId('alreadyLikedCount').innerHTML = ++alreadyLikedCount;
}

function incrementCommented() {
  byId('alreadyCommentedCount').innerHTML = ++alreadyCommentedCount;
}

function incrementLikeCount() {
  byId('likeCount').innerHTML = ++likeCount;
}

function incrementCommentCount() {
  byId('commentCount').innerHTML = ++commentCount;
}

function failedLikeCount() {
  byId('flikeCount').innerHTML = ++flikeCount;
}

function failedCommentCount() {
  byId('fcommentCount').innerHTML = ++fcommentCount;
}
