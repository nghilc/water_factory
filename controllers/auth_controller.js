const passport = require('passport');
const nodemailer =  require('nodemailer');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { access_db, query } = require("../config/mysql_config");
var saltRounds = 10;

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const auth_controller = {
    // hiển thị trang đăng nhập
    showLogin: (req, res) => {
        try{
            res.clearCookie('tram_id');
            res.clearCookie('dv_type');
            res.render('auth/login', {
                message: req.flash(),
                t: req.__ 
            })
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }

    },
    // Xử lý đăng nhập
    login: (req,res,next) => {
        try{
            if (!req.body.username) {
                req.flash('error', req.__("Tên đăng nhập không được để trống"));
                return res.redirect('/login');
            }
            if (!req.body.password) {
                req.flash('error', req.__("Mật khẩu không được để trống"));
                return res.redirect('/login');
            }
            passport.authenticate('local-signin',{failureRedirect: '/login',
                // successRedirect: '/dashboard',        // 
                failureFlash: true,
              }, (err, user, info) => {
                if (err) return next(err);
                if (!user){
                    req.flash('error', info.message || 'Tên đăng nhập hoặc mật khẩu sai');
                    return res.redirect('/login');
                } 
                req.logIn(user, (err) => {
                    if (err) return next(err);
                    
                    // Ánh xạ menu_option sang URL
                    const menuOptionMap = ["/dashboard","/overview","/monitoring"];
                    // let redirectUrl;
                    //     switch(user.menu_option){
                    //         case "1": 
                    //         case 1: redirectUrl = "/dashboard"; break;
                    //         case "2":
                    //         case 2: redirectUrl = "/overview"; break;
                    //         case "3":
                    //         case 3: redirectUrl = "/monitoring"; break;
                    //         case "5":
                    //         case 5: redirectUrl = "/terminal_index"; break;
                    //         case "4":
                    //         case 4: 
                    //          switch(user.last_menu_link){
                    //             case "1": 
                    //             case 1: redirectUrl = "/dashboard"; break;
                    //             case "2":
                    //             case 2: redirectUrl = "/overview"; break;
                    //             case "3":
                    //             case 3: redirectUrl = "/monitoring"; break;
                    //              case "5":
                    //              case 5: redirectUrl = "/terminal_index"; break;
                    //          }
                    //             break;

                    //     }
                    return res.redirect("/dashboard");
                  });
              })(req, res, next);
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    // lấy ngôn ngữ cho client
    get_lang: (req,res,next) =>{
        try{
            let data = {
                lang: "vi",
                role: req.user.role,
                access_menu: req.user.access_tab
              }
              if(req.cookies.lang){
                data.lang = req.cookies.lang;
              }
              res.json(data);
              res.end();
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }

    },
    logout: (req,res,next) =>{
        try{
            req.logout(function(err) {
                if (err) { return next(err); }
                req.session.destroy();
                res.clearCookie('tram_id');
                res.clearCookie('dv_type');
                res.redirect('/login');
                res.end();
              });
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }

    },

    show_forgot_password: (req, res, next) =>{
        try{
            res.render('auth/forgot_password', {
                message: req.flash(),
                t: req.__ 
            })
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_forgot_password: async (req, res, next) =>{
        try{
            let email = req.body.mail;
            if(!isValidEmail(email)){
                req.flash("error", "Sai định dạng email");
                return res.redirect("/forgot_password");
            }
            let result = await access_db("SELECT * FROM users WHERE email = ?;",[email]);
            if(result.length == 0){
                req.flash("error", "Email không có trong hệ thống");
                return res.redirect("/forgot_password");
            }else{

                let user_id = result[0].id;
                const token = jwt.sign({ user_id }, 'mySecret', { expiresIn: '10m' }); 

                await access_db("UPDATE users SET forgot_pass_token = ? WHERE id = ?", [token, user_id]);
                const resetUrl = `https://quawaco.saovietgroup.com.vn/reset-password?token=`+token+`&user_id=`+user_id;


                var transporter = nodemailer.createTransport({
                    host: config.email.host,
                    port: config.email.port,
                    auth: {
                    user: config.email.user,
                    pass: config.email.pass,
                    }
                });

                var mailOptions = {
                    from: config.email.user,
                    to: email,
                    subject: '[Sao Việt] Đổi mật Khẩu',
                    text: 'Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu. Liên kết có hiệu lực trong 10 phút kể từ thời điểm nhận email: ' + resetUrl,
                  };


                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    req.flash("error", "Lỗi server!");
                    return res.redirect("/forgot_password");
                    } else {
                    req.flash("success", "Thông tin đổi mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra email");
                    return res.redirect("/login");
                    }
                });

                    // req.flash("success", "Thông tin đổi mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra email");
                    // return res.redirect(`/reset-password?token=`+token+`&user_id=`+user_id);
                    // console.log(`/reset-password?token=`+token+`&user_id=`+user_id)

            }

        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_reset_password: async (req, res, next) =>{
        try{
            if(req.query.token && req.query.user_id){
                token = req.query.token;
                user_id = req.query.user_id;
                const decoded = jwt.verify(token, 'mySecret');

                if (decoded.user_id != user_id) {
                    return res.status(400).send('Token không hợp lệ.');
                }
                const tokenInDb = await access_db("SELECT * FROM users WHERE id = ? AND forgot_pass_token = ?", [user_id, token]);

                if (tokenInDb.length === 0) {
                    return res.status(400).send('Token không tồn tại hoặc đã hết hạn.');
                }

                res.render('auth/change-password', { 
                    message: req.flash(),
                    user_id 
                });


            }else{
                return res.json({ 
                    success: false,
                    message: "Token và user_id không hợp lệ" 
                  });
            }
        }catch(error){
            if(error){
                if (error.name === 'TokenExpiredError') {
                    req.flash('error', req.__("Liên kết đổi mật khẩu hết hạn."));
                    return res.redirect('/login');
                }
            }

            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_reset_password: async (req, res, next) =>{
        try{
            if(req.body.password === undefined || req.body.password === null || req.body.password.toString().trim() === ""){
                req.flash('error', req.__("Mật khẩu không được để trống"));
                const referer = req.get('referer')
                if (referer) {
                    // Tạo URL mới với query string nếu cần thiết
                    let url = new URL(referer);
                    // Redirect về trang cũ với query string đã được xử lý
                    return res.redirect(url.toString());
                }
                return res.redirect('/');
            }

            if(req.body.confirm_password === undefined || req.body.confirm_password === null || req.body.confirm_password.toString().trim() === ""){
                req.flash('error', req.__("Xác nhận mật khẩu không được để trống"));
                const referer = req.get('referer')
                if (referer) {
                    // Tạo URL mới với query string nếu cần thiết
                    let url = new URL(referer);
                    // Redirect về trang cũ với query string đã được xử lý
                    return res.redirect(url.toString());
                }
                return res.redirect('/');
            }
            let user_id = req.body.user_id;
            let password = req.body.password;
            let confirm_password = req.body.confirm_password;

            if(password != confirm_password){
                req.flash('error', req.__("Xác nhận mật khẩu không chính xác"));
                const referer = req.get('referer')
                if (referer) {
                    // Tạo URL mới với query string nếu cần thiết
                    let url = new URL(referer);
                    // Redirect về trang cũ với query string đã được xử lý
                    return res.redirect(url.toString());
                }
                return res.redirect('/');
            }

            if(/\s/.test(password)){
                req.flash('error', req.__("Mật khẩu không được chứa khoảng trắng"));
                const referer = req.get('referer')
                if (referer) {
                    // Tạo URL mới với query string nếu cần thiết
                    let url = new URL(referer);
                    // Redirect về trang cũ với query string đã được xử lý
                    return res.redirect(url.toString());
                }
                return res.redirect('/');
            }


            if(password.length < 8){
                req.flash('error', req.__("Độ dài mật khẩu phải lớn hơn hoặc bằng 8 ký tự"));
                const referer = req.get('referer')
                if (referer) {
                    // Tạo URL mới với query string nếu cần thiết
                    let url = new URL(referer);
                    // Redirect về trang cũ với query string đã được xử lý
                    return res.redirect(url.toString());
                }
                return res.redirect('/');
            }

            let new_password_bcrypt = bcrypt.hashSync(password, saltRounds);
            let row = await access_db("UPDATE users SET password = ? WHERE id = ?;", [new_password_bcrypt, user_id]);
            if(row.affectedRows > 0){
                req.flash('success', req.__("Đổi mật khẩu thành công"));
                return res.redirect('/login');
            }else{
                req.flash('error', req.__("Đổi mật khẩu thất bại"));
                return res.redirect('/login');
            }


        }catch(error){
            console.error('API auth error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

}


module.exports = auth_controller;

