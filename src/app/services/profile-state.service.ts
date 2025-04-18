import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileStateService {
  // Signal to store the current profile's following list
  followingList = signal<string[]>([]);
  
  // Current profile pubkey
  currentProfilePubkey = signal<string>('');
  
  constructor() { }
  
  setFollowingList(list: string[]): void {
    this.followingList.set(list);
  }
  
  setCurrentProfilePubkey(pubkey: string): void {
    this.currentProfilePubkey.set(pubkey);
  }
}