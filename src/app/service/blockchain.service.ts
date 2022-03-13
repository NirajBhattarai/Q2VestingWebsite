import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';
declare var $: any;

declare const window: any;
const chainAddress = '0x4';

const vestingAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_unLockDate',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'InvestorAccountAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithDrawnToken',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_investorAccount',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'unLockDate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'addInvestorAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'blockTimestamp',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
    ],
    name: 'unLockAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
    ],
    name: 'unLockTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unlockQ2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  public timeLeft: any = { days: '', hours: '', minutes: '', seconds: '' };
  public userAddress: any;
  readonly vestingContractAddress: any =
    '0xb1890e2C8b4c726306F5F295F86117df2EfA302b';
  public isConnected = new BehaviorSubject<boolean>(false);
  public isNetworkError = false;
  public walletAddress = new BehaviorSubject<string>("");   

  public vestingMethods: any;

  public unLockAmount = new BehaviorSubject<number>(0);
  public unLockAmountShow = new BehaviorSubject<boolean>(false);

  public unLockTime = new BehaviorSubject<any>(0);
  public unLockTimeShow = new BehaviorSubject<boolean>(false);

  public currentNetwork = new BehaviorSubject<string>("");

  constructor() { }

  loadVestingContract() {
    return new window.web3.eth.Contract(
      vestingAbi,
      this.vestingContractAddress
    );
  }

  async connectToMetaMask() {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' }).then(
        (response: any) => {
          this.isConnected.next(true);
          this.getChainId(response);
        },
        (error: any) => {
          this.isConnected.next(false);
        }
      );
    } else {
      return;
    }
  }

  async getChainId(userAddresses: any) {
    window.ethereum
      .request({ method: 'eth_chainId' })
      .then(async (response: any) => {
        console.log(response);
        this.currentNetwork.next(response);
        if (response === chainAddress) {
          this.userAddress = userAddresses[0];
          console.log(this.userAddress);
          this.checkWalletConnected();
          this.vestingMethods = await (
            await this.loadVestingContract()
          ).methods;

          this.checkUnlockAmount(this.userAddress);
          this.checkUnlockTime(this.userAddress);
          this.setWalletAddress();

          this.isNetworkError = false;

          this.isConnected.next(userAddresses.length == 0 ? false : true);
        } else if (userAddresses.length > 0) {
          this.isConnected.next(userAddresses.length == 0 ? false : true);
          this.isNetworkError = true;
        }
      });
  }

  setWalletAddress() {
    let responseString = window.web3.currentProvider.selectedAddress;
    if(responseString !== null){
      let splittedAddress =
      responseString.substring(0, 7) +
      '...' +
      responseString.substring(responseString.length - 7);
      this.walletAddress.next(splittedAddress);
    }
    
  }

  checkUnlockAmount(address: any) {
    this.vestingMethods
      .unLockAmount(address)
      .call()
      .then((resp: any) => {
        this.unLockAmount.next(Number(resp));
        this.unLockAmountShow.next(true);
      });
  }

  checkUnlockTime(address: any) {
    this.vestingMethods
      .unLockTime(address)
      .call()
      .then((resp: any) => {
        console.log(resp);
        this.unLockTime.next(resp);
        this.unLockTimeShow.next(true);
      });
  }

  async disconnect() {
    this.isConnected.next(false);
  }

  checkWalletConnected() {
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  async unLockQ2() {
    this.vestingMethods.unlockQ2().send({ from: this.userAddress });
  }

  getWalletAddress(){
    return this.walletAddress.asObservable();
  }

  getIsConnected(){
    return this.isConnected.asObservable();
  }

  getUnlockAmount(){
    return this.unLockAmount.asObservable();
  }

  getUnlockAmountShown(){
    return this.unLockAmountShow.asObservable();
  }

  getUnlockTime(){
    return this.unLockTime.asObservable();
  }

  getUnlockTimeShown(){
    return this.unLockTimeShow.asObservable();
  }

  getCurrentNetwork(){
    return this.currentNetwork.asObservable();
  }

}
