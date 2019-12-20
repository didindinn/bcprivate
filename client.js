const mongoose = require("mongoose");
const crypto = require("crypto");

const properties = require("./properties.json");
const User = require("./mongodb/User");
const codes = require("./items/codes");
const items = require("./items/items");
const staff = properties.staff;
const rooms_list = properties.rooms;

var rooms = {};
for (let i in rooms_list) {
	rooms[i] = rooms_list[i];
	rooms[i].data = require("./rooms/" + i + ".json");
}

var clients = {};

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function calculateAngle(t, e, i, o) {
    var s = i - t,
        r = e - o,
        a = Math.atan2(s, r),
        n = Math.floor(180 * a / Math.PI);
    return n < 0 ? n + 360 : n
}

class Client {
	constructor(socket, clients) {
		this.socket = socket;
		this.clients = clients;

		this.logged = false;
		this.isStaff = false;
		this.user = null;
		this.player = null;
		this.room = null;
	}
	
	// Events
	
	async onLogin(ticket) {
		if (!ticket)
			return this.disconnect();
		
		this.ticket = ticket;
		this.user = await User.findOne({ticket: ticket});
		
		if (this.user && !this.user.banned) {
			if (clients[this.user.nickname])
				clients[this.user.nickname].disconnect();

			this.logged = true;
			this.isStaff = staff.find(e => e === this.user.nickname) ? true : false;

			let inventory = [];
			let inventory_object = this.user.inventory.toObject();

			for (let i in inventory_object) {
				inventory.push(items[inventory_object[i].itemId]);
			}

			this.socket.emit('login', {
				nickname: this.user.nickname,
				critterId: this.user.critterId,
				playerId: this.user.playerId,
				coins: this.user.coins,
				gear: this.user.gear,
				gems: this.user.gems,
				inventory: inventory
			});
			
			clients[this.user.nickname] = this;

			if (this.user.newlyCreated) {
				this.user.newlyCreated = false;
				this.user.save();
			}

		} else {
			return this.disconnect();
		}
	}
	
	onJoinRoom(room_name = "tavern") {
		if (!this.logged)
			return this.disconnect();
		
		let room = rooms[room_name];

		if (this.canJoinRoom(room, true)) {
			this.joinRoom(room_name);
		} else {
			this.beep("Sorry this room is currently unavailable");
		}
	}
	
	onUpdateGear(gear) {
		if (!this.logged)
			return this.disconnect();

		this.updateGear(gear);
	}
	
	onMessage(message) {
		if (!this.logged || !this.room || !message)
			return this.disconnect();

		this.sendToRoom('M', {
			i: this.user.playerId,
			n: this.user.nickname,
			m: message.slice(0, 60),
			t: this.isStaff ? 1 : 0,
			server: true
		});
	}
	
	async onCommand(code, options) {
		if (!this.logged || !code)
			return this.disconnect();

		if (codes[code]) {
			items[codes[code]].name = items[codes[code]].itemId.replace(/_/g, ' ').toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

			if (await this.addToInventory(codes[code])) {
				this.beep(items[codes[code]], true);
			} else if (code != "darkmode") {
				this.beep("You have already unlocked this item");
			}
		}
	}
	
	onMove(x, y) {
		if (!this.logged || !this.room || !x || !y || !this.player)
			return this.disconnect();

		this.player.r = calculateAngle(this.player.x, this.player.y, x, y);
		this.player.x = x;
		this.player.y = y;
		
		this.sendToOthers('X', {
			i: this.user.playerId,
			x: this.player.x,
			y: this.player.y,
			z: 0,
			r: this.player.r
		});
	}
	
	onTrigger() {
		if (!this.logged || !this.room)
			return this.disconnect();

		if (this.room == "christmas") {
			if (inside([this.player.x, this.player.y], [[531,377],[609,417],[509,443],[436,399]])) {
				this.joinRoom("snowman_village");
			}
		} else if (this.room == "snowman_village") {
			if (inside([this.player.x, this.player.y], [[236,240],[326,292],[212,323],[131,269]])) {
				this.joinRoom("christmas");
			}
		}
	}
	
	onDisconnect() {
		this.leaveRoom();
		
		if (this.user)
			delete clients[this.user.nickname];
	}
	
	// Functions
	
	playerData(item) {
		this.player.g = item;
		this.socket.emit("playerData", {gear: item});

		this.sendToRoom('G', {
			i: this.user.playerId,
			g: item
		});
	}
	
	async updateGear(gear) {
		let inventory = this.user.inventory.toObject();

		for (let i in gear) {
			let found = inventory.find(e => e.itemId === gear[i]);

			if (!found)
				return this.disconnect();
		}

		this.user.gear = gear;
		await this.user.save();
		this.playerData(gear);
	}

	updatePlayer(item) {
		this.socket.emit("updatePlayer", {inventory: item});
	}

	async addToInventory(item_name) {
		if (!this.user || !this.logged)
			return this.disconnect();
		
		let found = await User.findOne({playerId: this.user.playerId, "inventory.itemId": item_name});
		if (found)
			return false;

		let item = items[item_name];

		if (item) {
			item.uid = crypto.randomBytes(8).toString("hex").toUpperCase();

			this.user.inventory.push(item);		
			await this.user.save();
			this.updatePlayer(item);

			return true;
		} else {
			return false;
		}
	}

	joinRoom(room_name, x, y, r) {
		let room = rooms[room_name];
		
		if (this.canJoinRoom(room)) {
			if (this.room)
				this.leaveRoom();
			
			this.room = room_name;

			let player = room.data.players.push({
				n: this.user.nickname,
				c: this.user.critterId,
				i: this.user.playerId,
				g: this.user.gear,
				r: r || room.data.startr,
				x: x ? x : room.data.startx,
				y: y ? y : room.data.starty,
				z: 0,
				s: 5
			});
			
			this.player = room.data.players[player - 1];
			this.socket.join(this.room);
			this.sendToOthers('A', this.player);
			this.socket.emit("joinRoom", room.data);
		}
	}
	
	leaveRoom() {
		if (!this.logged || !this.room)
			return this.disconnect();
		
		let room = rooms[this.room].data;
		let user_index = room.players.findIndex(e => e.i === this.user.playerId);
		
		if (room.players[user_index])
			room.players.splice(user_index, 1);
		
		this.sendToOthers('R', {i: this.user.playerId});
		this.socket.leave(this.room);
		this.room = null;
	}
	
	beep(content, isItem) {
		this.socket.emit("beep", isItem ? {item: content} : {alert: content});
	}
	
	canJoinRoom(room, joinCommand) {
		return room && room.main || ((joinCommand ? room.joinCommand : true) && ((!this.isStaff && !room.onlyStaff) || this.isStaff));
	}
	
	sendToRoom(t, data) {
		this.clients.to(this.room).emit(t, data);
	}
	
	sendToOthers(t, data) {
		this.socket.broadcast.to(this.room).emit(t, data);
	}
	
	disconnect() {
		if (this.socket)
			this.socket.disconnect();
	}
}

module.exports = Client