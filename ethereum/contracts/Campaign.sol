pragma solidity ^0.4.17;

/* factory to deploy our Campaign contract. Contract to deploy a contract so that fees are
paid by creator, not us. Ensures that our code is executed as written and without public
 exposure to malicious intent */
contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {

// defining our production funds release requests with type struct. keys are defined //
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

// all our variables to be used in contract //
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

/* deprecated constructor function of Contract Campaign. takes minimum contribution and address
as arguments. manager of campaign is assigned to creator to bypass it being assigned to the 
factory constructor address. i.e me */
    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

/* creates the function to contribute to campaign. Ensures contribution is above set minimum value.
adds the contributers address to the approvers mapping and sets their status to TRUE(default is false).
Adds +1 to approversCount, our list to keep track of how many contributors we have without 
using/iterating an array  */
    function contribute() public payable {
       
        bool isExisted = approvers[msg.sender];

        if (!isExisted) {
             require(msg.value > minimumContribution);
        
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

/*  function to request funds to be released for production. takes a description, value, and address of 
recipient of funds(vendor,manufacturer, etc. Restricted to creator(manager) of campaign. Creates a
 new Request struct with defined key/value pairs. pushes the new request to the requests array */
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
           description: description,
           value: value,
           recipient: recipient,
           complete: false,
           approvalCount: 0
        });

        requests.push(newRequest);
    }

/* function for approvers(contributors) to place their vote for request approval. Ensures that individual 
has indeed contributed by referencing approvers mapping and checks the specific request struct to ensure that
only one vote per approver can be made. updates the approvalCount so that we have a number to validate with. */
    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

/* function for manager to finalize request and release funds to proper channels to proceed. Can only be finalized
if approvalCount is more than 50% of contributors. marks the specifi Request strut as complete and transfers the 
specified value to the specified address */
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
        uint, uint, uint, uint, address
    ) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}