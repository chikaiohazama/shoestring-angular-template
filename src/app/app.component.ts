import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import * as firebase from 'firebase/app';

import { environment } from '../environments/environment';
import { build } from '../environments/build';
import { Profile, ProfileService } from './profile.service';

// declare ga as a function to set and sent the events
// tslint:disable-next-line: no-any
declare let ga: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-template';
  // tslint:disable-next-line: no-any
  build: any;
  progressBar = false;
  user: firebase.User | null = null;
  offlineSnackbarRef: MatSnackBarRef<TextOnlySnackBar> | undefined;

  showOfflineSnackbar(): void {
    this.offlineSnackbarRef = this.snackBar.open(
      'You appear to be offline. We will try to reconnect when we detect an internet connection.',
      'DISMISS',
      {
        duration: 24 * 60 * 60 * 1000,
        verticalPosition: 'bottom',
        panelClass: ['warning-snackbar']
      }
    );
  }

  @HostListener('window:offline', ['$event'])
  onOffline(event: Event): void {
    this.showOfflineSnackbar();
  }

  @HostListener('window:online', ['$event'])
  onOnline(event: Event): void {
    if (this.offlineSnackbarRef) {
      this.offlineSnackbarRef.dismiss();
    }
  }

  @HostListener('window:focus', ['$event'])
  onFocus(event: FocusEvent): void {
    // tslint:disable-next-line: no-any
    this.httpClient.get('assets/version.json').subscribe((httpResponse: any) => {
      const serverVersion = httpResponse.version;
      const clientVersion = sessionStorage.getItem('version');
      if (clientVersion !== serverVersion) {
        const snackBarRef = this.snackBar.open('A new version is available.', 'UPDATE', {
          duration: 600000,
          verticalPosition: 'top'
        });
        snackBarRef.onAction().subscribe(() => {
          window.location.reload();
        });
      }
    });
  }

  constructor(
    public afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router,
    public profile: ProfileService,
    private httpClient: HttpClient,
  ) {
    this.build = build;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (ga && environment.ga) {
          if (event.urlAfterRedirects === '/') {
            ga('set', 'page', `/`);
          } else {
            ga('set', 'page', `/${event.urlAfterRedirects}`);
          }
          ga('send', 'pageview');
        }
      }
    });
  }

  ngOnInit(): void {
    if (!navigator.onLine) {
      this.showOfflineSnackbar();
    }

    // tslint:disable-next-line: no-any
    this.httpClient.get('assets/version.json').subscribe((httpResponse: any) => {
      sessionStorage.setItem('version', httpResponse.version);
    });

    this.afAuth.user.subscribe(user => {
      this.user = user;
    });
  }

  signin(): void {
    this.progressBar = true;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(async (result) => {
      const profile: Profile = {
        email: result.user?.email ?? '',
        displayName: result.user?.displayName ?? '',
        photoURL: result.user?.photoURL ?? '',
      };
      this.user = result.user;
      if (this.user?.uid) {
        await this.profile.setProfile(profile);
        this.progressBar = false;
      } else {
        this.progressBar = false;
        this.snackBar.open('Hmmm, something went wrong with signing in.', '', {
          duration: 3000,
        });
      }
    }).catch((error) => {
      this.progressBar = false;
      this.snackBar.open('Sorry, there was a problem signing in.', '', {
        duration: 3000,
      });
    });
  }

  signout(): void {
    this.afAuth.signOut();
    this.user = null;
    this.snackBar.open('You have beed signed out.', '', {
      duration: 7000,
    });
    this.router.navigate(['/']);
  }

  buildInfo(): string {
    const buildDate = new Date(this.build.time);
    return `${buildDate.toLocaleString()} ${this.build.version.split('-')[0]}`;
  }
}
