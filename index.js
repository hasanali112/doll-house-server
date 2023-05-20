const express = require ('express')
const cors = require ('cors')
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res)=>{
    console.log('doll-house server is running')
    res.send('Doll House is ready for receive data from Mongodb')
})

app.listen(port, ()=>{
    console.log(`doll-house server is running: ${port}`)
})