pragma solidity ^0.4.6;


contract Splitter {
    address public owner;
    uint public contractBalance;
    address public Bob;
    address public Carol;
    uint public onePortion;
    uint public remainder;
    uint public transferAmount;

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawl(address withdrawer, uint amount);
    event LogContractState(uint timestamp, address splitter, uint balance, uint bobsFunds, uint carolsFunds);

    struct chosenOne {
        uint availableFunds;
    }

    mapping(address => chosenOne) public theChosenOnes;
    

    function Splitter() public {
        owner = msg.sender;
        // Bob = _Bob;
        // Carol = _Carol;
        Bob = 0x97314660e157102ddd219f16c80005c4c03ce659; 
        Carol = 0x156ee3356777139a2bbe695a4b1ccd5b692ca60c;
        // contractBalance = this.balance;
    }
    
    function deposit()
        public 
        payable                            
        returns(bool successfulSplit) {   
            require(msg.sender == owner);
            require(msg.value != 0);
            LogDeposit(msg.sender, msg.value);
            LogContractState(block.timestamp, this, this.balance, theChosenOnes[Bob].availableFunds, theChosenOnes[Carol].availableFunds);
            contractBalance = this.balance;
            remainder += msg.value % 2;
            onePortion = msg.value / 2;
            theChosenOnes[Bob].availableFunds += onePortion;
            theChosenOnes[Carol].availableFunds += onePortion;
            LogContractState(block.timestamp, this, this.balance, theChosenOnes[Bob].availableFunds, theChosenOnes[Carol].availableFunds);
            return true;
        }

    function withdrawFunds() 
        public
        returns(bool SuccessfulWithdrawl) 
    {
        require(theChosenOnes[msg.sender].availableFunds != 0);
        transferAmount = theChosenOnes[msg.sender].availableFunds + remainder; 
        theChosenOnes[msg.sender].availableFunds = 0;
        remainder = 0;
        msg.sender.transfer(transferAmount);
        contractBalance = this.balance;
        LogWithdrawl(msg.sender, transferAmount);
        LogContractState(block.timestamp, this, this.balance, theChosenOnes[Bob].availableFunds, theChosenOnes[Carol].availableFunds);
        return true;
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