import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// import { AngularFireModule } from '@angular/fire/compat';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
// import { AngularFireAuthModule } from '@angular/fire/compat/auth';
// import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
// import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// import { AngularFireStorageModule, BUCKET } from '@angular/fire/compat/storage';
import { PushMessagingService } from './services/push-messaging.service';


// NEW AngularFire v18 imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { VerificationComponent } from './components/verification/verification.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { GetnumberComponent } from './components/getnumber/getnumber.component';
import { TestPageComponent } from './components/test-page/test-page.component';



import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    RegisterPageComponent,
    VerificationComponent,
    StatisticsComponent,
    GetnumberComponent,
    TestPageComponent,
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging())

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }