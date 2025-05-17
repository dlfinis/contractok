async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ContratoOK = await ethers.getContractFactory("ContratoOK");
  const contrato = await ContratoOK.deploy();
  await contrato.deployed();
  console.log("ContratoOK deployed to:", contrato.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
