var Splitter = artifacts.require("./Splitter.sol");
  
let _Bob = 0x97314660e157102ddd219f16c80005c4c03ce659;
let _Carol = 0x156ee3356777139a2bbe695a4b1ccd5b692ca60c;

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Splitter, _Bob, _Carol);
};

