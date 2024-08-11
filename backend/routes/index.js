const express = require('express');
const userRoute = require('./user')

const router = express.router();
router.use('/user', userRoute)

module.exports = router; 