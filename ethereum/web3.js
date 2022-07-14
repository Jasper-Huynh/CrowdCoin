// Script to ensure that we have a working version of web3 on the server or client side //

import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // We are in the browser and Metamask is running //
  window.ethereum.request({ method: 'eth_requestAccounts' });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running Metamask//
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/597876c651aa4e1d9edb878fbc94e61d'
  );
  web3 = new Web3(provider);
}

export default web3;
