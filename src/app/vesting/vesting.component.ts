import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { SweetAlertDatas } from '../constants/SweetalertDatas';
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

@Component({
  selector: 'app-vesting',
  templateUrl: './vesting.component.html',
  styleUrls: ['./vesting.component.scss'],
})
export class VestingComponent implements OnInit {
  public timeLeft: any = { days: '', hours: '', minutes: '', seconds: '' };
  public userAddress: any;
  readonly vestingContractAddress: any =
    '0xb1890e2C8b4c726306F5F295F86117df2EfA302b';
  public isConnected = false;
  public isNetworkError = false;
  public walletAddress = '';
  public showSuccessMessage: boolean = false;
  public successMessage: string = '';
  public showErrorMessage: boolean = false;
  public errorMessage: string = '';
  public disableMintButton: boolean = false;
  public stakingMethods: any;
  public erc721Methods: any;
  public nftBalance: any;
  public stakingAmount: number = 0;
  public allTokenApproved: any = false;
  public approvedAddress: any = [];
  public noDatas: string = SweetAlertDatas.nullStakingData;
  public datas: string = SweetAlertDatas.stakingData;
  public sweetAlertBackgroundColor: string = '#191724';
  public stakedTokenAmount: any = 0;
  public unStakingAmount: any = 0;
  public earning: any = 0;

  public vestingMethods: any;

  public unLockAmount: any;
  public unLockAmountShow: boolean = false;

  public unLockTime: any;
  public unLockTimeShow: boolean = false;

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
          this.isConnected = true;
          this.getChainId(response);
        },
        (error: any) => {
          this.isConnected = false;
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

          this.isConnected = userAddresses.length == 0 ? false : true;
        } else if (userAddresses.length > 0) {
          this.isConnected = userAddresses.length == 0 ? false : true;
          this.isNetworkError = true;
        }
      });
  }

  async checkERC721Balance() {
    this.nftBalance = await this.erc721Methods
      .balanceOf(window.web3.currentProvider.selectedAddress)
      .call();
  }

  setWalletAddress() {
    let responseString = window.web3.currentProvider.selectedAddress;
    let splittedAddress =
      responseString.substring(0, 7) +
      '...' +
      responseString.substring(responseString.length - 7);
    this.walletAddress = splittedAddress;
  }

  checkUnlockAmount(address: any) {
    this.vestingMethods
      .unLockAmount(address)
      .call()
      .then((resp: any) => {
        this.unLockAmount = Number(resp);
        this.unLockAmountShow = true;
      });
  }

  checkUnlockTime(address: any) {
    this.vestingMethods
      .unLockTime(address)
      .call()
      .then((resp: any) => {
        console.log(resp);
        this.unLockTime = Number(resp);
        this.unLockTimeShow = true;
      });
  }

  async disconnect() {
    this.isConnected = false;
  }

  checkWalletConnected() {
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  unLockQ2() {
    this.vestingMethods.unlockQ2().send({ from: this.userAddress });
  }

  ngOnInit(): void {
    setInterval(() => {
      this.makeTimer();
    }, 1000);
  }

  makeTimer() {
    var now: any = new Date();
    now = Date.parse(now) / 1000;

    if(this.unLockTime > now){
    var endTime: any = new Date(this.unLockTime*1000);
    endTime = Date.parse(endTime) / 1000;

    var timeLeft: any = endTime - now;

    var days: any = Math.floor(timeLeft / 86400);
    var hours: any = Math.floor((timeLeft - days * 86400) / 3600);
    var minutes: any = Math.floor(
      (timeLeft - days * 86400 - hours * 3600) / 60
    );
    var seconds: any = Math.floor(
      timeLeft - days * 86400 - hours * 3600 - minutes * 60
    );

    if (hours < '10') {
      hours = '0' + hours;
    }
    if (minutes < '10') {
      minutes = '0' + minutes;
    }
    if (seconds < '10') {
      seconds = '0' + seconds;
    }
    this.timeLeft = {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  } else {
    this.timeLeft = {
      days: '0',
      hours: '0',
      minutes: '0',
      seconds: '0',
    };
  }
}
}
