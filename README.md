#Readme.md

## This is a simple contract which can be deployed by address A. Funds can be set to the splitter contract by A, and will be divided and sent to addresses B & C (currently using hardcoded values, and transfer to B & C is not working yet)

##TODOS
   * [] Unit tests!
   • [] Get addresses B and C zeroed out to start. Give A(Alice's address, the Sender and contract owner) some ether. I can probably achieve this by setting remix env to "web3 Provider" and connecting to my testrpc.
   • [] Get the contract to forward 1/n its balance, n times. Hardcode 2 for now.
   • [] Figure out the transaction costs to make sure that Alice always ends with a balance of 0
   • [] Understand the killswitch. It should only be visible to the owner.
   • [] Make this contract reusable (either through import or extension?)


