
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
        await client.connect();

        const postedJobCollection = client.db("jobManagemnetDB").collection("postedJob")




        app.get('/postedjobs', async (req, res) => {
            const cursor = postedJobCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.post('/postedjobs', async (req, res) => {
            const postedjobs = req.body;
            console.log(postedjobs);
            const result = await postedJobCollection.insertOne(postedjobs);
            res.send(result);
        });

        app.get('/postedjobs/:jobCategory', async (req, res) => {
            const jobCategory = req.params.jobCategory;
            console.log('brand name', jobCategory);
            const query = { brand_name: { $regex: new RegExp(jobCategory, 'i') } };
            const result = await postedJobCollection.find(query);

            res.send(result);
            console.log('brand name res', result);
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