const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3e6mwvl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        const usersCollection = client.db('assignment').collection('users')
        const categoryCollection = client.db('assignment').collection('category')
        const itemCollection = client.db('assignment').collection('item')
        const productBukCollection = client.db('assignment').collection('product')


        function verifyJWT(req, res, next) {
            const authHeader = req.headers.authorization
            console.log(authHeader);
            if (!authHeader) {
                return res.status(401).send('unauthorize access')
            }
            const token = authHeader.split(' ')[1]
            console.log(token)
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    console.log(err);
                    return res.status(403).send({ message: 'forbidden access hoise' })
                }

                req.decoded = decoded;
                next()
            })
        }


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = usersCollection.insertOne(user);
            res.send(result)
        })

        app.get('/categories', async (req, res) => {
            const result = await categoryCollection.find({}).toArray()
            res.send(result)
        })

        app.get("/category/:id", async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id };
            const category = await itemCollection.find(query).toArray();
            res.send(category);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            console.log(user)
            res.status(403).send({ 'aisos taile': 'churi korar eto danda k vai' })
        })
        // app.get('/users', async (req, res) => {
        //     const result = await usersCollection.find({}).toArray()
        //     res.send(result)
        // })
        // app.get('/category/:id', (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const category_details = itemCollection.find(d => d._id === id);
        //     // console.log(category_details.length);
        //     const result = category_details.toArray()
        //     res.send(result)

        // })
        app.post("/productconfirm", async (req, res) => {
            const bookings = req.body;
            const result = await productBukCollection.insertOne(bookings);
            res.send(result);
        });

        app.post('/item', async (req, res) => {
            const product = req.body
            const result = await itemCollection.insertOne(product)
            res.send(result)
        })
        app.put("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: "admin",
                },
            };
            const result = await usersCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        app.get('/users/sellers', async (req, res) => {
            const sellers = await usersCollection.find({}).toArray()
            const seller = sellers.filter(seller => seller.specialty === 'seller')
            res.send(seller)
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            };
            const bookings = await productBukCollection.find(query).toArray();
            res.send(bookings)
        })
        app.get('/users/buyers', async (req, res) => {
            const sellers = await usersCollection.find({}).toArray()
            const seller = sellers.filter(seller => seller.specialty === 'buyer')
            res.send(seller)
        })
        app.delete('/users/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.put("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    specialty: "admin",
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(e => console.log(e))


app.get('/', (req, res) => {
    res.send('assignment running hoise vai')
})

app.listen(port, () => {
    console.log(`assignment running on ${port}`)
})