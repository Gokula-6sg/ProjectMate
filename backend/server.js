const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const authRouter = require('./router/auth-router')
const homeRouter = require('./router/home-router')
const ratelimit = require('express-rate-limit')
const cookieParser = require("cookie-parser");
const helmet = require('helmet');

const port =process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());



app.use('/api/auth', authRouter);
app.use('/api/user', homeRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})