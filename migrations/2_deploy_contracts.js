var Splitter = artifacts.require("./Splitter.sol");
  


module.exports = function(deployer, network, accounts) {
	let _Bob = accounts[0];
    let _Carol = accounts[1];
    
    deployer.deploy(Splitter, _Bob, _Carol);
};

