/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';
import jwt from 'jsonwebtoken';
import config from '../config/config';

/** Class handling authentication. */
class AuthController {

  /**
   * Login and get an authentication token.
   */
  login(req, res) {
    var authObject = req.body.authenticationObject;
    var password = req.body.password;
    var sql;

    //check if user and password match
    if (authObject.userType == "student") {
      sql = "SELECT * FROM student WHERE student_id='" + authObject.userId + "' AND password=TO_BASE64('" + password +"')";
    }
    else if (authObject.userType == "staff") {
      sql = "SELECT * FROM staff WHERE staff_id='" + authObject.userId + "' AND password=TO_BASE64('" + password +"')";
    }

    dbConnection.query(sql, function (err, result) {
      if (err) throw err;

      if (result.length > 0) {
        //create token
        var token = jwt.sign({ id: authObject.userId }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ authenticated: true, token: token });
      }
      else {
        res.status(200).send({ authenticated: false });
      }
    });
  }
    
}

const authController = new AuthController();
export default authController;