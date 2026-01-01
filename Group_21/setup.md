# environment setup

Created a react app by running the following command in the terminal

```bash
npm create vite@latest frontend  --template react
cd frontend
npm install
npm run dev
```

### Backend Setup

These dependencies has been uploaded in the package

- express
- jsonwebtoken
- mongoose
- dotenv
- cors
- bcryptjs
- multer
- xlsx

Please setup by type this command:
`npm install`

Enviroment file has to be followed by these step:
1. Connect mongodb by clicking connect button, the URI will appear then copy this value into the .env:

+ `MONGO_URI=mongodb+srv://me:23L0zmsuNLjTPFs1@expenses-tracker.pm9qh.mongodb.net/expense_tracker_db?retryWrites=true&w=majority&appName=expenses-tracker`
2. Every local computer needs to get a JWT to connect to the mongo, use this command to create a password:

+ `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

+ Then copy that encrypted password into `JWT_SECRET` variable
+ `JWT_SECRET=$$$`
3. Port has to be 8000:
+ `PORT=8000`

# MUST

1. Every enviromnent variable and private folder has to be kept secretly and included in `.gitignore`:

```
.env
node_modules
.gitignore
```
