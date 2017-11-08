var Splitter = artifacts.require("./Splitter.sol");
  
// module.exports = function(deployer, accounts) {
//   deployer.deploy(Splitter, accounts);
// };

// module.exports = function(deployer) {
//   deployer.deploy(Splitter, 0x97314660e157102ddd219f16c80005c4c03ce659, 0x156ee3356777139a2bbe695a4b1ccd5b692ca60c
//   );
// };

module.exports = function(deployer) {
  deployer.deploy(Splitter);
};