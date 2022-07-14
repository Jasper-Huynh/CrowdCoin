// our variable to work with individual deployed campaigns. // 

import web3 from './web3';
import Campaign from './build/Campaign.json';

const campaignAddress = (address) => {
  return new web3.eth.Contract(JSON.parse(Campaign.interface), address);
};

export default campaignAddress;
