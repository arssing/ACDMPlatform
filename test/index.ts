import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import { ContractReceipt } from "ethers";
import {Token, Token__factory, ACDMPlatform, ACDMPlatform__factory} from "../typechain";
import { Address } from "ethereumjs-util";

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

describe("DAO-tests", function () {
  
  let token: Token;
  let acdm: ACDMPlatform;

  beforeEach(async () => {
    const [owner, user1] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("Token",owner) as Token__factory;
    const acdmFactory = await ethers.getContractFactory("ACDMPlatform", owner) as ACDMPlatform__factory;
    

    token = await tokenFactory.deploy("TestToken1","STT");
    await token.deployed();

    acdm = await acdmFactory.deploy(token.address, 3600);
    await acdm.deployed();
    await token.addAdmin(acdm.address);

    await acdm.startSaleRound();
    
  });

  it("startSaleRound, startTradeRound, buyACDM, addOrder, removeOrder, redeemOrder", async function () {
    const provider = waffle.provider;
    const [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    await acdm.connect(owner).register(ethers.constants.AddressZero);
    await acdm.connect(user1).register(owner.address);
    await acdm.connect(user2).register(user1.address);

    await expect(
      acdm.connect(owner).register(user1.address)
    ).to.be.revertedWith("ACDMPlatform::register:you are already registered");
    
    await expect(
      acdm.connect(user3).register(user4.address)
    ).to.be.revertedWith("ACDMPlatform::register:referrer is not registered");

    await expect(
      acdm.startSaleRound()
    ).to.be.revertedWith("ACDMPlatform::startSaleRound:sale round is active now");
    
    await expect(
      acdm.startTradeRound()
    ).to.be.revertedWith("ACDMPlatform::startSaleRound:sale round is not ended");

    await expect(
      acdm.addOrder(10, 10)
    ).to.be.revertedWith("ACDMPlatform::addOrder:trade round is not active now");

    await expect(
      acdm.connect(user2).buyACDM({ value: ethers.utils.parseEther("1.01") })
    ).to.be.revertedWith("ACDMPlatform::buyACDM:too many tokens to buy");

    await expect(
      acdm.connect(user2).buyACDM()
    ).to.be.revertedWith("ACDMPlatform::buyACDM:amountToBuy must be more than 0");

    await acdm.connect(user2).buyACDM({ value: ethers.utils.parseEther("0.1") });
    await acdm.connect(user3).buyACDM({ value: ethers.utils.parseEther("0.8") });
    await acdm.connect(user5).buyACDM({ value: ethers.utils.parseEther("0.1") });

    expect(await token.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("10000"));
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("100000"));

    await ethers.provider.send("evm_increaseTime", [3600]);
    await acdm.startTradeRound();

    await expect (
      acdm.startTradeRound()
    ).to.be.revertedWith("ACDMPlatform::startSaleRound:trade round is active now");
    
    await expect(
      acdm.connect(user2).buyACDM({ value: ethers.utils.parseEther("0.1") })
    ).to.be.revertedWith("ACDMPlatform::buyACDM:sale round is not active");

    await token.connect(user2).approve(acdm.address, ethers.utils.parseEther("1000"));
    await acdm.connect(user2).addOrder(ethers.utils.parseEther("1000"), ethers.utils.parseEther("0.000001"));

    await token.connect(user3).approve(acdm.address, ethers.utils.parseEther("1000"));
    await acdm.connect(user3).addOrder(ethers.utils.parseEther("1000"), ethers.utils.parseEther("0.0000011"));

    await token.connect(user5).approve(acdm.address, ethers.utils.parseEther("1000"));
    await acdm.connect(user5).addOrder(ethers.utils.parseEther("1000"), ethers.utils.parseEther("0.0001"));

    await acdm.connect(owner).redeemOrder(0, { value: ethers.utils.parseEther("0.00001") });
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("10"));

    await acdm.connect(user4).redeemOrder(1, { value: ethers.utils.parseEther("0.00011") });
    expect(await token.balanceOf(user4.address)).to.equal(ethers.utils.parseEther("100"));

    const tx1 = await acdm.orders(0);
    expect(tx1.tokens).to.equal(ethers.utils.parseEther("990"));
    

    await expect (
      acdm.connect(user1).redeemOrder(0, { value: ethers.utils.parseEther("10") })
    ).to.be.revertedWith("ACDMPlatform::redeemOrder:too many tokens to buy");

    await acdm.connect(owner).redeemOrder(1, { value: ethers.utils.parseEther("0.00099") });
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("910"));

    await expect (
      acdm.connect(user1).removeOrder(4)
    ).to.be.revertedWith("ACDMPlatform::removeOrder:orderId not found");

    await expect (
      acdm.connect(user1).removeOrder(0)
    ).to.be.revertedWith("ACDMPlatform::removeOrder:you are not an owner");

    await acdm.connect(user2).removeOrder(0);
    
    await expect (
      acdm.connect(user1).redeemOrder(0, { value: ethers.utils.parseEther("0.00001") })
    ).to.be.revertedWith("ACDMPlatform::redeemOrder:orderId not found");

    await expect (
      acdm.startSaleRound()
    ).to.be.revertedWith("ACDMPlatform::startSaleRound:trade round is not ended");
  
    await ethers.provider.send("evm_increaseTime", [3600]);
    await acdm.startSaleRound();

    const tx2 = await acdm.sales(1);
    expect(tx2.price).to.equal(ethers.utils.parseEther("0.0000143"));
    
    await expect (
      acdm.connect(user3).redeemOrder(3, { value: ethers.utils.parseEther("0.00001") })
    ).to.be.revertedWith("ACDMPlatform::redeemOrder:orderId not found");

    await ethers.provider.send("evm_increaseTime", [3600]);
    await acdm.startTradeRound();
    await ethers.provider.send("evm_increaseTime", [3600]);
    await acdm.startSaleRound();
    await acdm.startTradeRound();
  });


});