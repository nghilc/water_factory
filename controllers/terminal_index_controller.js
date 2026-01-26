const { access_db, query } = require("../config/mysql_config");




const terminal_index_controller = {
    show_terminal_index: async (req,res) => {
            try{
                let danhsachtram = [];
                danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])
                let MeterCode = null;
                let NodeCode = null;
                let meter_list = [];
                let parent_id = "all";
                if (!(typeof req.query.MeterCode === "undefined" || typeof req.query.NodeCode === "undefined" || req.query.MeterCode === null || req.query.NodeCode === null || req.query.MeterCode === "null" || req.query.NodeCode === "null")) {
                    let check_meter = await access_db("SELECT * FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t1.MeterCode = ? AND t1.MeterCode = ? AND t3.user_id = ?;", [req.query.MeterCode, req.query.NodeCode, req.user.id]);
                    if (check_meter.length > 0) {
                        MeterCode = req.query.MeterCode;
                        NodeCode = req.query.NodeCode;
                        if (req.cookies.tram_id && req.cookies.dv_type) {
                            parent_id = req.cookies.dv_type + req.cookies.tram_id;
                            let tram_id = req.cookies.tram_id;
                            let dv_type = req.cookies.dv_type;

                            if (dv_type == "dvql") {
                                meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                            } else {
                                meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                            }
                        } else {
                            // lấy tất cả các thiết bị được phân quyền
                            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])

                        }
                    } else {
                        // lấy tất cả các thiết bị được phân quyền
                        meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])
                        if (meter_list.length > 0) {
                            MeterCode = meter_list[0].MeterCode;
                            NodeCode = meter_list[0].NodeCode;
                        }
                    }
                } else {
                    if (req.cookies.tram_id && req.cookies.dv_type) {
                        parent_id = req.cookies.dv_type + req.cookies.tram_id;
                        let tram_id = req.cookies.tram_id;
                        let dv_type = req.cookies.dv_type;

                        if (dv_type == "dvql") {
                            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                        } else {
                            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                        }
                    } else {
                        // lấy tất cả các thiết bị được phân quyền
                        meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])

                    }
                    if (meter_list.length > 0) {
                        MeterCode = meter_list[0].MeterCode;
                        NodeCode = meter_list[0].NodeCode;
                    }

                }
                await access_db("UPDATE users SET last_menu_link = ? WHERE id = ?;", [5, req.user.id]);

                res.render('layouts/terminal_index', {
                    access_menu: req.user.access_tab,
                    user_id: JSON.stringify(req.user.id),
                    parent_id,
                    role: req.user.role,
                    meter_list,
                    full_name: req.user.name,
                    current_path: "/terminal_index",
                    danhsachtram: danhsachtram,
                    MeterCode,
                    NodeCode,
                    t: req.__
                })
            }catch(error){
                console.error('API terminal_index error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Lỗi server' 
                  });
            }
    },
    get_meter_data: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng hôm nay
            let consum_today = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_today FROM "Operation" WHERE "MeterTime"::date = CAST($1 AS date) AND "MeterCode" = $2 AND "NodeCode" = $3;`,[date,MeterCode, NodeCode]);
            // sản lượng hôm qua
            // let consum_yesterday = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_yesterday FROM "Operation" WHERE "MeterTime"::date = CAST($1 AS date) - INTERVAL '1 day' AND "MeterCode" = $2 AND "NodeCode" = $3;`,[date, MeterCode, NodeCode]);
            let consum_yesterday = await query(`SELECT "ValOfNum" AS consum_yesterday FROM daily_meter_usage WHERE "MeterTime"::date = CAST($1 AS date) - INTERVAL '1 day' AND "MeterCode" = $2 AND "NodeCode" = $3;`, [date, MeterCode, NodeCode]);
            // sản lượng tháng này
            let consum_this_month = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_month FROM "Operation" WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) AND "MeterTime" < date_trunc('month', CAST($2 AS date)) + INTERVAL '1 month' AND "MeterCode" = $3 AND "NodeCode" = $4;`,[date,date,MeterCode,NodeCode]);
            // sản lượng tháng trước
            // let consum_last_month = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_last_month FROM "Operation" WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) - INTERVAL '1 month' AND "MeterTime" < date_trunc('month', CAST($2 AS date))  AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            let consum_last_month = await query(`SELECT "ValOfNum" AS consum_last_month FROM monthly_meter_usage WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) - INTERVAL '1 month' AND "MeterTime" < date_trunc('month', CAST($2 AS date))  AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            // sản lượng năm nay
            let consum_this_year = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_year FROM "Operation" WHERE "MeterTime" >= date_trunc('year', CAST($1 AS date))  AND "MeterTime" < date_trunc('year', CAST($2 AS date)) + INTERVAL '1 year' AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            // sản lượng năm ngoái
            let consum_last_year = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_year FROM "Operation" WHERE "MeterTime" >= date_trunc('year', CAST($1 AS date)) - INTERVAL '1 year' AND "MeterTime" < date_trunc('year', CAST($2 AS date)) AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            // sản lượng theo giờ trong hôm nay
            // let consum_hour_of_day = await query(`WITH params AS (SELECT CAST($1 AS date) AS d, CAST($1 AS date) = CURRENT_DATE AS is_today), max_hour AS (SELECT CASE WHEN is_today THEN EXTRACT(HOUR FROM CURRENT_TIMESTAMP)::int ELSE 23 END AS h FROM params), hours AS (SELECT generate_series(0, (SELECT h FROM max_hour)) AS h), calc AS (SELECT h AS hour, (MAX("ValOfNum") - MIN("ValOfNum")) AS consumption FROM hours, params, "Operation" m WHERE m."MeterTime" >= params.d + make_interval(hours => h) AND m."MeterTime" < params.d + make_interval(hours => h+1) AND m."MeterCode" = $2 AND m."NodeCode" = $3 GROUP BY h) SELECT (hour+1) AS hour_of_day, COALESCE(consumption, 0) AS consumption FROM calc ORDER BY hour;`,[date, MeterCode, NodeCode] );
            let consum_hour_of_day = await query(`
                WITH params AS (
                    SELECT CAST($1 AS date) AS d,
                           CAST($1 AS date) - INTERVAL '1 day' AS d_yesterday
                  ),
                  h AS (
                    SELECT generate_series(0,24) AS h
                  ),
                  today_vals AS (
                    SELECT h.h,
                           MIN(m."ValOfNum") AS min_val
                    FROM h
                    CROSS JOIN params
                    LEFT JOIN "Operation" m
                      ON m."MeterTime" >= params.d + make_interval(hours => h.h)
                     AND m."MeterTime" <  params.d + make_interval(hours => h.h+1)
                     AND m."MeterCode" = $2
                     AND m."NodeCode" = $3
                    GROUP BY h.h
                  ),
                  yesterday_vals AS (
                    SELECT h.h,
                           MIN(m."ValOfNum") AS min_val
                    FROM h
                    CROSS JOIN params
                    LEFT JOIN "Operation" m
                      ON m."MeterTime" >= params.d_yesterday + make_interval(hours => h.h)
                     AND m."MeterTime" <  params.d_yesterday + make_interval(hours => h.h+1)
                     AND m."MeterCode" = $2
                     AND m."NodeCode" = $3
                    GROUP BY h.h
                  ),
                  today_calc AS (
                    SELECT h,
                           (LEAD(min_val) OVER (ORDER BY h) - min_val) AS consumption
                    FROM today_vals
                  ),
                  yesterday_calc AS (
                    SELECT h,
                           (LEAD(min_val) OVER (ORDER BY h) - min_val) AS consum_yesterday
                    FROM yesterday_vals
                  )
                  SELECT gs.h AS hour_of_day,
                         COALESCE(y.consum_yesterday, 0) AS consum_yesterday,
                         COALESCE(t.consumption, 0)      AS consumption
                  FROM (SELECT generate_series(0,23) AS h) gs
                  LEFT JOIN yesterday_calc y ON y.h = gs.h
                  LEFT JOIN today_calc     t ON t.h = gs.h
                  ORDER BY gs.h;
            `, [date, MeterCode, NodeCode]);
            // sản lượng theo ngày trong tháng này
            // let consum_day_of_month = await query(`SELECT COALESCE("ValEnd",0) - COALESCE("ValStart",0) AS consumption, "MeterTime", EXTRACT(DAY FROM "MeterTime")::int AS day_of_month FROM daily_meter_usage WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) AND "MeterTime" < date_trunc('month', CAST($1 AS date)) + INTERVAL '1 month' AND "MeterCode" = $2 AND "NodeCode" = $3;`,[date, MeterCode, NodeCode]);
            let consum_day_of_month = await query(`
                WITH this_month AS (
                    SELECT CAST($1 AS date) AS d,
                           date_trunc('month', CAST($1 AS date)) AS start_this_month,
                           (date_trunc('month', CAST($1 AS date)) + interval '1 month')::date AS start_next_month
                ),
                last_month AS (
                    SELECT (date_trunc('month', CAST($1 AS date)) - interval '1 month')::date AS start_last_month,
                           date_trunc('month', CAST($1 AS date))::date AS end_last_month,
                           (date_trunc('month', CAST($1 AS date)) - interval '1 day')::date AS last_day_last_month
                ),
                days AS (
                    SELECT generate_series(
                        (SELECT start_last_month FROM last_month),
                        (SELECT last_day_last_month FROM last_month),
                        interval '1 day'
                    )::date AS day
                ),
                data_this AS (
                    SELECT "MeterTime"::date AS d, 
                    "ValOfNum" AS consumption
                    FROM daily_meter_usage, this_month
                    WHERE "MeterTime" >= this_month.start_this_month
                      AND "MeterTime" < this_month.start_next_month
                      AND "MeterCode" = $2
                      AND "NodeCode" = $3
                ),
                data_last AS (
                    SELECT "MeterTime"::date AS d, 
                    "ValOfNum" AS consumption
                    FROM daily_meter_usage, last_month
                    WHERE "MeterTime" >= last_month.start_last_month
                      AND "MeterTime" < last_month.end_last_month
                      AND "MeterCode" = $2
                      AND "NodeCode" = $3
                )
                SELECT 
                    EXTRACT(DAY FROM days.day)::int AS day_of_month,
                    COALESCE(dt.consumption,0) AS consumption,
                    COALESCE(dl.consumption,0) AS consum_yesterday
                FROM days
                LEFT JOIN data_this dt ON dt.d = days.day + interval '1 month'
                LEFT JOIN data_last dl ON dl.d = days.day
                ORDER BY day_of_month;
            `, [date, MeterCode, NodeCode]);
            // sản lượng theo tháng trong năm nay
            // let consum_month_of_year = await query(`SELECT COALESCE("ValEnd",0) - COALESCE("ValStart",0) AS consumption, "MeterTime", EXTRACT(MONTH FROM "MeterTime")::int AS month_of_year FROM monthly_meter_usage WHERE "MeterTime" >= date_trunc('year', CAST($1 AS date)) AND "MeterTime" < date_trunc('year', CAST($1 AS date)) + INTERVAL '1 year' AND "MeterCode" = $2 AND "NodeCode" = $3;`, [date, MeterCode, NodeCode]);
                let consum_month_of_year = await query(`
                    WITH this_year AS (
                        SELECT date_trunc('year', CAST($1 AS date))::date AS start_this_year,
                               (date_trunc('year', CAST($1 AS date)) + interval '1 year')::date AS start_next_year
                    ),
                    last_year AS (
                        SELECT (date_trunc('year', CAST($1 AS date)) - interval '1 year')::date AS start_last_year,
                               date_trunc('year', CAST($1 AS date))::date AS end_last_year
                    ),
                    months AS (
                        SELECT generate_series(1, 12) AS m
                    ),
                    data_this AS (
                        SELECT EXTRACT(MONTH FROM "MeterTime")::int AS m, 
                        "ValOfNum" AS consumption
                        FROM monthly_meter_usage, this_year
                        WHERE "MeterTime" >= this_year.start_this_year
                          AND "MeterTime" < this_year.start_next_year
                          AND "MeterCode" = $2
                          AND "NodeCode" = $3
                    ),
                    data_last AS (
                        SELECT EXTRACT(MONTH FROM "MeterTime")::int AS m, 
                        "ValOfNum" AS consumption
                        FROM monthly_meter_usage, last_year
                        WHERE "MeterTime" >= last_year.start_last_year
                          AND "MeterTime" < last_year.end_last_year
                          AND "MeterCode" = $2
                          AND "NodeCode" = $3
                    )
                    SELECT 
                        months.m AS month_of_year,
                        COALESCE(dt.consumption,0) AS consumption,
                        COALESCE(dl.consumption,0) AS consum_yesterday
                    FROM months
                    LEFT JOIN data_this dt ON dt.m = months.m
                    LEFT JOIN data_last dl ON dl.m = months.m
                    ORDER BY months.m;
                    `, [date, MeterCode, NodeCode]);
            res.json({
                consum_today: (consum_today.length > 0) ? consum_today[0].consum_today : null,
                consum_yesterday: (consum_yesterday.length > 0) ? consum_yesterday[0].consum_yesterday : null,
                consum_this_month: (consum_this_month.length > 0) ? consum_this_month[0].consum_this_month : null,
                consum_last_month: (consum_last_month.length > 0) ? consum_last_month[0].consum_last_month : null,
                consum_this_year: (consum_this_year.length > 0) ? consum_this_year[0].consum_this_year : null,
                consum_last_year: (consum_last_year.length > 0) ? consum_last_year[0].consum_last_year : null,
                consum_hour_of_day: consum_hour_of_day,
                consum_day_of_month: consum_day_of_month,
                consum_month_of_year: consum_month_of_year
            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    post_insert_daily_terminal_index: async (req, res) => {
        try {
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let date = req.body.date;
            let terminal_index_val = req.body.terminal_index_val;
            let ValStart = (req.body.ValStart == "") ? null : req.body.ValStart;
            let ValEnd = (req.body.ValEnd == "") ? null : req.body.ValEnd;
            if (date == "" || date == null){
                return res.json({
                    success: false,
                    message: "Thời gian không được để trống"
                })
            }
            if (terminal_index_val == "" || terminal_index_val == null) {
                return res.json({
                    success: false,
                    message: "Sản lượng không được để trống"
                })
            }
            try{
                let check_exist = await query(`SELECT * FROM daily_meter_usage WHERE "MeterCode" = $1 AND "NodeCode" = $2 AND "MeterTime" = $3;`,[MeterCode, NodeCode, date]);
                if(check_exist.length > 0){
                    return res.json({
                        success: false,
                        message: "Dữ liệu tại thời điểm này đã tồn tại"
                    });
                }
                await query(`INSERT INTO daily_meter_usage ("MeterCode","NodeCode","MeterTime", "ValStart", "ValEnd", "ValOfNum","ValType") VALUES ($1, $2, $3, $4, $5, $6, $7);`, [MeterCode, NodeCode, date, ValStart, ValEnd, terminal_index_val, 1]);

                await query(`INSERT INTO "Operation" ("MeterCode","NodeCode","MeterTime", "terminal_index", "MessageType") VALUES ($1, $2, $3, $4, $5);`, [MeterCode, NodeCode, date, terminal_index_val, "INPUT"]);
                let log = {
                    MeterCode: MeterCode,
                    NodeCode: NodeCode,
                    date: date,
                    terminal_index_val: terminal_index_val,
                    ValStart: ValStart,
                    ValEnd: ValEnd,
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt nhập liệu giám sát sản lượng", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-giam-sat-san-luong", 1]);

                return res.json({
                    success: true,
                    message: "Lưu thành công"
                })
            }catch(err){
                console.error(err);
                return res.json({
                    success: false,
                    message: "Lưu thất bại"
                });
            }
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_today_and_yesterday: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng hôm nay
            let consum_today = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_today FROM "Operation" WHERE "MeterTime"::date = CAST($1 AS date) AND "MeterCode" = $2 AND "NodeCode" = $3;`, [date, MeterCode, NodeCode]);
            // sản lượng hôm qua
            let consum_yesterday = await query(`SELECT "ValOfNum" AS consum_yesterday FROM daily_meter_usage WHERE "MeterTime"::date = CAST($1 AS date) - INTERVAL '1 day' AND "MeterCode" = $2 AND "NodeCode" = $3;`, [date, MeterCode, NodeCode]);
            res.json({
                consum_today: (consum_today.length > 0) ? consum_today[0].consum_today : null,
                consum_yesterday: (consum_yesterday.length > 0) ? consum_yesterday[0].consum_yesterday : null
            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_this_month_and_last_month: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng tháng này
            let consum_this_month = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_month FROM "Operation" WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) AND "MeterTime" < date_trunc('month', CAST($2 AS date)) + INTERVAL '1 month' AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            // sản lượng tháng trước
            let consum_last_month = await query(`SELECT "ValOfNum" AS consum_last_month FROM monthly_meter_usage WHERE "MeterTime" >= date_trunc('month', CAST($1 AS date)) - INTERVAL '1 month' AND "MeterTime" < date_trunc('month', CAST($2 AS date))  AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            res.json({
                consum_this_month: (consum_this_month.length > 0) ? consum_this_month[0].consum_this_month : null,
                consum_last_month: (consum_last_month.length > 0) ? consum_last_month[0].consum_last_month : null

            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_this_year_and_last_year: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng năm nay
            let consum_this_year = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_year FROM "Operation" WHERE "MeterTime" >= date_trunc('year', CAST($1 AS date))  AND "MeterTime" < date_trunc('year', CAST($2 AS date)) + INTERVAL '1 year' AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            // sản lượng năm ngoái
            let consum_last_year = await query(`SELECT MAX("ValOfNum") - MIN("ValOfNum") AS consum_this_year FROM "Operation" WHERE "MeterTime" >= date_trunc('year', CAST($1 AS date)) - INTERVAL '1 year' AND "MeterTime" < date_trunc('year', CAST($2 AS date)) AND "MeterCode" = $3 AND "NodeCode" = $4;`, [date, date, MeterCode, NodeCode]);
            res.json({
                consum_this_year: (consum_this_year.length > 0) ? consum_this_year[0].consum_this_year : null,
                consum_last_year: (consum_last_year.length > 0) ? consum_last_year[0].consum_last_year : null,
            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_hour_of_day: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng theo giờ trong hôm nay
            let consum_hour_of_day = await query(`
                WITH params AS (
                    SELECT CAST($1 AS date) AS d,
                           CAST($1 AS date) - INTERVAL '1 day' AS d_yesterday
                  ),
                  h AS (
                    SELECT generate_series(0,24) AS h
                  ),
                  today_vals AS (
                    SELECT h.h,
                           MIN(m."ValOfNum") AS min_val
                    FROM h
                    CROSS JOIN params
                    LEFT JOIN "Operation" m
                      ON m."MeterTime" >= params.d + make_interval(hours => h.h)
                     AND m."MeterTime" <  params.d + make_interval(hours => h.h+1)
                     AND m."MeterCode" = $2
                     AND m."NodeCode" = $3
                    GROUP BY h.h
                  ),
                  yesterday_vals AS (
                    SELECT h.h,
                           MIN(m."ValOfNum") AS min_val
                    FROM h
                    CROSS JOIN params
                    LEFT JOIN "Operation" m
                      ON m."MeterTime" >= params.d_yesterday + make_interval(hours => h.h)
                     AND m."MeterTime" <  params.d_yesterday + make_interval(hours => h.h+1)
                     AND m."MeterCode" = $2
                     AND m."NodeCode" = $3
                    GROUP BY h.h
                  ),
                  today_calc AS (
                    SELECT h,
                           (LEAD(min_val) OVER (ORDER BY h) - min_val) AS consumption
                    FROM today_vals
                  ),
                  yesterday_calc AS (
                    SELECT h,
                           (LEAD(min_val) OVER (ORDER BY h) - min_val) AS consum_yesterday
                    FROM yesterday_vals
                  )
                  SELECT gs.h AS hour_of_day,
                         COALESCE(y.consum_yesterday, 0) AS consum_yesterday,
                         COALESCE(t.consumption, 0)      AS consumption
                  FROM (SELECT generate_series(0,23) AS h) gs
                  LEFT JOIN yesterday_calc y ON y.h = gs.h
                  LEFT JOIN today_calc     t ON t.h = gs.h
                  ORDER BY gs.h;
            `, [date, MeterCode, NodeCode]);
            res.json({

                consum_hour_of_day: consum_hour_of_day

            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_day_of_month: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng theo ngày trong tháng này
            let consum_day_of_month = await query(`
                WITH this_month AS (
                    SELECT CAST($1 AS date) AS d,
                           date_trunc('month', CAST($1 AS date)) AS start_this_month,
                           (date_trunc('month', CAST($1 AS date)) + interval '1 month')::date AS start_next_month
                ),
                last_month AS (
                    SELECT (date_trunc('month', CAST($1 AS date)) - interval '1 month')::date AS start_last_month,
                           date_trunc('month', CAST($1 AS date))::date AS end_last_month,
                           (date_trunc('month', CAST($1 AS date)) - interval '1 day')::date AS last_day_last_month
                ),
                days AS (
                    SELECT generate_series(
                        (SELECT start_last_month FROM last_month),
                        (SELECT last_day_last_month FROM last_month),
                        interval '1 day'
                    )::date AS day
                ),
                data_this AS (
                    SELECT "MeterTime"::date AS d, 
                    "ValOfNum" AS consumption
                    FROM daily_meter_usage, this_month
                    WHERE "MeterTime" >= this_month.start_this_month
                      AND "MeterTime" < this_month.start_next_month
                      AND "MeterCode" = $2
                      AND "NodeCode" = $3
                ),
                data_last AS (
                    SELECT "MeterTime"::date AS d, 
                    "ValOfNum" AS consumption
                    FROM daily_meter_usage, last_month
                    WHERE "MeterTime" >= last_month.start_last_month
                      AND "MeterTime" < last_month.end_last_month
                      AND "MeterCode" = $2
                      AND "NodeCode" = $3
                )
                SELECT 
                    EXTRACT(DAY FROM days.day)::int AS day_of_month,
                    COALESCE(dt.consumption,0) AS consumption,
                    COALESCE(dl.consumption,0) AS consum_yesterday
                FROM days
                LEFT JOIN data_this dt ON dt.d = days.day + interval '1 month'
                LEFT JOIN data_last dl ON dl.d = days.day
                ORDER BY day_of_month;
            `, [date, MeterCode, NodeCode]);
            res.json({

                consum_day_of_month: consum_day_of_month
            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_data_month_of_year: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let date = req.query.date;
            // sản lượng theo tháng trong năm nay
            let consum_month_of_year = await query(`
                    WITH this_year AS (
                        SELECT date_trunc('year', CAST($1 AS date))::date AS start_this_year,
                               (date_trunc('year', CAST($1 AS date)) + interval '1 year')::date AS start_next_year
                    ),
                    last_year AS (
                        SELECT (date_trunc('year', CAST($1 AS date)) - interval '1 year')::date AS start_last_year,
                               date_trunc('year', CAST($1 AS date))::date AS end_last_year
                    ),
                    months AS (
                        SELECT generate_series(1, 12) AS m
                    ),
                    data_this AS (
                        SELECT EXTRACT(MONTH FROM "MeterTime")::int AS m, 
                        "ValOfNum" AS consumption
                        FROM monthly_meter_usage, this_year
                        WHERE "MeterTime" >= this_year.start_this_year
                          AND "MeterTime" < this_year.start_next_year
                          AND "MeterCode" = $2
                          AND "NodeCode" = $3
                    ),
                    data_last AS (
                        SELECT EXTRACT(MONTH FROM "MeterTime")::int AS m, 
                        "ValOfNum" AS consumption
                        FROM monthly_meter_usage, last_year
                        WHERE "MeterTime" >= last_year.start_last_year
                          AND "MeterTime" < last_year.end_last_year
                          AND "MeterCode" = $2
                          AND "NodeCode" = $3
                    )
                    SELECT 
                        months.m AS month_of_year,
                        COALESCE(dt.consumption,0) AS consumption,
                        COALESCE(dl.consumption,0) AS consum_yesterday
                    FROM months
                    LEFT JOIN data_this dt ON dt.m = months.m
                    LEFT JOIN data_last dl ON dl.m = months.m
                    ORDER BY months.m;
                    `, [date, MeterCode, NodeCode]);
            res.json({
                consum_month_of_year: consum_month_of_year
            })
        } catch (error) {
            console.error('API terminal_index error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    // show_terminal_index: (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API terminal_index error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },
    // show_terminal_index: (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API terminal_index error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },
    // show_terminal_index: (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API terminal_index error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },

    // show_terminal_index: (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API terminal_index error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },
    // show_terminal_index: (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API terminal_index error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },

}



module.exports = terminal_index_controller;