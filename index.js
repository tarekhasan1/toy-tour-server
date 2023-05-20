const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ro4rymx.mongodb.net/?retryWrites=true&w=majority`;

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


    const carsCollection = client.db('toyTour').collection('toycars');


    // getting all data
    app.get('/cars', async(req, res) =>{
        const cursor = carsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    
    // getting data by user email
    app.get("/user-products/:email", async (req, res) => {
        const userProducts = await carsCollection.find({ email: req.params.email }).toArray();

        userProducts.length > 0
            ? res.status(200).json(userProducts)
            : res.status(404).json({ error: "data not found" });
    }
    );



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('toy tour server is running');
})

app.listen(port, () =>{
    console.log(`server is running on port ${port}`);
})