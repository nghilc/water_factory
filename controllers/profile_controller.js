const { access_db, query } = require("../config/mysql_config");
function isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}
var saltRounds = 10;


const bcrypt =require('bcrypt');


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const profile_controller = {
    show_profile: async (req,res) => {
        let dvql = await access_db("SELECT t2.org_name, t1.donviquanly_id AS id, t1.popup_noti_status AS status FROM user_donviquanly t1 LEFT JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE t1.user_id = ? ORDER BY t2.org_name;",[req.user.id]);

        try{ 
            res.render('layouts/profile',{
                access_menu: req.user.access_tab,
                dvql: dvql,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/profile",
                username: req.user.user_name,
                mail: req.user.email,
                menu_option: req.user.menu_option,
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

    post_user_info: async (req,res) => {
        try{

            if(req.body.full_name === undefined || req.body.full_name === null || req.body.full_name.toString().trim() === ""){
                return res.json({ 
                    success: false,
                    message: 'Họ và tên không được để trống!' 
                  });
            }

            if(req.body.mail === undefined || req.body.mail === null || req.body.mail.toString().trim() === ""){
                return res.json({ 
                    success: false,
                    message: 'Mail không được để trống!' 
                  });
            }

            if(!isValidEmail(req.body.mail)){
                return res.json({ 
                    success: false,
                    message: 'Mail không hợp lệ!' 
                  });
            }
            let full_name = req.body.full_name;
            let mail = req.body.mail;
            let check_email = await access_db("SELECT * FROM users WHERE email = ?;",[mail]);
            if(check_email.length > 0 && mail != req.user.email){
                return res.json({ 
                    success: false,
                    message: 'Mail đã được sử dụng!' 
                  });
            }
            let result = await access_db("UPDATE users SET `name` = ?, email = ? WHERE id = ?;",[full_name, mail, req.user.id]);
            if(result.affectedRows > 0){
                return res.json({ 
                    success: true,
                    message: 'Cập nhật tài khoản thành công' 
                  });
            }else{
                return res.json({ 
                    success: false,
                    message: 'Cập nhật tài khoản thất bại' 
                  });
            }

        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_user_info: (req,res) => {
        try{
            res.json({ 
                name: req.user.name,
                mail: req.user.email
              });
        }catch(error){
            console.error('API dashboard error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_change_password: async (req,res) => {
        try{
            if(req.body.new_password === undefined || req.body.new_password === null || req.body.new_password.toString().trim() === ""){
                return res.json({ 
                    success: false,
                    message: 'Mật khẩu không được để trống' 
                  });
            }

            let current_password = req.body.current_password;
            let new_password = req.body.new_password;
            let old_pass_bcrypt = req.user.password; 

            if(!bcrypt.compareSync(current_password, old_pass_bcrypt)){
                return res.json({ 
                    success: false,
                    message: 'Mật khẩu hiện tại không chính xác!' 
                  });
            }
            
            if(current_password == new_password){
                return res.json({ 
                    success: false,
                    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!' 
                  });
            }

            if(/\s/.test(new_password)){
                return res.json({ 
                    success: false,
                    message: 'Mật khẩu không được chứa khoảng trắng!' 
                  });
            }

            
            if(new_password.length < 8){
                return res.json({ 
                    success: false,
                    message: 'Độ dài mật khẩu phải lớn hoặc bằng 8 ký tự!' 
                  });
            }
            
            let new_password_bcrypt = bcrypt.hashSync(new_password, saltRounds);
            let row = await access_db("UPDATE users SET password = ? WHERE id = ?;", [new_password_bcrypt, req.user.id]);
            if(row.affectedRows > 0){
                return res.json({ 
                    success: true,
                    message: 'Cập nhật mật khẩu thành công' 
                  });
            }else{
                return res.json({ 
                    success: false,
                    message: 'Cập nhật mật khẩu thất bại' 
                  });
            }

        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_menu_option: async (req,res) => {
        try{
            let menu_option = req.body.menu_option;
            let result = await access_db("UPDATE users SET menu_option = ? WHERE id = ?;",[menu_option,req.user.id]);
            if(result.affectedRows > 0){
                return res.json({ 
                    success: true,
                    message: 'Cài đặt thành công' 
                  });
            }else{
                return res.json({ 
                    success: false,
                    message: 'Cài đặt thất bại' 
                  });
            }
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_change_noti_popup_status: async (req,res) => {
        try{
            let dvql_id = req.body.dvql_id;
            let status = req.body.status;
            let result = await access_db("UPDATE user_donviquanly SET popup_noti_status = ? WHERE donviquanly_id =  ? AND user_id = ?;",[status, dvql_id, req.user.id]);
            if(result.affectedRows > 0){
                return res.json({ 
                    success: true,
                    message: 'Cài đặt thành công' 
                  });
            }else{
                return res.json({ 
                    success: false,
                    message: 'Cài đặt thất bại' 
                  });
            }
        }catch(error){
            console.error('API profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API profile error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API profile error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = profile_controller;