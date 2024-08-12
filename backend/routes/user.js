const express = require('express');
const zod = require('zod');
const {User} = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require('../middleware');

const router = express.Router();

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
});

router.post('/signup', async (req, res) => {
    const parseResult = signupBody.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            msg: 'Invalid input',
            errors: parseResult.error.errors
        });
    }

    const existUser = await User.findOne({
        username: req.body.username
    });

    if (existUser) {
        return res.status(400).json({
            msg: "User already exists / Incorrect input."
        });
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const userId = user._id;

    await User.Account.create({
        userId: userId,
        balance: 1 + Math.random() * 1000
    });

    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    });
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

router.post('/signin', async (req, res) => {
    const parseResult = signinBody.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            msg: 'Invalid input',
            errors: parseResult.error.errors
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({
            token: token
        });
        return;
    }

    res.status(400).json({
        message: "Error while logging in"
    });
});

const updatedUser = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put('/user', authMiddleware, async (req, res) => {
    const parseResult = updatedUser.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            message: "Error while updating information",
            errors: parseResult.error.errors
        });
    }

    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Updated successfully"
    });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { "$regex": filter } },
            { lastName: { "$regex": filter } }
        ]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

module.exports = router;
