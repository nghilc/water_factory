const meterSubscriptions = new Map(); 
const {access_db} = require("./config/mysql_config");
const util = require("./config/util");

async function sendMessage(json){
  try{
    let check_meter = await access_db("SELECT * FROM totaleq WHERE MeterCode = ?",[json.meter]);
    let DcuCode;
    let server_address;
    if(check_meter.length > 0){
      server_address = check_meter[0].server_address;
      DcuCode = check_meter[0].DcuCode;
    }
    let user_id = json.user_id;
    let topic = json.topic;
    let payload_temp = json.message;
    let payload = payload_temp + util.genCrc(payload_temp);
   await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, user_id,0]);
    
  }catch(error){
    console.error('wss connection send_message error:', error);
  }
}

function registerMeters(ws, meterCodes) {
  meterCodes.forEach(meterCode => {
    if (!meterSubscriptions.has(meterCode)) {
      meterSubscriptions.set(meterCode, new Set());
    }
    meterSubscriptions.get(meterCode).add(ws);
  });

  ws.on('close', () => {

    meterSubscriptions.forEach((set, meterCode) => {
      set.delete(ws);
      if (set.size === 0) {
        meterSubscriptions.delete(meterCode);
      }
    });
  });
}

// function sendToMeterSubscribers(meterCode, data) {
//   const subscribers = meterSubscriptions.get(meterCode);
//   if (subscribers) {
//     for (const ws of subscribers) {
//       if (ws.readyState === ws.OPEN) {
//         ws.send(JSON.stringify({ meterCode, ...data }));
//       }
//     }
//   }
// }


// ws -> Set<meterCode>
const wsSubscriptions = new WeakMap();

// (tùy chọn) throttle mỗi meter
const lastSentAt = new Map();         // meterCode -> timestamp(ms)
const THROTTLE_MS = 100;              // tối đa 10 msg/s/meter

function subscribe(ws, meterCodes) {
  if (!Array.isArray(meterCodes) || meterCodes.length === 0) return;

  let set = wsSubscriptions.get(ws);
  if (!set) {
    set = new Set();
    wsSubscriptions.set(ws, set);
  }
  for (const code of meterCodes.map(String)) {
    let subs = meterSubscriptions.get(code);
    if (!subs) {
      subs = new Set();
      meterSubscriptions.set(code, subs);
    }
    subs.add(ws);
    set.add(code);
  }
}

function unsubscribe(ws, meterCodes) {
  if (!Array.isArray(meterCodes) || meterCodes.length === 0) return;
  const set = wsSubscriptions.get(ws);
  if (!set) return;

  for (const code of meterCodes.map(String)) {
    const subs = meterSubscriptions.get(code);
    if (subs) {
      subs.delete(ws);
      if (subs.size === 0) meterSubscriptions.delete(code);
    }
    set.delete(code);
  }
}

function unsubscribeAll(ws) {
  const set = wsSubscriptions.get(ws);
  if (!set) return;
  for (const code of set) {
    const subs = meterSubscriptions.get(code);
    if (subs) {
      subs.delete(ws);
      if (subs.size === 0) meterSubscriptions.delete(code);
    }
  }
  wsSubscriptions.delete(ws);
}

// Gửi 1 meter update tới subscribers (có throttle)
function sendToMeterSubscribers(meterCode, data) {
  const now = Date.now();
  const last = lastSentAt.get(meterCode) || 0;
  if (now - last < THROTTLE_MS) return; // bỏ bớt nếu quá dày
  lastSentAt.set(meterCode, now);

  const subs = meterSubscriptions.get(String(meterCode));
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({ meterCode, ...data });// JSON.stringify({ type: 'meter_update', data: { meterCode, ...data } });

  for (const ws of subs) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

// Gửi nhiều meter 1 lần (gom theo ws)
function sendBulk(updates /* Array<{meterCode, ...fields}> */) {
  if (!Array.isArray(updates) || updates.length === 0) return;
  const perWs = new Map(); // ws -> array
  for (const { meterCode, ...rest } of updates) {
    const subs = meterSubscriptions.get(String(meterCode));
    if (!subs || subs.size === 0) continue;
    for (const ws of subs) {
      if (ws.readyState !== ws.OPEN) continue;
      if (!perWs.has(ws)) perWs.set(ws, []);
      perWs.get(ws).push({ meterCode, ...rest });
    }
  }
  for (const [ws, list] of perWs) {
    ws.send(JSON.stringify({ type: 'bulk', data: list }));
  }
}

function sanitizeJsLiteralToJson(str) {
  // BỎ nếu Java đã gửi JSON chuẩn
  str = str.toString().replace(/^\uFEFF/, '').trim();
  // đổi '...' → "..."
  str = str.replace(/'/g, '"');
  // thêm quote quanh key: meterCode: -> "meterCode":
  str = str.replace(/([{,\s])(\w+)\s*:/g, '$1"$2":');
  return str;
}

function safeParse(msg) {
  const raw = msg.toString();
  try {
    return JSON.parse(raw);
  } catch {
    // thử sanitize nếu là object-literal
    try {
      const fixed = sanitizeJsLiteralToJson(raw);
      return JSON.parse(fixed);
    } catch (e2) {
      console.error('JSON parse failed:', e2.message, 'raw =', raw);
      return null;
    }
  }
}


module.exports = {
  registerMeters,sendBulk,unsubscribeAll,unsubscribe,subscribe,sendBulk,sanitizeJsLiteralToJson,safeParse,
  sendToMeterSubscribers,sendMessage
};
