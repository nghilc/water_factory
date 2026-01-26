const {access_db, query} = require("../config/mysql_config");





const dashboard_controller = {
    // hiển thị trang dashboard - giám sát hệ thống
    show_dashboard: async (req, res) => {
        try{

            let danh_sach_thiet_bị = [];
            let danh_sach_xi_nghiep_nha_may = [];
            danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t5.meter_status AS status_meter FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;",[req.user.id]);

            danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;",[req.user.id]);



            // await access_db("UPDATE users SET last_menu_link = ? WHERE id = ?;", [1, req.user.id]);
            res.render('layouts/dashboard', {
                danh_sach_thiet_bị, danh_sach_xi_nghiep_nha_may,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/dashboard",
            })
        } catch (error) {
            console.error('API dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }

    },
    get_map_data: async (req,res) => {
        try{
            let org_id = req.query.org_id;
            let danh_sach_thiet_bị = [];
            let type= req.query.type;
            if(type == "all"){
                danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t4.* FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;", [req.user.id]);

            }else if(type == "xi_nghiep"){
                danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t4.* FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.parent_id = ?;", [req.user.id, org_id]);

            }else{
                danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t4.* FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.org_id = ?;", [req.user.id, org_id]);

            }


            res.json({
                success: true,
                danh_sach_thiet_bị
            })
        }catch (error){
            console.error('API dashboard error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_general_status: async (req,res) => {
        try{
            let node_id = req.query.node_id; 
            let type = req.query.type;
            if(type =="all"){
                res.clearCookie('tram_id');
                res.clearCookie('dv_type');
            }else{
                res.cookie("tram_id", node_id, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                });
                res.cookie("dv_type", type, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                })
            }

            let meter_status;
            if(type =="all"){
                meter_status = await access_db("SELECT SUM(CASE WHEN t1.`status` = 0 THEN 1 ELSE 0 END) AS total_status_0, SUM(CASE WHEN t1.`status` = 1 THEN 1 ELSE 0 END) AS total_status_1, SUM(CASE WHEN t1.`status` = 1 AND t1.warning IS NOT NULL THEN 1 ELSE 0 END) AS total_status_2 FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            }else if(type == "dvql"){
                // meter_status = await access_db("SELECT SUM(CASE WHEN t1.`status` = 0 THEN 1 ELSE 0 END) AS total_status_0, SUM(CASE WHEN t1.`status` = 1 THEN 1 ELSE 0 END) AS total_status_1, SUM(CASE WHEN t1.`status` = 2 THEN 1 ELSE 0 END) AS total_status_2 FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ?;",[node_id])
                meter_status = await access_db("SELECT SUM(CASE WHEN t1.`status` = 0 THEN 1 ELSE 0 END) AS total_status_0, SUM(CASE WHEN t1.`status` = 1 THEN 1 ELSE 0 END) AS total_status_1, SUM(CASE WHEN t1.`status` = 1 AND t1.warning IS NOT NULL THEN 1 ELSE 0 END) AS total_status_2 FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? AND t2.org_id = ?;",[req.user.id, node_id]);
            }else{
                meter_status = await access_db("SELECT SUM(CASE WHEN t1.`status` = 0 THEN 1 ELSE 0 END) AS total_status_0, SUM(CASE WHEN t1.`status` = 1 THEN 1 ELSE 0 END) AS total_status_1, SUM(CASE WHEN t1.`status` = 1 AND t1.warning IS NOT NULL THEN 1 ELSE 0 END) AS total_status_2 FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id INNER JOIN org_groups t4 ON t1.MeterCode = t4.MeterCode AND t1.NodeCode = t4.NodeCode WHERE t3.user_id = ? AND t4.org_id = ?;",[req.user.id, node_id]);
            }
            res.json({
                success: true,
                meter_status: {
                    total: (meter_status.length > 0) ? (meter_status[0].total_status_0 + meter_status[0].total_status_1) : "-",
                    lost_connect: (meter_status.length > 0) ?  meter_status[0].total_status_0 : "-",
                    good: (meter_status.length > 0) ?  meter_status[0].total_status_1 : "-",
                    exceeded: (meter_status.length > 0) ?  meter_status[0].total_status_2 : "-",
                }
            })
        }catch(error){
            console.error('API dashboard error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_map_setting: async (req,res) => {
        try{
            let map_setting = req.body.map_setting;
            var result = await access_db("UPDATE users SET map_setting = ? WHERE id = ?;",[map_setting,req.user.id]);
            if(result.affectedRows > 0){
                return res.json({ success: true, message: "Lưu cấu hình bản đồ thành công!" });
            }else{
                return res.status(400).json({ success: false, message: "Lưu cấu hình bản đồ không thành công!" });
            }
        }catch(error){
            console.error('API dashboard error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_save_add_meter: async (req,res) => {
        try{
            let arr_meter = JSON.parse(req.body.arr_meter).map(x => x.trim());
            // console.log(arr_meter)
            let val_checked_pass_meter = JSON.parse(req.body.arr_meter).map(x => x.trim());;
            let password = req.body.password;
            let dv_id = req.body.dv_id;
            let type = req.body.type;
            // số lượng dấu ? = arr_meter
            let placeholders = arr_meter.map(() => '?').join(',');
            //thêm password ở đầu mảng
            val_checked_pass_meter.unshift(password);
            // lấy các meter tồn tại và đúng password từ db
            // console.log(placeholders, val_checked_pass_meter)
            let get_checked_pass_meter =  await access_db("SELECT MeterCode, DcuCode FROM totaleq WHERE password_device = ? AND DcuCode IN ("+placeholders+");",val_checked_pass_meter);
            if(get_checked_pass_meter.length == 0){
                return res.json({ success: false, message: "Thêm thiết bị không thành công" });
            }
            // console.log(get_checked_pass_meter)
            //mảng chỉ gồm các meter đúng
            let checked_pass_meter = get_checked_pass_meter.map(row => row.MeterCode);
            // mảng chỉ gồm các DcuCode đúng
            let checked_pass_DcuCode = get_checked_pass_meter.map(row => row.DcuCode);

            let placeholders_2 = checked_pass_meter.map(() => '?').join(',');
            // mảng gồm các DcuCode lỗi
            let error_meter = arr_meter.filter(item => !checked_pass_DcuCode.includes(item));

            if(checked_pass_meter.length > 0){
                if(type == "dvql"){
                    let val_exsit_meter = [...checked_pass_meter];
                    // thêm dvql_id ở đầu mảng
                    val_exsit_meter.unshift(dv_id);
                    // lấy các meter đã tồn tại trong org_managers
                    let exsit_meter = await access_db("SELECT MeterCode FROM org_managers WHERE org_id = ? AND MeterCode IN ("+placeholders_2+");",val_exsit_meter);
                    // chuyển thành mảng 
                    let existingMeterCodes = exsit_meter.map(row => row.MeterCode);
                    // console.log(existingMeterCodes, checked_pass_meter)
                    // mảng gồm các meter không tồn tại/ meter mới
                    let newMeterCodes = checked_pass_meter.filter(code => !existingMeterCodes.includes(code));
                    if (newMeterCodes.length > 0) {
                        let insertValues = [];
                        for(let i=0; i<newMeterCodes.length; i++){
                            insertValues.push([newMeterCodes[i], newMeterCodes[i], new Date(), dv_id])
                        }
                        // console.log(insertValues)

                        await access_db("INSERT INTO org_managers (MeterCode, NodeCode, created_at, org_id) VALUES ?", [insertValues]);
                            let log = {
                                action: "Thêm thiết bị vào tài khoản",
                                Meter: newMeterCodes
                            }
                            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Thêm thiết bị vào tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-thiet-bi", 3]);

                        res.json({ success: true, message: ((newMeterCodes.length > 0) ? ("Thiết bị thêm thành công:" + JSON.stringify(newMeterCodes)) : "") + ((error_meter.length > 0) ? ("\n Thiết bị thêm không thành công: " + JSON.stringify(error_meter)) : "") });

                      }else{
                        res.json({ success: false, message: "Thêm thiết bị không thành công do các thiết bị đã tồn tại" });

                      }
                }else{
                    let get_dvql = await access_db("SELECT parent_id FROM organizations WHERE id = ?;",[dv_id]);
                    if(get_dvql.length > 0){
                        let dvql_id = get_dvql[0].parent_id;
                        let val_exsit_meter = [...checked_pass_meter];
                        val_exsit_meter.unshift(dvql_id);
                        let exsit_meter = await access_db("SELECT MeterCode FROM org_managers WHERE org_id = ? AND MeterCode IN ("+placeholders_2+");",val_exsit_meter);
                        let existingMeterCodes = exsit_meter.map(row => row.MeterCode);
                        let newMeterCodes = checked_pass_meter.filter(code => !existingMeterCodes.includes(code));
                        if (newMeterCodes.length > 0) {
                            let insertValues = [];
                            for(let i=0; i<newMeterCodes.length; i++){
                                insertValues.push([newMeterCodes[i], newMeterCodes[i], new Date(), dvql_id])
                            }
                            // console.log(insertValues)
                            await access_db("INSERT INTO org_managers (MeterCode, NodeCode, created_at, org_id) VALUES ?;", [insertValues]);
                          }
                          let dvnd_val_exsit_meter = [...checked_pass_meter];
                          dvnd_val_exsit_meter.unshift(dv_id);

                        let exsit_meter_dvnd = await access_db("SELECT MeterCode FROM org_groups WHERE org_id = ? AND MeterCode IN ("+placeholders_2+");",dvnd_val_exsit_meter);
                        let existingMeterCodes_dvnd = exsit_meter_dvnd.map(row => row.MeterCode);
                        let newMeterCodes_dvnd = checked_pass_meter.filter(code => !existingMeterCodes_dvnd.includes(code));
                        if (newMeterCodes_dvnd.length > 0) {
                            let insertValues_2 = [];
                            for(let i=0; i<newMeterCodes_dvnd.length; i++){
                                insertValues_2.push([newMeterCodes_dvnd[i], newMeterCodes_dvnd[i], new Date(), dv_id])
                            }
                            // console.log(newMeterCodes_dvnd)

                            await access_db("INSERT INTO org_groups (MeterCode, NodeCode, created_at, org_id) VALUES ?;", [insertValues_2]);
                            // dùng cho postgresql
                            let valuesFlat = [].concat(...insertValues_2)
                            let placeholders = insertValues_2.map((row, i) => `(${row.map((_, j) => `$${i * row.length + j + 1}`).join(",")})`).join(",");
                            let postgre_query = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "created_at", "org_id") VALUES ${placeholders}`;
                            await query(postgre_query, valuesFlat);
                            //
                 
                            let log = {
                                action: "Thêm thiết bị vào tài khoản",
                                Meter: newMeterCodes_dvnd
                            }
                            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Thêm thiết bị vào tài khoản", JSON.stringify(log), new Date(), "-", "-", "phan-quyen-thiet-bi", 3]);

                            return res.json({ success: true, message: ((newMeterCodes_dvnd.length > 0) ? ("Thiết bị thêm thành công:" + JSON.stringify(newMeterCodes_dvnd)) : "") + ((error_meter.length > 0) ? ("\n Thiết bị thêm không thành công: " + JSON.stringify(error_meter)) : "") });

                          }else{
                            return res.json({ success: false, message: "Thêm thiết bị không thành công do các thiết bị đã tồn tại" });
    
                          }
                    }else{
                        return res.json({ success: false, message: "Thêm thiết bị không thành công do sai id đơn vị quản lý" });

                    }
                }
            }else{
                return res.json({ success: false, message: "Thêm thiết bị không thành công do sai mật khẩu" });
            }

        }catch(error){
            console.error('API dashboard error:', error);
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

    

}


module.exports = dashboard_controller;