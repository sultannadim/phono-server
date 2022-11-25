const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    // get single category product
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { productId: parseFloat(id) };
      const category = await productsCollection.find(query).toArray();
      res.send(category);
    });
    // get seller product
    app.get("/product/:seller", async (req, res) => {
      const seller = req.params.seller;
      const auery = { sellerName: seller };
      const sellerProduct = await productsCollection
        .find(auery)
        .sort({ _id: -1 })
        .toArray();
      res.send(sellerProduct);
    });
    // delete seller product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // set advertise
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          advertise: "Added",
        },
      };
      const result = await productsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
    // get advertise product
    app.get("/advertise", async (req, res) => {
      const query = { advertise: "Added" };
      const advertiseProduct = await productsCollection.find(query).toArray();
      res.send(advertiseProduct);
    });
    // get all sellers
    app.get("/allsellers", async (req, res) => {
      const query = { role: "Seller" };
      const allSeller = await usersCollection.find(query).toArray();
      res.send(allSeller);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

// mongodb part end

app.listen(port, console.log(`Surver running from port : ${port}`));
