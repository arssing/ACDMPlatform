import { ethers } from "hardhat";

async function main() {
  const ACDM = await ethers.getContractFactory("ACDMPlatform");
  const acdm = await ACDM.deploy("0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f", 3600);

  await acdm.deployed();

  console.log("address:", acdm.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});