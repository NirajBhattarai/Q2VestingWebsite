import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { BlockchainService } from '../service/blockchain.service';
declare var $: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
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
  public vestingMethods: any;

  public investorAddress: any;
  public unlockTimeInput: any;
  public unlockTokenAmount: any;
  public invAddressTouched: boolean = false;

  constructor(private blockchainService: BlockchainService) {}

  async connectToMetaMask() {
    this.blockchainService.connectToMetaMask();
  }

  async addInvestor() {
    this.blockchainService.addInvestor(
      this.investorAddress,
      this.unlockTimeInput,
      this.unlockTokenAmount
    );
  }

  changeUnlockTime(event: any) {
    this.unlockTimeInput =
      Math.trunc(Date.now() / 1000) + Number(event.target.value) * 86400;
  }

  changeInvestorAddress(event: any) {
    this.invAddressTouched = true;
    this.investorAddress = event.target.value;
  }

  changeTokenAmount(event: any) {
    this.unlockTokenAmount = event.target.value;
  }

  isInvestorAddressValid() {
    return Web3.utils.isAddress(this.investorAddress);
  }

  ngOnInit(): void {
    this.blockchainService
      .getIsConnected()
      .subscribe((res) => (this.isConnected = res));
    this.blockchainService
      .getWalletAddress()
      .subscribe((res) => (this.walletAddress = res));
  }
}
