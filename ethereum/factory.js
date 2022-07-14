// our instance of the deployed campaign factory and the address of its location on the blockchain //

import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x2112EebF41cE4488525b2ef06701B854C9cE6364'
);

export default instance;
