const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
    const ordersCollection = client.db("phonoDb").collection("orders");
    const paymentCollection = client.db("phonoDb").collection("payment");
    const reportsCollection = client.db("phonoDb").collection("reports");
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
    app.get("/roleuser", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const roleUse = await usersCollection.findOne(query);
      res.send(roleUse);
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
    app.get("/product", async (req, res) => {
      const email = req.query.email;
      const auery = { sellerEmail: email };
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
    // verify seller
    app.put("/allsellers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Verified",
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);

      res.send(result);
    });

    // seller delete
    app.delete("/allsellers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    // get all buyer
    app.get("/allbuyers", async (req, res) => {
      const query = { role: "User" };
      const allBuyer = await usersCollection.find(query).toArray();
      res.send(allBuyer);
    });
    // delete buyer
    app.delete("/allbuyers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    // post order data
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });
    // get orders
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await ordersCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(orders);
    });
    // delete order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
    // get single order
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await ordersCollection.findOne(query);
      res.send(order);
    });
    // stripe payment
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // add payment info to database
    app.post("/payment", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      const id = payment.bookinID;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paymentStatus: "Paid",
          transactionId: payment.trangactionId,
        },
      };
      const updateOrder = await ordersCollection.updateOne(query, updatedDoc);
      const idTwo = payment.productId;
      const queryTwo = { _id: ObjectId(idTwo) };
      const updatedDoctwo = {
        $set: {
          status: "Sold",
        },
      };
      const updateProduct = await productsCollection.updateMany(
        queryTwo,
        updatedDoctwo
      );
      res.send(result);
    });
    // post reported product
    app.post("/reports", async (req, res) => {
      const report = req.body;
      const result = await reportsCollection.insertOne(report);
      const id = report.reportedProductId;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          reportStatus: "Reported",
        },
      };
      const reportProduct = await productsCollection.updateOne(
        query,
        updatedDoc
      );
      res.send(result);
    });
    // get reported product
    app.get("/reported", async (req, res) => {
      const query = { reportStatus: "Reported" };
      const repotedProduct = await productsCollection.find(query).toArray();
      res.send(repotedProduct);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

// mongodb part end

app.listen(port, console.log(`Surver running from port : ${port}`));
