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

  it("should keep track of the total value of all deposits", () => {
  	return Splitter.deployed().then(instance => {
  	   contract = instance;
  	   return contract.deposit({from: owner, value: 7})
  	}).then (() => {
  		return contract.deposit({from: owner, value: 19})
  	}).then(() => {
  		return contract.deposit({from: owner, value: 16})
  	}).then (() => {
  		return contract.getContractBalance()
  	}).then((_balance) => {
  		assert.equal(_balance.toString(10), "52", "Splitter balance was not properly accumulated")
  	})
  })

});
