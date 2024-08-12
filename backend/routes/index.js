const express = require('express');
const userRoute = require('./user')
const accountRouter = require('./acounts');

const router = express.Router();
router.use('/user', userRoute);
router.use('/account', accountRouter);

module.exports = router; 