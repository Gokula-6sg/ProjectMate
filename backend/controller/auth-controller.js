const prisma = require("../utils/prismaClient");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



//register endpint

const registerUser = async (req, res) => {
    try{
        const {username, password, email} = req.body

        //check the user is alreday exist or not

        const checkExist = await  prisma.user.findUnique({where: {email}})
        if(checkExist){
            return res.status(400).json({error: "User already exists"})
        }

        //hash user pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        //create a new user and save in db

        const newUsr = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })


        if(newUsr){
            return res.status(201).json({
                sucess: true,
                message:"Sucessfully created"
            })
        }
        else{
            return res.status(401).json({
                sucess: false,
                message:"Unable to register"
            })
        }


    }catch(err){
        console.log(err)
        res.status(500).json({
            sucess: false,
            message: "Some error occured"
        })
    }

}


//login endpoint  ---------------------------------

const loginUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;


        //find the user is in db
        const user = await  prisma.user.findUnique({where: {email}})
        if(!user){
            return res.status(400).json({error: "Invalid user"})
        }


        //if user present, check the pwd is crt or not

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(401).json({
                sucess: false,
                message: "Invalid pass"
            })
        }

        const token = jwt.sign({
            userid: user._id,
            username: user.username,

        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000,
            path: '/'
        })


        return res.status(200).json({
            success: true,
            message:"Logged in successfully",
            token
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            sucess: false,
            message: "Some error occured"
        })

    }

}

const logoutUser = async (req, res) => {
    try{
        res.clearCookie("token",{
            httpOnly: true,
            secure: false,
            path: '/'
        })
        return res.status(200).json({
            success: true,
            message:"Logged out successfully",
        })

    }catch(err){
        res.status(500).json({
            sucess: false,
            message: "Login first"
        })
    }
}

module.exports = { registerUser, loginUser , logoutUser }