//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(
        string memory _name, 
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
    }

    function addAdmin(address newAdmin) public onlyRole(ADMIN_ROLE) {
        _setupRole(ADMIN_ROLE, newAdmin);
    }
}