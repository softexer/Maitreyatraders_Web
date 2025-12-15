import { Component } from '@angular/core';
import { Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatisticsComponent } from '../statistics/statistics.component';

@Component({
  selector: 'app-getnumber',
  templateUrl: './getnumber.component.html',
  styleUrls: ['./getnumber.component.css']
})
export class GetnumberComponent implements OnInit {
  isDarkMode: boolean = false;
  dataInfo: any;
  OTPForm: any;
  isverified: boolean = false;
  headerTitle: string = "";
  isOpen: boolean = true
  inputValue = ""
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<StatisticsComponent>,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {

  }

  ngOnInit(): void {
    this.dataInfo = this.data;
    this.headerTitle = this.dataInfo.title
    console.log(this.data)


  }

  cancel(): void {
    this.inputValue = ""
    // this.onCancel.emit()
    this.dialogRef.close()
  }


  okcall() {
    let obj = {
      number: this.inputValue.trim(),
      istrue: false
    }
    this.dialogRef.close(obj)
  }
  ok(): void {
    if (this.inputValue.trim()) {
      let payload = {
        number: this.inputValue.trim(),
        istrue: true
      }
      this.dialogRef.close(payload)
      // this.router.navigateByUrl('/exam');
      this.inputValue = ""
    } else {
      alert("Please enter a valid number")
    }
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
