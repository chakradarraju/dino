var fbApp = {
	init: function(accessToken) {
		var def = $.Deferred(),
			self = this;
		this.accessToken = accessToken;
		this.posts = [];
		this.fetchUserData().then(function() {
			def.resolve();
			self.initUser();
		});
		this.prevPost = null;
		this.liked = 0;
		this.commented = 0;
		return def;
	},
	fetchUserData: function() {
		var self = this,
			def = $.Deferred();
		$.get('https://graph.facebook.com/me?fields=name,username&access_token='+this.accessToken,
			function(response) {
				$.each(response,function(key,value) {
					self[key] = value;
				});
				mixpanel.track("Got user details",{name:self.username});
				def.resolve();
			}, "json")
		.error(function(ajaxObj) {
			alert("Unknown error while fetching userdata");
			console.error(ajaxObj.response);
		});
		return def;
	},
	initUser: function() {
		this.fetchMoreURL = 'https://graph.facebook.com/'+this.username+'/feed?access_token='+this.accessToken;
	},
	getMorePosts: function() {
		var self = this;
		this.getPosts(this.fetchMoreURL,function(response) {
			self.fetchMoreURL = response.paging.next;
			$("#numPosts").html(self.posts.length);
		});
	},
	selectAll: function() {
		mixpanel.track("selectAll");
		$.each(this.posts,function(index,post) {
			post.check();
		});
	},
	selectNone: function() {
		mixpanel.track("selectNone");
		$.each(this.posts,function(index,post) {
			post.uncheck();
		});
	},
	invertSelection: function() {
		mixpanel.track("invertSelection");
		$.each(this.posts,function(index,post) {
			if(post.isChecked()) post.uncheck();
			else post.check();
		});
	},
	onPostSelected: function(postId,shift) {
		if(shift&&this.prevPost) {
			mixpanel.track("Range select");
			var shouldSelect = false,
				self = this;
			$.each(this.posts,function(index,post) {
				if(post.id === self.prevPost || post.id === postId) shouldSelect = !shouldSelect;
				if(shouldSelect&&!post.isChecked()) post.toggle();
			});
		} else {
			this.prevPost = postId;
		}
	},
	applyForSelectedPosts: function(shouldLike, comments) {
		mixpanel.track("applyForSelectedPosts");
		var shouldComment = comments.length > 0;
		if(!shouldLike&&!shouldComment) {
			alert("Choose like and/or write Comment");
			return;
		}
		var count = 0;
		$.each(this.posts, function(index,post) {
			if(post.isChecked()) {
				count += 1;
				if(shouldLike) post.like();
				if(shouldComment) post.comment(comments[rand(comments.length)])
			}
		});
		if(count === 0) alert("No post selected");
	},
	postPendingChanges: function() {
		showProgress();
		mixpanel.track("postPendingChanges");
		var likeCount = 0,
			commentCount = 0,
			requests = [],
			self = this;
		$.each(this.posts, function(index, post) {
			var likeUrl = post.getLikeUrl(),
				commentUrl = post.getCommentUrl();
			if(likeUrl) {
				requests.push($.post("https://graph.facebook.com/"+likeUrl+"&access_token="+self.accessToken));
				likeCount++;
			}
			if(commentUrl) {
				requests.push($.post("https://graph.facebook.com/"+commentUrl+"&access_token="+self.accessToken));
				commentCount++;
			}
		});
		if(likeCount+commentCount === 0) alert("There are no pending changes to Post");
		else processRequests(requests).then(function() {
			self.clearChanges();
			self.selectNone();
		});
	},
	clearChanges: function() {
		$.each(this.posts, function(index, post) {
			post.clearChanges();
		});
	},
	getPostsOnDate: function(date) {
		if(date.toString() === "Invalid Date") {
			mixpanel.track("getPostsOnDate with invalid date");
			alert("Please choose a valid date");
			return;
		}
		//show loading icon
		$('#loading').fadeIn();
		mixpanel.track("getPostsOnDate");
		var fromDate = encodeURIComponent(date.toGMTString()),
			toDate = encodeURIComponent(nextDay(date).toGMTString()),
			fetchURL = "https://graph.facebook.com/"+this.username+"/feed?access_token="+this.accessToken+"&since="+fromDate+"&until="+toDate,
			fetchedPosts = [],
			self = this,
			count = 0
			def = $.Deferred();
			def.done(function(){
				//hide loading icon
				$('#loading').fadeOut();
			});
		(function fetchNextPage() {
			self.getPosts(fetchURL, function(response) {
				fetchURL = response.paging.next;
				var isAllPostsOnDate = true;
				$.each(response.data, function(index,post) {
					if(!dateEquals(new Date(post.created_time),date)) isAllPostsOnDate = false;
				});
				if(isAllPostsOnDate)
					fetchNextPage();
				else
					def.resolve(self.posts);
				$("#numPosts").html(self.posts.length);
			}, function(post) {
				return dateEquals(new Date(post.created_time),date);
			});
		})();
		return def;
	},
	getPosts: function(fetchURL,callback,filterFn) {
		var self = this,
			postlist = $("#postlist")[0],
			shouldIgnoreMyPosts = isChecked('ignoreMyPosts');
		$.get(fetchURL,
			function(response) {
				$.each(response.data,function(index,postdata) {
					if(filterFn && !filterFn(postdata)) return;
					if(shouldIgnoreMyPosts && postdata.from.name === self.name) return;
					var post = new Post(postdata);
					postlist.appendChild(post.getHTMLNode());
					self.posts.push(post);
				});
				callback(response);
			},"json")
		.error(function(ajaxObj) {
			var e = ajaxObj.responseJSON;
			if(e&&e.error&&e.error.type&&e.error.type==="OAuthException") {
				gotoAuthPage();
			} else {
				alert("Unknown error, we are working on fixing it, please be patient");
				console.error(ajaxObj.response);
			}   
		}); 
	},
	removeSelected: function() {
		mixpanel.track("removeSelected");
		var self = this,
			postList = [];
		$.each(this.posts,function(index,post) {
			if(post.isChecked()) post.remove();
			else postList.push(post);
		});
		this.posts = postList;
		$("#numPosts").html(self.posts.length);
	}
}
