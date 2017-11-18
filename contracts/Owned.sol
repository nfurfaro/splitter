pragma solidity ^0.4.6;


contract Owned  {

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier ifOwner() {
        if(msg.sender == owner) {
            LogOwnerDrain(msg.sender, this.balance);
            msg.sender.transfer(this.balance);
            } else _;
    }

    event LogNewOwner(address oldowner, address newOwner);
    event LogOwnerDrain(address owner, uint amount);

    function Owned() {
    	owner = msg.sender;
    }

    function changeOwner(address newOwner)
        onlyOwner
        returns (bool success) 
    {
    	require(newOwner != 0);
    	LogNewOwner(owner, newOwner);
    	owner = newOwner;
    	return true;
    }

}