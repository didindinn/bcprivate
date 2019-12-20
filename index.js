const socketio = require("socket.io");
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const Login_page = require("./login_page");
const Client = require("./client");

const port = process.env.PORT || 80;
const app = express();

dotenv.config();

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));

app.use(function(err, req, res, next) {
	if (req.path.indexOf('.') === -1)
		res.setHeader('Content-Type', 'text/html');

	next();
});

app.use('/', express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.DB_CONNECT, {useUnifiedTopology: true, useNewUrlParser: true})
.then(database => {
	console.log("[MongoDB] Connected.");

	try {
		new Login_page(app); // Login and Registration pages

		let server = app.listen(port);
		console.log("[Website] Online!");

		let websocket = socketio(server);
		websocket.on('connection', socket => {
			let client = new Client(socket, websocket);
			
			socket.on('login', (data) => client.onLogin(data.ticket));
			socket.on('joinRoom', (data) => client.onJoinRoom(data.roomId));
			socket.on('disconnect', () => client.onDisconnect());
			socket.on('click', (data) => client.onMove(data.x, data.y));
			socket.on('sendMessage', (data) => client.onMessage(data.message));
			socket.on('code', (data) => client.onCommand(data.code, data.options));
			socket.on('trigger', (data) => client.onTrigger());
			socket.on('updateGear', (data) => client.onUpdateGear(data));
		});
	} catch (err) {
		console.log(err);
	}
})
.catch(err => {
	console.log("[MongoDB] Error. Couldn't connect to MongoDB.");
});