/* eslint-disable class-methods-use-this */
import dbConnection from '../db/db';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import crypto from 'crypto';

/** Class handling mobile api. */
class MobileApiController {

  /**
   * GET - Login and get an authentication token.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {object} data - A data packet that can contain different form of objects
   * @return {string} data.token - A generated authentication token
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

        res.status(200).send({ success: true, data: token });
      }
      else {
        res.status(200).send({ success: false });
      }
    });
  }

  /**
   * GET - Return staff/student profile information.
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
   * PUT - Update staff/student profile information.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @param {string} name - New Name of the user
   * @param {int} age - New Age of the user
   * @param {string} email - New Email of the user
   * @param {string} ic_number - New IC Number of the user
   * @param {string} telephone_number - New Telephone Number of the user
   * @param {string} [password] - New Password of the user
   * @return {boolean} success - Indicate succesful action
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
   * GET - Get the list of lessons for a specified date range
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
   * GET - Get the details of a lesson
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {List<object>} data - A data packet that can contain different form of objects
   * @return {Date} data.date_time - Date and time of the lesson
   * @return {string} data.subject_name - Name of the subject to be taught in the lesson
   * @return {string} data.staff_name - Name of the staff teaching the lesson
   * @return {string} [data.student_name] - Name of the student assigned to the lesson if user is staff
   * @return {int} data.attended - Indicates whether the student attended the class
   */
  getLesson(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    //IF(att.attended=1, 1, 0) is required for mysql because boolean is stored as bit
    if (authObject.userType == "student") {
      sql = "select l.date_time, s.subject_name, stf.name as staff_name, IF(att.attended=1, 1, 0) as attended from lesson l";
      sql += " left join subject s on l.subject_id=s.id";
      sql += " left join staff stf on l.staff_id=stf.id";
      sql += " left join lesson_attendance att on l.id = att.lesson_id";
      sql += " left join student std on att.student_id = std.id";
      sql += " WHERE l.id='" + data.lessonId + "' AND std.student_id='" + authObject.userId + "'";
    }
    else if (authObject.userType == "staff") {
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

  /**
   * GET - Return list of subject and attendance percentage for each subject if user is student. Return list of subject, with a list of student and their attendance percentage for each subjct if user is staff.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {List<object>} data - A data packet that can contain different form of objects
   * @return {string} data.subject_name - Name of the subject taken
   * @return {string} data.student_name - Name of the student taking the subject if user is staff
   * @return {double} data.attendance_percentage - Percentage of attendance for given subject
   */
  getSubjectAttendance(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    if (authObject.userType == "student") {
      sql = "select sbj.subject_name, SUM(att.attended)/count(att.attended)*100 as attendance_percentage from student s";
      sql += " left join lesson_attendance att ON s.id = att.student_id";
      sql += " left join lesson l ON att.lesson_id=l.id";
      sql += " left join subject sbj ON l.subject_id=sbj.id";
      sql += " left join staff stf ON l.staff_id=stf.id";
      sql += " WHERE s.student_id='" + authObject.userId + "'";
      sql += " GROUP BY sbj.subject_name";
    }
    else if (authObject.userType == "staff") {
      sql = "select sbj.subject_name, s.name as student_name, SUM(att.attended)/count(att.attended)*100 as attendance_percentage from student s";
      sql += " left join lesson_attendance att ON s.id = att.student_id";
      sql += " left join lesson l ON att.lesson_id=l.id";
      sql += " left join subject sbj ON l.subject_id=sbj.id";
      sql += " left join staff stf ON l.staff_id=stf.id";
      sql += " WHERE stf.staff_id='" + authObject.userId + "'";
      sql += " GROUP BY sbj.subject_name, s.id, s.name";
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

  /**
   * PUT - Generate random 64 bit key for a lesson. If already generated before, return the previously generated string.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {object} data - A data packet that can contain different form of objects
   * @return {string} data.qr_key_string - The generated qr key string
   */
  generateLessonAttendanceQrCode(req, res) {

    crypto.randomBytes(64, function(err, buffer) {
      var token = buffer.toString('hex');

      var sql = "";
      var data = req.body;
      var authObject = data.authenticationObject;

      sql = "UPDATE lesson SET qr_key_string='" + token + "' WHERE id=" + data.lesson_id + " AND (qr_key_string IS NULL OR qr_key_string = '');";
      sql += " SELECT qr_key_string FROM lesson WHERE id=" + data.lesson_id;

      dbConnection.query(sql, function (err, result) {
        if (err) {
          res.status(200).send({ success: false });
          throw err;
        }
        else {
          res.status(200).send({ success: true, data: result[1][0] });
        }
      });
    })
  }

  /**
   * PUT - Mark the lesson attedance of given student if qr_key_string matched. Return error if user does not belong to lesson.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {string} [error] - Indicate user is not in the given class
   */
  updateLessonAttendance(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    sql = "UPDATE lesson_attendance att";
    sql += " left join lesson l on att.lesson_id=l.id";
    sql += " left join student s on s.id = att.student_id";
    sql += " SET att.attended = 1";
    sql += " WHERE s.student_id='" + authObject.userId + "' AND l.qr_key_string='" + data.qr_key_string + "'";

    dbConnection.query(sql, function (err, result) {
      
      if (err) {
        res.status(200).send({ success: false });
        throw err;
      }
      else {
        if (!result.affectedRows) {
          res.status(200).send({ success: false, error: "Student does not belong in class" });
        }
        else {
          res.status(200).send({ success: true });
        }
      }
    });
  }

  /**
   * GET - Get the list of notification related to user.
   * @param {AuthenticationObject} authenticationObject - Consist of userId and userType, all in string type
   * @return {boolean} success - Indicate succesful action
   * @return {object} List<data> - A data packet that can contain different form of objects
   * @return {string} data.date_time - Date and time of when the notification created
   * @return {string} data.sender_name - Name of the staff who created the notification
   * @return {string} data.message - Message of the notification
   */
  getNotifiationList(req, res) {
    var sql = "";
    var data = req.body;
    var authObject = data.authenticationObject;

    if (authObject.userType == "student") {
      sql = "select date_time, s.name as sender_name, message from notification n";
      sql += " left join staff s ON s.id = n.sender_id";
      sql += " left join student std ON std.id = n.student_id";
      sql += " WHERE std.student_id='" + authObject.userId + "'";
    }
    else if (authObject.userType == "staff") {
      sql = "select date_time, s.name as sender_name, message from notification n";
      sql += " left join staff s ON s.id = n.sender_id";
      sql += " WHERE s.staff_id='" + authObject.userId + "'";
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