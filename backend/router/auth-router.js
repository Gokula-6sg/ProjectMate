const express = require('express');
const router = express.Router();
const {registerUser , loginUser, logoutUser, forgotPassword, resetPassword} = require('../controller/auth-controller');
const ratelimit = require("express-rate-limit");
const {RequestHandler} = require('express');


const loginlimiter= ratelimit({
    windowMs: 15*60*1000,
    max: 3,
    message: "Too many requests",
})



router.post('/register',  registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);



module.exports = router;