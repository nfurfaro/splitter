var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', accounts => {
  let owner = accounts[0] ;
  let contract;

  beforeEach(function({from: owner}) {
    return Splitter.new()
    .then(function(instance) {
    	contract = instance;
    });
  });

  it("should say hi", function() {
	assert.strictEqual(true, true, "Something's wrong!");
  });

  it("should be owned by owner", function() {
  	return contract.owner({from: owner})
  	.then(function(_owner) {
  		assert.strictEqual(_owner, owner, "Contract is not owned by owner");
  	});
  });
});
