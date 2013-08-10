mixpanel.track("Loaded page");

var getVars = {},
    data = [];
function byId(id) {
  return document.getElementById(id);
}

function parseForGetVars() {
  var hashLoc = window.location.href.indexOf('#'),
      getPart = hashLoc === -1 ? window.location.href : window.location.href.substring(0,hashLoc);
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
  var initDef = fbApp.init(getVars.access_token);
  if(getVars.all === "true") {
    showProgress();
    initDef.then(function() {
      fbApp.getPostsOnDate(new Date($.cookie('datepicker'))).then(function(posts) {
        var shouldLike = $.cookie('like') === "on",
            shouldComment = $.cookie('comment') !== "",
            comment = $.cookie('comment'),
            requests = [];

        $.each(posts, function(index, post) {
          if(shouldLike) requests.push("https://graph.facebook.com/"+post.getLikeUrl(true)+"&access_token="+getVars.access_token);
          if(shouldComment && !post.isCommented(fbApp.name)) {
            var customComment = encodeURIComponent(post.replaceVars(comment));
            requests.push("https://graph.facebook.com/"+post.id+"/comments?method=POST&format=json&message="+customComment+"&access_token="+getVars.access_token);
          }
        });
        processRequests(requests);
      });
    });
  } else {
    showDashboard();
  }
}

function showDashboard() {
  $("#dashboard").show();
  $("#progressBoard").hide();
}

function showProgress() {
  $("#dashboard").hide();
  $("#progressBoard").show();
}

function processRequests(arr) {
  var total = arr.length,
      success = 0,
      failure = 0,
      def = $.Deferred();

  function doneFn() {
    success++;
  }

  function failFn() {
    failure++;
  }

  function update() {
    $("#successProgress").width(success/total*100 + "%");
    $("#failureProgress").width(failure/total*100 + "%");
    if(success+failure === total) {
      $("#progress").removeClass("active");
      mixpanel.track("completed",{total:arr.length});
      alert("Done");
      def.resolve();
    }
  }

  $.each(arr, function(index, value) {
    $.post(value).done(doneFn).fail(failFn).always(update);
  });

  return def;
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
