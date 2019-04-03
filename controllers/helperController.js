/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import admin from 'firebase-admin';
import serviceAccount from '../config/serviceAccountKey.json';

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
   * @param {List<obj>} umiData - Use umiData.unique_messaging_id to get int value
   * @param message - Body of notification to be sent
   */
	sendPushNotification(umiData, message) {
		try {
			admin.initializeApp({
				  credential: admin.credential.cert(serviceAccount),
				  databaseURL: ""
				});
		}
		catch (ex) {
		}

		var registrationTokens = [];
		umiData.forEach(function(item) {
			registrationTokens.push(item.unique_messaging_id);
		});
		

		var payload = {
			notification: {
				title: "You have new Message",
				body: message,
				sound: "default"
			}
		};

		var options = {
			priority: "high",
			timeToLive: 60 * 60 *24
		};

		admin.messaging().sendToDevice(registrationTokens, payload, options)
		.then(function(response) {
		})
		.catch(function(error) {
			console.log("Error sending message:", error);
		});
  }
}

const helperController = new HelperController();
export default helperController;

