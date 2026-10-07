import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page-view animate-fade-in">
      <div class="page-header">
        <div>
          <div class="text-muted" style="font-size:12px; margin-bottom: 8px;">
            {{ 'SETTINGS.BREADCRUMB_DASHBOARD' | translate }}<span style="color:var(--color-gray-900); font-weight:600;">{{ 'SETTINGS.BREADCRUMB_SETTINGS' | translate }}</span>
          </div>
          <h1 class="page-title">{{ 'SETTINGS.TITLE' | translate }}</h1>
        </div>
      </div>
      
      <div class="tabs-container">
        <div class="tabs">
          <button class="tab-btn active">{{ 'SETTINGS.TAB_PROFILE' | translate }}</button>
          <button class="tab-btn text-muted">{{ 'SETTINGS.TAB_BILLING' | translate }}</button>
        </div>
        <div class="tab-divider"></div>
      </div>

      <div class="card p-6">
        <h2 class="card-title mb-6">{{ 'SETTINGS.SECTION_PERSONAL' | translate }}</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">person</span> {{ 'SETTINGS.LBL_NAME' | translate }} <span class="text-danger">*</span></label>
            <input type="text" class="form-control" value="Distrib. José">
          </div>
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">person</span> {{ 'SETTINGS.LBL_LAST_NAME' | translate }}</label>
            <input type="text" class="form-control" value="Vegetables">
          </div>
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">call</span> {{ 'SETTINGS.LBL_PHONE' | translate }} <span class="text-danger">*</span></label>
            <input type="text" class="form-control" value="+51 999 888 777">
          </div>
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">mail</span> {{ 'SETTINGS.LBL_EMAIL' | translate }} <span class="text-danger">*</span></label>
            <input type="text" class="form-control" value="alex.morgan@refrio.com">
          </div>
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">domain</span> {{ 'SETTINGS.LBL_DEPARTMENT' | translate }}</label>
            <input type="text" class="form-control" value="Lima">
          </div>
          <div class="form-group">
            <label><span class="material-symbols-outlined icon-label">language</span> {{ 'SETTINGS.LBL_TIMEZONE' | translate }}</label>
            <input type="text" class="form-control" value="GMT-5 (Lima)">
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-cancel">{{ 'SETTINGS.CANCEL' | translate }}</button>
          <button class="btn-submit">{{ 'SETTINGS.SAVE_PROFILE' | translate }}</button>
        </div>
      </div>
    </div>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  `,
  styles: [`
    .page-view { display: flex; flex-direction: column; gap: var(--space-6); }
    .page-header { display: flex; align-items: flex-start; }
    .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-gray-900); }
    
    .tabs-container { margin-bottom: -16px; }
    .tabs { display: flex; gap: var(--space-6); padding: 0 var(--space-4); }
    .tab-btn { background: none; border: none; font-size: var(--font-size-sm); font-weight: 600; cursor: pointer; padding: var(--space-3) 0; position: relative; }
    .tab-btn.active { color: var(--color-primary); }
    .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--color-primary); }
    .tab-divider { height: 1px; background: var(--color-gray-300); margin-top: -1px; }

    .card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--color-gray-200); }
    .p-6 { padding: var(--space-6); }
    .mb-6 { margin-bottom: var(--space-6); }
    .card-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-gray-900); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-8); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { display: flex; align-items: center; gap: 6px; font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-700); }
    .icon-label { font-size: 16px; color: var(--color-gray-500); }
    .text-danger { color: var(--color-danger); }
    
    .form-control { padding: 12px 16px; border: 1px solid var(--color-gray-300); border-radius: var(--radius); font-size: var(--font-size-sm); color: var(--color-gray-900); font-family: inherit; }
    .form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); }
    
    .form-actions { display: flex; gap: var(--space-4); }
    .btn-cancel { padding: 10px 24px; background: white; border: 1px solid var(--color-gray-300); border-radius: var(--radius); font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-700); cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { background: var(--color-gray-50); }
    .btn-submit { padding: 10px 24px; background: var(--color-primary-dark); border: none; border-radius: var(--radius); font-size: var(--font-size-sm); font-weight: 600; color: white; cursor: pointer; transition: all 0.2s; }
    .btn-submit:hover { background: #1e3a8a; }
  `],
})
export class SettingsComponent {}
