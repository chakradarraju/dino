Post = function(post) {
	this.id = post.id;
	this.domNode = false;
	this._post = post;
};

Post.prototype.getHTMLNode = function() {
	return this.domNode || (this.domNode = this.render());
}

Post.prototype.render = function() {
	var jnode = $("<div><input type='checkbox' />"+this.getLabel()+"</div>");
	return jnode[0];
}

Post.prototype.getLabel = function() {
	var message = this._post.message || this._post.story;
	return this._post.from.name + ": " + message;
}

Post.prototype.isChecked = function() {
	return $("input:checked",this.domNode).length !== 0;
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
	if(!post||!post.comments||!post.comments.data) return false;
	var comments = post.comments.data;
	for(var i=0;i<comments.length;i++) {
		if(comments[i].from.name===userName&&comments[i].message===comment)
			return true;
	}
	return false;
}