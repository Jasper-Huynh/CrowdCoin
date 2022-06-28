import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
'0xf5B20fCaF89Ef4FB42756D8dfb0D2Bf60761b7D1'
);

export default instance;