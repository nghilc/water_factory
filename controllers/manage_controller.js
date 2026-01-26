const { access_db, query } = require("../config/mysql_config");
var bcrypt = require('bcrypt');
var saltRounds = 10;

function removeVietnameseTones(str) {
    return str
        .normalize('NFD') // Tách dấu ra khỏi ký tự
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/đ/g, 'd') // Chuyển đ -> d
        .replace(/Đ/g, 'D') // Chuyển Đ -> D
        .replace(/[^a-zA-Z0-9]/g, '') // Bỏ khoảng trắng, ký tự đặc biệt
        .toLowerCase() + new Date().getTime(); // Chuyển hết sang chữ thường
}

const manage_controller = {
    show_manage: async (req,res) => {
        try{ 
            res.render('layouts/manage',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/manage",
                t: req.__ 
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },


    get_user_list: async (req,res) => {
        try{
            let data;
            if(req.user.parent_role == 0){
                data = await access_db("SELECT * FROM users ORDER BY id desc;",[]);
            }else{
                data = await access_db("SELECT * FROM users WHERE created_by = ? ORDER BY id desc;",[req.user.id]);
            }
            res.json({
                data
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    change_user_role: async (req,res) => {
        try{    
            let valid_role = ["admin", "sub"];
            let user_id = req.body.acc_id;
            let role = req.body.role;
            if(!valid_role.includes(role)){
                return res.status(400).json({
                    success: false,
                    message: 'Role không hợp lệ' 
                })
            }
            let result = await access_db("UPDATE users SET role = ? WHERE id = ?;",[role, user_id]);
            // await access_db("DELETE FROM group_user WHERE user_id = ?", user_id);
            // if(role == "admin"){
            //     await access_db("INSERT INTO group_user (user_id, MeterCode, NodeCode, notification_type, created_at, updated_at) SELECT ?, totaleq.MeterCode, totaleq.NodeCode, ?, ?, ? FROM totaleq;",[user_id,"[1,1,1,1,1,1,1]",new Date(), new Date()])
            // }
            if(result.affectedRows > 0){
                let log = {
                    action: "Đổi vai trò tài khoản",
                    user_id: user_id,
                    role: role
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đổi vai trò tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-tai-khoan", 3]);

                return res.json({ success: true, message: "Đổi vai trò user thành công!" });
            }else{
                return res.status(400).json({ success: false, message: "Đổi vai trò không thành công!" });
            }

        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    change_user_status: async (req,res) => {
        try{
            let status_valid = [0, 1];
            let user_id = req.body.user_id;
            let status = req.body.status;
            if(!status_valid.includes(Number(status))){
                return res.status(400).json({
                    success: false,
                    message: 'status không hợp lệ' 
                })
            }
            let result = await access_db("UPDATE users SET status = ? WHERE id = ?;",[status, user_id]);
            if(result.affectedRows > 0){
                let log = {
                    action: "Đổi trạng thái tài khoản",
                    user_id: user_id,
                    status: status
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đổi trạng thái tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-tai-khoan", 3]);

                return res.json({ success: true, message: "Đổi trạng thái user thành công!" });
            }else{
                return res.status(400).json({ success: false, message: "Đổi trạng thái không thành công!" });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    change_user_allow_req_api: async (req, res) => {
        try {
            let allow_req_api_valid = [0, 1];
            let user_id = req.body.user_id;
            let allow_req_api = req.body.allow_req_api;
            if (!allow_req_api_valid.includes(Number(allow_req_api))) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ'
                })
            }
            let result = await access_db("UPDATE users SET allow_req_api = ? WHERE id = ?;", [allow_req_api, user_id]);
            if (result.affectedRows > 0) {
                let log = {
                    action: "Đổi quyền truy cập api tài khoản",
                    user_id: user_id,
                    allow_req_api: allow_req_api
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đổi trạng thái tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-tai-khoan", 3]);

                return res.json({ success: true, message: "Đổi quyền truy cập api user thành công!" });
            } else {
                return res.status(400).json({ success: false, message: "Đổi quyền truy cập api không thành công!" });
            }
        } catch (error) {
            console.error('API manage error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    delete_user: async (req,res) => {
        try{
            let user_id = req.body.user_id;
            // lấy org_manager tài khoản này có:
            let get_user_org_manager = await access_db("SELECT * FROM user_donviquanly WHERE user_id = ?;",[user_id]);
            // chuyển thành mảng
            let org_manager = get_user_org_manager.map(item => item.donviquanly_id)
            // lấy org_id
            let org_id = [];
            if(org_manager.length > 0){
                let get_org_id = await access_db("SELECT t1.org_id FROM org_mapping t1 INNER JOIN organizations t2 ON t1.org_id = t2.id WHERE t1.parent_id IN (?) AND t2.created_by = ?;",[org_manager, user_id]);
                org_id = get_org_id.map(item => item.org_id);
            }
            // xóa bảng user
            let result = await access_db("DELETE FROM users WHERE id = ?;",[user_id]);

            if(org_manager.length > 0){
                // xóa bảng org_manager
                await access_db("DELETE FROM org_managers WHERE org_id IN (?);",[org_manager])
                // xóa bảng org_mapping
                await access_db("DELETE FROM org_mapping WHERE parent_id IN (?);",[org_manager])
                // xóa bảng orgainzations
                await access_db("DELETE FROM organizations WHERE id IN (?);",[org_manager])
            }
            if(org_id.length > 0){
                // xóa bảng org_groups
                await access_db("DELETE FROM org_groups WHERE org_id IN (?);",[org_id]);
                await query(`DELETE FROM "org_groups" WHERE "org_id" = ANY($1)`,[org_id]);
                //xóa barmg org_mapping
                await access_db("DELETE FROM org_mapping WHERE org_id IN (?);",[org_id]);
                // xóa bảng organizations
                await access_db("DELETE FROM organizations WHERE id IN (?);", [org_id]);

            }
            if(result.affectedRows > 0){
                let log = {
                    action: "Xóa tài khoản và dữ liệu tài khoản đó",
                    user_id: user_id,
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Xóa tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-tai-khoan", 3]);

                return res.json({ success: true, message: "Xóa user thành công!" });
            }else{
                return res.status(400).json({ success: false, message: "Xóa không thành công!" });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_set_role_meter_list: async (req,res) => {
        try{
            let user_id = req.query.USER_ID;
            let dvql_id = req.query.dvql_id;
            // let meter_list = await access_db("SELECT t1.MeterCode, t1.NodeCode, t1.`name`, t2.user_id, t4.name AS ten_donvi FROM totaleq t1 LEFT JOIN group_user t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode AND t2.user_id = ? LEFT JOIN tram_diemdo_relation t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN tram_diemdo_relation t4 ON t3.parent_id = t4.id;",[user_id]);
            let meter_list = [];
            if(req.user.parent_role == 0){
                meter_list = await access_db(`SELECT t6.id AS group_id, t1.MeterCode, t1.NodeCode, t1.name AS meter_name, '-' AS donviquanly_name FROM totaleq t1 LEFT JOIN (SELECT DISTINCT y1.MeterCode, y1.NodeCode, y1.id FROM org_managers y1 INNER JOIN user_donviquanly y2 ON y1.org_id= y2.donviquanly_id WHERE y1.org_id = ? ) AS t6 ON t1.MeterCode = t6.MeterCode AND t1.NodeCode = t6.Nodecode ORDER BY t1.name;`, [dvql_id]);
            }else{
                meter_list = await access_db(`SELECT t6.id AS group_id, t5.MeterCode, t5.NodeCode, t5.name AS meter_name, t1.org_id AS donviquanly_id, t4.org_name AS donviquanly_name FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN organizations t4 ON t1.org_id = t4.id LEFT JOIN totaleq t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode LEFT JOIN (SELECT DISTINCT y1.MeterCode, y1.NodeCode, y1.id FROM org_managers y1 INNER JOIN user_donviquanly y2 ON y1.org_id= y2.donviquanly_id WHERE y1.org_id = ? ) AS t6 ON t1.MeterCode = t6.MeterCode AND t1.NodeCode = t6.Nodecode WHERE t2.user_id = ? ORDER BY t5.name;`, [dvql_id, req.user.id]);
            }

            let inh = await access_db("SELECT t1.org_id, t3.org_name FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;", [req.user.id]);
            let selected_inh = await access_db("SELECT * FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t1.parent_id = ? AND t2.user_id = ?;", [dvql_id, user_id])
            res.json({
                meter_list,
                inh,
                selected_inh
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_set_role: async (req,res) => {
        try{
            // đơn vị quản lý id
            let dvql_id = req.body.dvql_id;
            // các meter đang đã có sẵn
            let exist_meter = await access_db("SELECT MeterCode, NodeCode FROM org_managers WHERE org_id = ?;",[dvql_id]);
            let user_id = req.body.user_id;

            // các meter do tk cha được phân quyền
            let this_user_meter = await access_db("SELECT t1.MeterCode, t1.NodeCode FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id WHERE t2.user_id = ?;",[req.user.id]);
            // lọc trong meter đang có sẵn có mà meter tk cha không có không, loại bỏ ra khỏi đang có sẵn để không xóa
            var onlyInA =[]
            if(req.user.parent_role != 0){
                onlyInA = exist_meter.filter(itemA =>
                    !this_user_meter.some(itemB =>
                        itemB.MeterCode === itemA.MeterCode &&
                        itemB.NodeCode === itemA.NodeCode
                    )
                );

                exist_meter = exist_meter.filter(itemA =>
                    this_user_meter.some(itemB =>
                        itemB.MeterCode === itemA.MeterCode &&
                        itemB.NodeCode === itemA.NodeCode
                    )
                  );
            }


            // mảng meter gửi lên
            let arr_meter = JSON.parse(req.body.arr_meter);
            // mảng id nhóm kế thừa
            let inh = JSON.parse(req.body.inh_group);
            // mảng meter trong các nhóm kế thừa
            let inh_metercode = [];
            if (inh.length > 0) {
                inh_metercode = await access_db("SELECT MeterCode, NodeCode FROM org_groups WHERE org_id IN (?);", [inh]);
            }     
            // chuyển thành json
            let json_inh = JSON.parse(JSON.stringify(inh_metercode))
            // gộp mảng meter gửi lên và kế thừa
            let merged = [...arr_meter, ...json_inh];
            // lọc trùng
            let arr = Array.from(
                new Map(
                    merged.map(item => [item.MeterCode + "|" + item.NodeCode, item])
                ).values()
            );
            // so sáng với các thiết bị đã có xem có xóa hoặc thêm phân quyền thiết bị nào không,
            let deleted = exist_meter.filter(
                a => !arr.some(b => b.MeterCode === a.MeterCode && b.NodeCode === a.NodeCode)
              );
            let added = arr.filter(
                b => !exist_meter.some(a => a.MeterCode === b.MeterCode && a.NodeCode === b.NodeCode)
            );
            // đối với các thiết bị đã xóa thì xóa trong org_groups
            let placeholders = deleted.map(() => "(?, ?)").join(", "); 

            let sql = `DELETE t1 FROM org_groups t1 JOIN org_mapping t2 ON t1.org_id = t2.org_id WHERE t2.parent_id = ? AND (t1.MeterCode, t1.NodeCode) IN (${placeholders});`;
            let params = [dvql_id].concat(
                [].concat(...deleted.map(p => [p.MeterCode, p.NodeCode]))
              );
            if (deleted.length > 0){
                // lấy các thiết bị ở bên org_groups mysql cần xóa để xóa bên postgre
                let postgre_delete_meter = await access_db(`SELECT t1.MeterCode, t1.NodeCode, t1.org_id FROM org_groups t1 JOIN org_mapping t2 ON t1.org_id = t2.org_id WHERE t2.parent_id = ? AND (t1.MeterCode, t1.NodeCode) IN (${placeholders});`, params);

                const postgre_delete_meter_param = postgre_delete_meter.map(
                    o => `('${o.MeterCode}', '${o.NodeCode}', ${o.org_id})`
                  ).join(',');
                if (postgre_delete_meter.length > 0){
                    await query(`DELETE FROM org_groups WHERE ("MeterCode", "NodeCode", "org_id") IN (${postgre_delete_meter_param})`, []);
                }
                await access_db(sql, params);
            }
            // xóa các thiết bị phân quyền hiện tại            
            await access_db("DELETE FROM org_managers WHERE org_id = ?;",[dvql_id]);
            let val = [];
            for (let i = 0; i < arr.length; i++){
                val.push([arr[i].MeterCode, arr[i].NodeCode, new Date(), dvql_id]);
            }
            for (let i = 0; i < onlyInA.length; i++) {
                val.push([onlyInA[i].MeterCode, onlyInA[i].NodeCode, new Date(), dvql_id]);
            }
            if (val.length > 0){
                // insert lại tất cả
                await access_db("INSERT INTO org_managers (MeterCode, NodeCode, created_at, org_id) VALUES ?;",[val]);
            }
            // xóa các kế thừa hiện tại trong mapping
            await access_db("DELETE t1 FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id WHERE t1.parent_id = ? AND t2.created_by = ?;",[dvql_id, req.user.id]);
            // thêm vào mapping các nhóm kế thừa
            let val_org_mapping = [];
            for (let i = 0; i < inh.length; i++) {
                val_org_mapping.push([inh[i], dvql_id, new Date(), new Date()])
            }
            if (val_org_mapping.length > 0) {
                await access_db("INSERT INTO org_mapping (org_id, parent_id, created_at, updated_at) VALUES ?;", [val_org_mapping]);
            }

            // lưu trang được phép truy cập
            let access_menu = (req.body.access_menu == "") ? null : req.body.access_menu;
            await access_db("UPDATE users SET access_tab = ? WHERE id = ?", [access_menu, user_id])

            let log = {
                action: "Phần quyền thiết bị",
                user_id: user_id,
                inherit_group: inh,
                meter: arr_meter,
                access_menu: access_menu
            }
            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Phân quyền thiết bị", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-thiet-bi", 3]);

            res.json({
                success: true,
                message: "Phân quyền trạm thành công!"
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    register_admin: async (req,res) => {
        try{
            let resign_dvql_name = req.body.resign_dvql_name;
            let arr_meter_raw = JSON.parse(req.body.arr_meter)
            let email = req.body.email;
            let usr = req.body.username;
            let pass = req.body.pass;
            let role = req.body.role;
            let allow_req_api = req.body.allow_req_api;
            let full_name = req.body.full_name;
            let inh = JSON.parse(req.body.inh_group);
            let inh_metercode = [];
            if (inh.length > 0){
                inh_metercode = await access_db("SELECT MeterCode, NodeCode FROM org_groups WHERE org_id IN (?);", [inh]);
            }
            json_inh = JSON.parse(JSON.stringify(inh_metercode))
            let merged = [...arr_meter_raw, ...json_inh];

            let arr_meter = Array.from(
                new Map(
                    merged.map(item => [item.MeterCode + "|" + item.NodeCode, item])
                ).values()
            );
            
            var x = bcrypt.hashSync(pass, saltRounds);
            var row = await access_db("SELECT * FROM users WHERE email = ? OR user_name = ?;",[email,usr]);
            if(row.length > 0){
                if(row[0].user_name == usr){
                    return res.json({ 
                        success: false,
                        message: 'Tên đăng nhập đã tồn tại' 
                      });
                }
                if(row[0].email == email){
                    return res.json({ 
                        success: false,
                        message: 'Email đã tồn tại' 
                      });
                }
            }else{
                let insert_user = await access_db("INSERT INTO users (user_name, email, password, role, allow_req_api, status, name, created_by, mobile, access_tab) VALUES (?,?,?,?,?,?,?,?,?,?)", [usr, email, x, role, allow_req_api, 1, full_name, req.user.id,usr, "1,2,3,4,5,6,7,8,9,10,11"]);
                let insert_organizations = await access_db("INSERT INTO organizations (org_code, org_name, created_at, created_by) VALUES (?,?,?,?);",[usr, resign_dvql_name, new Date(), req.user.id]);
                await access_db("INSERT INTO org_mapping (org_id, created_at, updated_at) VALUES (?,?,?);", [insert_organizations.insertId, new Date(), new Date()])
                let val_org_mapping = [];
                for (let i = 0; i < inh.length; i++){
                    val_org_mapping.push([inh[i], insert_organizations.insertId, new Date(), new Date()])
                }
                if(val_org_mapping.length > 0){
                    await access_db("INSERT INTO org_mapping (org_id, parent_id, created_at, updated_at) VALUES ?;",[val_org_mapping]);
                }
                let val = [];
                for(let i=0; i<arr_meter.length; i++){
                    val.push([arr_meter[i].MeterCode, arr_meter[i].NodeCode, new Date(),insert_organizations.insertId]);
                }
                await access_db("INSERT INTO user_donviquanly (user_id, donviquanly_id) VALUES (?,?);",[insert_user.insertId, insert_organizations.insertId]);
                if(val.length > 0){
                    await access_db("INSERT INTO org_managers (MeterCode, NodeCode, created_at, org_id) VALUES ?;", [val])
                }

                let log = {
                    action: "Tạo tài khoản",
                    usr: usr,
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Tạo tài khoản", JSON.stringify(log), new Date(), "-", "-", "tai-khoan", 3]);

                return res.json({ 
                    success: true,
                    message: 'Thêm tài khoản thành công' 
                  });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_danhsachdonvi: async (req,res) => {
        try{
            let danhsachdonvi = await access_db("SELECT t2.* FROM user_donviquanly t1 INNER JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE t1.user_id = ? ORDER BY t2.id DESC;", [req.user.id]);
            res.json({
                danhsachdonvi
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_danhsachnhom: async (req,res) => {
        try{
            let dvql_id = req.query.dvql_id
            let danhsachnhom = await access_db("SELECT t2.* FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id WHERE t1.parent_id = ? ORDER BY t2.id DESC;", [dvql_id]);
            res.json({
                danhsachnhom
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_themdonvi: async (req,res) => {
        try{
            let ten_donvi = req.body.ten_donvi;
            let check_exist = await access_db("SELECT * FROM user_donviquanly t1 INNER JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE (t2.org_name = ? OR t2.org_code = ?) AND t1.user_id = ?;",[ten_donvi, removeVietnameseTones(ten_donvi), req.user.id]);
            if(check_exist.length > 0){
                return res.json({ 
                    success: false,
                    message: 'Tên đơn vị đã tồn tại' 
                  });
            }else{
                let result_1 = await access_db("INSERT INTO organizations (org_name, org_code, created_at) VALUES (?,?,?);",[ten_donvi, removeVietnameseTones(ten_donvi), new Date()]);
                await access_db("INSERT INTO org_mapping (org_id, parent_id, created_at, updated_at) VALUES (?,?,?,?);", [result_1.insertId, null, new Date(), new Date()])

                let result_2 = await access_db("INSERT INTO user_donviquanly (user_id, donviquanly_id) VALUES (?,?);",[req.user.id, result_1.insertId ])
                if(result_1.affectedRows > 0 && result_2.affectedRows > 0){
                    let log = {
                        action: "Thêm đơn vị quản lý",
                        ten_donvi: ten_donvi,
                    }
                    await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Thêm đơn vị quản lý", JSON.stringify(log), new Date(), "-", "-", "tai-khoan", 3]);

                    return res.json({ 
                        success: true,
                        message: 'Thêm đơn vị thành công!' 
                      });
                }else{
                    return res.json({ 
                        success: false,
                        message: 'Thêm đơn vị thất bại!' 
                      });
                }
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_themnhom: async (req,res) => {
        try{
            let ten_nhom = req.body.ten_nhom;
            let dvql_id = req.body.dvql_id;
            let check_exist = await access_db("SELECT t2.* FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id  WHERE t1.parent_id = ? AND (t2.org_name = ? OR t2.org_code = ?);", [dvql_id, ten_nhom, removeVietnameseTones(ten_nhom)]);
            if(check_exist.length > 0){
                return res.json({ 
                    success: false,
                    message: 'Tên nhóm đã tồn tại' 
                  });
            }else{
                let result = await access_db("INSERT INTO organizations (org_code, org_name, parent_id, created_at, created_by) VALUES (?,?,?,?,?);",[removeVietnameseTones(ten_nhom), ten_nhom, dvql_id, new Date(), req.user.id])
                await access_db("INSERT INTO org_mapping (org_id, parent_id, created_at, updated_at) VALUES (?,?,?,?);", [result.insertId, dvql_id, new Date(), new Date()])

                if(result.affectedRows > 0){
                    let log = {
                        action: "Thêm DMA",
                        ten_nhom: ten_nhom,
                        dvql_id: dvql_id
                    }
                    await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Thêm DMA", JSON.stringify(log), new Date(), "-", "-", "them-DMA", 3]);

                    return res.json({ 
                        success: true,
                        message: 'Thêm nhóm thành công!' 
                      });
                }else{
                    return res.json({ 
                        success: false,
                        message: 'Thêm nhóm thất bại!' 
                      });
                }
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    // delete_donvi: async (req,res) => {
    //     try{
    //         let donvi_id = req.body.donvi_id;
    //         let result = await access_db("DELETE FROM tram_diemdo_relation WHERE id = ? AND depth = 1;",[donvi_id]);
    //         if(result.affectedRows > 0){
    //             return res.json({ 
    //                 success: true,
    //                 message: 'Xóa đơn vị thành công!' 
    //               });
    //         }else{
    //             return res.json({ 
    //                 success: false,
    //                 message: 'Xóa đơn vị thất bại!' 
    //               });
    //         }
    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
    delete_nhom: async (req,res) => {
        try{
            let nhom_id = req.body.nhom_id;
            let get_created_by = await access_db("SELECT * FROM organizations WHERE id = ?;",[nhom_id]);
            let result;
            let log;
            if(get_created_by.length > 0){
                let created_by_id = get_created_by[0].created_by;
                if(created_by_id == req.user.id){
                    await access_db("DELETE FROM org_groups WHERE org_id = ?;", [nhom_id]);
                    await query(`DELETE FROM "org_groups" WHERE "org_id" = $1;`, [nhom_id]);
                    result = await access_db("DELETE FROM org_mapping WHERE org_id = ?;",[nhom_id]);
                    await access_db("DELETE FROM organizations WHERE id = ?;", [nhom_id]);
                    res.clearCookie('tram_id');
                    res.clearCookie('dv_type');
                    log = {
                        note: "Xóa dữ liệu DMA",
                        org_id: nhom_id
                    }
                }else{
                    result = await access_db("DELETE t1 FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t1.org_id = ? and t2.user_id = ?;", [nhom_id, req.user.id]);
                    log = {
                        note: "Xóa phân quyền DMA",
                        org_id: nhom_id
                    }
                }
            }

            // let result = await access_db("DELETE FROM organizations WHERE id = ?;",[nhom_id]);
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, org_id) VALUES (?,?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt DMA", JSON.stringify(log), new Date(), null, null, "cai-dat-dma", 1, log.org_id]);
                return res.json({ 
                    success: true,
                    message: 'Xóa DMA thành công!' 
                  });
            }else{
                return res.json({ 
                    success: false,
                    message: 'Xóa DMA thất bại!' 
                  });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_suatendonvi: async (req,res) => {
        try{
            let ten_donvi = req.body.ten_donvi;
            let donvi_id = req.body.donvi_id;
            if(ten_donvi == "" || ten_donvi == null){
                return res.json({ 
                    success: false,
                    message: 'Tên đơn vị không được để trống!' 
                  });
            }
            let check_exist = await access_db("SELECT t2.* FROM user_donviquanly t1 INNER JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE t1.user_id = ? AND t2.id = ?;",[ req.user.id, donvi_id]);
            if(check_exist.length > 0){
                if(check_exist[0].org_name == ten_donvi){
                    return res.json({ 
                        success: false,
                        message: 'Tên đơn vị đã tồn tại' 
                      });
                }else{
                    let result = await access_db("UPDATE organizations SET org_name = ? WHERE id = ?;",[ten_donvi, donvi_id]);
                    if(result.affectedRows > 0){
                        let log = {
                            action: "Đổi tên đơn vị quản lý",
                            ten_donvi: ten_donvi,
                        }
                        await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đổi tên vị quản lý", JSON.stringify(log), new Date(), "-", "-", "don-vi-quan-ly", 3]);

                        return res.json({ 
                            success: true,
                            message: 'Đổi tên đơn vị thành công!' 
                          });
                    }else{
                        return res.json({ 
                            success: false,
                            message: 'Đổi tên đơn vị thất bại!' 
                          });
                    }
                }                

            }else{
                return res.json({ 
                    success: false,
                    message: 'Không hợp lệ' 
                  });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_suatennhom: async (req,res) => {
        try{
            let ten_nhom = req.body.ten_nhom;
            let nhom_id = req.body.nhom_id;
            let dvql_id = req.body.dvql_id;

            if(ten_nhom == "" || ten_nhom == null){
                return res.json({ 
                    success: false,
                    message: 'Tên đơn vị không được để trống!' 
                  });
            }
            let check_exist = await access_db("SELECT t2.* FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id WHERE t1.parent_id = ? AND t2.org_name = ?;",[dvql_id, ten_nhom]);
            if(check_exist.length > 0){
                    return res.json({ 
                        success: false,
                        message: 'Tên nhóm đã tồn tại' 
                      });
                        
            }else{
                let result = await access_db("UPDATE organizations SET org_name = ? WHERE id = ?;",[ten_nhom, nhom_id]);
                if(result.affectedRows > 0){
                    let log = {
                        action: "Đổi tên DMA",
                        ten_nhom: ten_nhom,
                    }
                    await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đổi tên DMA", JSON.stringify(log), new Date(), "-", "-", "cai-dat-DMA", 3]);

                    return res.json({
                        success: true,
                        message: 'Đổi tên đơn vị thành công!' 
                      });
                }else{
                    return res.json({ 
                        success: false,
                        message: 'Đổi tên đơn vị thất bại!' 
                      });
                }
                // return res.json({ 
                //     success: false,
                //     message: 'Không hợp lệ' 
                //   });
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_danhsachtram: async (req,res) => {
        try{
            let danhsachtram = await access_db("SELECT t1.*, t2.id AS tram_diemdo_id, t2.parent_id, t1.name AS meter_name  FROM totaleq t1 LEFT JOIN tram_diemdo_relation t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode ORDER BY t1.idkey DESC;");
            res.json({
                danhsachtram
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_doi_donvi: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let donvi_id = req.body.donvi_id;
            let result = await access_db("SELECT * FROM tram_diemdo_relation WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(result.length > 0){
                let result_2 = await access_db("UPDATE tram_diemdo_relation SET parent_id = ? WHERE MeterCode = ? AND NodeCode = ?;",[donvi_id, MeterCode, NodeCode]);
                if(result_2.affectedRows > 0){
                    res.json({
                        success: true,
                        message: "Cập nhật đơn vị thành công"
                    })
                }else{
                    res.json({
                        success: true,
                        message: "Cập nhật đơn vị thất bại"
                    })
                }
            }else{
                let result_2 = await access_db("INSERT INTO tram_diemdo_relation (MeterCode, NodeCode, parent_id, depth) VALUES (?,?,?,?)",[ MeterCode, NodeCode, donvi_id, 2]);
                if(result_2.affectedRows > 0){
                    res.json({
                        success: true,
                        message: "Cập nhật đơn vị thành công"
                    })
                }else{
                    res.json({
                        success: true,
                        message: "Cập nhật đơn vị thất bại"
                    })
                }
            }
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_resign_meter_list: async (req,res) => {
        try{
            let data = await access_db(`SELECT t5.MeterCode, t5.NodeCode, t5.name AS meter_name, t1.org_id AS donviquanly_id, t4.org_name AS donviquanly_name FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN organizations t4 ON t1.org_id = t4.id LEFT JOIN totaleq t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode WHERE t2.user_id = ? ORDER BY t5.name;`,[req.user.id]);
            let inh = await access_db("SELECT t1.org_id, t3.org_name FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;",[req.user.id]);
            res.json({
                data,
                inh
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_danhsach_dvql: async (req,res) => {
        try{
            let data = await access_db("SELECT t2.* FROM user_donviquanly t1 LEFT JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE t1.user_id = ?;",[req.user.id]);
            res.json({
                data
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_danhsachthietbi: async (req,res) => {
        try{
            let dvnd_id = req.query.dvnd_id;
            let dvql_id = req.query.dvql_id;

            // let meter_list = await access_db(`SELECT t5.MeterCode, t5.NodeCode, t5.name AS meter_name, t1.org_id AS donviquanly_id, t4.org_name AS donviquanly_name, t3.org_id AS donvinguoidung_id, t3.org_name AS donvinguoidung_name, t3.is_pipe FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN (SELECT x2.parent_id, x1.org_id, x2.org_name, x1.MeterCode, x1.NodeCode, x1.is_pipe FROM org_groups x1 LEFT JOIN organizations x2 ON x1.org_id = x2.id) AS t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode AND t3.parent_id = t1.org_id LEFT JOIN organizations t4 ON t1.org_id = t4.id LEFT JOIN totaleq t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode WHERE t2.user_id = ? ORDER BY t3.is_pipe DESC, t5.name ASC;`,[req.user.id]);
            // let group_meter_list = await access_db("SELECT * FROM org_groups WHERE org_id = ?;",[dvnd_id]);
            let meter_list =  await access_db('SELECT t3.MeterCode, t3.NodeCode, t3.name AS meter_name, t1.org_id AS donviquanly_id, t4.org_name AS donviquanly_name, t2.is_pipe, t2.org_id AS donvinguoidung_id FROM org_managers t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode AND t2.org_id = ? LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN organizations t4 ON t1.org_id = t4.id WHERE t1.org_id = ?;',[dvnd_id, dvql_id])
            res.json({
                meter_list
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_save_manage_danhsachthietbi: async (req,res) => {
        try{
            let dvnd_id = req.body.dvnd_id;
            let arr_meter = JSON.parse(req.body.arr_meter)
            await access_db("DELETE FROM org_groups WHERE org_id = ?;",[dvnd_id]);
            await query(`DELETE FROM "org_groups" WHERE "org_id" = $1;`, [dvnd_id]);

            let val = [];
            for(let i=0; i<arr_meter.length; i++){
                val.push([arr_meter[i].MeterCode, arr_meter[i].NodeCode, dvnd_id, new Date(), arr_meter[i].is_pipe]);
            }
            await access_db("INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at, is_pipe) VALUES ?;",[val]);
            // dùng cho postgresql
            const valuesFlat = [].concat(...val)
            const placeholders = val.map(
                    (row, rowIndex) =>
                        `(${row.map((_, colIndex) => `$${rowIndex * row.length + colIndex + 1}`).join(",")})`
                )
                .join(",");

            const postgresql_query = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at", "is_pipe") VALUES ${placeholders};`;

            await query(postgresql_query, valuesFlat);
            let log = {
                action: "Phân quyền thiết bị vào DMA",
                arr_meter: arr_meter,
                dvnd_id: dvnd_id
            }
            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt DMA", JSON.stringify(log), new Date(), "-", "-", "cai-dat-DMA", 3]);

            return res.json({
                success: true,
                message: 'Cài đặt thành công!' 
              });
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_set_role_dvql: async (req,res) => {
        try{
            let user_id = req.query.user_id;
            let dvql = await access_db('SELECT t2.* FROM user_donviquanly t1 INNER JOIN organizations t2 ON t1.donviquanly_id = t2.id WHERE t1.user_id = ?;',[user_id]);
            let get_access_menu = await access_db("SELECT access_tab, role FROM users WHERE id = ?;",[user_id])
            let access_menu = null;
            let role = "sub";
            if (get_access_menu.length > 0){
                access_menu = get_access_menu[0].access_tab;
                role = get_access_menu[0].role;
            }
            res.json({
                dvql, access_menu, role
            })
        }catch(error){
            console.error('API manage error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API manage error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = manage_controller;