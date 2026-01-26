let mqtt_option = require("./mqtt-config.js");
var mqtt = require('mqtt');
const accessDB = require("./mysql-config.js");


function send_mqtt(req,res){
    let ideq = req.session.ideq;
    // console.log(engine_index,block)
    var Options={
        clientId:"danh_duc_tu_dien",
        username: mqtt_option.username,
        password: mqtt_option.password,
        clean:true
    };
    var client  = mqtt.connect(mqtt_option.server,Options);
    var TOPIC = "AMI/"+ideq+"/SeriS";
    
    let mess = "01";
    var mess_hex = Buffer.from(mess, 'hex');
    
    client.subscribe(TOPIC, {qos:1});
    client.publish(TOPIC,mess_hex,{retain:true ,qos:1});
    
    client.on('message',function(topic, message, packet){
        let a = message.toString('hex');
        console.log(a, ideq);
            res.send("Đã gửi bản tin cập nhật serial sim tới thiết bị");
            res.end();
            client.unsubscribe(TOPIC);
            client.on('close',function(){
                console.log("close");
            });
            client.end();
    });
    client.on("error",function(error){
        console.log("Can't connect: " + error);
    })
}

module.exports = send_mqtt