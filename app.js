const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
var path = require('path');
const nodemailer = require("nodemailer");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});
const binary = require('mongodb').Binary;
const fs = require('fs');


const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(function verify(username, password, cb) {
  db.get('SELECT * FROM users WHERE username = ?', [username], function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb(null, false, {
        message: 'Incorrect username or password.'
      });
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) {
        return cb(err);
      }
      if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
        return cb(null, false, {
          message: 'Incorrect username or password.'
        });
      }
      return cb(null, user);
    });
  });
}));

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID1,
    pass: process.env.MAIL_PASSWORD
  }
});

mongoose.set('strictQuery', true);
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
let id = "";
let fname = "";
let lname = "";
let mail_id = "";
let data = "";
let rid = "";
let image_data = "";
let application_number = "";
let reason = "";
let dob = "";
let address = "";
 mongoose.connect(process.env.MONGO);
//mongoose.connect("mongodb://localhost:27017/voterDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const dataSchema = {
  firstName: String,
  lastName: String,
  fathersName: String,
  dob: Date,
  email: String,
  mob: Number,
  address: {
    house_no: String,
    locality: String,
    road_name: String,
    pincode: Number,
    district: String,
    state: String,
  },
  identity_type: String,
  identity_no: String,
  status: String,
  reason: String,
  pdf: Buffer,
  voterId: {
    name: String,
    data: Buffer
  }
  // {
  //   filename: {
  //     type: String,
  //     required: true
  //   },
  //   contentType: {
  //     type: String,
  //     required: true
  //   },
  //   length: {
  //     type: Number,
  //     required: true
  //   },
  //   data1: {
  //     type: Buffer,
  //     required: true
  //   }
  //
  // }

}
const pdfSchema = new mongoose.Schema({
    key : String,
    name: String,
    data: Buffer
  });
  const Pdf = mongoose.model('Pdf', pdfSchema);
const Data = mongoose.model('Data', dataSchema);
// app.use(function(req, res) {
//   res.status(404).send('its a 404 try to enter right URL bro!');
// })


app.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.render("index-new");
  }
});
app.get("/index", function(req, res) {
  res.render("index", {

  });
});

app.get("/apply", function(req, res) {
  if (req.isAuthenticated()) {
    res.render('apply');
  } else {
    res.redirect('/login');
  }
});

app.get("/login", function(req, res) {
  res.render("login", {

  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

app.post("/apply", upload.single('upload_document'), function(req, res) {


  const buffer = new Buffer(req.file.buffer, 'binary');

  data = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    fathersName: req.body.fathersName,
    dob: req.body.dob,
    email: req.body.email,
    mob: req.body.mob,
    address: {
      house_no: req.body.address_house,
      locality: req.body.address_locality,
      road_name: req.body.address_road,
      pincode: req.body.address_pincode,
      district: req.body.district,
      state: req.body.state,

    },
    identity_type: req.body.id_type,
    identity_no: req.body.id_number,
    status: "In process",
    reason: "",
    pdf: req.file.buffer,
    voterId: {
      name: "",
      data: ""
    }
    //{
    //   filename: req.file.originalname,
    //   contentType: req.file.mimetype,
    //   length: req.file.size,
    //   data1: buffer
    //
    // }
  };
  res.redirect("/about");
});
// new Data()
function imageFilter(req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}

app.get("/about", function(req, res) {
  res.render("about", {
    //id : id,
    data: data
  });
});

app.post("/about", function(req, res) {

  data = new Data({
    firstName: data.firstName,
    lastName: data.lastName,
    fathersName: data.fathersName,
    dob: data.dob,
    email: data.email,
    mob: data.mob,
    address: {
      house_no: data.address.house_no,
      locality: data.address.locality,
      road_name: data.address.road_name,
      pincode: data.address.pincode,
      district: data.address.district,
      state: data.address.state,

    },
    identity_type: data.identity_type,
    identity_no: data.identity_no,
    status: "In process",
    reason: "",
    pdf: data.pdf,
    voterId: {
      name: "",
      data: "Buffer"
    }
  });
  data.save(function saving(err) {

    if (!err) {
      rid = data._id.toString().replace(/[^a-z0-9]/g, '');

      fname = data.firstName;
      lname = data.lastName;
      mail_id = data.email;
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_ID1,
          pass: process.env.MAIL_PASSWORD
          // user: "${process.env.MAIL_ID1}!",
          // pass: "${process.env.MAIL_PASSWORD}!"
        }
      });

      var mailOptions = {
        from: '"Votar Portal" <process.env.MAIL_ID1>',
        to: mail_id,
        subject: 'Application submitted',
        text: '' + '' + rid + ' .',
        html: '<h3>Dear ' + fname + ' ' + lname + ',</h3><br>Your application is submitted successfully.Currently its in process of verification.It`s your aplication id , save it for further enquiries : ' + '<h3 style="color:red">' + rid + '</h3>'
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  });

  res.redirect("/application");

});

app.get("/application", function(req, res) {
  Data.find({}, function(err, datas) {
    res.render("application", {
      id: rid,
      data: datas
    });
  });

});
app.get('/view-pdf', (req, res) => {

  Data.findById(req.query.id, function(err, data) {
    if (data) {
      res.contentType("image/jpeg");
      res.send(data.pdf);
    } else {
      res.send("User not found");
    }
  });

});
app.get('/view-pdf1', (req, res) => {

  Pdf.findOne({ key: req.query.id}, (err, pdf) => {
    if (err) throw err;
    res.set("Content-Type", "application/pdf");
    res.set(
      "Content-Disposition",
      'attachment; filename="' + pdf.name + '"'
    );
    res.send(pdf.data);
  });

});

app.get("/verify", function(req, res) {

  Data.find({}, function(err, datas) {
    res.render("verify", {
      id: id,
      data: datas
    });
  });
});

app.post("/verify/:ApplicationId", function(req, res) {
  const requestedApplicationId = (req.params.ApplicationId);
  Data.updateOne({
    _id: requestedApplicationId
  }, {
    reason: req.body.reason
  }, function(err) {
    if (!err) {
      res.redirect("/verify");
    }
  });
});
app.get("/status2/:id", function(req, res) {
  Data.find({}, function(err, datas) {

    res.render("status", {
      id: req.params.id,

    });
  });
});

app.post('/change-image/:id', upload.single('image'), (req, res) => {
  if (req.file) {
    Data.findById(req.params.id, (err, user) => {
      if (err) {
        res.send(err);
      } else {
        user.pdf = req.file.buffer;
        user.status = "In process";
        user.reason = "";
        user.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/status2/' + req.params.id);
          }
        });
      }
    });
  } else {
    res.send("Please select a file to upload")
  }
});


app.get("/approved", function(req, res) {

  Data.find({}, function(err, datas) {
    res.render("approved", {
      id: id,
      data: datas
    });
  });


});
app.get("/disapproved", function(req, res) {

  Data.find({}, function(err, datas) {
    res.render("disapproved", {
      id: id,
      data: datas
    });
  });
});

app.get("/check1", function(req, res) {

  Data.find({}, function(err, datas) {
    res.render("check1", {
      id: id,
      data: datas
    });
  });
});

app.get("/approve/:ApplicationId", function(req, res) {
  const requestedApplicationId = (req.params.ApplicationId);
  Data.updateOne({
    _id: requestedApplicationId
  }, {
    status: "Approved"
  }, function(err) {
    if (!err) {


      Data.findById(requestedApplicationId, function(err, data) {
        if(err){
          console.log(err);
        }else{
        fname = data.firstName;
        lname = data.lastName;
        dob = data.dob;
        mail_id = data.email;
      }

      });

      var mailOptions = {
        from: '"Votar Portal" <process.env.MAIL_ID1>',
        to: mail_id,
        subject: 'Application Approved',
        text: '' + '' + requestedApplicationId + ' .',
        html: '<h3>Dear ' + fname + ' ' + lname + ',</h3><br>Your application is ' + '<h3 style="color:red">' + "Approved" + '</h3>' + " and you can download it from website using given application id" + '<br><h3 style="color:red">' + requestedApplicationId + "<h3>" + "<h3>Download it from given link</h3>" + "<br>http://localhost:3012/status2/" + requestedApplicationId + ""
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      ////////////////PDF////////////////////////////
      const doc = new PDFDocument();
      Data.findById(requestedApplicationId, function(err, data) {
        if(err){
          console.log(err);
        }else{
        fname = data.firstName;
        lname = data.lastName;
        dob = data.dob;
      }
      });
      doc

        .fontSize(25)
        .text('First Name : ')
        .text(fname);
        doc
        .text('Last Name : ')
        .text(lname);

      // doc.pipe(fs.createWriteStream(__dirname + '/VoterId.pdf'));
      doc.pipe(fs.createWriteStream('VoterId.pdf'));
      doc.end();
      fs.readFile('VoterId.pdf', (err, pdfBuffer) => {
        if (err) throw err;
        // Create a new pdf instance
        const newPdf = new Pdf({
          key : requestedApplicationId,
          name: 'VoterId.pdf',
          data: pdfBuffer
        });
        newPdf.save((err, pdf) => {
          if (err) throw err;
          //console.log('PDF saved to MongoDB');
        });
      });
      res.redirect("/verify");
    }
  });
});

app.get("/disapprove/:ApplicationId", function(req, res) {
  const requestedApplicationId = (req.params.ApplicationId);
  Data.updateOne({
    _id: requestedApplicationId
  }, {
    status: "Disapproved"
  }, function(err) {
    if (!err) {

      Data.find({
        _id: requestedApplicationId
      }, function(err, datas) {
        if(err){
          console.log(err);
        }else{
        fname = data.firstName;
        lname = data.lastName;
        dob = data.dob;
        mail_id = data.email;
      }



      });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_ID1,
          pass: process.env.MAIL_PASSWORD
        }
      });

      var mailOptions = {
        from: '"Votar Portal" <process.env.MAIL_ID1>',
        to: mail_id,
        subject: 'Application Rejected',
        text: '' + '' + requestedApplicationId + ' .',
        html: '<h3>Dear ' + fname + ' ' + lname + ',</h3><br>Your application is ' + '<h3 style="color:red">' + "Rejected" + '</h3>' + " upload supporting document on portal using given application id" + '<br><h3 style="color:red">' + requestedApplicationId + "<h3>" + "<h3>Upload from given link</h3>" + "<br>http://localhost:3012/status2/" + requestedApplicationId + ""
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }) ;

      res.redirect("/verify");
    }
  });

});

app.get("/status", function(req, res) {
  res.render("status", {
      id:""
  });
});
app.post("/status", function(req, res) {
  application_number = req.body.applicationNumber;
  res.redirect("/status2");
});
app.get("/status2", function(req, res) {

  Data.find({}, function(err, datas) {

    res.render("status2", {
      id: application_number,
      data: datas
    });
  });

});

app.get("/signup", function(req, res) {
  res.render("signup");
});


app.post("/signup", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/home");
      });
    }
  });
});

app.get("/home", function(req, res) {
  if (req.isAuthenticated()) {
    res.render('home');
  } else {
    res.redirect('/');
  }
});

app.post("/home", function(req, res) {
  res.redirect("index-new");
});
app.get("/news", function(req, res) {
  res.render("news");
});
app.get("/home", function(req, res) {
  res.render("home");
});



app.get("/aboutus", function(req, res) {
  res.render("aboutus");
});
app.post("/", function(req, res) {

  res.render("index-new");
});

app.get('/check23', function(req, res) {
  res.render("check23");
});

app.get('/edit', function(req, res) {
  res.render("edit", {
    data: data
  });
});









app.listen(3012, function() {
  console.log("Server started on port 3012");
});
