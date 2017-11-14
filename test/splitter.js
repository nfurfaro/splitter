const Splitter = artifacts.require("./Splitter.sol");
const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

contract('Splitter', accounts => {
  let instance;
  let eventObject;
  let owner = accounts[0] ;
  let Bob = accounts[1];
  let Carol = accounts[2];
  let initialBalance;
  let finalBalance;
  let gasPrice;
  let gasUsed;
  let txFee;
  let payout;

  beforeEach(() => {
    return Splitter.new({ from: owner }).then(_instance => {
      instance = _instance;
    })
  });

  it("should be owned by owner", function() {
  	  return assert.eventually.strictEqual(Promise.resolve(instance.owner({from: owner})), owner, "Contract is not owned by owner");

  });

  it("should add a new deposit to the contract balance", function() {
  	  return instance.deposit({from: owner, value: 10}).then(function(txObj) {
  	      return instance.getContractBalance.call()
  	  }).then(function(_balance) {
  	      assert.equal(_balance.toString(10), "10", "Splitter balance was not increased by 10 wei")
  	})
  });

  it("should keep track of the total value of all deposits", function() {
  	return instance.deposit({from: owner, value: 2}).then (function() {
  	    return instance.deposit({from: owner, value: 14})
  	}).then(function(txObj) {
  		// console.log(txObj.receipt.logs);
  	    return instance.deposit({from: owner, value: 14})
  	}).then (function() {
  	    return instance.getContractBalance.call()
  	}).then(function(_balance) {
  	    assert.equal(_balance.toString(10), "30", "Splitter balance was not properly credited")
  	})
  })


//check that he actually got it
  it("should allow Bob to withdraw 25 wei", function() {
  	  return instance.deposit({from: owner, value: 50}).then(function() {
  	      return instance.getContractBalance.call()
  	  }).then(function(_balance) {
          return instance.withdrawFunds({from: Bob})
      }).then(function(txObj) {
          assert.equal(txObj.logs[0].args.bobsFunds.toString(10), "25", "Bob's share wasn't properly allocated");
      });
   });

   //check that she actually got it
  it("should allow Carol to withdraw 11 wei", function() {
  	  return instance.deposit({from: owner, value: 22}).then(function() {
  	      return instance.getContractBalance.call()
  	  }).then(function(_balance) {
          return instance.withdrawFunds({from: Carol})
      }).then(function(txObj) {
      	  // console.log(txObj.receipt);
          assert.equal(txObj.logs[0].args.carolsFunds.toString(10), "11", "Carols's share wasn't properly allocated");
      });
   });

  // Xavier:
// "You should not use the sync' getBalance.
// The difference is Bob's tx fee. You need to get that. The withdraw tx.
// And gasPrice has to come from your tx.""

   it("should confirm that carol actually received her funds", () => {
   		// initialBalance = web3.toBigNumber(Carol.balance);
   		initialBalance = web3.toBigNumber(web3.eth.getBalance(Carol));
        return instance.deposit({from: owner, value: 21}).then(() => {  
            return instance.withdrawFunds({from: Carol})
        }).then((txObj) => {
            payout = txObj.logs[0].args.carolsFunds.toString(10);
            currentBalance = web3.toBigNumber(web3.eth.getBalance(Carol));
            console.log("payout: " + payout);
            console.log("initialBalance: " + initialBalance.toString(10));
            console.log("currentBalance: " + currentBalance.toString(10));
            console.log("difference: " + currentBalance.minus(initialBalance).toString(10));
            gasUsed = txObj.receipt.gasUsed;
            console.log("gasUsed: " + gasUsed);
            gasPrice = web3.eth.gasPrice;
            web3.eth.getTransaction(txObj.tx, () => {
                gasPrice = txObj.tx.gasPrice;
            });
            console.log("gasPrice: " + gasPrice);
            txFee = gasPrice.times(web3.toBigNumber(gasUsed));
            console.log("txFee: " + txFee.toString(10)); 
            assert.equal(initialBalance.plus(payout).minus(txFee).toString(10), currentBalance.toString(10), "Carol didn't get her ether")
        })
    });

});
