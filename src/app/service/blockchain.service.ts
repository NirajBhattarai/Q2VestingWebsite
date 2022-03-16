import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';
declare var $: any;

declare const window: any;

const vestingAbi = [
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
  providedIn: 'root',
})
export class BlockchainService {
  public timeLeft: any = { days: '', hours: '', minutes: '', seconds: '' };
  public userAddress: any;
  readonly vestingContractAddress: any =
    '0xf293d624da0d0cebec23f9c03acedaffc6ec934c';
  public isConnected = new BehaviorSubject<boolean>(false);
  public isNetworkError = false;
  public walletAddress = new BehaviorSubject<string>('');

  public vestingMethods: any;

  public unLockAmount = new BehaviorSubject<number>(0);
  public unLockAmountShow = new BehaviorSubject<boolean>(false);

  public unLockTime = new BehaviorSubject<any>(0);
  public unLockTimeShow = new BehaviorSubject<boolean>(false);

  public currentNetwork = new BehaviorSubject<string>('');

  constructor() {}

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

        this.userAddress = userAddresses[0];
        console.log(this.userAddress);
        this.checkWalletConnected();
        this.vestingMethods = await (await this.loadVestingContract()).methods;

        this.checkUnlockAmount(this.userAddress);
        this.checkUnlockTime(this.userAddress);
        this.setWalletAddress();

        this.isNetworkError = false;

        this.isConnected.next(userAddresses.length == 0 ? false : true);
        // } else if (userAddresses.length > 0) {
        //   this.isConnected.next(userAddresses.length == 0 ? false : true);
        //   this.isNetworkError = true;
        // }
      });
  }

  setWalletAddress() {
    let responseString = window.web3.currentProvider.selectedAddress;
    if (responseString !== null) {
      this.walletAddress.next(responseString);
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

  toFixed(x: any) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + new Array(e).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    return x;
  }

  async addInvestor(investorAddress: any, unlockTime: any, unlockAmount: any) {
    unlockAmount = unlockAmount;
    unlockAmount = this.toFixed(unlockAmount * 1e18).toString();
    console.log(unlockAmount);
    return this.vestingMethods
      .addInvestorAccount(investorAddress, unlockTime, unlockAmount)
      .send({ from: this.userAddress });
  }

  async unLockQ2() {
    this.vestingMethods.unlockQ2().send({ from: this.userAddress });
  }

  getWalletAddress() {
    return this.walletAddress.asObservable();
  }

  getIsConnected() {
    return this.isConnected.asObservable();
  }

  getUnlockAmount() {
    return this.unLockAmount.asObservable();
  }

  getUnlockAmountShown() {
    return this.unLockAmountShow.asObservable();
  }

  getUnlockTime() {
    return this.unLockTime.asObservable();
  }

  getUnlockTimeShown() {
    return this.unLockTimeShow.asObservable();
  }

  getCurrentNetwork() {
    return this.currentNetwork.asObservable();
  }
}
