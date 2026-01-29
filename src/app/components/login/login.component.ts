import { Component, Inject, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router";

import { PushMessagingService } from "src/app/services/push-messaging.service";
// import { v4 as uuidv4 } from 'uuid';
import { MaitreyaCustomerService } from "src/app/services/maitreya-customer.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { CheckoutPageComponent } from "../checkout-page/checkout-page.component";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  isLoading = false
  errorMessage = ""
  deviceID: any;
  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private AdminService: MaitreyaCustomerService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CheckoutPageComponent>,
    private http: HttpClient,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.initializeForm()
  }

  /**
   * Initialize the login form with validation rules
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required,  Validators.email]],
    })
    if (this.data.em != '') {
      this.loginForm.patchValue({ username: this.data.ems })
    }

  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    const { username } = this.loginForm.value

    this.performLogin(username)
  }

  private performLogin(username: string): void {


    // Simulate API delay
    setTimeout(() => {
      if (this.loginForm.valid) {
        this.isLoading = true;
        let obj = {
          userID: this.loginForm.get('username')?.value,
        }

        console.log(obj)
        this.AdminService.UserLogin(obj).subscribe((posRes: any) => {
          console.log(posRes)
          if (posRes.response == 3) {
            const uid = posRes.CustomerData.userID;
            // this.AdminService.setUserId(uid);
            this.dialogRef.close(true)
          } else {
            this.openSnackBar(posRes.message, "")
          }
          this.isLoading = false;
        }, (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.openSnackBar(err.message, "")
          if (err.error instanceof Error) {
            console.warn("Client Error", err.error)
          } else {
            console.warn("Server Error", err.error)
          }
        })
      } else {
        this.openSnackBar("Enter Valid User ID/Password", "")
      }
    }, 1500)
  }
  openSnackBar(message: string, action: string) {
    // this.snackBar.open(this.translateService.instant(message.trim()), action, {
    //   duration: 3000,
    //   panelClass: "red-snackbar",
    // });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      control?.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  get username() {
    return this.loginForm.get("username")
  }

  get password() {
    return this.loginForm.get("password")
  }

  closeLogin(){
  this.dialogRef.close(false);
  }
}

