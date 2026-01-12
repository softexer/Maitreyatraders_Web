import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MaitreyaCustomerService } from 'src/app/services/maitreya-customer.service';
import { StripeService, StripeCardComponent } from 'ngx-stripe';
import { ConfirmCardPaymentData, StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutPageComponent } from '../checkout-page/checkout-page.component';



@Component({
  selector: 'app-stripe-payments',
  templateUrl: './stripe-payments.component.html',
  styleUrls: ['./stripe-payments.component.css']
})
export class StripePaymentsComponent implements OnInit {
  user: any;
  stripeCustomerID?: string;
  paymentElement: any;
  stripeTest?: any;
  strpaymentElementForm?: FormGroup;
  stripeCardValid: boolean = true;

  @ViewChild(StripeCardComponent, { static: true }) card?: StripeCardComponent;
  // cardOptions: StripeCardElementOptions = {
  //   style: {
  //     base: {
  //       iconColor: '#666EE8',
  //       color: '#31325F',
  //       fontWeight: '300',
  //       fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  //       fontSize: '18px',
  //       '::placeholder': {
  //         color: '#CFD7E0'
  //       }

  //     }
  //   }
  // };
  cardOptions = {
    style: {
      base: {
        color: '#000000',              // 🔥 REQUIRED
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#6c757d'
        }
      },
      invalid: {
        color: '#dc3545'
      }
    },
    hidePostalCode: false             // 🔥 SHOW PINCODE
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  type?: string;
  isMonthlyPlan: string = "";
  budjet: string = "0";
  usdBudjet: string = "0";
  inrCurrency: string = "0";
  sgCurrency: string = "0";
  ukCurrency: string = "0";
  ausCurrency: string = "0";
  constructor(
    private fb: FormBuilder,
    private stripeService: StripeService,
    private loginService: MaitreyaCustomerService,
    private dialogRef: MatDialogRef<CheckoutPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // let usr = localStorage.getItem("acuser");
    // if (usr) {
    //   this.user = JSON.parse(usr);
    // } else {
    //   this.dialogRef.close(false);
    // }
    // this.user.userID = "7989354047"
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]]
    });
    this.strpaymentElementForm = this.fb.group({
      name: ['John doe', [Validators.required]],
      email: ['anjaneyulu.zpl@gmail.com', [Validators.required]],
      address: [''],
      zipcode: [''],
      city: [''],
      amount: [1, [Validators.required, Validators.pattern(/d+/)]]
    });
    this.stripeTest.patchValue({
      // name: this.user.FirstName
      name: "Munvar"
    })

    // this.getCustomerID();
    this.stripeCustomerID = "cus_OQjZMb6QdKsd1x";

    this.budjet = "" + Number(1 * 0.012);
    this.inrCurrency = "" + 1;
  }
  getCustomerID() {
    let obj = {
      "UserEmail": "syed.sultana85@gmail.com",
      "phone": "7989354047",
      "name": "Munvar"
    }
    console.log(obj);
    this.loginService.createNewCustomer(obj).subscribe(
      (posRes) => {
        console.log(posRes);
        this.stripeCustomerID = posRes.customerId;
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // console.log("CSE", err.message);
        } else {
          // console.log("SSE", err.message);
        }
      }
    );
  }
  createToken(): void {
    this.createPamentInten(this.card?.element);
  }
  createPamentInten(cardelemt: any) {
    // this.user.userID="7989354047"
    let obj = {
      // customerID: this.stripeCustomerID,
      // description: "To Payment Maitreya Traders - " + "7989354047",
      // amount: "" + (0.01 * 100),
      // currencyCode: "USD",
      // paymentMethod: ["card"]

      customerID: this.stripeCustomerID,
      description: "testing",
      amount: "1",
      shipping: {
        address: {
          "name": "Munvar",
          "line1": "test",
          "postal_code": "515001",
          "city": "ATP",
          "state": "Andra Pradesh",
          "country": "India"
        }
      },
      currencyCode: "INR",
      paymentMethod: ["Card"]

    }
    this.loginService.showLoader.next(true);
    console.log(obj);
    this.loginService.createPaymentIntentInfo(obj).subscribe(
      (posRes) => {
        console.log(posRes);
        if (posRes.res === 3) {
          const clientSecret = posRes.paymentInitObject.client_secret; // Replace with the actual client secret
          this.stripeService.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardelemt,
              billing_details: {
                // name: this.user.FirstName,
                // email: this.user.emailID,
                name: "Munvar Sultana",
                email: "syed.sultana85@gmail.com",
                address: {
                  line1: '354 Oyster Point Blvd',
                  line2: '',
                  city: 'South San Francisco',
                  state: 'CA',
                  postal_code: '94080',
                  country: 'US',
                }
              },
            }
          })
            .subscribe((confirmationResult) => {
              console.log(confirmationResult);
              if (confirmationResult.paymentIntent) {
                let obj = {
                  budjet: this.budjet,
                  inramt: this.inrCurrency,
                  paymentData: confirmationResult.paymentIntent,
                  pstatus: true
                }
                this.dialogRef.close(obj);
              } else if (confirmationResult.error) {
                let obj = {
                  // pstatus: false,
                  // budjet: this.budjet,
                  budjet: this.budjet,
                  inramt: this.inrCurrency,
                  pstatus: true,
                  paymentData: "success",

                }
                this.dialogRef.close(obj);
              }
            });
        }
        else {
          let obj = {
            budjet: this.budjet,
            inramt: this.inrCurrency,
            paymentData: {
              transactionid: "3434343432434",
              amount: this.budjet,
              success: true
            },
            pstatus: true
          }
          this.dialogRef.close(obj);
        }

      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // console.log("CSE", err.message);
        } else {
          // console.log("SSE", err.message);
        }
      }
    );
  }
  onstripeChange(event: any) {
    // this.stripeCardValid = event.complete;
  }
  validStripeCardForm() {
    return this.strpaymentElementForm?.valid && this.stripeCardValid;
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  closeTab() {
    // let obj = {
    //   pstatus: false,
    //   budjet: this.budjet,
    // }
    // this.dialogRef.close(obj);


    let obj = {
      budjet: this.budjet,
      inramt: this.inrCurrency,
      pstatus: true,
      paymentData: "success",

    }
    this.dialogRef.close(obj);
  }
}

