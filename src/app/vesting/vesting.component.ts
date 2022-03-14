import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../service/blockchain.service';
declare var $: any;

@Component({
  selector: 'app-vesting',
  templateUrl: './vesting.component.html',
  styleUrls: ['./vesting.component.scss'],
})
export class VestingComponent implements OnInit {
  public timeLeft: any = { days: '', hours: '', minutes: '', seconds: '' };
  public isConnected = false;
  public walletAddress = '';
  public unLockAmount: any;
  public unLockAmountShow: boolean = false;

  public unLockTime: any;
  public unLockTimeShow: boolean = false;

  constructor(private blockchainService: BlockchainService) {}

  async connectToMetaMask() {
    this.blockchainService.connectToMetaMask();
  }

  async disconnect() {
    this.blockchainService.disconnect();
  }

  unLockQ2() {
    this.blockchainService.unLockQ2();
  }

  ngOnInit(): void {
    setInterval(() => {
      this.makeTimer();
    }, 1000);
    this.blockchainService.getIsConnected().subscribe(res=>this.isConnected=res);
    this.blockchainService.getWalletAddress().subscribe(res=>this.walletAddress = res); 
    this.blockchainService.getUnlockAmount().subscribe(res=>this.unLockAmount=res);
    this.blockchainService.getUnlockAmountShown().subscribe(res=>this.unLockAmountShow=res);
    this.blockchainService.getUnlockTime().subscribe(res=>this.unLockTime=res);
    this.blockchainService.getUnlockTimeShown().subscribe(res=>this.unLockTimeShow=res);
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
