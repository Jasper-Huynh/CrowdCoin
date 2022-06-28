/* import assert module for testing framework, ganache-cli (ethereum development tool), Web3 constructor
and create an instance of Web3 to work with and pass it a provider */
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

//imports entire json file( as opposed to just ABI(interface)/Bytecode with path //
const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

//declare variables to use within our beforeEach statement//
let accounts;
let factory;
let campaignAddress;
let campaign;

/* code that runs before each assert IT statement. Deploys an instance of campaign factory by using Web3,
 Contract constructor by parsing our compiledFactory and deploying it with our accounts variable. Whole 
 function is asychronous(async/await syntax). Calls the create campaign method and saves address of 
 deployed campaign to use/reference for following IT statements/tests */
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

/* basic test to check if both factory and campaign deploys correctly by using
assert to check if both factory and campaign have addresses. Take a moment to 
think about what kinds of tests you want to run, what to test */
describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  /*tests to see if caller of campaign is assigned manager. since manager is a 
  public variable in our contract, a GET method is auto created. assert.equal
  equates what we want expect to be as first argument and what it is as second. */
  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  /* tests to see if contributor function works/ contributor is added to approvers
mapping. Ganache always generates 10 accounts to test with */
  it("allows contributors and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1],
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  /* calls contribute method with value explicitly lower than minimum to test 
failure using try/catch. Use assert(false). if that line ever runs, it will auto
fail */
  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "50",
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  /* calls createRequest method. call request struct and assert an equal test
  matching a key to test that our function worked properly. */
  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("buy batteries", "100", accounts[2])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    const request = await campaign.methods.requests(0).call();
    assert.equal("buy batteries", request.description);
  });

  //creates a request from an address that is not the manager//
  it("wont create a request from someone who isnt the manager", async () => {
    try {
      await campaign.methods
        .createRequest("not the manager", "500", accounts[3])
        .send({
          from: accounts[5],
          gas: "1000000",
        });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  /* An end to end test that utilizes all functions. creates a request,
  finalizes request, and tracks money transfer. */
  it("processes requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods
      .createRequest("A", web3.utils.toWei("5", "ether"), accounts[1])
      .send({ from: accounts[0], gas: "1000000" });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
