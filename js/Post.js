Post = function(post) {
	this.id = post.id;
	this.domNode = false;
	this.state = false;
	this._post = post;
};

Post.prototype.getHTMLNode = function() {
	return this.domNode || (this.domNode = this.render());
}

Post.prototype.render = function() {
	var jnode = $("<tr><td>"+this.getLabel()+"</td></tr>");
	$("td",jnode).click(this.onClick.bind(this));
	return jnode[0];
}

Post.prototype.getLabel = function() {
	var message = this._post.message || this._post.story;
	return this._post.from.name + ": " + message;
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
		if(comments[i].from.name===userName&&comments[i].message===comment)
			return true;
	}
	return false;
}