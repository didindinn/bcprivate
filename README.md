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

Now, you need to [download the client files](https://www.mediafire.com/file/pz6cp7o9fl84o33/v152.zip/file "download the client files") and extract it in the folder **public**.

## Setting

**You will need an account in mongodb to continue the proccess, the project uses it to save data of players.**</br>
Taking into consideration, create a new project in [MongoDB](mongodb.org "MongoDB website"), and configure the environment variables, in .env file.

#### environment variables
DB_CONNECT: Mongodb connection url</br>
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

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details