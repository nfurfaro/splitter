pragma solidity ^0.4.6;


contract Splitter {
    address public owner;
    bool public frozen;
    address public Bob;
    address public Carol;
    uint public onePortion;
    uint public transferAmount;

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawl(address withdrawer, uint amount);
    event LogContractState(uint balance, uint bobsFunds, uint carolsFunds);
    event LogFreeze(string title, bool isFrozen);

    mapping(address => uint) public theChosenOnes;
    
    // function Splitter(address _Bob, address _Carol) public {
    //     owner = msg.sender;
    //     Bob = _Bob;
    //     Carol = _Carol;
    // }

    function Splitter() public {
        owner = msg.sender;
        Bob = 0x97314660e157102ddd219f16c80005c4c03ce659;
        Carol = 0x156ee3356777139a2bbe695a4b1ccd5b692ca60c;
    }
    
    modifier isOwner() {
        require(msg.sender == owner);
        _; 
    }

    modifier freezeRay() {
        require(!frozen);
        _;
    }
    
    function deposit()
        freezeRay
        isOwner
        public 
        payable                            
    {  
        require(msg.value != 0);
        LogDeposit(msg.sender, msg.value);
        LogContractState(this.balance, theChosenOnes[Bob], theChosenOnes[Carol]); 
        theChosenOnes[Bob] += msg.value / 2;
        theChosenOnes[Carol] += msg.value / 2 + msg.value % 2;
        LogContractState(this.balance, theChosenOnes[Bob], theChosenOnes[Carol]);
    }

    function withdrawFunds()
        freezeRay 
        public 
    {
        require(theChosenOnes[msg.sender] != 0);
            LogContractState(this.balance, theChosenOnes[Bob], theChosenOnes[Carol]);
            transferAmount = theChosenOnes[msg.sender]; 
            theChosenOnes[msg.sender] = 0;
            msg.sender.transfer(transferAmount);
            LogWithdrawl(msg.sender, transferAmount);
            LogContractState(this.balance, theChosenOnes[Bob], theChosenOnes[Carol]); 
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

    function freeze(bool _freeze)
        isOwner
        returns (bool success) {
            frozen = _freeze;
            LogFreeze("Splitter contract frozen?", frozen);
            return true;
    }
}