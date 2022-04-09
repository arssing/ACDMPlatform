import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("Token");
  let contract = await factory.deploy("WowToken","WoW");

  await contract.deployed();
  console.log(`Contract address: ${contract.address}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });