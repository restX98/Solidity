const { ethers } = require("hardhat");
const { assert, expect } = require("chai");

// HardHat utilizza MochaJS come framework per il testing

// Arrow function sconsigliate da MochaJS
describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage;
  before(async function () {
    // runs once before the first test in this block
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
    await simpleStorage.deployed();
  });
  /*
  after(function () {
    // runs once after the last test in this block
  });
  beforeEach(function () {
    // runs before each test in this block
  });
  afterEach(function () {
    // runs after each test in this block
  });
*/
  it("MyNumber should start with 0", async function () {
    let expectedValue = "0";
    let myNumber = await simpleStorage.retrieve();
    // assert.equal(myNumber, expectedValue);
    expect(myNumber).to.equal(expectedValue); // I due metodi sono equivalenti
  });

  it("MyNumber should when I call store()", async function () {
    let expectedValue = "10";
    await simpleStorage.store("10");
    let myNumber = await simpleStorage.retrieve();
    assert.equal(myNumber, expectedValue);
  });

  it("Add person to the contract", async function () {
    let expectedResult = { name: "Ciccio", favoriteNumber: "16" };
    await simpleStorage.addPerson("Ciccio", "16");
    let [favoriteNumber, name] = await simpleStorage.people(0);
    assert.equal(name, expectedResult.name);
    assert.equal(favoriteNumber, expectedResult.favoriteNumber);
  });
});
