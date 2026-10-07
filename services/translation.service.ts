import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  currentLang = signal<'en' | 'es'>('en');
  translationsLoaded = signal(0);

  private translations: any = {
    en: {},
    es: {}
  };

  constructor() {
    this.loadLang('en');
    this.loadLang('es');
  }

  async loadLang(lang: string) {
    try {
      const res = await fetch(`/i18n/${lang}.json?v=${new Date().getTime()}`);
      if (res.ok) {
        this.translations[lang] = await res.json();
        this.translationsLoaded.update(v => v + 1);
      }
    } catch (e) {}
  }

  translate(key: string): string {
    this.translationsLoaded();
    const lang = this.currentLang();
    const data = this.translations[lang];
    if (!data || Object.keys(data).length === 0) return key;

    const keys = key.split('.');
    let result = data;
    for (const k of keys) {
      if (result) {
        result = result[k];
      }
    }
    return result || key;
  }

  toggleLanguage() {
    this.currentLang.set(this.currentLang() === 'en' ? 'es' : 'en');
  }
}
