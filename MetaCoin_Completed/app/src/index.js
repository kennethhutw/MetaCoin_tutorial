import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/MetaCoin.json";

const App = {
  web3: null,
  account: null,
  accounts: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      this.CheckNetwork(networkId);
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      if(networkId === 4){
        this.meta = new web3.eth.Contract(
          metacoin_abi,
          '0xaec78a8ac33da71d453ab6396e1acbf538213955',
        );
      } else {
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address,
      );
      }

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      const accountElement = document.getElementsByClassName("account")[0];
      accountElement.innerHTML =  this.account ;
      this.accounts =  accounts;
      this.refreshBalance();

      this.GetAccountBalances();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
  CheckNetwork:function(networkId){
    let network ="Mainnet";
    switch(networkId){
      case 1:
        network ="Mainnet";
        break;
      case 3:
        network ="Ropsten";
        break;
      case 4:
        network ="Rinkeby";
        break;
      case 42:
        network ="Kovan";
        break;
      default:
        network ="Custom";
        break;
    }
    const networkElement = document.getElementsByClassName("network")[0];
    networkElement.innerHTML = network;
  },
  refreshBalance: async function() {
    const { getBalance } = this.meta.methods;
    const balance = await getBalance(this.account).call();

    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },
  setStatus: function ( message,id) {
    if(id = 'undefined')
      id = 'status'
    const status = document.getElementById(id);
    status.innerHTML = message;
  },

  sendCoin: async function() {
    const amount = parseInt(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    const { sendCoin } = this.meta.methods;
    await sendCoin(receiver, amount).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  },
  checkCoin: async function() {
    const checkAddr = document.getElementById("address1").value;
    const balance1 = document.getElementById("balance1");

    this.setStatus("Check account ("+ checkAddr +")... (please wait)");

    const { getBalance } = this.meta.methods;
    const amount = await getBalance(checkAddr).call({ from: this.account });
    balance1.value = amount;
    
    this.setStatus("Check complete!");
    this.refreshBalance();
  },
  GetCoinInEther: async function() {
    const checkAddr = document.getElementById("address2").value;
    const balance2 = document.getElementById("balance2");

    this.setStatus("Check account ("+ checkAddr +") in Ether... (please wait)");

    const { getBalanceInEth } = this.meta.methods;
    const amount = await getBalanceInEth(checkAddr).call({ from: this.account });
    balance2.value = amount;
    this.setStatus("Check complete!");
    this.refreshBalance();
  },
  GetAccountBalance: function(checkAddr){
    return new Promise(async (resolve) => {
    const { getBalance } = this.meta.methods;
    const weiAmount = await this.web3.eth.getBalance(checkAddr);
    const etherAmount = await this.web3.utils.fromWei(weiAmount, 'ether')
    const amount = await getBalance(checkAddr).call({ from: this.account });
    resolve( "<tr><td>"+checkAddr+"</td><td>"+amount+"</td><td>"+etherAmount+"</td></tr>");
    });
  },
  GetAccountBalances: function(){
    var promises = [];
      for(var i = 0; i <  this.accounts.length; i++){
        promises.push( this.GetAccountBalance( this.accounts[i]));
      }
      Promise.all(promises)
      .then((results) => {
        console.log("All done", results);
        document.getElementById("accountlist").innerHTML =results;
      })
      .catch((e) => {
          // Handle errors here
      });
  }

};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts

    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanges',accounts);
      App.start();
    });

    window.ethereum.on('networkChanged', function(networkId){
      console.log('networkChanged',networkId);

      App.start();
    });
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
  }

  App.start();
});
let metacoin_abi =[
	{
		"constant": true,
		"inputs": [
			{
				"name": "addr",
				"type": "address"
			}
		],
		"name": "getBalanceInEth",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "receiver",
				"type": "address"
			},
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "sendCoin",
		"outputs": [
			{
				"name": "sufficient",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "addr",
				"type": "address"
			}
		],
		"name": "getBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	}
];