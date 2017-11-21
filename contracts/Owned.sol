pragma solidity ^0.4.6;


contract Owned  {

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    event LogNewOwner(address oldowner, address newOwner);
    event LogOwnerDrain(address owner, uint amount);

    function Owned() public {
    	owner = msg.sender;
    }

    function changeOwner(address newOwner)
        public
        onlyOwner
        returns (bool success) 
    {
    	require(newOwner != 0);
    	LogNewOwner(owner, newOwner);
    	owner = newOwner;
    	return true;
    }

}