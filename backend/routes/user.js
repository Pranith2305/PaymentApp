const express = require('express');
const zod = require('zod');
const User = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");

const router = express.router();

const signupBody = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

router.post('/signup', async(req, res)=>{
    const { success } = signupBody.safeParse(req.body);
    if (!success){
        return resizeBy.status(404).json({
            msg: 'user doesnot exists'
        })
    }
    const existUser = await User.findOne({
        username : req.body.username
    })
    if (existUser){
        return res.status(411).json({
            msg:"User already exists / Incorrect input."
        })
        
    }
    
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;
    const token = jwt.sign({userId}, JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    })
})

const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post('/signin', async(req, res) => {
    const {success} = signinBody.safeParse(req.body);
    if (!success){
        return res.status(404).json({
            msg : 'Email already taken / Incorrect inputs'
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });
    if(user){
       const token = jwt.sign({userId: user._id},JWT_SECRET);
       res.json({
        token: token
       })
       return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })

})



module.exports = router; 