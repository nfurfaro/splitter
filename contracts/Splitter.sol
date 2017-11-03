pragma solidity ^0.4.6;

contract Splitter {
    address public owner;
    uint private onePortion;
    address private Bob;
    address private Carol;
    uint private bobsFunds;
    uint private carolsFunds;
    

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawl(address withdrawer, uint amount);

    // Temporarily working through this project with hard-coded values for now.
    function Splitter() public {
        owner = msg.sender;
        Bob = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c;
        Carol = 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db;
        bobsFunds = 0;
        carolsFunds = 0;
    }
    
    function deposit()
        public      
        payable
        returns(bool successfulSplit)
    {   
        require(msg.sender == owner);
        require(msg.value != 0);
        uint remainder = msg.value % 2;
        onePortion = (msg.value - remainder) / 2;
        bobsFunds += onePortion;
        carolsFunds += onePortion;
        LogDeposit(msg.sender, msg.value);
        return true;
    }
    // todo keep track of each persons available funds independently 
    function WithdrawFunds() 
        public
        returns(bool SuccessfulWithdrawl)
    { 
        require(msg.sender == Bob || msg.sender == Carol);
        uint transferAmount;
        if(msg.sender == Bob) {
            require(bobsFunds != 0);
            transferAmount = bobsFunds;
            bobsFunds = 0;
            msg.sender.transfer(transferAmount);
            LogWithdrawl(msg.sender, transferAmount);
        }
        if(msg.sender == Carol) {
            require(carolsFunds != 0);
            transferAmount = carolsFunds;
            carolsFunds = 0;
            msg.sender.transfer(transferAmount);
            LogWithdrawl(msg.sender, transferAmount);
        }
        return true;
    } 
    
    function getContractBalance() public constant returns(uint) {
        return this.balance;
    }
    
    function getBalanceA() public constant returns(uint) {
        return owner.balance;
    }
    
    function getBalanceB() public constant returns(uint) {
        return Bob.balance;    
    }
    
    function getBalanceC() public constant returns(uint) {
        return Carol.balance;    
    }
}