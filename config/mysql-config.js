const { query } = require('express');
const mysql = require('mysql');
const config = require('./config');

var pool = mysql.createPool({
    connectionLimit : 10,
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    multipleStatements: true
})

 function accessDB(query,val,callback){
     pool.getConnection(function(err, con){
        if(err){
            console.log(err);
        }else{
            try{
                con.query(query,val,function(err2,result){
                    if(!err2){
                        callback(result);
                    }else{
                        console.log(err2)
                    }
                    con.release();
                })
            }catch(err2){
                console.log(err2);
                con.release();
            }
        }
    })
}

// async function accessDB(query, values = []) {
//     let connection;
//     try {
//         connection = pool.getConnection();
//         const [rows] = await connection.execute(query, values);
//         return rows;
//     } catch (error) {
//         console.error("Database Error: ", error);
//         throw error;
//     } finally {
//         if (connection) connection.release();
//     }
// }

module.exports = accessDB;