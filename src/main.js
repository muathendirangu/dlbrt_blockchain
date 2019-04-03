import * as  bodyParser from 'body-parser';

import {addNewBlock, generateNewBlock, blockchain} from './blockchain';
import {broadcast, responseToLatestMessage} from './utils';
import {connectToPeers, initiateP2PServer, sockets} from './peer_to_peer';

let initial_peers = [];
const HTTP_PORT = 3000;

var express = require('express');

let initiateHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.post('/addBlock', (req, res) => {
        let newBlock = generateNewBlock(req.body.data);
        addNewBlock(newBlock);
        broadcast(responseToLatestMessage());
        console.log('a new block was added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/peer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(HTTP_PORT, () => console.log('Listening http on port: ' + HTTP_PORT));
};

connectToPeers(initial_peers);
initiateHttpServer();
initiateP2PServer();
