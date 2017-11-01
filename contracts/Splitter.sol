//                    CAUTION!
// ==========  NOT FOR PRODUCTION USE!  ===========
// This is meant for course-project practice use only.
// Author = @nick44o

pragma solidity ^0.4.6;

contract owned {
    function owned() { owner = msg.sender; }
    address owner;
}

contract mortal is owned {
    function kill() {
        selfdestruct(owner);
    }
}

contract Splitter is mortal{
    address public owner;
    uint public balanceAlice;
    uint public contractBalance;
    uint public totalContributions;
    address Bob;
    address Carol;
    uint public balanceBob;
    uint public balanceCarol;
    
    function Splitter()
        public 
    {
        owner = msg.sender;
        balanceAlice = owner.balance;
        Bob = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c;
        Carol = 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db;
        balanceBob = Bob.balance;
        balanceCarol = Carol.balance;
    }
    
    function spreadTheWealth()
        public      
        payable
        returns(bool successfulSplit)
    {   
        require(msg.sender == owner);
        require(msg.value != 0);
        contractBalance = this.balance;
        totalContributions += contractBalance;
        uint onePortion = contractBalance / 2;
        Bob.transfer    (onePortion);
        Carol.transfer(onePortion);
        return true;
    }
}