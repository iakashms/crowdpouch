const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 4000;
const mongoose = require('mongoose');
const User = require('./models/user');
const config = require('./config');
const auth = require('./middleware/auth');
const customApiRouter = require('./routes/customApi')
var cors = require('cors')

const connection_url = "mongodb://localhost:27017/crowdPouch"
// const connection_url = `mongodb+srv://${config.env.MONGO_USER}:${config.env.MONGO_PASSWORD}@cluster0.b1yrq.mongodb.net/${config.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
app.use(cors())
 
app.use(auth)
app.use('/api/v1',customApiRouter);

mongoose.set('useFindAndModify', false);

mongoose.connect(connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((res)=>{
    app.listen(port,() => console.log(`Express Server is now running on localhost:${port}`))
}).catch((err)=>{
    console.log(`Mongoose default connection has occured ${err} error`);
})

mongoose.connection.on('connected', function(){  
    console.log("Mongoose default connection is open to ", connection_url);
});

mongoose.connection.on('disconnected', function(){
    console.log("Mongoose default connection is disconnected");
});
