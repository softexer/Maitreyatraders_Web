import { Component } from '@angular/core';
import { Inject, OnInit } from '@angular/core';
import { FormBuilder,Validators  } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterPageComponent } from '../register-page/register-page.component';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  isDarkMode: boolean = false;
  dataInfo: any;
  OTPForm: any;
  isverified: boolean = false;

  constructor(
    // private AdminService: AieonkiAdminService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RegisterPageComponent>,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {

  }
  ngOnInit(): void {
    this.dataInfo = this.data;
    console.log(this.data)
    this.OTPForm = this.fb.group({
      otp: [
        '', 
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(6),
          Validators.maxLength(6)
        ]
      ]
    });
  

  }
  close() {
    let obj = {
      isverify: false
    }
    this.dialogRef.close(obj)
  }
  submitOTP() {
    let payLoad = this.OTPForm.value.otp;
    console.log("otpvalue", this.OTPForm.value.otp);
    let token = localStorage.getItem("token");
    if (payLoad && payLoad.trim() !== "") {
      let obj = {
        isverify: true,
       
      }
      this.dialogRef.close(obj)
    } else {
      this.isverified = false;
    }


  }
  cancel() {
    this.dialogRef.close();
  }
  get otpControl() {
    return this.OTPForm.get('otp')!;
  }

  noEvent() {
    let obj = {
      isverify: false,
      pdata: this.dataInfo
    }
    this.dialogRef.close(obj)
  }
  yesEvent() {
    let obj = {
      isverify: true,
      pdata: this.dataInfo
    }
    this.dialogRef.close(obj)
  }
  okcall() {
    let obj = {
      isverify: true
    }
    this.dialogRef.close(obj)
  }
  numericOnly(event: KeyboardEvent) {
    const pattern = /^[0-9]*$/;
    if (!pattern.test(event.key)) {
      event.preventDefault(); // Prevent input if it's not a number
    }
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
}
