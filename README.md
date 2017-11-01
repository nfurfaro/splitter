#Readme.md

## This is a simple contract which can be deployed by address A. Funds can be set to the splitter contract by A, and will be divided and sent to addresses B & C (currently using hardcoded values, and transfer to B & C is not working yet)

##TODOS
[_] Get addresses B and C zeroed out to start. Give A(Alice's address, the Sender and contract owner) some ether, maybe 10? I can probably achieve this by setting remix to env "web3 Provider" and connecting to my testrpc using the mnemonic flag.
[_] Get the contract to forward 1/n its balance, n times. Hardcode 2 for now.
[_] Figure out the transaction costs to make sure that Alice always ends with a balance of 0
[_] Understand the killswitch
[_] Make this contract reusable (either through import or extension?)

