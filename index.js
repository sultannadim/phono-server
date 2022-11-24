const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Phono server api is running");
});

// mongodb part start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.newitlb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoryesCollection = client.db("phonoDb").collection("categories");
    const usersCollection = client.db("phonoDb").collection("users");
    const productsCollection = client.db("phonoDb").collection("products");
    // get categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const category = await categoryesCollection.find(query).toArray();
      res.send(category);
    });
    // set users in database
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });
    // get role user
    app.get("/roleuser/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const roleUser = await usersCollection.findOne(query);
      res.send(roleUser);
    });
    // insert product in database
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

// mongodb part end

app.listen(port, console.log(`Surver running from port : ${port}`));
