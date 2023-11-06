
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 7000; // Use process.env.PORT or default to 3000

app.use(cors());
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

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const postedJobCollection = client.db("jobManagemnetDB").collection("postedJob")
        const biddingCollection = client.db("jobManagemnetDB").collection("bidding")



// post job
        app.get('/postedjobs', async (req, res) => {
            const cursor = postedJobCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/postedjobs/:id', async (req, res) => {
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

        app.get('/bid', async (req, res) => {
            console.log(req.query.email);
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
    res.send('Hello from tech guru server side!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})