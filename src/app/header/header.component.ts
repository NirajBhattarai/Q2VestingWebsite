import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { AccountInfoComponent } from '../modal/account-info/account-info.component';
import { BlockchainService } from '../service/blockchain.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public isCollapsed = true;

  public isConnected:boolean = false;
  public walletAddress:string = "";
  public currentNetwork:string="";
  public networks:any = {
    "0x1": "Ethereum",
    "0x3": "Ropsten",
    "0x4": "Rinkeby",
    "0x5": "Goerli",
    "0x2a": "Kovan"
  };

  constructor(private modalService: NgbModal, private blockchainService: BlockchainService) {
  }

   
  ngOnInit(): void {
    this.blockchainService.getWalletAddress().subscribe(res=>this.walletAddress = res); 
    this.blockchainService.getIsConnected().subscribe(res=>this.isConnected = res);    
    this.blockchainService.getCurrentNetwork().subscribe((res:any)=>this.currentNetwork = this.networks[res]);
  }


  open() {
    const modalRef = this.modalService.open(AccountInfoComponent,{centered:true,animation:false});    
    modalRef.componentInstance.walletAddress=this.walletAddress;
  }
  
}
