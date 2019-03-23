/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';

/** Class handling profile. */
class MobileApiController {

  /**
   * Return staff/student profile information.
   */
  getProfile(req, res) {
    var sql = "";
    var authObject = req.body.authenticationObject;

    if (authObject.userType == "student") {
      sql = "SELECT student_id, name, address, age, email, ic_number, telephone_number FROM student WHERE student_id='" + authObject.userId + "';"
    }
    else if (authObject.userType == "staff") {
      sql = "SELECT staff_position, staff_id, name, address, age, email, ic_number, telephone_number FROM staff WHERE staff_id='" + authObject.userId + "';"
    }

    dbConnection.query(sql, function (err, result) {
      if (err) throw err;
      
      if (result) {
        res.status(200).send({ profile: result });
      }

    });
  }
}

const mobileApiController = new MobileApiController();
export default mobileApiController;