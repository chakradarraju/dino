var fbApp = {
	init: function(accessToken) {
		this.accessToken = accessToken;
		this.posts = [];
		this.queue = [];
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
					postlist.appendChild(post.getHTMLNode());
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
	selectAll: function() {
		$.each(this.posts,function(index,post) {
			post.check();
		});
	},
	selectNone: function() {
		$.each(this.posts,function(index,post) {
			post.uncheck();
		});
	},
	invertSelection: function() {
		$.each(this.posts,function(index,post) {
			if(post.isChecked()) post.uncheck();
			else post.check();
		});
	},
	likeAndComment: function() {
		var shouldLike = !!$("#likeCheckbox").is(':checked'),
			shouldComment = $("#commentCheckbox").is(':checked'),
			comment = $("#commentBox").val(),
			self = this;

		$.each(this.posts,function(index,post) {
			if(post.isChecked()) {
				if(shouldLike&&!post.isLiked(self.name)) self.like(post.id);
				if(shouldComment&&!post.isCommented(self.name,comment)) self.comment(post.id,comment);
			}
		});
		$.when.apply({},this.queue).done(function() {
			self.queue = [];
			alert("Done");
		});
	},
	like: function(postId) {
		this.queue.push($.get("https://graph.facebook.com/"+postId+"/likes?method=POST&format=json&access_token="+this.accessToken));
	},
	comment: function(postId,comment) {
		comment = encodeURIComponent(comment);
		this.queue.push($.get("https://graph.facebook.com/"+postId+"/comments?method=POST&message="+comment+"&format=json&access_token="+this.accessToken));
	}
}