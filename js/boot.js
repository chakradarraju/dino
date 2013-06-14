var getVars = {}, commentCount = 0, likeCount = 0, alreadyCommentedCount =
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

function getUserWall(accessToken) {
  $.get('https://graph.facebook.com/chakradarraju/feed?access_token='+accessToken,
    function(data) {
        glbdata = data;
        browse(data);
    },"json");
}

function browse(page) {
  pageCount++;
  var allToday = true;
  for(var i in page.data) {
    var post = page.data[i];
    var d = new Date(post.created_time), liked = false, commented = false;
    if(!post.message) continue;
    if(!isToday(d)) { allToday = false; break; }
    if(!isLiked(post)) { liked = true; likeIt(post); }
    else incrementLiked();
    if(!isCommented(post)) { commented = true; comment(post); }
    else incrementCommented();
    if(commented||liked) log(post);
  }
  if(allToday) {
    $.get(page.paging.next,function(data) { browse(data); },"json");
  } else {
    alert('done, Downloaded ' + pageCount);
  }
}

function log(post) {
  var d = document.createElement('div');
  d.innerHTML = post.from.name + ": " + post.message;
  byId('log').appendChild(d);
}

function isToday(d) {
  var n = new Date();
  return n.getDate()===d.getDate()&&n.getMonth()===d.getMonth()&&n.getYear()===d.getYear();
}

function isLiked(post) {
  if(!post||!post.likes||!post.likes.data) return false;
  var likes = post.likes.data;
  for(var i=0;i<likes.length;i++) {
    if(likes[i].name==="Chakradar Raju")
      return true;
  }
  return false;
}

function isCommented(post) {
  if(!post||!post.comments||!post.comments.data) return false;
  var comments = post.comments.data;
  for(var i=0;i<comments.length;i++) {
    if(comments[i].from.name==="Chakradar Raju")
      return true;
  }
  return false;
}

function likeIt(post) {
  $.get("https://graph.facebook.com/"+post.id+"/likes?method=POST&format=json&access_token="+getVars.access_token,
      function(data) {
        if(data) incrementLikeCount();
        else failedLikeCount();
      },"json");
}

function comment(post) {
  $.get("https://graph.facebook.com/"+post.id+"/comments?method=POST&message=thanks%20%3A)&format=json&access_token="+getVars.access_token,
      function(data) {
        if(data.id) incrementCommentCount();
        else failedCommentCount();
      }, "json");
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
parseForGetVars();
if(!getVars.access_token) {
  byId('content').innerHTML = "Click <a href='./accessToken.php'>here</a>"
    + " to authenticate your account";
} else {
  getUserWall(getVars.access_token);
}