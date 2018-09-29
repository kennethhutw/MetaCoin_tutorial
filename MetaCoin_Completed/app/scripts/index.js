// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metaCoinArtifact from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const MetaCoin = contract(metaCoinArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0];
      let meta;

      MetaCoin.deployed().then(function (instance) {
        meta = instance
        return meta.name.call()
      }).then(function (name) {
        document.getElementById("tokenName").innerHTML =name;
      }).catch(function (e) {
        console.log(e)
        self.setStatus('Error getting token name; see log.')
      });

      self.refreshBalance();
      self.GetAccountBalances();
    })
  },

  setStatus: function ( message,id) {
    if(id = 'undefined')
      id = 'status'
    const status = document.getElementById(id);
    status.innerHTML = message;
  },

  refreshBalance: function () {
    const self = this

    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },
  GetCoinInEther: function(){
    var self = this;

    var balance2 = document.getElementById("balance2");
    var address2 = document.getElementById("address2").value;

    this.setStatus("Initiating transaction... (please wait)","status2");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalanceInEth(address2, {from: account});
    }).then(function(value) {
      self.setStatus("check complete!","status2");
      balance2.value = value;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error check coin in Ether; see log.","status2");
    });
  },
  checkCoin: function(){
    var self = this;

    var balance1 = document.getElementById("balance1");
    var address1 = document.getElementById("address1").value;

    this.setStatus("Initiating transaction... (please wait)","status1");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance(address1, {from: account});
    }).then(function(value) {
      self.setStatus("check complete!","status1");
      balance1.value = value;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error check coin; see log.","status1");
    });
  }
  ,
  sendCoin: function () {
    const self = this

    const amount = parseInt(document.getElementById('amount').value)
    const receiver = document.getElementById('receiver').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.sendCoin(receiver, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },
  GetAccountBalance: function(acc){
    let meta
    let _account = acc;
    return new Promise((resolve) => {
                        MetaCoin.deployed().then(function (instance) {
                          meta = instance
                          return meta.getBalance.call(acc, { from: acc })
                        }).then(function (value) {
                          resolve( "<tr><td>"+acc+"</td><td>"+value+"</td></tr>");
                        }).catch(function (e) {
                          console.log(e);
                          self.setStatus('Error getting balance; see log.');
                        });
                      });

    
  },
  GetAccountBalances: function(){
    var body = "";
      for(var i = 0; i < accounts.length; i++){
        this.GetAccountBalance(accounts[i]).then(function(result){
          body+=result;
          $("#accountlist").html(body);
        });
      }
   
  }
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  // if (typeof web3 !== 'undefined') {
  //   console.warn(
  //     'Using web3 detected from external source.' +
  //     ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
  //     ' ensure you\'ve configured that source properly.' +
  //     ' If using MetaMask, see the following link.' +
  //     ' Feel free to delete this warning. :)' +
  //     ' http://truffleframework.com/tutorials/truffle-and-metamask'
  //   )
  //   // Use Mist/MetaMask's provider
  //   window.web3 = new Web3(web3.currentProvider)
  // } else {
  //   console.warn(
  //     'No web3 detected. Falling back to http://127.0.0.1:9545.' +
  //     ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
  //     ' Consider switching to Metamask for development.' +
  //     ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
  //   )
  //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  //   window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  // }
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  App.start()
})
