// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json'

var EcommerceStore = contract(ecommerce_store_artifacts);

const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');

const ipfs = ipfsAPI({host: '54.242.168.42', port: '5001', protocol: 'http'});

window.App = {
 start: function() {
  var self = this;

  EcommerceStore.setProvider(web3.currentProvider);
  renderStore();

  var reader;
  $("#product-image").change(function(event) {
    const file = event.target.files[0]
    reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
  });
 },

};

window.addEventListener('load', function() {
 // Checking if Web3 has been injected by the browser (Mist/MetaMask)
 //if (typeof web3 !== 'undefined') {
 // console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  // Use Mist/MetaMask's provider
//  window.web3 = new Web3(web3.currentProvider);
// } else {
  console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// }

 App.start();
});

function renderStore() {
 EcommerceStore.deployed().then(function(i) {
  i.getProduct.call(1).then(function(p) {
   $("#product-list").append(buildProduct(p));
  });
  i.getProduct.call(2).then(function(p) {
   $("#product-list").append(buildProduct(p));
  });
 });
}

function buildProduct(product) {
 let node = $("<div/>");
 node.addClass("col-sm-3 text-center col-margin-bottom-1");
 node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />");
 node.append("<div>" + product[1]+ "</div>");
 node.append("<div>" + product[2]+ "</div>");
 node.append("<div>" + product[5]+ "</div>");
 node.append("<div>" + product[6]+ "</div>");
 node.append("<div>Ether " + product[7] + "</div>");
 return node;
}

function saveImageOnIpfs(reader) {
 return new Promise(function(resolve, reject) {
  const buffer = Buffer.from(reader.result);
  ipfs.add(buffer)
  .then((response) => {
   console.log(response)
   resolve(response[0].hash);
  }).catch((err) => {
   console.error(err)
   reject(err);
  })
 })
}

function saveTextBlobOnIpfs(blob) {
 return new Promise(function(resolve, reject) {
  const descBuffer = Buffer.from(blob, 'utf-8');
  ipfs.add(descBuffer)
  .then((response) => {
   console.log(response)
   resolve(response[0].hash);
  }).catch((err) => {
   console.error(err)
   reject(err);
  })
 })
}