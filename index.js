const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_username}:${process.env.DB_password}@cluster1.4gey7ap.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const userReviewCollection = client.db("reviewDb").collection("review");
    const createToyCollection = client.db("addAtoyDB").collection("addtoy");

    //for add a toy
    app.post("/addtoys", async (req, res) => {
      const addAtoy = req.body;
      console.log(addAtoy);
      const result = await createToyCollection.insertOne(addAtoy);
      res.send(result);
    });

    //receive from mongodb
    app.get("/alltoys", async (req, res) => {
      const cursor = createToyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });



    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await createToyCollection.findOne(query);
      res.send(result);
    });

   

    //my toys
    app.get("/mytoy/:email", async (req, res) => {
      const result = await createToyCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });


    //search  

    const indexKeys = {toyName: 1, categories: 1}
    const indexOptions ={name: "searchToyNameCategories"}
    const result = await createToyCollection.createIndex(indexKeys, indexOptions)

    app.get('/searchbytoy/:text', async (req, res)=>{
       const searchText = req.params.text;
       const result = await createToyCollection.find({
        $or:[
          {toyName: {$regex:searchText , $options: 'i'}},
          {categories: {$regex:searchText , $options: 'i'}},
        ]
       }).toArray()
       res.send(result)
    })
  
     

    //update coffee
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = req.body;
      const update = {
        $set: {
          photoUrl: updateToy.photoUrl,
          price:  updateToy.price,
          rating: updateToy.rating,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };
      const result = await createToyCollection.updateOne(
        filter,
        update,
        options
      );
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await createToyCollection.deleteOne(query);
      res.send(result);
    });

    

    //receive review data from client
    app.post("/reviews", async (req, res) => {
      const reviewCollection = req.body;
      console.log(reviewCollection);
      const result = await userReviewCollection.insertOne(reviewCollection);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log("doll-house server is running");
  res.send("Doll House is ready for receive data from Mongodb");
});

app.listen(port, () => {
  console.log(`doll-house server is running: ${port}`);
});
