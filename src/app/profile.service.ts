import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

export interface Profile {
  email: string;
  displayName: string;
  photoURL: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService implements OnDestroy {
  profile: Profile | undefined;
  profileRef: Subscription | undefined;

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private snackBar: MatSnackBar,
  ) {
    this.afAuth.user.subscribe(user => {
      if (user) {
        if (this.profileRef) {
          this.profileRef.unsubscribe();
        }
        this.profileRef = this.afs.doc<Profile>(`users/${user.uid}`).valueChanges().subscribe(
          profile => {
            if (profile) {
              this.profile = profile;
            }
          }
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.profileRef) {
      this.profileRef.unsubscribe();
    }
  }

  setProfile(profile: Profile): Promise<void> {
    return this.afAuth.currentUser.then(async user => {
      if (user) {
        await this.afs.collection('users').doc(user.uid).set(profile, { merge: true }).then(() => {
          this.profile = profile;
        })
          .catch((error) => {
            this.snackBar.open('Hmmm, there was a problem accessing your account.', '', {
              duration: 3000,
            });
          });
      }
    });
  }

  getProfile(): Profile | undefined {
    return this.profile;
  }
}
