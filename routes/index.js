

const auth_router = require('./auth')
const dashboard_router = require('./dashboard')
const overview_router = require('./overview')
const monitoring_router = require('./monitoring')
const data_search_router = require('./data_search')
const setting_router = require('./setting')
const alert_router = require('./alert')
const manage_router = require('./manage')
const report_router = require('./report')
const profile_router = require('./profile')
const config_meter_router = require('./config_meter')
const api_router = require('./api_router')
const dma_router = require('./dma')
const terminal_indexa_router = require('./terminal_index')




function route(app){
    // app.use('/admin', admin_router);
    // app.use('/', user_router);  
    app.use('/',auth_router); 
    app.use('/dashboard',dashboard_router); 
    app.use('/overview',overview_router); 
    app.use('/monitoring',monitoring_router); 
    app.use('/data_search',data_search_router); 
    app.use('/setting',setting_router); 
    app.use('/alert',alert_router); 
    app.use('/manage',manage_router); 
    app.use('/report',report_router); 
    app.use('/profile',profile_router); 
    app.use('/config_meter',config_meter_router); 
    app.use('/',api_router); 
    app.use('/DMA', dma_router); 
    app.use('/terminal_index', terminal_indexa_router); 


}

module.exports = route;