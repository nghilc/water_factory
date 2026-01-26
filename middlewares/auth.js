const {access_db} = require("../config/mysql_config");
const jwt = require('jsonwebtoken');
const  TOKEN_SECRET = "mySecret";
const REFESH_TOKEN = "refreshMySecret";


const middlewares_auth = {
    access_menu: (required_access_menu) => {
        try{
            return (req, res, next) => {
                let access_menu = req.user.access_tab;
                const tabs = access_menu ? access_menu.split(',') : []; 
                if (required_access_menu.some(value => tabs.includes(value))){
                    next();
                }else{
                    return res.status(400).json({
                        success: false,
                        message: `Bạn không có quyền truy cập trang này`
                    });
                }
            }        
        } catch (error) {
            console.error('API middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    ensure_authenticated: (req, res, next) => {
        try{
            if (req.isAuthenticated()) {
                return next();
              }
              req.flash('error_msg', 'Vui lòng đăng nhập để tiếp tục');
              res.redirect('/login');
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
      },

    forward_authenticated_login: (req, res, next) => {
        try{
            if (!req.isAuthenticated()) {
                return next();
            }
        //     let redirectUrl;
        //     switch(req.user.menu_option){
        //         case "1": 
        //         case 1: redirectUrl = "/dashboard"; break;
        //         case "2":
        //         case 2: redirectUrl = "/overview"; break;
        //         case "3":
        //         case 3: redirectUrl = "/monitoring"; break;
        //         case "4":
        //         case 4: 
        //          switch(req.user.last_menu_link){
        //             case "1": 
        //             case 1: redirectUrl = "/dashboard"; break;
        //             case "2":
        //             case 2: redirectUrl = "/overview"; break;
        //             case "3":
        //             case 3: redirectUrl = "/monitoring"; break;
        //          }
        //             break;

        //     }
        // return res.redirect(redirectUrl);
            return res.redirect('/dashboard');
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    forward_authenticated: (req,res,next) => {
        try{
            if(req.isAuthenticated()){
                return next();
            }
            res.status(401).send("Đã hết phiên quản lý. Vui lòng đăng nhập lại")
            res.end();
            return;
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    is_admin: (req, res, next) => {
        try{
            if (req.user && req.user.role === 'admin') {
                return next();
              }
              req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
            res.status(401).send("Bạn không có quyền truy cập api này")
            //   return res.redirect('/dashboard');
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
      },

    check_MeterCode_and_NodeCode: async (req, res, next) => {
        try{
            const { MeterCode, NodeCode } = req.query;
            // Kiểm tra xem MeterCode & NodeCode có được truyền lên không
            if (!MeterCode || !NodeCode) {
                return res.status(400).json({ error: "MeterCode and NodeCode are required" });
            }
            // Truy vấn kiểm tra xem có được phân quyền cho user không
            let result = await access_db("SELECT * FROM group_user WHERE MeterCode = ? AND NodeCode = ? AND user_id = ?;",[MeterCode, NodeCode, req.user.id]);
            if(result.length > 0){
                next()
            }else{
                res.status(404).json({ error: "MeterCode, NodeCode not found" });
            }
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    check_MeterCode_and_NodeCode_post: async (req, res, next) => {
        try{
            const { MeterCode, NodeCode } = req.body;
            // Kiểm tra xem MeterCode & NodeCode có được truyền lên không
            if (!MeterCode || !NodeCode) {
                return res.status(400).json({ error: "MeterCode and NodeCode are required" });
            }
            // Truy vấn kiểm tra xem có được phân quyền cho user không
            let result = await access_db("SELECT * FROM group_user WHERE MeterCode = ? AND NodeCode = ? AND user_id = ?;",[MeterCode, NodeCode, req.user.id]);
            if(result.length > 0){
                next()
            }else{
                res.status(404).json({ error: "MeterCode, NodeCode not found" });
            }
        }catch(error){
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
        check_required_field: (required_fields, source = "body") => {
        try{
            return (req, res, next) => {
                const data = req[source];
                const missing_field = [];
                required_fields.forEach(field => {
                    if (!data[field] || data[field].toString().trim() === "") {
                        missing_field.push(field);
                    }
                });

                if (missing_field.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Các trường sau không được để trống: ${missing_field.join(", ")}`
                    });
                }
                next();
            }
        }catch(error){
            console.error('API dashboard error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    verifyApiToken: (req,res, next) => {
        try{
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Lấy phần sau "Bearer"
            // const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.header('Authorization');
            if (!token) return res.status(401).json({ error: 'Access denied' });
          
            try {
             const decoded = jwt.verify(token, TOKEN_SECRET);
             console.log(decoded)
             req.userId = decoded.userId;
             next();
             }catch (error) {
                console.log(error)
              return res.status(401).json({ error: 'Invalid token' });
             }
        }catch(error){
            console.error('API error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    // get_general_status: (req,res) => {
        //     try{
    
        //     }catch(error){
        //         console.error('API dashboard error:', error);
        //         res.status(500).json({ 
        //             success: false,
        //             message: 'Lỗi server' 
        //           });
        //     }
        // },

};

module.exports = middlewares_auth;