var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', accounts => {
  let owner = accounts[0] ;
  let contract;
  let Bob = accounts[1];
  let Carol = accounts[2];

  //beforeEach(function({from: owner}) {
    //return Splitter.new()
    //.then(function(instance) {
    	//contract = instance;
    //});
  //});

  it("should be owned by owner", function() {
  	return Splitter.deployed().then(function(instance) {
  	  contract = instance;
  	  return contract.owner({from: owner})
  	  .then(function(_owner) {
  		assert.strictEqual(_owner, owner, "Contract is not owned by owner");
  	  });
    });
  });

  it("should start with a balance of 0", () => {
    return Splitter.deployed().then(instance => {
  	   contract = instance;
  	   return contract.getContractBalance()
  	}).then(_balance => {
  	    assert.equal(_balance.toString(10), "0", "Splitter was not initialized with a balance of 0");
  	});
  });

  it("should add a new deposit to the contract balance", () => {
  	return Splitter.deployed().then(instance => {
  	   contract = instance;
  	   return contract.deposit({from: owner, value: 10})
  	}).then(() => {
  	   return contract.getContractBalance()
  	}).then((_balance) => {
  		assert.equal(_balance.toString(10), "10", "Splitter balance was not increased by 10 wei")

  	})
  });
// todo if i make total value of all deposits = 42 I get errors, but not with 40...
  it("should keep track of the total value of all deposits", () => {
  	return Splitter.deployed().then(instance => {
  	   contract = instance;
  	   return contract.deposit({from: owner, value: 2})
  	}).then (() => {
  		return contract.deposit({from: owner, value: 14})
  	}).then(() => {
  		return contract.deposit({from: owner, value: 14})
  	}).then (() => {
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "40", "Splitter balance was not properly credited")
  	})
  })

  it("should allow Bob and Carol to each withdraw half of the funds", () => {
  	return Splitter.deployed().then(instance => {
  	   contract = instance;
  	   return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "40", "The balance is incorrect here.")
  	}).then(() => {
  		return contract.withdrawFunds({from: Bob})
  	}).then(() => {
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "20", "Splitter balance was not properly debited")
  	}).then(() => {
  		return contract.withdrawFunds({from: Carol})
  	}).then(() => {
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })

  it("should not allow Bob to withdraw more than his share", () => {
  	return Splitter.deployed().then(instance => {
  		contract = instance;
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "0", "The starting balance is incorrect here.")
  	}).then (() => {
  		return contract.deposit({from: owner, value: 50})
  	}).then(() => {
  		return contract.withdrawFunds({from: Bob})
  		//should be 25
  	}).then (() => {
  		return contract.deposit({from: owner, value: 10})
  	}).then(() => {
  		return contract.withdrawFunds({from: Bob})
  		//should be 5, not 17
  	}).then(() => {
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "30", "Splitter balance was not properly debited")
  	}).then(() => {
  		return contract.withdrawFunds({from: Carol})
  	}).then(() => {
  		return contract.getContractBalance()
  	}).then(_balance => {
  		assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })


});
