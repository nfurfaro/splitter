pragma solidity ^0.4.6;

import "./Freezable.sol";

contract Splitter is Freezable {
    address public Bob;
    address public Carol;

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawal(address withdrawer, uint amount);

    mapping(address => uint) public theChosenOnes;
    
    function Splitter(address _Bob, address _Carol) public {
        Bob = _Bob;
        Carol = _Carol;
    }
    
    function deposit()
        freezeRay
        onlyOwner
        public 
        payable                            
    {  
        require(msg.value != 0);
        theChosenOnes[Bob] += msg.value / 2;
        theChosenOnes[Carol] += msg.value / 2 + msg.value % 2;
        LogDeposit(msg.sender, msg.value); 
    }

    function withdrawFunds()
        freezeRay
        public
        returns (bool success) 
    {
        require(theChosenOnes[msg.sender] != 0);
        uint amount = theChosenOnes[msg.sender]; 
        theChosenOnes[msg.sender] = 0;
        msg.sender.transfer(amount);
        LogWithdrawal(msg.sender, amount);
        return true; 

        
    } 
}