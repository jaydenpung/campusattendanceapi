/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';
import jwt from 'jsonwebtoken';
import config from '../config/config';

/** An utility class providing some functionality. */
class HelperController {

  /**
   * Check if the user is already logged in.
   */
  authenticated(req, res, next) {
    var token = req.body.authenticationObject.token;

		jwt.verify(token, config.secret, function(err, decoded) {
    	if (!err) {
    		return next();
    	}
    	else {
    		res.status(200).send({ error: "TOKEN_EXPIRED" });
    	}
   	});
	}

}

const helperController = new HelperController();
export default helperController;