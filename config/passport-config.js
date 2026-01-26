const LocalStrategy = require('passport-local').Strategy
const bcrypt =require('bcrypt')
const { authenticate } = require('passport');
var accessDB = require('./mysql-config');
var saltRounds = 10;

function validateEmail(email) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
var LANG ="en";
function translate_noti(str){
    if(LANG == "en"){
        return str;
    }else{
        switch(str){
            case "Username cannot be empty!":
            return "Tên đăng nhập không được để trống!";
            case "Password cannot be empty!":
            return "Mật khẩu không được để trống!" ;
            case 'Your username or password is incorrect' :
            return "Tên đăng nhập hoặc mật khẩu không chính xác";
            case "User Email cannot be empty!":
            return "Email không được để trống";
            case "Invalid email format!": 
            return "Sai định dạng email";
            case "Password must be at least 8 characters long!":
            return "Độ dài mật khẩu phải dài ít nhất 8 ký tự";
            case "Conrfirm Password cannot be empty!":
            return "Xác nhận mật khẩu không được để trống";
            case "The password and confirm password must be match!":
            return "Xác nhận mật khẩu không chính xác";
            case "Username already taken. Please try another!":
            return "Tên đăng nhập đã tồn tại!";
            case "Email already taken. Please try another!":
            return "Email đã được sử dụng";
        }
    }

}

function initialize(passport){
    var authenticateUser = (req, username, password, done) => {
        if(req.cookies.lang){
            LANG = req.cookies.lang
        }else{
            LANG = "en";
            // req.cookies.lang = "en";
            // res.cookie('lang', "en", { maxAge: 1000*60*60*24*30 });
        }
        if(username == ""){
            return done(null, false,{message: translate_noti("Username cannot be empty!")})
        }else if(password == ""){
            return done(null, false,{message:translate_noti("Password cannot be empty!")})
        }
        let sqlquery = " SELECT * FROM users WHERE user_name = ? AND status = ?"
        accessDB(sqlquery,[username,1],function(result){
            if(result.length == 0){
                        return done(null, false, {message: translate_noti('Your username or password is incorrect')})
                    }else{
                    try{
                        if(bcrypt.compareSync(password, result[0].password)){
                            // console.log("true");
                            if (req.body.remember) {
                                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
                                } else {
                                req.session.cookie.expires = false; // Cookie expires at end of session
                               }
                            return done(null, result[0])
                        }else{
                            return done(null, false, {message: translate_noti('Your username or password is incorrect')})
                        }
                    }catch (e) {
                        return done(e)
                    }
                }
        })
    }
    var registerAuthenticate = (req,username,password,done) =>{
        if(req.cookies.lang){
            LANG = req.cookies.lang
        }else{
            LANG = "en";
            // req.cookies.lang = "en";
            // res.cookie('lang', "en", { maxAge: 1000*60*60*24*30 });
        }
        if(username == ""){
            return done(null,false,{message:  translate_noti("Username cannot be empty!")});
        }
        else if(req.body.email == ""){
            return done(null,false,{message: translate_noti("User Email cannot be empty!")});
        }
        else if(!validateEmail(req.body.email)){
            return done(null,false,{message:  translate_noti("Invalid email format!")});
        }
        else if(password == ""){
            return done(null,false,{message:  translate_noti("Password cannot be empty!")});
        }
        else if(password.length < 8){
            return done(null,false,{message:  translate_noti("Password must be at least 8 characters long!")});
        }else if(req.body.password == ""){
            return done(null,false,{message:  translate_noti("Conrfirm Password cannot be empty!")});
        }
        else if(req.body.password != req.body.cfpassword){
            return done(null,false,{message:  translate_noti("The password and confirm password must be match!")});
        }else{
            accessDB("SELECT * FROM users WHERE user_name = ? OR email = ?",[username,req.body.email],function(result){
                if(result.length > 0){
                    if(result[0].user_name == username){
                        return done(null,false,{message:  translate_noti("Username already taken. Please try another!")})
                    }else if(result[0].email == req.body.email){
                        return done(null,false,{message:  translate_noti("Email already taken. Please try another!")})
                    }
                }else{
                    var x = bcrypt.hashSync(password, saltRounds);
                    accessDB("INSERT INTO users (user_name, email, password, role, status) VALUES (?,?,?,?,?)",[username,req.body.email,x,"sub",1],function(result){
                        console.log(result);
                        accessDB("SELECT * FROM users WHERE user_name = ? AND status = ?",[username,1],function(result2){
                            if(result2.length > 0){
                                return done(null, result2[0]);
                            }else{
                                return done(null,false,{message:  translate_noti("Register fail, please try again!")})
                            }
                        })
                    })
                }
            })
        }
    }
    passport.use('local-signin',new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback:true}, authenticateUser));

    passport.use("local-signup", new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback:true},registerAuthenticate)); 

    passport.serializeUser((user, done) =>{done(null, user.id)} )
    passport.deserializeUser((id, done) =>{
        accessDB(" SELECT * FROM users WHERE id = ?",[id], function( result){
            done(null, result[0]);
        });
    })
}
module.exports = initialize