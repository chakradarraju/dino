Post = function(post) {
	this.id = post.id;
	this.domNode = false;
	this.state = false;
	this._post = post;

	// Initing vars
	this.var_name = getProperty(this._post,["from","name"]);
	var brokenName = this.var_name.split(" ");
	this.var_firstname = brokenName[0] || "";
	this.var_lastname = brokenName[1] || "";
};

Post.prototype.getHTMLNode = function() {
	return this.domNode || (this.domNode = this.render());
}

Post.prototype.render = function() {
	var jnode = $(new EJS({url: 'templates/post.ejs'}).render({
		label: this.getLabel(),
		info: this.getInfo(),
		imgurl: 'http://graph.facebook.com/'+this.getUserId()+'/picture',
	}));
	$("td",jnode).click(this.onClick.bind(this));
	$(".postLike",jnode).click(this.postLikeClick.bind(this));
	$(".postCommentBox",jnode).click(this.postCommentBoxClick.bind(this));
	return jnode[0];
}

Post.prototype.postLikeClick = function(e) {
	var node = $(".postLike",this.getHTMLNode())[0],
		stateString = ["Like it", "Don't like it"];
	node.innerHTML = node.innerHTML === stateString[0] ? stateString[1] : stateString[0];
	return false;
}

Post.prototype.postCommentBoxClick = function(e) {
	e.preventDefault();
	return false;
}

Post.prototype.getLabel = function() {
	var message = this._post.message || this._post.story;
	return this._post.from.name + ": " + message;
}

Post.prototype.getInfo = function() {
	var likes = getProperty(this,["_post","likes","data","length"]), comments = getProperty(this,["_post","comments","data","length"]);
	if(likes) likes = "likes: "+likes;
	if(comments) comments = " comments: "+comments;
	return "<small>"+likes+comments+"</small>";
}

Post.prototype.onClick = function(e) {
	this.toggle();
	if(this.isChecked()) fbApp.onPostSelected(this.id,e.shiftKey);
}

Post.prototype.isChecked = function() {
	return this.state;
}

Post.prototype.toggle = function() {
	this.domNode.className = ["","info"][(this.state = !this.state)+0];
}

Post.prototype.check = function() {
	if(this.isChecked()) return;
	this.toggle();
}

Post.prototype.uncheck = function() {
	if(!this.isChecked()) return;
	this.toggle();
}

Post.prototype.like = function() {
	if(this.isChecked()) fbApp.like(this.id);
}

Post.prototype.comment = function(text) {
	if(this.isChecked()) fbApp.comment(this.id,text);
}

Post.prototype.isLiked = function(userName) {
	var post = this._post;
	if(!post||!post.likes||!post.likes.data) return false;
	var likes = post.likes.data;
	for(var i=0;i<likes.length;i++) {
		if(likes[i].name===userName)
			return true;
	}
	return false;
}

Post.prototype.isCommented = function(userName,comment) {
	var post = this._post;
	if(!post||!post.comments||!post.comments.data) return false;
	var comments = post.comments.data;
	for(var i=0;i<comments.length;i++) {
		if(comments[i].from.name===userName&&(!comment||comments[i].message===comment))
			return true;
	}
	return false;
}

Post.prototype.remove = function() {
	var parentNode = this.domNode.parentElement;
	parentNode.removeChild(this.domNode);
	delete this;
}

Post.prototype.getAuthor = function() {
	return this._post.from.name;
}

Post.prototype.getUserId = function() {
	return this._post.from.id;
}

Post.prototype.replaceVars = function(comment) {
	var vars = ["firstname","lastname","name"],
		self = this;
	$.each(vars, function(index,value) {
		if(self["var_"+value]) comment = comment.replace("<"+value+">",self["var_"+value]);
	});
	return comment;
}

Post.prototype.shouldLike = function() {
	return $(".postLike",this.getHTMLNode())[0].innerHTML === "Don't like it";
}

Post.prototype.like = function() {
	if(this.shouldLike()) return;
	var node = $(".postLike",this.getHTMLNode())[0];
	node.innerHTML = "Don't like it";
}

Post.prototype.comment = function(comment) {
	$(".postCommentBox",this.getHTMLNode()).val(this.replaceVars(comment));
}

Post.prototype.getLikeUrl = function(force) {
	if(!force && !this.shouldLike()) return;
	return this.id+"/likes?method=POST&format=json";
}

Post.prototype.getCommentUrl = function(force) {
	var comment = encodeURIComponent($(".postCommentBox",this.getHTMLNode()).val());
	if(!force && !comment) return;
	return this.id+"/comments?method=POST&format=json&message="+comment;
}

Post.prototype.clearChanges = function() {
	$(".postLike",this.getHTMLNode())[0].innerHTML = "Like it";
	$(".postCommentBox",this.getHTMLNode()).val("");
}

Post.prototype.getCommentId = function() {
	var a = this._post.comments.data[0].id;
	if(a) return a;
	return Math.floor(Math.random()*100000);
}
