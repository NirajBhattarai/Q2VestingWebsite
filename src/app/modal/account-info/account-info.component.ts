import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
  @Input() public walletAddress:any;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    console.log("Add",this.walletAddress);
    
  }

}