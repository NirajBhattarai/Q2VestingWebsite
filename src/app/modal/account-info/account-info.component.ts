import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BlockchainService } from 'src/app/service/blockchain.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit {
  @Input() public walletAddress: any;

  constructor(
    public activeModal: NgbActiveModal,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {}

  copyAddress() {
    this.clipboard.copy(this.walletAddress);
  }
}
