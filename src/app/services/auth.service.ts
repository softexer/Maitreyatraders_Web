import { Injectable } from '@angular/core';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  recaptchaVerifier!: RecaptchaVerifier;
  verificationId!: string;

  constructor(private auth: Auth) {}

  setupReCaptcha(containerId: string) {
    // this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
    //   size: "invisible"
    // });
    console.log(containerId)
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
        size: "invisible"
      });
      this.recaptchaVerifier.render(); // optional but good to trigger setup
    }
  }

  sendOtp(phoneNumber: string) {
    return signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.verificationId = confirmationResult.verificationId;
        return { success: true, message: "OTP sent successfully", verificationId: this.verificationId };
      })
      .catch(error => {
        return { success: false, message: "Failed to send OTP", error };
      });
  }

  verifyOtp(code: string) {
    if (!this.verificationId) {
      return Promise.resolve({ success: false, message: "No verificationId found. Send OTP first." });
    }
  
    const credential = PhoneAuthProvider.credential(this.verificationId, code);
  
    return signInWithCredential(this.auth, credential)
      .then((userCredential) => {
        return { success: true, message: "OTP verified successfully", user: userCredential.user };
      })
      .catch(error => {
        return { success: false, message: "Failed to verify OTP", error };
      });
  }
}
