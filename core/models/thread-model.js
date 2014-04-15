//getMyThreads() => user_thread
//getThreadContent() => thread
//thread id = if one to one = util.format("%s_%s", user1[id], user2[id]);

var thread = {
	threadId: '',
	name: '',
	type: '',
	status: '',
	createdTime: '',
	users: [{
		userId: '',
		message: ''
	}],
	converstations: {
		userId: '',
		message: '',
		messageType: '',
		createdTime: 0
	}
};

var user_thread = {
	userId: '',
	threadId: ''
};