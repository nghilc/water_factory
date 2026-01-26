const LocalStrategy = require('passport-local').Strategy;
const bcrypt =require('bcrypt');
const { authenticate } = require('passport');
const {access_db} = require("./mysql_config");


function initialize(passport){
    var authenticateUser = async (req, username, password, done) => {
        // validate username và password
        try {
            if(!username){
                return done(null, false,  req.__("thiếu trường dữ liệu"))
            }else if(!password){
                return done(null, false, req.__("thiếu trường dữ liệu"))
            }
            // tìm kiếm theo username
            console.log(req.body.remember)
            const user = await access_db("SELECT * FROM users WHERE user_name = ? AND status = ?;",[username, 1]);1
            if (user.length == 0) return done(null, false, "Tên đăng nhập hoặc mật khẩu sai");
            if(bcrypt.compareSync(password, user[0].password)){
                if (req.body.remember) {
                    console.log("remember")
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
                } else {
                    console.log("no remember")

                    req.session.cookie.expires = false; // Cookie expires at end of session
                }
                return done(null, user[0]);
            }else{
                return done(null, false, {message: 'Tên đăng nhập hoặc mật khẩu sai'})
            }
        }catch(error){
            console.error('Lỗi xác thực: ',error);
            return done(error)
        }

        
    }
    passport.use('local-signin',new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback:true}, authenticateUser));
    // lấy id lưu vào session
    passport.serializeUser((user, done) =>{done(null, user.id)} )
    // lấy thông tin người dùng từ db dựa vào id đã lưu trong session
    passport.deserializeUser(async (id, done) =>{
        try {
            let user = await access_db("SELECT * FROM users WHERE id = ?",[id]);            
            done(null, user[0]);
        } catch (error){
            done(error, null)
        }
    });
}


module.exports = initialize;