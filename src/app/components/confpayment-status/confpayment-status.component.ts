import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CheckoutPageComponent } from '../checkout-page/checkout-page.component';


@Component({
  selector: 'app-confpayment-status',
  templateUrl: './confpayment-status.component.html',
  styleUrls: ['./confpayment-status.component.css']
})
export class ConfpaymentStatusComponent implements OnInit {
  isSucess: boolean = true;
  imgPath: string = "";
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CheckoutPageComponent>
  ) { }
  ngOnInit(): void {
    if (this.data.isSuccess) {    
      this.isSucess = true;
      setTimeout(() => {
        this.closeTab()
      }, 3000)
    } else {    
      this.isSucess = true;
      setTimeout(() => {
        this.closeTab()
      }, 3000)
    }
  }
  closeTab() {
    let obj = {
      retry: false
    }
    this.dialogRef.close(obj)
  }
  retryPayment() {
    let obj = {
      retry: true
    }
    this.dialogRef.close(obj);
  }
}
