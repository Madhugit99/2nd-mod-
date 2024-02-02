// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed depositor, uint256 amount);
    event Withdrawal(address indexed withdrawer, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit() public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        require(msg.value > 0, "Deposit amount should be greater than 0");

        balance += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _withdrawAmount, "Insufficient balance");

        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);

        emit Withdrawal(msg.sender, _withdrawAmount);
    }
}
