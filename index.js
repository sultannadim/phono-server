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
    // get categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const category = await categoryesCollection.find(query).toArray();
      res.send(category);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

// mongodb part end

app.listen(port, console.log(`Surver running from port : ${port}`));
