const { expect } = require("chai");

describe("ContratoOK", function () {
  it("Debería tener el mensaje inicial correcto", async function () {
    const ContratoOK = await ethers.getContractFactory("ContratoOK");
    const contrato = await ContratoOK.deploy();
    await contrato.waitForDeployment();
    expect(await contrato.message()).to.equal("ContratoOK activo");
  });

  it("Debería permitir cambiar el mensaje", async function () {
    const ContratoOK = await ethers.getContractFactory("ContratoOK");
    const contrato = await ContratoOK.deploy();
    await contrato.waitForDeployment();
    await contrato.setMessage("Nuevo mensaje");
    expect(await contrato.message()).to.equal("Nuevo mensaje");
  });
});
