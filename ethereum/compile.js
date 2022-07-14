/* Script to create a build folder that takes our Solidity contract and writes seperate Json 
files for both the Campaign Factory and Campaign contracts. Erases any current build folder
and ensures that the latest version of our contract is the one being used for the rest of our 
scripts. Utilizes path, solc the solidity compiler and fs-extra with gives us access to removesync.
 */

const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output[contract]
  );
}
