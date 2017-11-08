var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', accounts => {
  let instance;
  let owner = accounts[0] ;
  let Bob = accounts[1];
  let Carol = accounts[2];
  let initialBalance;
  let finalBalance;
  let gasPrice;
  let gasUsed;
  let txFee;
  let payout;

  beforeEach(function() {
    return Splitter.new({ from: owner }).then(_instance => {
      instance = _instance;	
    })
  });

  it("should be owned by owner", () => {
  	return instance.owner({from: owner}).then(_owner => {
      assert.strictEqual(_owner, owner, "Contract is not owned by owner");
  	})
  });

  it("should start with a balance of 0", () => {
  	return instance.contractBalance().then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter was not initialized with a balance of 0");
  	});
  });

  it("should add a new deposit to the contract balance", () => {
  	return instance.deposit({from: owner, value: 10}).then((txObj) => {
  	  return instance.contractBalance()
  	}).then((_balance) => {
  	  assert.equal(_balance.toString(10), "10", "Splitter balance was not increased by 10 wei")
  	})
  });

  it("should keep track of the total value of all deposits", () => {
  	return instance.deposit({from: owner, value: 2}).then (() => {
  	  return instance.deposit({from: owner, value: 14})
  	}).then((txObj) => {
  	  return instance.deposit({from: owner, value: 14})
  	}).then ((txObj) => {
  	  return instance.contractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "30", "Splitter balance was not properly credited")
  	})
  })

  it("should allow Bob and Carol to each withdraw half of the funds", () => {
  	initialBalance = web3.toBigNumber(web3.eth.getBalance(Bob).toString(10));
  	return instance.deposit({from: owner, value: 30}
  	).then((txObj) => {	
  	  return instance.withdrawFunds({from: Bob})
  	}).then((txObj) => {
  	  payout = txObj.logs[0].args.amount.toString(10);
  	  currentBalance = web3.toBigNumber(web3.eth.getBalance(Bob));
  	  console.log("payout: " + payout);
  	  console.log("initialBalance: " + initialBalance.toString(10));
  	  console.log("currentBalance: " + currentBalance.toString(10));
  	  console.log("difference: " + currentBalance.minus(initialBalance).toString(10));
  	  gasUsed = txObj.receipt.gasUsed;
  	  console.log("gasUsed: " +gasUsed);
  	  gasPrice = web3.eth.gasPrice;
  	  console.log("gasPrice: " + gasPrice.toString(10));
  	  txFee = gasPrice.times(web3.toBigNumber(gasUsed));
  	   console.log("txFee: " + txFee.toString(10)); 
  	  assert.equal(txObj.logs.length, 2, "should have received 2 events");
  	  assert.equal(txObj.logs[0].args.amount.toString(10), "15", "Bob's share wasn't properly allocated");
  	  // assert.equal(initialBalance.plus(payout).minus(txFee).toString(10), currentBalance.toString(10), "Bob failed to receive the correct ammount of ether in to his account")

      assert.equal(currentBalance.minus(payout).minus(txFee).toString(10), initialBalance.toString(10), "Bob failed to receive the correct ammount of ether in to his account")
  	}).then(() => {
  		return instance.contractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "15", "Splitter balance was not properly debited")
  	}).then(() => {
  	  return instance.withdrawFunds({from: Carol})
  	}).then((txObj) => {
  	  assert.equal(txObj.logs[0].args.amount.toString(10), "15", "Carol's share wasn't properly allocated");
  	  return instance.contractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })

  it("should not allow Bob to withdraw more than his share", () => {
  	return instance.contractBalance().then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "The starting balance is incorrect here.")
  	}).then (() => {
  	  return instance.deposit({from: owner, value: 50})
  	}).then((txObj) => {
  	  return instance.withdrawFunds({from: Bob})
  	}).then (() => {
  	  return instance.deposit({from: owner, value: 10})
  	}).then((txObj) => {
  	  return instance.withdrawFunds({from: Bob})
  	}).then((txObj) => {
  	  return instance.contractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "30", "Splitter balance was not properly debited")
  	}).then(() => {
  	  return instance.withdrawFunds({from: Carol})
  	}).then((txObj) => {
  	  return instance.contractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })
});
