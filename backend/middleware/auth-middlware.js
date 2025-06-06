const jwt = require('jsonwebtoken')



const authmiddleware = (req, res, next) => {
    const authheader = req.headers['authorization'];
    let token = authheader && authheader.split(' ')[1];

    if(!token && req.cookies){
        token = req.cookies.token
    }


    if(!token){
        return res.status(401).json({
            success: false,
            message:"No token"
        })
    }


    //deode the token

    try{
        const decodetoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodetoken);

        req.user = decodetoken;
        next()



    }catch(error){
        return res.status(401).json({
            success: false,
            message: "NO token provided"
        })
    }
}


module.exports = authmiddleware