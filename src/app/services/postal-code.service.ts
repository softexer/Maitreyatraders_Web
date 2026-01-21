// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class PostalCodeService {
//   private API = 'https://api.postcodes.io/postcodes';

//   constructor(private http: HttpClient) { }

//   searchPostcodes(query: string): Observable<any> {
//     return this.http.get(`${this.API}?q=${query}`);
//   }

//   getPostcodeDetails(postcode: string): Observable<any> {
//     return this.http.get(`${this.API}/${postcode}`);
//   }
// }
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class PostalCodeService {

//   private POSTCODE_API = 'https://api.postcodes.io/postcodes';
//   private PLACES_API = 'https://api.postcodes.io/places';

//   constructor(private http: HttpClient) {}

//   /* 🔍 Search UK postcodes (autocomplete) */
//   searchPostcodes(query: string): Observable<any> {
//     return this.http.get(`${this.POSTCODE_API}?q=${query}`);
//   }

//   /* 📍 Get postcode details */
//   getPostcodeDetails(postcode: string): Observable<any> {
//     return this.http.get(`${this.POSTCODE_API}/${postcode}`);
//   }

//   /* 🏙 Find place by name (Ilkley, Burley, etc.) */
//   findPlace(query: string): Observable<any> {
//     return this.http.get(`${this.PLACES_API}?q=${query}`);
//   }

//   /* 📌 Get places near a postcode */
//   getPlacesByPostcode(postcode: string): Observable<any> {
//     return this.http.get(
//       `${this.POSTCODE_API}/${postcode}/places`
//     );
//   }

//   /* 🌍 Get places near coordinates */
//   getPlacesByCoordinates(lat: number, lng: number): Observable<any> {
//     return this.http.get(
//       `${this.PLACES_API}?latitude=${lat}&longitude=${lng}`
//     );
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostalCodeService {

  private POSTCODE_API = 'https://api.postcodes.io/postcodes';
  private PLACES_API = 'https://api.postcodes.io/places';

  constructor(private http: HttpClient) {}

  searchPostcodes(query: string): Observable<any> {
    return this.http.get(`${this.POSTCODE_API}?q=${query}`);
  }

  getPostcodeDetails(postcode: string): Observable<any> {
    return this.http.get(`${this.POSTCODE_API}/${postcode}`);
  }

  findPlace(query: string): Observable<any> {
    return this.http.get(`${this.PLACES_API}?q=${query}`);
  }

  getPlacesByPostcode(postcode: string): Observable<any> {
    return this.http.get(`${this.POSTCODE_API}/${postcode}/places`);
  }

  getPlacesByCoordinates(lat: number, lng: number): Observable<any> {
    return this.http.get(
      `${this.PLACES_API}?latitude=${lat}&longitude=${lng}`
    );
  }
}
