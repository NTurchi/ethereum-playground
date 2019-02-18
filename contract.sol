pragma solidity >0.4.99 <0.6.0;

contract Ewm {
    // contract logic
    address payable owner;
    
    constructor() public payable {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "You're not the owner of the contract");
        _;
    }
    
    function () payable external {
    }
    
    function withdraw(uint withdraw_amount) public onlyOwner {
        require(withdraw_amount <= address(this).balance, "Insufficient balance in faucet for withdrawal request");
        msg.sender.transfer(withdraw_amount);
    }
    
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}