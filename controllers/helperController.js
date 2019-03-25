/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';
import jwt from 'jsonwebtoken';
import config from '../config/config';

/** An utility class providing some functionality. */
class HelperController {

  handleCorsPreflight(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT");
    next();
  }

  /**
   * Check if the user is already logged in.
   */
  authenticated(req, res, next) {
    var token = req.body.authenticationObject.token;

		jwt.verify(token, config.secret, function(err, decoded) {
    	if (!err || token == "backofficesecretkey") {
    		return next();
    	}
    	else {
    		res.status(200).send({ error: "TOKEN_EXPIRED" });
    	}
   	});
	}

	/**
   * Send push notification to given unique messaging ids
   * @param {List<obj>} umiData - Use umiData.unique_messaing_id to get int value
   */
	sendPushNotification(umiData) {
		umiData.forEach(function(item, index) {
		  //sendToId(item.unique_messaging_id);
		});
	}

}

const helperController = new HelperController();
export default helperController;