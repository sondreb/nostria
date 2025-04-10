import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RelaysComponent } from './pages/relays/relays.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AboutComponent } from './pages/about/about.component';
import { CredentialsComponent } from './pages/credentials/credentials.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileNotesComponent } from './pages/profile/profile-notes/profile-notes.component';
import { ProfileRepliesComponent } from './pages/profile/profile-replies/profile-replies.component';
import { ProfileReadsComponent } from './pages/profile/profile-reads/profile-reads.component';
import { ProfileMediaComponent } from './pages/profile/profile-media/profile-media.component';
import { ProfileAboutComponent } from './pages/profile/profile-about/profile-about.component';
import { ProfileConnectionsComponent } from './pages/profile/profile-connections/profile-connections.component';
import { FollowingComponent } from './pages/profile/following/following.component';
import { ProfileHomeComponent } from './pages/profile/profile-home/profile-home.component';
import { LearnComponent } from './pages/learn/learn.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'learn', component: LearnComponent },
  { path: 'relays', component: RelaysComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'credentials', component: CredentialsComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'p/:id',
    component: ProfileComponent,
    children: [
      // { path: '', redirectTo: 'notes', pathMatch: 'full' },
      { path: '', component: ProfileHomeComponent, pathMatch: 'full' },
      { path: 'replies', component: ProfileRepliesComponent },
      { path: 'reads', component: ProfileReadsComponent },
      { path: 'media', component: ProfileMediaComponent },
      { path: 'about', component: ProfileAboutComponent },
      { path: 'connections', component: ProfileConnectionsComponent },
      { path: 'following', component: FollowingComponent }

    ]
  },
  { path: 'profile', redirectTo: '/credentials' },
  { path: '**', redirectTo: '/home' }
];
