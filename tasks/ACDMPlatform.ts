import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("start-sale", "start sale round")
    .addParam("address","smart contract address")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const accounts = await hre.ethers.getSigners();
    
    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const tx = await ACDMContract.startSaleRound();

    console.log(
        `tx hash: ${tx.hash}`
    );
});
task("start-trade", "start trade round")
    .addParam("address","smart contract address")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const accounts = await hre.ethers.getSigners();
    
    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const tx = await ACDMContract.startTradeRound();

    console.log(
        `tx hash: ${tx.hash}`
    );
});
task("buy-acdm", "buy tokens by eth value")
    .addParam("address","smart contract address")
    .addParam("value","value eth to send")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const accounts = await hre.ethers.getSigners();
    
    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const tx = await ACDMContract.buyACDM({value:hre.ethers.utils.parseEther(taskArgs.value)});

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("add-order", "add order by amount and price")
    .addParam("address","smart contract address")
    .addParam("token","token address")
    .addParam("amount","amount tokens")
    .addParam("price","price for 1 token")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const TokenFactory = await hre.ethers.getContractFactory("Token");

    const accounts = await hre.ethers.getSigners();
    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const price = hre.ethers.utils.parseEther(taskArgs.price);

    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const TokenContract = new hre.ethers.Contract(
        taskArgs.token,
        TokenFactory.interface,
        accounts[0]
    );

    const appr = await TokenContract.approve(taskArgs.address, amount);
    console.log(
        `approve hash: ${appr.hash}`
    );

    const createOrder = await ACDMContract.addOrder(amount, price);
    console.log(
        `order hash: ${createOrder.hash}`
    );
});

task("redeem-order", "redeem order")
    .addParam("address","smart contract address")
    .addParam("id","order id")
    .addParam("value","value in eth to send")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const accounts = await hre.ethers.getSigners();
    const value = hre.ethers.utils.parseEther(taskArgs.value);

    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const redeemOrder = await ACDMContract.redeemOrder(taskArgs.id, {value:value});
    console.log(
        `redeemOrder hash: ${redeemOrder.hash}`
    );
});

task("remove-order", "remove order")
    .addParam("address","smart contract address")
    .addParam("id","order id")
    .setAction (async (taskArgs, hre) => {
    
    const ACDMFactory = await hre.ethers.getContractFactory("ACDMPlatform");
    const accounts = await hre.ethers.getSigners();

    const ACDMContract = new hre.ethers.Contract(
        taskArgs.address,
        ACDMFactory.interface,
        accounts[0]
    );

    const removeOrder = await ACDMContract.removeOrder(taskArgs.id);
    console.log(
        `removeOrder hash: ${removeOrder.hash}`
    );
});