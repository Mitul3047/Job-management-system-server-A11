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