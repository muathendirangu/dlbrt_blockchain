import { latestBlock } from "./blockchain";
import {sockets} from "./peer_to_peer";

const MessageType = {
    QUERY_LATEST : 0,
    QUERY_ALL : 1,
    RESPONSE : 2,
}

let initiateMessageHandler = (ws) => {
    ws.on("message", (data) => {
        let message = JSON.parse(data);
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseToLatestMessage());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseToChainMessage());
                break;
            case MessageType.RESPONSE:
                responseToBlockChain(message);
                break;
            default:
                break;
        }
    });
}

let initiateErrorHandler = (ws) => {
    let closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

let queryChainLengthMessage = () => ({'type': MessageType.QUERY_LATEST});
let queryAllMessage = () => ({'type': MessageType.QUERY_ALL});
let responseChainMessage = () =>({
    'type': MessageType.RESPONSE, 'data': JSON.stringify(blockchain)
});
let responseToLatestMessage = () => ({
    'type': MessageType.RESPONSE,
    'data': JSON.stringify([latestBlock()])
});

let write = (ws, message) => ws.send(JSON.stringify(message));
let broadcast = (message) => sockets.forEach(socket => write(socket, message));

let responseToBlockChain = (message) => {
    let receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    let latestBlockHeld = latestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            blockchain.push(latestBlockReceived);
            broadcast(responseToLatestMessage());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMessage());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            changeToNewChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

export {broadcast, responseToLatestMessage, initiateErrorHandler, initiateMessageHandler, queryChainLengthMessage, write}