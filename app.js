const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
var path = require('path');

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
let id = "";
let application_number = "";
mongoose.connect('mongodb+srv://aditya:jpRuMoJrw5KdwIox@cluster0.x9qucfu.mongodb.net/voterDB');
const dataSchema = {
  firstName : String,
  lastName : String,
  fathersName : String,
  dob   : Date,
  email : String,
  mob : Number,
  address : {
    house_no : String,
    locality : String,
    road_name : String,
    pincode : Number,
    district : String,
    state : String,


  },
  identity_type : String,
  identity_no : String,
  status : String,
  reason : String
}
const Data = mongoose.model('Data',dataSchema);
// app.use(function(req, res) {
//   res.status(404).send('its a 404 try to enter right URL bro!');
// })


app.get("/",function(req,res){
  res.render("index",{

  });
});
app.get("/index",function(req,res){
  res.render("index",{

  });
});

app.get("/apply",function(req,res){
  res.render("apply",{

  });
});
app.post("/apply",function(req,res){
  //publishContent = req.body.postTitle;
  const data = new Data({
    firstName : req.body.fname,
    lastName : req.body.lname,
    fathersName : req.body.fathersName,
    dob   : req.body.dob,
    email : req.body.email,
    mob : req.body.mob,
    address : {
      house_no : req.body.address_house,
      locality : req.body.address_locality,
      road_name : req.body.address_road,
      pincode : req.body.address_pincode,
      district : req.body.district,
      state : req.body.state,

    },
    identity_type : req.body.id_type,
    identity_no : req.body.id_number,
    status : "In process",
    reason : ""
  });
  data.save(function(err){

   if (!err){
      id = data._id.toString().replace(/[^a-z0-9]/g, '');
     //const id = temp.toString().replace(/[^a-z0-9]/g, '');
     //const id1 = id.replace(/[^a-z0-9]/g, '');

     res.redirect("/about");

   }
   });


});
 app.get("/about",function(req,res){

   Data.find({}, function(err, datas){
     res.render("about", {
       id : id,
       data: datas
       });
   });


 });

 app.get("/verify",function(req,res){

   Data.find({}, function(err, datas){
     res.render("verify", {
        id : id,
       data: datas
       });
   });


 });

 app.get("/approved",function(req,res){

   Data.find({}, function(err, datas){
     res.render("approved", {
        id : id,
       data: datas
       });
   });


 });
 app.get("/disapproved",function(req,res){

   Data.find({}, function(err, datas){
     res.render("disapproved", {
        id : id,
       data: datas
       });
   });


 });


 app.get("/check1",function(req,res){

   Data.find({}, function(err, datas){
     res.render("check1", {
       id : id,
       data: datas
       });
   });
  });

  app.get("/approve/:ApplicationId",function(req,res){
      const requestedApplicationId = (req.params.ApplicationId);
      Data.updateOne({_id: requestedApplicationId},{status:"Approved"},function(err){
        if(!err){
          res.redirect("/verify");
        }
      });
  });
  // app.post("/disapprove/:ApplicationId",function(req,res){
  //     const requestedApplicationId = (req.params.ApplicationId);
  //     Data.updateOne({_id: requestedApplicationId},{reason:req.body.reason},function(err){
  //       if(!err){
  //         console.log("Done");
  //         res.redirect("/verify");
  //       }
  //     });
  //
  //
  // });
  app.get("/disapprove/:ApplicationId",function(req,res){
      const requestedApplicationId = (req.params.ApplicationId);
      Data.updateOne({_id: requestedApplicationId},{status:"Disapproved"},function(err){
        if(!err){
          res.redirect("/verify");
        }
      });
  });
  //res.redirect("/");


app.get("/status",function(req,res){
  res.render("status",{

  });
});
  app.post("/status",function(req,res){
  application_number = req.body.applicationNumber;
  res.redirect("/status2");
 });
 app.get("/status2",function(req,res){

     Data.find({}, function(err, datas){

       res.render("status2", {
           id : application_number,
           data:datas
         });
     });

 });

app.get("/signup",function(req,res){
  res.render("signup");
});
app.post("/home",function(req,res){
  res.redirect("home");
});
app.get("/news",function(req,res){
  res.render("news");
});
app.get("/home",function(req,res){
  res.render("home");
});
app.get("/application",function(req,res){
  res.render("application",{
    id : id
  });
});









  app.listen(3012, function() {
  console.log("Server started on port 3012");
});
