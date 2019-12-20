const Cryptr = require("cryptr");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./mongodb/User");

dotenv.config();
const cryptr = new Cryptr(process.env.PASSWORD_ENCRYPTION);

class Server {
	constructor(app) {
		this.app = app;
		
		this.app.post('/register', async (req, res) => {
			if (!req)
				throw "Error";
			
			let username = req.body.nickname;
			let email = req.body.email;
			let password = req.body.password;
			
			if (await User.findOne({nickname:{$regex: new RegExp('^'+username+'$', 'i')}}))
				return this.error(res, 'NameNotAvailable', 'Nickname is not available. Try again');
			else if (await User.findOne({email: req.body.email}))
				return this.error(res, 'EmailAddressNotAvailable', 'Email address not available');
			
			let hash = await bcrypt.hash(password, 10);
			if (!hash)
				return this.unexpected(res);
			
			this.register_account(res, req, username, email, password);
		});
		
		this.app.post('/login', async (req, res) => {
			let username = req.body.nickname;
			let email = req.body.email;
			let password = req.body.password;
			
			if ((!username && !email) || (username && email) || !password)
				return this.unexpected(res);
			
			this.login(res, req, username, email, password);
		});
	}
	
	async login(res, req, username, email, password) {
		var user = await User.findOne(email ? {email: email} : {nickname: username});

		if (user) {
			var isTheSamePassword = await user.validatePassword(password);
		} else {
			return this.error(res, '', 'User not found');
		}
		
		if (isTheSamePassword) {
			req.headers["content-type"] = "application/json";

			res.send({
				playerId: user.playerId,
				sessionTicket: user.ticket,
				isNewPlayer: user.newlyCreated
			});
		} else
			return this.error(res, '', 'Invalid email address or password');
	}
	
	async register_account(res, req, username, email, password) {
		let user = new User({
			nickname: username,
			email: email,
			password: password,
			ticket: cryptr.encrypt(username+'_'+email+'_'+password),
			gear: {}
		});

		try {
			await user.save();
			
			req.headers["content-type"] = "application/json";

			res.send({
				playerId: user.playerId,
				sessionTicket: user.ticket,
				isNewPlayer: true,
			});
		} catch(err) {
			return this.unexpected(res);
		}	
	}
	
	error(res, type, message) {
		return res.status(400).json({error: type, errorMessage: message});
	}
	
	unexpected(res) {
		return this.error(res, "unexpected", "An unexpected error occurred");
	}
}

module.exports = Server