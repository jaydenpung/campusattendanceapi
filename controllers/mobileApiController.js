/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';

/** Class handling profile. */
class MobileApiController {

  /**
   * Return staff/student profile information.
   * @param {AuthenticationObject} authenticationObject - Consist of userId, userType, and token, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {object} data - A data packet that can contain different form of objects
   * @return {string} [data.student_id] - Id of student if profile belongs to student
   * @return {string} [data.staff_id] - Id of staff if profile belongs to staff
   * @return {string} [data.staff_position] - Position title of staff if profile belongs to staff
   * @return {string} data.name - Name of the user
   * @return {int} data.age - Age of the user
   * @return {string} data.email - Email of the user
   * @return {string} data.ic_number - IC Number of the user
   * @return {string} data.telephone_number - Telephone Number of the user
   */
  getProfile(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    if (authObject.userType == "student") {
      sql = "SELECT student_id, name, address, age, email, ic_number, telephone_number FROM student WHERE student_id='" + authObject.userId + "';"
    }
    else if (authObject.userType == "staff") {
      sql = "SELECT staff_position, staff_id, name, address, age, email, ic_number, telephone_number FROM staff WHERE staff_id='" + authObject.userId + "';"
    }

    dbConnection.query(sql, function (err, result) {
      if (err) {
        res.status(200).send({ success: false });
        throw err;
      }
      else {
        res.status(200).send({ success: true, data: result[0] });
      }
    });
  }

   /**
   * Update staff/student profile information.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @param {string} name - New Name of the user
   * @param {int} age - New Age of the user
   * @param {string} email - New Email of the user
   * @param {string} ic_number - New IC Number of the user
   * @param {string} telephone_number - New Telephone Number of the user
   * @param {string} [password] - New Password of the user
   * @return {boolean} success - Indicate succesful action
   * @return {object} data - A data packet that can contain different form of objects
   */
  updateProfile(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    sql = "UPDATE";

    if (authObject.userType == "student") {
      sql += " student";
    }
    else if (authObject.userType == "staff") {
      sql += " staff";
    }

    sql += " SET name='" + data.name + "',";
    sql += " address='" + data.address + "',";
    sql += " age='" + data.age + "',";
    sql += " email='" + data.email + "',";
    sql += " ic_number='" + data.ic_number + "',";
    sql += " telephone_number='" + data.telephone_number + "'";

    if (data.password) {
      sql += " ,password=TO_BASE64('" + data.password + "')";
    }

    sql += " WHERE ";

    if (authObject.userType == "student") {
      sql += " student_id='" + authObject.userId + "';";
    }
    else if (authObject.userType == "staff") {
      sql += " staff_id='" + authObject.userId + "';";
    }

    dbConnection.query(sql, function (err, result) {
      if (err) {
        res.status(200).send({ success: false });
        throw err;
      }
      else {
        res.status(200).send({ success: true });
      }

    });
  }

  /**
   * Get the list of lessons for a specified date range
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @param {epoch} [dateTime] - Date filer to only show lessons for specified date
   * @return {boolean} success - Indicate succesful action
   * @return {List<object>} data - A data packet that can contain different form of objects
   * @return {string} data.lesson_id - Id of lesson
   * @return {Date} data.date_time - Date and time of lesson
   * @return {string} data.subject_name - Name of the subject to be taught in the lesson
   * @return {string} [data.staff_name] - Name of the staff teaching the lesson if user is student
   */
  getTimetable(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    if (authObject.userType == "student") {
      sql = "SELECT l.id as lesson_id, date_time, subject_name, s.name as staff_name FROM lesson l";
      sql += " left join staff s ON l.staff_id=s.id";
      sql += " left join lesson_attendance att ON l.id=att.lesson_id";
      sql += " left join student std ON att.student_id=std.id";
      sql += " left join subject sbj ON l.subject_id=sbj.id";
      sql += " WHERE std.student_id='" + authObject.userId + "'";
    }
    else if (authObject.userType == "staff") {
      sql = "SELECT l.id as lesson_id, date_time, subject_name FROM lesson l";
      sql += " left join staff s ON l.staff_id=s.id";
      sql += " left join subject sbj ON l.subject_id=sbj.id";
      sql += " WHERE s.staff_id='" + authObject.userId + "'";
    }

    //filter by date if given
    if (data.dateTime) {
      sql += " AND DATE(l.date_time)=DATE(FROM_UNIXTIME(" + data.dateTime + "))";
    }

    sql += " ORDER BY l.date_time;";

    dbConnection.query(sql, function (err, result) {
      if (err) {
        res.status(200).send({ success: false });
        throw err;
      }
      else {
        res.status(200).send({ success: true, data: result });
      }
    });
  }

  /**
   * Get the details of a lesson
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {List<object>} data - A data packet that can contain different form of objects
   * @return {Date} data.date_time - Date and time of the lesson
   * @return {string} data.subject_name - Name of the subject to be taught in the lesson
   * @return {string} data.staff_name - Name of the staff teaching the lesson
   * @return {string} [data.student_name] - Name of the student assigned to the lesson if user is staff
   * @return {int} [data.attended] - Indicates whether the student attended the class
   */
  getLesson(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    if (authObject.userType == "student") {
      sql = "select l.date_time, s.subject_name, stf.name as staff_name from lesson l";
      sql += " left join subject s on l.subject_id=s.id";
      sql += " left join staff stf on l.staff_id=stf.id";
      sql += " WHERE l.id='" + data.lessonId + "'";
    }
    else if (authObject.userType == "staff") {
      //IF(att.attended=1, 1, 0) is required for mysql because boolean is stored as bit
      sql = "select l.date_time, s.subject_name, stf.name as staff_name, std.name as student_name, IF(att.attended=1, 1, 0) as attended from lesson l";
      sql += " left join subject s on l.subject_id=s.id";
      sql += " left join staff stf on l.staff_id=stf.id";
      sql += " left join lesson_attendance att on l.id = att.lesson_id";
      sql += " left join student std on att.student_id = std.id";
      sql += " WHERE l.id='" + data.lessonId + "'";
    }

    dbConnection.query(sql, function (err, result) {
      if (err) {
        res.status(200).send({ success: false });
        throw err;
      }
      else {
        res.status(200).send({ success: true, data: result });
      }
    });
  }
}

const mobileApiController = new MobileApiController();
export default mobileApiController;