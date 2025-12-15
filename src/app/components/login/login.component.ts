import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { SVITCustomerService } from "src/app/services/Maitreya-Customer.service"
import { MatSnackBar } from "@angular/material/snack-bar"
import { HttpErrorResponse } from "@angular/common/http"

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = ""
  password = ""
  showPassword = false
  constructor(private router: Router, private Customerservice: SVITCustomerService,
    private snackBar: MatSnackBar,) { }


 
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  submitlogin(form: any) {
    if (form.valid) {
      let obj = {
        userID: this.username,
        password: this.password,
      };

      console.log("Login attempt:", obj);
      this.Customerservice.showLoader.next(true);
      this.Customerservice.login(obj).subscribe(
        (posRes: any) => {
          console.log(posRes);
          this.Customerservice.showLoader.next(false);
          if (posRes.response == 3) {
            this.openSnackBar(posRes.message, "");
            localStorage.setItem('token', posRes.token);
            localStorage.setItem('svituser', JSON.stringify(posRes.data));
             this.router.navigateByUrl('/dashboard');
          } else {
            this.openSnackBar(posRes.message, "");
            this.router.navigateByUrl('/login');
          }
        },
        (err: HttpErrorResponse) => {
          this.openSnackBar(err.message, "");
          this.Customerservice.showLoader.next(false);
        }
      );
    } else {
      this.openSnackBar("Please enter valid phone number and password", "");
    }
  }

  onRegister(): void {
    console.log("Navigating to register page")
    this.router.navigateByUrl('/register');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  numericOnly(event: any) {
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
  }
}
