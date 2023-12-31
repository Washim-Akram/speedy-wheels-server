const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware's
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x32av.mongodb.net/?retryWrites=true&w=majority`;

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

    const carCollection = client.db("speedyWheels").collection("cars");

    app.get("/cars", async(req, res) => {
        const result = await carCollection.find().limit(20).toArray();
        res.send(result);
    });

    app.get("/car/:id", async(req, res) => {
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await carCollection.findOne(query);
        res.send(result);
    });

    app.get("/cars/:category", async(req, res) => {
        if(req.params.category == 'regular' || req.params.category == 'sports' || req.params.category == 'truck') {
            const result = await carCollection.find({category: req.params.category}).toArray();
             res.send(result);
        }
    });

    app.get("/my-cars", async(req, res) => {
      let query = {};
      if(req.query?.email) {
        query = {sellerEmail : req.query.email}
      }
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/cars", async(req, res) => {
        const car = req.body;
        const result = await carCollection.insertOne(car);
        res.send(result);
    });

    app.patch('/cars/:id', async(req, res) => {
      const id = req.params.id;
      const car = req.body;
      const filter = { _id: new ObjectId(id)};
      const updatedCar = {
        $set: {
          price: car.price,
          quantity: car.quantity,
          description: car.description
        }
      }
      const result = await carCollection.updateOne(filter, updatedCar);
      res.send(result);
    });

    app.delete('/cars/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)};
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send('Speedy Wheels Server is Running');
});


app.listen(port, () => {
    console.log(`Speedy Wheels Server is Running on Port : ${port}`);
});