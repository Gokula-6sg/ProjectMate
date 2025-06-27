const prisma = require("../utils/prismaClient");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const resend = require('resend');
const crypto = require('crypto');
const {Resend} = require("resend");




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
            userid: user.id,
            username: user.username,

        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
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
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/'
        })
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })

    } catch (err) {
        res.status(500).json({
            sucess: false,
            message: "Login first"
        })
    }
}


    // if user forget password

    const forgotPassword = async (req, res) => {
        const {email} = req.body;
        const resend = new Resend(process.env.RESEND_KEY);
        try {

            const user = await prisma.user.findUnique({where: {email}})
            if (!user) {
                return res.status(400).json({error: "Invalid user"})
            }

            const token = crypto.randomBytes(32).toString("hex")
            const expiresAt = new Date(Date.now() + 1000 * 60 * 15)

            await prisma.passwordResetToken.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt
                }
            })

            const resetlink = `http://localhost:3000/auth/reset-password/${token}`

            await resend.emails.send({
                from: 'ProjectMate <onboarding@resend.dev>',
                to: email,
                subject: 'Reset Password MAIL',
                html: `<p>Click <a href="${resetlink}">here</a> to reset your password. Link expires in 15 minutes.</p>`
            })
            return res.status(200).json({
                success: true,
                message:"Reset link is send to ur email"
            })
        }catch (err){
            console.log(err)
            res.status(500).json({
                sucess: false,
                message: "Some error occured"
            })
        }
    }

    const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try{
        const tokDoc = await prisma.passwordResetToken.findUnique({
            where: {token},
            include: {user:true}
        })

        if(!tokDoc || new Date() > tokDoc.expiresAt){
            return res.status(401).json({
                sucess: false,
                message: "Password reset expired"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hased = await bcrypt.hash(password,salt);

        await prisma.user.update({
            where: { id: tokDoc.userId},
            data: { password : hased}

        })

        await prisma.passwordResetToken.delete({
            where: {token},

        })

        return res.status(200).json({
            success: true,
            message:"Successfully reset password"
        })



    }catch(err){
        console.log(err);
        res.status(500).json({

            sucess: false,
            message: "Some error occured"

        })
    }

    }




module.exports = { registerUser, loginUser , logoutUser, forgotPassword,resetPassword }