const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    app.get('/', (req, res) =>{
      res.send('toy tour server is running');
  })

    // getting all data
    app.get('/cars', async(req, res) =>{
        const cursor = carsCollection.find();
        const result = await cursor.limit(20).toArray();
        res.send(result);
    })




    // getting single car toy data
    app.get("/single-car/:id", async (req, res) => {
        console.log(req.params.id)
        const singleProduct = await carsCollection.find({ _id: new ObjectId(req.params.id) }).toArray();
        console.log(singleProduct);

        singleProduct.length > 0
            ? res.status(200).json(singleProduct)
            : res.status(404).json({ error: "data not found" });
    });


    
    // getting data by user email
    app.get("/user-cars/:email", async (req, res) => {
        console.log(req.params.email)
        const userProducts = await carsCollection.find({ email: req.params.email }).toArray();

        userProducts.length > 0
            ? res.status(200).json(userProducts)
            : res.status(404).json({ error: "data not found" });
    }
    ); 
    
    // category wise data collection finding
    app.get('/categories', async(req, res) =>{
      const sportsCar = await carsCollection.find({category: "Sports Car"}).toArray();

      const classic = await carsCollection.find({category: "Classic"}).toArray();

      const offRoad = await carsCollection.find({category: "Off-Road"}).toArray();

      const data = [sportsCar, classic, offRoad];

      data.length > 0 ? res.status(200).json(data): res.status(404).json({error: 'data not found'});
    })


    // create new car data
    app.post('/create-car', async(req, res) =>{
      const newCar = await carsCollection.insertOne(req.body);

      newCar.acknowledged ? res.status(200).json({ message: "car successfully added"}) : res.status(400).json({ error: "Bad Request"});
    })


    // update car data
    app.put('/update-car/:id', async(req, res) => {
      const objId = new ObjectId(req.params.id);
      const updateCar = await carsCollection.updateOne(
        { _id: objId},
        { $set: {
          ...req.body
        } }
      );

      updateCar.acknowledged ? res.status(200).json({ message: "product successfully updated" })
      : res.status(400).json({ error: "Bad Request" });
    });



    // delete car data
    app.delete('/delete-car/:id', async(req, res) =>{
      const objId = new ObjectId(req.params.id);
      const deleteCar = await carsCollection.deleteOne({ _id: objId});

      deleteCar.acknowledged
      ? res.status(200).json({ message: "product successfully deleted" })
      : res.status(400).json({ error: "Bad Request" });
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

app.listen(port, () =>{
    console.log(`server is running on port ${port}`);
})