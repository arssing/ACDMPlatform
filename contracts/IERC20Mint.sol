// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Mint is IERC20 {
    function decimals() external view returns(uint8);
    function mint(address recipient, uint amount) external;
    function burn(uint256 amount) external;
}