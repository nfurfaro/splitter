pragma solidity ^0.4.6;

contract Splitter {
    address owner;
    address Account;
    uint OnePortion;
    uint public ContractBalance;
    address Alice = 0xca35b7d915458ef540ade6068dfe2f44e8fa733c;
    address  Bob = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c;
    address  Carol = 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db;
    
    event LogDeposit(address sender, uint amount);
    event LogWithdrawl(address taker, uint amount);

    function Splitter() public {
        owner = msg.sender;
    }
    
    function GetBalanceA() public view returns(uint) {
        return Alice.balance;
    }
    
    function GetBalanceB() public view returns(uint) {
        return Bob.balance;    
    }
    
    function GetBalanceC() public view returns(uint) {
        return Carol.balance;    
    }
    
    function deposit()
        public      
        payable
        returns(bool successfulSplit)
    {   
        require(msg.sender == owner);
        require(msg.value != 0);
        ContractBalance = msg.value;
        uint Remainder = msg.value % 2;
        OnePortion = (ContractBalance - Remainder) / 2;
        LogDeposit(msg.sender, msg.value);
        return true;
    }

    function WithdrawFunds(address _Account) 
        public
        returns(bool SuccessfulWithdrawl)
    {
        require(OnePortion != 0);
        Account = _Account;
        require(Account == Bob || Account == Carol);
        ContractBalance -= OnePortion;
        Account.transfer(OnePortion);
        LogWithdrawl(msg.sender, OnePortion);
        return true;
    } 
}