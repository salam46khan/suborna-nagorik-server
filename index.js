const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wueeg5w.mongodb.net/?retryWrites=true&w=majority`;

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

    const storyCollection = client.db('subornaDB').collection('story');
    const userCollection = client.db('subornaDB').collection('users');
    const memberCollection = client.db('subornaDB').collection('member');


    app.get('/story', async (req, res) => {
      const result = await storyCollection.find().sort({ date: -1 }).toArray()
      res.send(result)
    })

    app.get('/story/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await storyCollection.findOne(query)
      res.send(result)
    })

    app.post('/story', async (req, res) => {
      const story = req.body;
      console.log(story);
      const result = await storyCollection.insertOne(story)
      res.send(result)
    })

    app.delete('/story/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await storyCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/member', async (req, res) => {
      const result = await memberCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body;

      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.get('/user', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await userCollection.findOne(query)
      res.send(result)
    })

    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = {
        $set: {
          admin: true
        }
      }



      const result = await userCollection.updateOne(filter, update, options)
      res.send(result)
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
  res.send('suborno is running')
})

app.listen(port, () => {
  console.log(`suborno is running by ${port}`);
})