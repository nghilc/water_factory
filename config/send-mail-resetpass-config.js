var accessDB = require('./mysql-config');
const nodemailer =  require('nodemailer');
var bcrypt = require('bcrypt');
var saltRounds = 10;

var email = require("./emai-config");

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function sendmail(req,emailsend,res,usr){
  let newpass = makeid(8);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email.user,
          pass: email.pass
        }
      });
      
      var mailOptions = {
        from: email.user,
        to: emailsend,
        subject: '[Sao Việt] Reset pass',
        text: 'Your password has been reset by '+ usr +'. Your new password is: '+ newpass,
      };
      let hasspass = bcrypt.hashSync(newpass, saltRounds);
      console.log(hasspass);
      accessDB("UPDATE users SET password = ? WHERE email = ?",[hasspass,emailsend],function(result){
        console.log(result);
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.send("Err: "+ error);
            res.end();
          } else {
            console.log('Email sent: ' + info.response);
            if(req.session.lang){
              if(req.session.lang == "en"){
                res.send("Reset password success.")
              }else{
                res.send("reset mật khẩu thành công.")
              }
            }else{
              res.send("Reset password success.")
            }
            res.end();
          }
        })
      })
      
      // transporter.sendMail(mailOptions, function(error, info){
      //   if (error) {
      //     console.log(error);
      //     res.send("Err: "+ error);
      //     res.end();
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //     res.send("reset pass success.")
      //     res.end();
      //   }
      // });
}

module.exports = sendmail