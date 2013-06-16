var fbApp = {
	init: function(accessToken) {
		this.accessToken = accessToken;
		this.posts = [];
		this.fetchUserData().then(this.initUser.bind(this));
	},
	fetchUserData: function() {
		self = this;
		var def = $.Deferred();
		$.get('https://graph.facebook.com/me?fields=name,username&access_token='+this.accessToken,
			function(response) {
				$.each(response,function(key,value) {
					self[key] = value;
				});
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
		var postlist = $("#postlist")[0];
		$.get(this.fetchMoreURL,
			function(response) {
				$.each(response.data,function(index,postdata) {
					var post = new Post(postdata);
					postlist.appendChild(post.render());
					self.posts.push(post);
				});
				this.fetchMoreURL = response.paging.next;
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
	likeAndComment: function() {
		var shouldLike = $("#likeCheckbox").attr('checked'),
			shouldComment = $("#commentCheckbox").attr('checked'),
			comment = $("#commentBox").value();
		$.each(this.posts,function(index,post) {
			if(shouldLike&&!post.isLiked(post.id)) this.like(post.id);
			if(shouldComment&&!post.isCommented(post.id,comment)) this.comment(post.id,comment);
		});
	},
	like: function(postId) {
		$.get("https://graph.facebook.com/"+postId+"/likes?method=POST&format=json&access_token="+this.accessToken,
			function(data) {
				if(data) incrementLikeCount();
				else failedLikeCount();
			},"json")
		.error(function(e) {
			failedLikeCount();
		});
	},
	comment: function(postId,comment) {
		comment = encodeURIComponent(comment);
		$.get("https://graph.facebook.com/"+post.id+"/comments?method=POST&message="+comment+"&format=json&access_token="+getVars.access_token,
		function(data) {
			if(data.id) incrementCommentCount();
			else failedCommentCount();
		}, "json")
		.error(function(e) {
			failedLikeCount();
		});
	}
}