// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var fs = require('fs');
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var methodOverride = require('method-override')
// var excel = require('exceljs');

const route = require('./routes/index');
var i18n = require("i18n");
const { Server } = require('socket.io');
const WebSocket = require('ws');
var wsManager = require('./ws-manager');
let wss = new WebSocket.Server({ port: 5015 });

// var initializePassport = require('./config/passport-config')
// initializePassport(passport);

var initializePassport = require('./config/passport')
initializePassport(passport);

function validateEmail(email) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function translate_noti_app(req,str){
      if(req.cookies.lang){
        if(req.cookies.lang == "vi"){
          switch(str){
            case "Creat Account success!":
            return "Tạo tài khoản thành công";
            case "Email cannot be empty!":
            return "Email không được để trống";
            case "Invalid email format!":
            return "Sai định dạng email";
            case "Your email is incorrect":
            return "Email không chính xác";
            case "delete success":
            return "Xóa thành công";
            case "Update success!":
            return "Cập nhật thành công";
            case "Change password success!":
            return "Đổi mật khẩu thành công";
            case "wrong current password!":
            return "Sai mật khẩu hiện tại";
            case "ERR! cannot find user!":
            return "Không tìm thấy tài khoản";
            case "save success!":
            return "Lưu thành công";
            case "email or username had been use!":
              return "email hoặc tên đăng nhập đã đc sử dụng";
            case "Missing credentials":
              return "Thiếu thông tin đăng nhập";
              case "Missing register information":
              return "Thiểu thông tin đăng ký";
              case "Verify code is incorrect":
              return "Mã xác nhận không chính xác";
              case "Password cannot be empty!":
              return "Mật khẩu không được để trống"
              case "Confirm password cannot be empty!":
                return "Xác nhận mật khẩu không được để trống";
              case "Password must be at least 8 characters long!":
                return "Mật khẩu phải có độ dài ít nhất 8 ký tự"
                case "The password and confirm password must be match!": 
                return "Mật khẩu xác nhận không khớp"

          }
        }else{
          return str;
        }
      }else{
        return str;
      }
    }


function fixNum(num){
  if(Number.isNaN(Number(num)) || num == null){
    return null;
  }else{
    return +Number(num).toFixed(3)
  }
}


function configDataWmeter(arrData){
  let data=[];
  for(let i=1; i<arrData.length; i++){
    if((Number(arrData[i].TIME)-Number(arrData[i-1].TIME))>0 && (arrData[i].ValOfNum - arrData[i-1].ValOfNum)> 0){
    let flr = (arrData[i].ValOfNum - arrData[i-1].ValOfNum)*3600*1000/(Number(arrData[i].TIME)-Number(arrData[i-1].TIME));
    let x = {
      pressure: fixNum(arrData[i].pressure),
      quanity: fixNum(arrData[i].ValOfNum - arrData[i-1].ValOfNum),
      flowRate: fixNum(arrData[i].flowRate),
      TIME: Number(arrData[i].TIME),
      Voltage: arrData[i].Voltage,
      meterTime: arrData[i].meterTime
    };
    data.push(x);
  };
  }
  return data;
}

i18n.configure({
  locales:['en', 'vi'],
  defaultLocale: "vi",
  directory: __dirname + '/locales',
  queryParameter: "lang",
  autoReload: true,
  syncFiles: true,
 cookie: 'lang',
 });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
app.use(session({
  secret: "mySecret",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  },
  resave: false,
  saveUninitialized: false,
}))
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'plugins')));
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(i18n.init);
app.use((req, res, next) => {
  res.locals.t = req.__;
  next();
});
// app.use((req, res, next) => {
//   res.locals.translations = JSON.stringify(req.i18n.__mf);
//   next();
// });
app.use(methodOverride('_method'));

//route init
route(app);

app.get('/change-lang/:lang', (req, res) => {
  // req.cookies.lang = req.params.lang;
  console.log("lang: "+ req.cookies.lang)
  res.cookie('lang', req.params.lang, { maxAge: 1000*60*60*24*30 });
  res.redirect('back');
})

// Tạo socket trực tiếp trong app.js
let io = null;
var userSocketMap = [];
app.initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    const user_id = socket.handshake.auth.user_id;
    if (!user_id) return next(new Error("Thiếu user_id"));
    socket.user_id = user_id;
    next();
  });

  io.on('connection', (socket) => {
    // const { user_id } = socket;
    // const {id} = socket;
    var user_id = socket.user_id;
    var id = socket.id;
    if( !userSocketMap.some(obj => obj.id === id)){
      userSocketMap.push({
        user_id: user_id,
        id: id,
        socket: socket
      })
      app.set('userSocketMap', userSocketMap);
      app.set('io', io);
    } 


    console.log(`User ${user_id} connected via socket ${id}`);
console.log('User registered:', user_id);
    socket.on('disconnect', () => {
      userSocketMap = userSocketMap.filter(obj => obj.id !== id);
      app.set('userSocketMap', userSocketMap);
      app.set('io', io);
      console.log("dis");
    });
  });

 

}

// app.set('wss', wss);
// app.set('sendToMeterSubscribers', wsManager.sendToMeterSubscribers);

const meterSubscriptions = new Map();
wss.on('connection', (ws) => {
  // (tuỳ chọn) parse token từ URL/header nếu cần ACL
  // const url = new URL(req.url, 'http://localhost');
  // const token = url.searchParams.get('token');
app.set('ws', ws);
  // heartbeat
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    // console.log(raw)
    let msg;
    let messageStr;
      if (Buffer.isBuffer(raw)) {
      messageStr = raw.toString('utf8');
    }

    try { msg = JSON.parse(messageStr); } catch { return; }
    
    const { type, data } = msg || {};
        try {
              // console.log(msg);
          if (msg.type === 'subscribe') {
            const meters = msg.meters;
              ws.meterCodes = meters;
              wsManager.registerMeters(ws, meters);      
          } else if (msg.type === 'notify') {
            const meterCode = msg.meterCode;
            wsManager.sendToMeterSubscribers(meterCode, msg.data);
          } else if (msg.type === 'send_message'){
            wsManager.sendMessage(msg);
            }
            else {
            if (msg.length > 0){
              msg.forEach(record => {
                    const MeterCode = record.meterCode; 
                    io.to(`device:${MeterCode}`).emit("meter_instant", record);
                    wsManager.sendToMeterSubscribers(MeterCode, record);
                  });
                }
            }
          } catch (err) {
            console.error('Lỗi parse JSON:', err);
            console.log('Raw message:', messageStr);
          }
    switch (type) {
      case 'register':
        // Option: lưu user/token từ client nếu cần
        // ws.user = { id: data?.user, token: data?.token };
        ws.send(JSON.stringify({ type: 'ack', data: { registered: true } }));
        break;

      case 'subscribe': {
        const meterCodes = data.meterCodes;
        wsManager.subscribe(ws, meterCodes);
        ws.send(JSON.stringify({ type: 'subscribed', data: { count: meterCodes.length || 0 } }));
        break;
      }

      case 'unsubscribe': {
        const meterCodes = data.meterCodes;
        wsManager.unsubscribe(ws, meterCodes);
        ws.send(JSON.stringify({ type: 'unsubscribed', data: { count: meterCodes.length || 0 } }));
        break;
      }

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        break;

      default:
      wsManager.sendBulk(msg);
        // console.log("here");
        //     msg.forEach(record => {
        //       const MeterCode = record.meterCode; 
        //       console.log(MeterCode);
              
        //       wsManager.sendToMeterSubscribers(MeterCode, record);
        //     });
        break;
    }
  });

  ws.on('close', () => wsManager.unsubscribeAll(ws));
  ws.on('error', () => wsManager.unsubscribeAll(ws));
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);

wss.on('close', () => clearInterval(interval));
// wss.on('connection', (ws) => {
//   console.log('Client connected');
//   app.set('ws', ws);
//   ws.subscribedMeters = new Set();
//   ws.on('message', (message) => {
//   let messageStr = message;
//   if (Buffer.isBuffer(message)) {
//       messageStr = message.toString('utf8');
//     }

//     try {
//       const json = JSON.parse(messageStr);
//         //console.log(json);
//       if (json.type === 'subscribe') {
//         const meters = json.meters;
//         ws.meterCodes = meters;
//         wsManager.registerMeters(ws, meters);      
//       }else if (json.type === 'notify') {
//         const meterCode = json.meterCode;
//         wsManager.sendToMeterSubscribers(meterCode, json.data);
//       }else if(json.type === 'send_message'){
//         wsManager.sendMessage(json);
//       }
//       else {
//           if(json.length > 0){
//             json.forEach(record => {
//               const MeterCode = record.meterCode; 
//               io.to(`device:${MeterCode}`).emit("meter_instant", record);
//               wsManager.sendToMeterSubscribers(MeterCode, record);
//             });
//           }
//       }
//     } catch (err) {
//       console.error('Lỗi parse JSON:', err);
//       console.log('Raw message:', messageStr);
//     }
   
//   });
// });

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
// var port = 8000;
// // app.listen(port, ()=> console.log("server listening on port " + port));
// port = process.env.PORT || port;
// app.listen(port);
// console.log('todo list RESTful API server started on: ' + port);