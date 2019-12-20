# bcprivate
A Box Critters Private Server

## Getting Started

### Prerequisites
```
node.js - v12.14.0 (recommended version)
```

### Installing
```
git clone https://github.com/Useems/bcprivate.git
```
```
npm install
```

## Setting

**You will need an account in mongodb to continue the proccess, the project uses it to save data of players.**

Taking into consideration, create a new project in [MongoDB](mongodb.org "MongoDB website"), and configure the environment variables, in .env file.

#### environment variables
DB_CONNECT: Mongodb connection url
PASSWORD_ENCRYPTION: Your secret key to generate players's password

## Running
In terminal, run:
```
npm start
```

## Client Version
v152

## Authors

* **Marcos André** - *All work* - [Useems](https://github.com/Useems)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details