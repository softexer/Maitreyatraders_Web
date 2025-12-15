// import { AbstractControl, ValidationErrors } from '@angular/forms';

// const isEmailValid = (email: string): boolean => {
//     const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(email);
// };

// export function customEmailValidator(control: AbstractControl): ValidationErrors | null {
//     const email = control.value;
//     if (email && !isEmailValid(email)) {
//         return { invalidEmail: true }; // Return error object
//     }
//     return null; // Return null if valid
// }
// const isMobileValid = (mobile: string): boolean => {
//     const expr = /^[6-9]\d{9}$/gi; // Indian mobile number format (starts with 6-9 and has 10 digits)
//     return expr.test(mobile);
// };

// export function customMobileValidator(control: AbstractControl): ValidationErrors | null {
//     const mobile = control.value;
//     if (mobile && !isMobileValid(mobile)) {
//         return { invalidMobile: true }; // Return an error object if invalid
//     }
//     return null; // Return null if valid
// }


import { AbstractControl, ValidationErrors } from '@angular/forms';

// Function to validate email
const isEmailValid = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
};

// Function to validate mobile number
const isMobileValid = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/gi; // Mobile should start with 6-9 and be 10 digits
    return mobileRegex.test(mobile);
};

// Function to validate mobile number
const isWhatsupValid = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/gi; // Mobile should start with 6-9 and be 10 digits
    return mobileRegex.test(mobile);
};

// **Reusable Validator Function**
export function customValidator(type: 'email' | 'mobile' | 'whatsapp') {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (!value) return null; // If value is empty, don't validate

        if (type === 'email' && !isEmailValid(value)) {
            return { invalidEmail: true }; // Email validation error
        }

        if (type === 'mobile' && !isMobileValid(value)) {
            return { invalidMobile: true }; // Mobile validation error
        }
        if (type === 'whatsapp' && !isWhatsupValid(value)) {
            return { invalidWhatsup: true }; // Mobile validation error
        }

        return null; // Return null if valid
    };
}
