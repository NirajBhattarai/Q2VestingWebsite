import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { SweetAlertDatas } from '../constants/SweetalertDatas';
declare var $: any;

declare const window: any;
const chainAddress = '0xa869';

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
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public userAddress: any;
  public scodacBalance: any = 0;
  readonly vestingContractAddress: any =
    '0xc85742d8c768d2cB3bDE61E08CCf282ed8F10032';
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
  public investorAddress: any;
  public unlockTimeInput: any;

  constructor() {}

  loadVestingContract() {
    return new window.web3.eth.Contract(
      vestingAbi,
      this.vestingContractAddress
    );
  }

  changeStakingAmount(value: any) {
    this.stakingAmount = Number(value.data);
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
        if (response === chainAddress) {
          this.userAddress = userAddresses[0];
          console.log(this.userAddress);
          this.checkWalletConnected();
          this.vestingMethods = await (
            await this.loadVestingContract()
          ).methods;

          this.checkUnlockAmount(this.userAddress);
          this.checkUnlockTime(this.userAddress);
          // this.stakingMethods = await (
          //   await this.loadStakingContract()
          // ).methods;
          // this.erc721Methods = await (await this.loadERC721Contract()).methods;
          await this.checkERC721Balance();
          this.setWalletAddress();
          this.checkStakedAmount();

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

  checkUnlockTime(unlockTime: any) {
    console.log(unlockTime);
    this.vestingMethods
      .unLockTime(unlockTime)
      .call()
      .then((resp: any) => {
        console.log(resp);
        this.unLockTime = Number(resp);
        this.unLockTimeShow = true;
      });
  }

  async unstake() {
    this.stakingMethods
      .unstakeTokens(this.stakingAmount)
      .send({ from: window.web3.currentProvider.selectedAddress })
      .then(async (response: any) => {
        this.checkStakedAmount();
        await this.checkERC721Balance();
      });
  }

  async stake() {
    this.stakingMethods
      .stakeTokens(this.stakingAmount)
      .send({ from: window.web3.currentProvider.selectedAddress })
      .then(async (response: any) => {
        this.checkStakedAmount();
        await this.checkERC721Balance();
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

  // async checkAllTokenApproved() {
  //   this.allTokenApproved = await this.erc721Methods
  //     .isApprovedForAll(
  //       window.web3.currentProvider.selectedAddress,
  //       this.stakeAddress
  //     )
  //     .call();
  // }

  async checkEarning() {
    this.earning = await this.stakingMethods
      .calculateEarnings(window.web3.currentProvider.selectedAddress)
      .call();
  }

  selectMax() {
    this.stakingAmount = this.nftBalance;
  }

  changeUnStakingAmount(value: any) {
    this.unStakingAmount = Number(value.target.value);    
  }

  changeUnlockTime(unlockDate: any) {
    this.unlockTimeInput = new Date(unlockDate.target.value).getTime() / 1000;
  }

  changeInvestorAddress(address: any) {
    this.investorAddress = address.target.value;    
  }

  selectMaxUnStake() {
    this.unStakingAmount = this.stakedTokenAmount;
  }

  async checkStakedAmount() {
    this.stakedTokenAmount = await this.stakingMethods
      .stakedAmount(window.web3.currentProvider.selectedAddress)
      .call();
  }

  withdrawEarning() {
    this.stakingMethods
      .stakeTokens(this.stakingAmount)
      .send({ from: window.web3.currentProvider.selectedAddress });
  }

  ngOnInit(): void {}

}
