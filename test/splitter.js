var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', accounts => {
  let instance;
  let owner = accounts[0] ;
  let Bob = accounts[1];
  let Carol = accounts[2];

  beforeEach(function() {
    return Splitter.new().then(_instance => {
      instance = _instance;	
    })
  });

  it("should be owned by owner", () => {
  	return instance.owner({from: owner}).then(_owner => {
      assert.strictEqual(_owner, owner, "Contract is not owned by owner");
  	})
  });

  it("should start with a balance of 0", () => {
  	return instance.getContractBalance().then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter was not initialized with a balance of 0");
  	});
  });

  it("should add a new deposit to the contract balance", () => {
  	return instance.deposit({from: owner, value: 10}).then((txObj) => {
  	  return instance.getContractBalance()
  	}).then((_balance) => {
  	  assert.equal(_balance.toString(10), "10", "Splitter balance was not increased by 10 wei")
  	})
  });

  it("should keep track of the total value of all deposits", () => {
  	return instance.deposit({from: owner, value: 2}).then (() => {
  	  return instance.deposit({from: owner, value: 14})
  	}).then((txObj) => {
  	  console.log(txObj.tx);
  	  return instance.deposit({from: owner, value: 14})
  	}).then ((txObj) => {
  	  return instance.getContractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "30", "Splitter balance was not properly credited")
  	})
  })

  it("should allow Bob and Carol to each withdraw half of the funds", () => {
  	return instance.deposit({from: owner, value: 30}).then(() => {
  	  return instance.withdrawFunds({from: Bob})
  	}).then((txObj) => {
  	  return instance.getContractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "15", "Splitter balance was not properly debited")
  	}).then(() => {
  	  return instance.withdrawFunds({from: Carol})
  	}).then((txObj) => {
  	  return instance.getContractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })

  it("should not allow Bob to withdraw more than his share", () => {
  	return instance.getContractBalance().then(_balance => {
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
  	  return instance.getContractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "30", "Splitter balance was not properly debited")
  	}).then(() => {
  	  return instance.withdrawFunds({from: Carol})
  	}).then((txObj) => {
  	  return instance.getContractBalance()
  	}).then(_balance => {
  	  assert.equal(_balance.toString(10), "0", "Splitter balance was not properly debited")
  	})
  })
});
