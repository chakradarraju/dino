var fbApp = {
	init: function(accessToken) {
		this.accessToken = accessToken;
		this.posts = [];
		this.queue = [];
		this.fetchUserData().then(this.initUser.bind(this));
		this.prevPost = null;
		this.liked = 0;
		this.commented = 0;
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
	likeAndComment: function() {
		mixpanel.track("likeAndComment");
		var comment = filterEmptyStrings($("#commentBox").val().split("\n")),
			shouldLike = !!$("#likeCheckbox").is(':checked'),
			shouldComment = comment.length > 0,
			self = this;
		
		if(!shouldLike&&!shouldComment) {
			alert("Choose like and/or write Comment");
			return;
		}
		this.liked = 0; this.commented = 0;
		$.each(this.posts,function(index,post) {
			if(post.isChecked()) {
				if(shouldLike&&!post.isLiked(self.name)) self.like(post.id);
				if(shouldComment&&!post.isCommented(self.name,comment)) self.comment(post.id,post.replaceVars(comment[rand(comment.length)]));
			}
		});
		if(this.queue.length === 0) {
			alert("Choose atleast 1 post to "+$("#applyBtn").val());
			return;
		}
		$.when.apply({},this.queue).done(function() {
			self.queue = [];
			self.selectNone();
			mixpanel.track("completed",{liked:self.liked,commented:self.commented});
			alert("Done");
		});
	},
	like: function(postId) {
		this.liked++;
		this.queue.push($.get("https://graph.facebook.com/"+postId+"/likes?method=POST&format=json&access_token="+this.accessToken));
	},
	comment: function(postId,comment) {
		this.commented++;
		var comment = encodeURIComponent(comment);
		this.queue.push($.get("https://graph.facebook.com/"+postId+"/comments?method=POST&message="+comment+"&format=json&access_token="+this.accessToken));
	},
	getPostsOnDate: function(date) {
		if(date.toString() === "Invalid Date") {
			mixpanel.track("getPostsOnDate with invalid date");
			alert("Please choose a valid date");
			return;
		}
		mixpanel.track("getPostsOnDate");
		var fromDate = encodeURIComponent(date.toGMTString()),
			toDate = encodeURIComponent(nextDay(date).toGMTString()),
			fetchURL = "https://graph.facebook.com/"+this.username+"/feed?access_token="+this.accessToken+"&since="+fromDate+"&until="+toDate,
			fetchedPosts = [],
			self = this,
			count = 0;
		(function fetchNextPage() {
			self.getPosts(fetchURL, function(response) {
				fetchURL = response.paging.next;
				var isAllPostsOnDate = true;
				$.each(response.data, function(index,post) {
					if(!dateEquals(new Date(post.created_time),date)) isAllPostsOnDate = false;
				});
				if(isAllPostsOnDate)
					fetchNextPage();
				$("#numPosts").html(self.posts.length);
			}, function(post) {
				return dateEquals(new Date(post.created_time),date);
			});
		})();
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
