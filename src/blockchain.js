import * as cryptoHashing from 'crypto-js';

class Block {
    constructor(index, data, hash, previousHash, timestamp){
        this.index = index;
        this.data = data;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
    }
}

const generateHash = (index, data, hash, previousHash, timestamp) => {
    return cryptoHashing.SHA256(index + data + hash + previousHash + timestamp).toString();
}
const generateHashForBlock = (block) => {
    return generateHash(block.index, block.data, block.hash, block.previousHash, block.timestamp);
}
const genesisBlock = new Block(0,'first test block','39DBDE4B0B29E6644F980DC9A5461E98C7BB5775BDF2CEC3A1690FC524BC307D',null,new Date().getTime());

const blockchain = [genesisBlock()];

var latestBlock = () => blockchain[blockchain.length - 1];

const generateNewBlock = (blockData) => {
    const previousBlock = latestBlock();
    const nextIndexForBlock = previousBlock.index + 1;
    const nextTimeStamp = new Date().getTime();
    const nextHashForNextBlock = generateHash(nextIndexForBlock, blockData, previousBlock.hash, nextTimeStamp);
    const newBlock = new Block(nextIndexForBlock, blockData, nextHashForNextBlock, previousBlock.hash, nextTimeStamp);
    return newBlock;
}

const isNewBlockValid = (newBlock, previousBlock) => {
    if (previousBlock.index +1 !== newBlock.index) {
        console.log('Your block is invalid');
        return false;
    }else if(previousBlock.hash !== newBlock.previousHash){
        console.log('the block does not contain hash of the previous block');
        return false;
    }else if(generateHashForBlock(newBlock) !== newBlock.hash){
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' generated and not similar to ' + newBlock.hash);
        return false;
    }
    return true;
}

const isBlockContentValid = (block) => {
    if(typeof block.index === 'number' && typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number' && typeof block.data === 'string'){
        return true;
    }
    return false;
}
const ensureChainIsValid = (blockToValidate) => {
    if (JSON.stringify(blockToValidate[0]) !== JSON.stringify(genesisBlock())) {
        return false;
    }
    for (let i = 1; i < blockToValidate.length; i++) {
        if(!isNewBlockValid(blockToValidate[i], blockToValidate[i -1])){
            return false;
        }
    }
    return true;
}

// var changeToNewChain = (newBlocks) => {
//     if (ensureChainIsValid(newBlocks) && newBlocks.length > blockchain.length) {
//         console.log('the blockchain has added new blocks');
//         blockchain = newBlocks;
//         broadcast(responseLatestMsg());
//     } else {
//         console.log('Received blockchain invalid');
//     }
// };