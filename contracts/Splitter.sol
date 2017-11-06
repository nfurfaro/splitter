pragma solidity ^0.4.6;

contract Splitter {
    address public owner;
    address public Bob;
    address public Carol;
    uint public n;

    address[] public addresses;
    
    struct ChosenOneStruct {
        address addr;
        uint availableFunds;
    }

    ChosenOneStruct[] public theChosenOnes;

    event LogDeposit(address depositor, uint amount);
    event LogDepositInternals(uint funds, uint onePortion);
    event LogWithdrawl(address withdrawer, uint amount);
    event LogContractState(uint timestamp, address splitter, uint balance, uint bobsFunds, uint carolsFunds );

    function Splitter() public {
        owner = msg.sender;
        addresses.push(0x97314660e157102ddd219f16c80005c4c03ce659);
        addresses.push(0x156ee3356777139a2bbe695a4b1ccd5b692ca60c);
        n = addresses.length;
        for(uint i; i < n; i++) {
            ChosenOneStruct memory chosenOne;
            chosenOne.addr = addresses[i];
            theChosenOnes.push(chosenOne);
        }
        // testrpc
        // Bob = 0x97314660e157102ddd219f16c80005c4c03ce659;
        // Carol = 0x156ee3356777139a2bbe695a4b1ccd5b692ca60c;
        //// remix
        // Bob = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c;
        // Carol = 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db;
    }
    
    function deposit()
        public      
        payable
        returns(bool successfulSplit)
    {   
        require(msg.sender == owner);
        require(msg.value != 0);
        LogDeposit(msg.sender, msg.value);
        LogContractState(block.timestamp, this, this.balance, theChosenOnes[0].availableFunds, theChosenOnes[1].availableFunds );
        uint remainder = msg.value % n;
        uint onePortion = (msg.value - remainder) / n;
        for(uint i; i < n; i++) {
            // uint funds = theChosenOnes[i].availableFunds
            theChosenOnes[i].availableFunds += onePortion;
            LogDepositInternals(theChosenOnes[i].availableFunds, onePortion);
        }
        LogContractState(block.timestamp, this, this.balance, theChosenOnes[0].availableFunds, theChosenOnes[1].availableFunds );
        return true;
    }

    function withdrawFunds() 
        public
        returns(bool SuccessfulWithdrawl) { 
            for(uint i; i < n; i++) {
                address addr = theChosenOnes[i].addr;
                uint funds = theChosenOnes[i].availableFunds;
                if(addr == msg.sender) {
                    require(funds != 0);
                    LogContractState(block.timestamp, this, this.balance, theChosenOnes[0].availableFunds, theChosenOnes[1].availableFunds );
                    msg.sender.transfer(funds);
                    funds = 0;
                    LogWithdrawl(msg.sender, funds);
                    LogContractState(block.timestamp, this, this.balance, theChosenOnes[0].availableFunds, theChosenOnes[1].availableFunds );
                } else continue;
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