import express from 'express';
import MobileApiController from '../controllers/mobileApiController';
import AuthController from '../controllers/authController';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const router = express.Router();

/** @function */
/** Check if the user is already logged in. */
function authenticated (req, res, next) {
	var token = req.body.authenticationObject.token;

	jwt.verify(token, config.secret, function(err, decoded) {
    	if (!err) {
    		return next();
    	}
    	else {
    		res.status(200).send({ error: "TOKEN_EXPIRED" });
    	}
	});
};

router.get('/api/v1/auth/login', AuthController.login);
router.get('/api/v1/mobileapi/getProfile', authenticated, MobileApiController.getProfile);

export default router;