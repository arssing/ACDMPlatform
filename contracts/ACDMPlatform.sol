//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20Mint.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract ACDMPlatform {

    using EnumerableMap for EnumerableMap.UintToAddressMap;

    event Registered(address newAddress);
    event StartSaleRound(uint indexed id, uint amount);
    event StartTradeRound(uint indexed id);
    event Bought(uint amount);
    event AddOrder(uint indexed id, uint amount, uint price);
    event RemoveOrder(uint indexed id);
    event RedeemOrder(uint indexed id, address to, uint amount);

    address public token;
    uint public roundTime;
    uint public totalSales;
    uint public totalTrades;
    uint public totalOrders;
    uint public percentDivider;
    uint public lastTradeValue;
    EnumerableMap.UintToAddressMap activeOrders;

    struct Order {
        address owner;
        uint priceInEth;
        uint tokens;
    }

    struct Sale {
        uint price;
        uint startTime;
        uint toSale;
        uint sold;
        bool active;
    }

    struct Trade {
        bool active;
        uint startTime;
    }

    struct Account {
        bool registered;
        address[] referrers;
    }

    mapping(address => Account) public accounts;
    mapping(uint => Sale) public sales;
    mapping(uint => Trade) public trades;
    mapping(uint => Order) public orders;

    constructor(address _token, uint _roundTime) {
        token = _token;
        roundTime = _roundTime;
        percentDivider = 10000;
        accounts[address(0)].registered = true;
        lastTradeValue = 1 ether;
        sales[totalSales].price = 10000000000000;
    }

    function register(address _referrer) public {
        require(accounts[msg.sender].registered != true, "ACDMPlatform::register:you are already registered");
        require(accounts[_referrer].registered == true, "ACDMPlatform::register:referrer is not registered");
    
        if (_referrer != address(0)) {
            accounts[msg.sender].referrers.push(_referrer);

            if (accounts[_referrer].referrers.length != 0){
                accounts[msg.sender].referrers.push(accounts[_referrer].referrers[0]);
            }
        }
        accounts[msg.sender].registered = true;
        emit Registered(msg.sender);
    }

    function startSaleRound() public {
        require(block.timestamp - trades[totalTrades].startTime >= roundTime, "ACDMPlatform::startSaleRound:trade round is not ended");
        require(sales[totalSales].active != true, "ACDMPlatform::startSaleRound:sale round is active now");

        if(totalSales != 0) sales[totalSales].price = sales[totalSales-1].price * 10300 / percentDivider + 4000000000000;

        sales[totalSales].toSale = (lastTradeValue / sales[totalSales].price) * 10 ** IERC20Mint(token).decimals() ;
        sales[totalSales].startTime = block.timestamp;
        sales[totalSales].active = true;
        IERC20Mint(token).mint(address(this),sales[totalSales].toSale);

        uint amountActiveOrders = activeOrders.length();
        
        if (amountActiveOrders != 0) {
            for (uint i = 0; i < amountActiveOrders; i++) {
                (uint key, ) = activeOrders.at(i);
                IERC20Mint(token).transfer(orders[key].owner, orders[key].tokens);
            }
            delete activeOrders;
        }
        totalTrades++;

        emit StartSaleRound(totalSales, sales[totalSales].toSale);
    }

    function startTradeRound() public {
        require(block.timestamp - sales[totalSales].startTime >= roundTime, "ACDMPlatform::startSaleRound:sale round is not ended");
        require(trades[totalTrades].active != true, "ACDMPlatform::startSaleRound:trade round is active now");
        uint amountToBurn;

        trades[totalTrades].active = true;
        trades[totalTrades].startTime = block.timestamp;
        amountToBurn = sales[totalSales].toSale - sales[totalSales].sold;
        lastTradeValue = 0;
        totalSales++;

        if (amountToBurn > 0) IERC20Mint(token).burn(amountToBurn);

        emit StartTradeRound(totalTrades);
    }

    function buyACDM() payable public {
        require(sales[totalSales].active == true, "ACDMPlatform::buyACDM:sale round is not active");
        
        uint amountToBuy = (msg.value / sales[totalSales].price) * 10 ** IERC20Mint(token).decimals();
        require(amountToBuy > 0, "ACDMPlatform::buyACDM:amountToBuy must be more than 0");
        require(sales[totalSales].sold + amountToBuy <= sales[totalSales].toSale, "ACDMPlatform::buyACDM:too many tokens to buy");

        if (accounts[msg.sender].referrers.length > 0) payable(accounts[msg.sender].referrers[0]).transfer(msg.value * 500 / percentDivider);
        if (accounts[msg.sender].referrers.length > 1) payable(accounts[msg.sender].referrers[1]).transfer(msg.value * 300 / percentDivider);

        sales[totalSales].sold += amountToBuy;
        IERC20Mint(token).transfer(msg.sender, amountToBuy);

        emit Bought(amountToBuy);
    }

    function addOrder(uint _amount, uint _price) public {
        require(trades[totalTrades].active == true, "ACDMPlatform::addOrder:trade round is not active now");

        orders[totalOrders].owner = msg.sender;
        orders[totalOrders].tokens = _amount;
        orders[totalOrders].priceInEth = _price;
        activeOrders.set(totalOrders, msg.sender);
        IERC20Mint(token).transferFrom(msg.sender, address(this), _amount);

        totalOrders++;

        emit AddOrder(totalOrders - 1, _amount, _price);
    }

    function removeOrder(uint _orderId) public {
        require(activeOrders.contains(_orderId) == true, "ACDMPlatform::removeOrder:orderId not found");
        require(orders[_orderId].owner == msg.sender, "ACDMPlatform::removeOrder:you are not an owner");
        activeOrders.remove(_orderId);

        IERC20Mint(token).transfer(msg.sender, orders[_orderId].tokens);
        emit RemoveOrder(_orderId);
    }

    function redeemOrder(uint _orderId) payable public {
        require(activeOrders.contains(_orderId) == true, "ACDMPlatform::redeemOrder:orderId not found");

        uint amountToBuy = (msg.value / orders[_orderId].priceInEth) * 10 ** IERC20Mint(token).decimals();
        require(amountToBuy <= orders[_orderId].tokens, "ACDMPlatform::redeemOrder:too many tokens to buy");

        uint sendToOwner = msg.value * 9500 / percentDivider;
        uint sendToReff = msg.value * 250 / percentDivider;

        orders[_orderId].tokens -= amountToBuy;
        lastTradeValue += msg.value;
        
        IERC20Mint(token).transfer(msg.sender, amountToBuy);
        
        if (orders[_orderId].tokens == 0) activeOrders.remove(_orderId);
        
        if (accounts[orders[_orderId].owner].referrers.length != 0) {
            for (uint8 i = 0; i < accounts[orders[_orderId].owner].referrers.length; i++) {
                payable(accounts[orders[_orderId].owner].referrers[i]).transfer(sendToReff);
            }
        }
        payable(orders[_orderId].owner).transfer(sendToOwner);
        emit RedeemOrder(_orderId, msg.sender, amountToBuy);
    }

}