pragma solidity ^0.4.6;


contract Splitter {
    address public owner;
    bool public frozen;
    address public Bob;
    address public Carol;

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawal(address withdrawer, uint amount);
    event LogFreeze(bool isFrozen);

    mapping(address => uint) public theChosenOnes;
    
    function Splitter(address _Bob, address _Carol) public {
        owner = msg.sender;
        Bob = _Bob;
        Carol = _Carol;
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
        theChosenOnes[Bob] += msg.value / 2;
        theChosenOnes[Carol] += msg.value / 2 + msg.value % 2;
        LogDeposit(msg.sender, msg.value); 
    }

    function withdrawFunds()
        freezeRay 
        public
        returns (bool success) 
    {
        if(msg.sender == owner) {
            frozen = true;
            LogWithdrawal(msg.sender, this.balance);
            msg.sender.transfer(this.balance);
            return true;
        } 
        require(theChosenOnes[msg.sender] != 0);
        uint amount = theChosenOnes[msg.sender]; 
        theChosenOnes[msg.sender] = 0;
        msg.sender.transfer(amount);
        LogWithdrawal(msg.sender, amount);
        return true; 

        
    } 

    function freeze(bool _freeze)
        isOwner
        returns (bool success) {
            frozen = _freeze;
            LogFreeze(frozen);
            return true;
    }
}