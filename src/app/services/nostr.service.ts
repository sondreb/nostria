import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as nip19 from 'nostr-tools/nip19';

export interface NostrUser {
  pubkey: string;
  privkey?: string;
  name?: string;
  source: 'generated' | 'extension' | 'nsec' | 'preview';
}

@Injectable({
  providedIn: 'root'
})
export class NostrService {
  #bootStrapRelays = ['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nos.lol'];
  private readonly USER_STORAGE_KEY = 'nostria-user';
  private user = signal<NostrUser | null>(null);
  isLoggedIn = computed(() => !!this.user());
  currentUser = computed(() => this.user());

  constructor() {
    this.loadUserFromStorage();

    // Save user to localStorage whenever it changes
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(currentUser));
      }
    });
  }

  get bootStrapRelays() {
    return this.#bootStrapRelays;
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson) {
      try {
        this.user.set(JSON.parse(userJson));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  generateNewKey(): void {
    // Generate a proper Nostr key pair using nostr-tools
    const secretKey = generateSecretKey(); // Returns a Uint8Array
    const pubkey = getPublicKey(secretKey); // Converts to hex string

    // We'll store the hex string representation of the private key
    // In a real app, you might want to encrypt this before storing
    const privkeyHex = bytesToHex(secretKey);

    this.user.set({
      pubkey,
      privkey: privkeyHex,
      source: 'generated'
    });
  }

  async loginWithExtension(): Promise<void> {
    try {
      // Check if NIP-07 extension is available
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.');
      }

      // Get the public key from the extension
      const pubkey = await window.nostr.getPublicKey();

      if (!pubkey) {
        throw new Error('Failed to get public key from extension');
      }

      // Get user metadata if available
      let name: string | undefined = undefined;
      try {
        // Some extensions may provide user metadata like name
        const userInfo = await window.nostr.getUserMetadata();
        name = userInfo?.name;
      } catch (error) {
        // Ignore errors for metadata, it's optional
        console.warn('Could not get user metadata from extension', error);
      }

      // Set the user with the public key from the extension
      this.user.set({
        pubkey,
        name,
        source: 'extension'
      });

      return;
    } catch (error) {
      console.error('Error connecting to Nostr extension:', error);
      throw error; // Re-throw to handle in the UI
    }
  }

  loginWithNsec(nsec: string): void {
    try {
      // Validate and decode the nsec
      if (!nsec.startsWith('nsec')) {
        throw new Error('Invalid nsec format. Must start with "nsec"');
      }

      // Decode the nsec to get the private key bytes
      const { type, data } = nip19.decode(nsec);
      
      if (type !== 'nsec') {
        throw new Error(`Expected nsec but got ${type}`);
      }
      
      // Convert the private key bytes to hex string
      const privkeyHex = bytesToHex(data);
      
      // Generate the public key from the private key
      const pubkey = getPublicKey(data);
      
      // Store the user info
      this.user.set({
        pubkey,
        privkey: privkeyHex,
        source: 'nsec'
      });
    } catch (error) {
      console.error('Error decoding nsec:', error);
      throw new Error('Invalid nsec key provided. Please check and try again.');
    }
  }

  usePreviewAccount(): void {
    // jack
    const previewPubkey = '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2';
    this.user.set({
      pubkey: previewPubkey,
      name: 'Preview User',
      source: 'preview'
    });
  }

  logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.user.set(null);
  }

  getNsecFromPrivkey(privkey: string): string {
    // Convert the hex private key to a Nostr secret key (nsec)
    const bytes = hexToBytes(privkey);
    const nsec = nip19.nsecEncode(bytes);
    return nsec;
  }

  getNpubFromPubkey(pubkey: string): string {
    // Convert the hex public key to a Nostr public key (npub)
    const npub = nip19.npubEncode(pubkey);
    return npub;
  }
}
