
const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
app.use(cookieParser())
const port = process.env.PORT || 7000; // Use process.env.PORT or default to 3000


app.use(cors({
    origin: [
        'https://job-management-auth.web.app',
        'https://job-management-auth.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkhcmhi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// middleWare
const logger = (req, res, next) =>{
    console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) =>{
    const token = req?.cookies?.token;
    console.log('token in the middleware', token);
    // no token available 
    if(!token){
        return res.status(401).send({message: 'unauthorized access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) =>{
        if(err){
            console.log(err);
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const postedJobCollection = client.db("jobManagemnetDB").collection("postedJob")
        const biddingCollection = client.db("jobManagemnetDB").collection("bidding")
        const usersCollection = client.db("jobManagemnetDB").collection("users")


       //auth related api jwt
       app.post('/jwt', logger, async (req, res) => {
        const user = req.body;
        console.log('user for token', user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN,
            {
                expiresIn: '1h'
            })
        console.log(token)
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
            .send({ success: true });
    })

    // app.post('/jwt', async(req , res) =>{
    //     const user = req.body;
    //     console.log(user);
    //     const token = jwt.sign(user,process.env.ACCESS_TOKEN, {expiresIn: '1h'})
    //     res.send(token)
    // })


    // user
    app.get('/users', async (req, res) => {
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })
    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await usersCollection.findOne(query)
        res.send(result)
    })
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        console.log(newUser);
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    });
// post job
        app.get('/postedjobs',logger, async (req, res) => {
            const cursor = postedJobCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/postedjobs/:id',logger, async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await postedJobCollection.findOne(query)
            res.send(result)
        })
        app.post('/postedjobs', async (req, res) => {
            const postedjobs = req.body;
            console.log(postedjobs);
            const result = await postedJobCollection.insertOne(postedjobs);
            res.send(result);
        });

        app.delete('/postedjobs/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await postedJobCollection.deleteOne(query);
            res.send(result);
            
        })
        app.put('/postedjobs/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedPostedJob = req.body;
            const product = {
                $set: {
                    email: updatedPostedJob.email,
                    jobTitle: updatedPostedJob.jobTitle,
                    description: updatedPostedJob.description,
                    jobCategory: updatedPostedJob.jobCategory,
                    description: updatedPostedJob.description,
                    deadline: updatedPostedJob.deadline,
                    maxPrice: updatedPostedJob.maxPrice,
                    minPrice: updatedPostedJob.minPrice


                }
            }
            const result = await postedJobCollection.updateOne(filter, product, options)
            res.send(result);
        })

        // bidding

        app.get('/bid',logger, async (req, res) => {  //verifyToken,
            console.log('mail2',req.query.email);
            console.log('tok tok ', req.cookies.token);
            let query ={};
            if (req.query?.email) {
                query = {email: req.query.email}
            }
            const cursor = biddingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/bid', async (req, res) => {
            const bid = req.body;
            console.log(bid);
            const result = await biddingCollection.insertOne(bid);
            res.send(result);
        });
        app.patch('/bid/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBiding = req.body;
            console.log(updatedBiding);
            const updateDoc = {
                $set: {
                    status: updatedBiding.status
                },
            };
            const result = await biddingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        
        
        app.delete('/bid/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await biddingCollection.deleteOne(query);
            res.send(result);
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from the job management server .. side!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})