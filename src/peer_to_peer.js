import {initiateErrorHandler, initiateMessageHandler, queryChainLengthMessage, write} from './utils'

let WebSocket = require('ws');
let sockets = [];
const PEER_TO_PEER_PORT = 6000;

let initiateConnection = (ws) => {
    sockets.push(ws);
    initiateMessageHandler(ws);
    initiateErrorHandler(ws);
    write(ws, queryChainLengthMessage());
};

let initiateP2PServer = () => {
    let server = new WebSocket.Server({port: PEER_TO_PEER_PORT});
    server.on('connection', ws => initiateConnection(ws));
    console.log('listening websocket on port: ' + PEER_TO_PEER_PORT);
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        let ws = new WebSocket(peer);
        ws.on('open', () => initiateConnection(ws));
        ws.on('error', () => {
            console.log('peer to peer connection failed to open')
        });
    });
};

export {connectToPeers, initiateConnection, initiateP2PServer, sockets};