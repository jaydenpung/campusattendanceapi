var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "",
  password: "",
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  con.query("Use campusattendance", function (err, result) {
    if (err) throw err;
    console.log("DB Connected!");
  });
});

export default con;