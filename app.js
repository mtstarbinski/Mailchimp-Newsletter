const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  // data grabbed from form
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  
  const options = {
    method: "POST",
    auth: process.env.MAILCHIMP_KEY
  };

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  var jsonData = JSON.stringify(data);

  const request = https.request(process.env.MAILCHIMP_URL, options, function(response) {

    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else if (response.statusCode === 400){
      res.sendFile(__dirname + "/failure.html")
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  });

  request.write(jsonData);
  request.end();

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started on port 3000...");
});
