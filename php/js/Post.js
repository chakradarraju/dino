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
	var jnode = $("<tr><td>"+this.getLabel()+"</td><td>"+this.getInfo()+"</td></tr>");
	$("td",jnode).click(this.onClick.bind(this));
	return jnode[0];
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
		if(comments[i].from.name===userName&&comments[i].message===comment)
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

Post.prototype.replaceVars = function(comment) {
	var vars = ["firstname","lastname","name"],
		self = this;
	$.each(vars, function(index,value) {
		if(self["var_"+value]) comment = comment.replace("<"+value+">",self["var_"+value]);
	});
	return comment;
}
