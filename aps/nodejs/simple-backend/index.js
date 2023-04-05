const express = require('express')
const fs = require('fs')
const {Mapping} = require("@sebyone_/daasiot-aps/lib/core/mapping");
const {Node} = require("@sebyone_/daasiot-aps/lib/defs/node");
const bodyParser = require('body-parser')
const {setPersistenceDriver} = require("@sebyone_/daasiot-aps/lib/core/init");
const {NodeTypes} = require("@sebyone_/daasiot-aps/lib/defs/node-types");
const {Availability} = require("@sebyone_/daasiot-aps/lib/core/availability");
const {Transfer} = require("@sebyone_/daasiot-aps/lib/core/transfer");

const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())

const fileName = 'daas.db.json';
const dbDriver = {
    internalData: {},
    getData: () => {
        const rawData = fs.readFileSync(fileName);
        return rawData ? JSON.parse(rawData) : {};
    },
    setData: (data) => {
        fs.writeFileSync(fileName, JSON.stringify(data));
    },
};

setPersistenceDriver(dbDriver);

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Daas example backend!')
})

app.post('/mapping/map', async (req, res) => {
    try {
        console.log(req.body);

        const node1 = new Node(req.body.node1.identifier, req.body.node1.type, req.body.node1.protocol, req.body.node1.uri);
        const node2 = req.body.node2
            ? new Node(req.body.node2.identifier, req.body.node2.type, req.body.node2.protocol, req.body.node2.uri)
            : null;

        console.log(node1);
        console.log(node2);

        await Mapping.map(node1, node2);
        res.send({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.send({
            error: error,
        });
    }
})

app.post('/mapping/unmap', async (req, res) => {
    try {

        const node1 = new Node(req.body.node1.identifier, req.body.node1.type, req.body.node1.protocol, req.body.node1.uri);
        const node2 = req.body.node2
            ? new Node(req.body.node2.identifier, req.body.node2.type, req.body.node2.protocol, req.body.node2.uri)
            : null;
        await Mapping.unmap(node1, node2);
        res.send({
            success: true,
        });
    } catch (error) {
        res.send({
            error: error,
        });
    }
})

app.get('/mapping/fetch/:type', async (req, res) => {
    try {
        res.send(Mapping.fetch(req.params.type));
    } catch (error) {
        res.send({
            error,
        });
    }
})

app.get('/availability/locate/:identifier', async (req, res) => {
    try {
        const node = new Node(req.params.identifier, NodeTypes.EP);
        res.send(await Availability.locate(node));
    } catch (error) {
        res.send({
            error: error,
        });
    }
})

app.get('/transfer/use/:identifier', async (req, res) => {
    try {
        const node = new Node(req.params.identifier, NodeTypes.EP);
        res.send({measurements_count: await Transfer.use(node)});
    } catch (error) {
        console.log(error);
        res.send({
            error: error,
        });
    }
})

app.get('/transfer/pull/:identifier', async (req, res) => {
    try {
        const node = new Node(req.params.identifier, NodeTypes.EP);
        res.send(await Transfer.pull(node));
    } catch (error) {
        res.send({
            error: error,
        });
    }
})

app.post('/transfer/pullData/:identifier', async (req, res) => {
    try {
        // todo:
        const node = new Node(req.params.identifier, NodeTypes.EP);
        const measurement = req.body.measurement;
        const options = req.body?.options;
        res.send(await Transfer.pullData(node, measurement, options));
    } catch (error) {
        res.send({
            error: error,
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})