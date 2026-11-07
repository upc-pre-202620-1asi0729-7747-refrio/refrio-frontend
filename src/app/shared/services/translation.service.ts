import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  currentLang = signal<'en' | 'es'>('es');
  translationsLoaded = signal(0);

  private translations: any = {
    en: {},
    es: {},
  };

  constructor() {
    this.loadLang('en');
    this.loadLang('es');
  }

  async loadLang(lang: string) {
    try {
      // Resolve assets against Angular's <base href>. Absolute `/i18n/...`
      // requests break when the application is hosted below a repository path
      // such as GitHub Pages `/refrio-frontend/`.
      const url = new URL(`i18n/${lang}.json`, document.baseURI);
      const res = await fetch(url);
      if (res.ok) {
        this.translations[lang] = await res.json();
        this.translationsLoaded.update((v) => v + 1);
      }
    } catch (e) {}
  }

  translate(key: string, params: readonly unknown[] = []): string {
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
    const message = data.OPERATION_MESSAGES?.[key] ?? result ?? key;
    return typeof message === 'string'
      ? message.replace(/\{(\d+)\}/g, (match, index) =>
          Number(index) < params.length ? String(params[Number(index)] ?? '') : match,
        )
      : key;
  }

  toggleLanguage() {
    this.currentLang.set(this.currentLang() === 'en' ? 'es' : 'en');
  }
}
