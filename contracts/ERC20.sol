//SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

contract ERC20 {
    
    uint256 _totalSupply;
    string _name;
    string _symbol;
    uint8 _decimals;
    uint256 balance;
    
    mapping(address => uint256) balances;  
    mapping(address => mapping(address => uint256)) allowed;

    event Transfer(address from, address to, uint256 amount);
    event Approval(address from, address spender, uint256 amount);

    constructor (string memory name_, string memory symbol_, uint8 decimals_, uint256 amount_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        balances[msg.sender] = amount_;
        _totalSupply = amount_;
    }
    
    function name() public view returns(string memory) {
        return _name;
    }

    function symbol() public view returns(string memory) {
        return _symbol;
    }

    function decimals() public view returns(uint8) {
        return _decimals;
    }

    function totalSupply() public view returns(uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public returns(uint256) {
        return balance = balances[account];
    }

    function transfer(address to, uint256 amount) public returns(bool) {
        require(balances[msg.sender] >= amount, "ERC20: not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns(bool) {
        allowed[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns(uint256) {
        return allowed[owner][spender];
    }

    function transferFrom(address from, address to, uint256 amount) external returns(bool) {
        require(allowed[from][msg.sender] >= amount, "ERC20: no permission to spend");
        require(balances[from] >= amount, "ERC20: not enough tokens");
        balances[from] -= amount;
        balances[to] += amount;
        allowed[from][msg.sender] -= amount;
        emit Transfer(msg.sender, to, amount);
        emit Approval(from, msg.sender, amount);
        return true;
    }
}