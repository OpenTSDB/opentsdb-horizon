import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor() { }

    getLocal(key: string) {
        return localStorage.getItem(key);
    }

    setLocal(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    clearAll() {
        localStorage.clear();
    }

    getKeys(): string[] {
        return Object.keys(localStorage);
    }

    hasKey(key: string): boolean {
        const keys = this.getKeys();
        return keys.includes(key);
    }
}
