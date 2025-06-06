const express = require('express');
const router = express.Router();
const authmiddle = require('../middleware/auth-middlware')

router.get('/home', authmiddle, (req, res) => {
    res.json({
        "success": true,
        "message": "Welcome to mate!"
    })
})


module.exports = router;