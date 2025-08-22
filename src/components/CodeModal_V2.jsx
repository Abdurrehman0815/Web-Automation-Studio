// CodeModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download, Play, Code, Terminal, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkflowStore } from '../store/workflowStore';

const CodeModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('puppeteer');
  const { workflow } = useWorkflowStore();

  // ---------- Generators ----------
  const generateCode = (type) => {
    switch (type) {
      case 'puppeteer':
        return generatePuppeteerCode();
      case 'selenium':
        return generateSeleniumCode();
      case 'playwright':
        return generatePlaywrightCode();
      default:
        return '';
    }
  };

  // ---------- Shared helpers (templates) ----------
  const jsDateHelper = `
function formatDate(fmt, baseDate = new Date()) {
  const pad = (n) => String(n).padStart(2,'0');
  const map = {
    YYYY: baseDate.getFullYear(),
    MM: pad(baseDate.getMonth()+1),
    DD: pad(baseDate.getDate()),
    hh: pad(baseDate.getHours()),
    mm: pad(baseDate.getMinutes()),
    ss: pad(baseDate.getSeconds())
  };
  return fmt.replace(/YYYY|MM|DD|hh|mm|ss/g, (m) => map[m]);
}
function resolveTemplate(str, vars = {}) {
  if (!str) return '';
  // {var:name}
  str = str.replace(/\\{var:([^}]+)\\}/g, (_, k) => (vars[k] ?? ''));
  // {date:YYYY-MM-DD} or {date}
  str = str.replace(/\\{date(?::([^}]+))?\\}/g, (_, f) => f ? formatDate(f) : new Date().toISOString().slice(0,10));
  // {timestamp}
  str = str.replace(/\\{timestamp\\}/g, () => String(Date.now()));
  return str;
}
`;

  // ============ PUPPETEER ============
  const generatePuppeteerCode = () => {
    const stepBlocks = workflow.map((step, i) => `      // Step ${i + 1}: ${step.name}
      ${generatePuppeteerStepCode(step)}`).join('\n\n');

    return `const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// 🚀 Auto-generated Web Automation Script (Puppeteer)
// Generated on: ${new Date().toISOString()}
// Total Steps: ${workflow.length}

${jsDateHelper}

class AutomationRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.downloadPath = path.resolve('./downloads');
    this.vars = {}; // variable store for variable-set/get, extractors, api-call etc.
  }

  async initialize() {
    console.log('🚀 Starting automation...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setDefaultTimeout(30000);

    // Enable downloads
    try {
      const client = await this.page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: this.downloadPath
      });
    } catch (e) {
      console.warn('Download behavior setup failed (non-Chromium builds may ignore):', e.message);
    }
  }

  // ---- helpers ----
  async q$(selector, type='css') {
    if (type === 'xpath') {
      const els = await this.page.$x(selector);
      return els[0] || null;
    }
    return await this.page.$(selector);
  }
  async waitFor(selector, condition='visible', timeout=30000) {
    switch (condition) {
      case 'visible':
        return this.page.waitForSelector(selector, { visible: true, timeout });
      case 'present':
        return this.page.waitForSelector(selector, { timeout });
      case 'clickable':
        // Approximate: visible + not disabled
        return this.page.waitForFunction((sel) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          const style = getComputedStyle(el);
          const visible = style && style.visibility !== 'hidden' && style.display !== 'none';
          return visible && !el.disabled;
        }, { timeout }, selector);
      case 'enabled':
        return this.page.waitForFunction((sel) => {
          const el = document.querySelector(sel);
          return !!(el && !el.disabled);
        }, { timeout }, selector);
      case 'selected':
        return this.page.waitForFunction((sel) => {
          const el = document.querySelector(sel);
          return !!(el && el.selected);
        }, { timeout }, selector);
      case 'invisible':
        return this.page.waitForSelector(selector, { hidden: true, timeout });
      default:
        return this.page.waitForSelector(selector, { timeout });
    }
  }
  async waitForText(selector, expected, { exact=false, timeout=30000 }={}) {
    await this.page.waitForFunction((sel, text, exact) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const t = (el.textContent || '').trim();
      return exact ? t === text : t.includes(text);
    }, { timeout }, selector, expected, exact);
  }
  async waitForDisappear(selector, timeout=30000) {
    await this.page.waitForFunction((sel) => !document.querySelector(sel), { timeout }, selector);
  }
  async waitForDownload(expectedName='', timeout=30000, exact=false) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const files = fs.readdirSync(this.downloadPath);
        const match = files.find(f => exact ? f === expectedName : (expectedName ? f.includes(expectedName) : true));
        if (match) {
          console.log('📥 Download detected:', match);
          return match;
        }
      } catch {}
      await new Promise(r => setTimeout(r, 500));
    }
    throw new Error('Download timeout');
  }

  async runWorkflow() {
    try {
      await this.initialize();

${stepBlocks}

      console.log('✅ Automation completed successfully!');
    } catch (error) {
      console.error('❌ Automation failed:', error);
      try { await this.page.screenshot({ path: 'error-screenshot.png', fullPage: true }); } catch {}
    } finally {
      if (this.browser) await this.browser.close();
    }
  }
}

// Run
(async () => {
  const runner = new AutomationRunner();
  await runner.runWorkflow();
})();`;
  };

  const generatePuppeteerStepCode = (step) => {
    const c = step.config || {};
    const sel = (c.selector || '').replace(/`/g,'\\`');

    switch (step.type) {
      case 'navigate':
        return `console.log('🌐 Go to ${c.url}');
      await this.page.goto('${c.url}', { waitUntil: '${c.waitForLoad ? 'networkidle2' : 'load'}', timeout: ${c.timeout ?? 30000} });`;

      case 'new-tab':
        return `console.log('🆕 New tab');
      const _newPage = await this.browser.newPage();
      ${c.url ? `await _newPage.goto('${c.url}', { timeout: ${c.timeout ?? 10000} });` : ''}
      ${c.switchToTab === false ? '' : 'this.page = _newPage;'};`;

      case 'refresh':
        return `console.log('🔄 Refresh');
      await this.page.reload({ waitUntil: 'networkidle2', timeout: ${c.timeout ?? 30000} });`;

      case 'back':
        return `console.log('⬅️ Back');
      await this.page.goBack({ waitUntil: 'load', timeout: ${c.timeout ?? 10000} });`;

      case 'forward':
        return `console.log('➡️ Forward');
      await this.page.goForward({ waitUntil: 'load', timeout: ${c.timeout ?? 10000} });`;

      case 'wait-time':
        return `console.log('⏱️ Wait ${c.duration}ms');
      await new Promise(r => setTimeout(r, ${c.randomDelay ? `Math.floor(${c.minDelay ?? 1000} + Math.random()*${Math.max((c.maxDelay ?? 3000) - (c.minDelay ?? 1000),1)})` : (c.duration ?? 1000)}));`;

      case 'wait-element':
        return `console.log('⏳ Wait element ${sel} (${c.condition||'visible'})');
      await this.waitFor('${sel}', '${c.condition||'visible'}', ${c.timeout ?? 30000});`;

      case 'wait-disappear':
        return `console.log('🫥 Wait disappear ${sel}');
      await this.waitForDisappear('${sel}', ${c.timeout ?? 30000});`;

      case 'wait-text':
        return `console.log('🔤 Wait text "${(c.expectedText||'').replace(/`/g,'\\`')}" in ${sel}');
      await this.waitForText('${sel}', \`${(c.expectedText||'').replace(/`/g,'\\`')}\`, { exact: ${!!c.exact}, timeout: ${c.timeout ?? 30000} });`;

      case 'wait-page-load':
        return `console.log('📄 Wait page load');
      await this.page.waitForNavigation({ waitUntil: '${c.waitFor||'networkidle2'}', timeout: ${c.timeout ?? 30000} });`;

      case 'click':
        return `console.log('🖱️ Click ${sel}');
      ${c.waitForElement ? `await this.waitFor('${sel}','clickable', ${c.timeout ?? 10000});` : `await this.page.waitForSelector('${sel}', { timeout: ${c.timeout ?? 10000} });`}
      ${c.scrollToElement ? `await this.page.evaluate((s)=>document.querySelector(s)?.scrollIntoView({block:'center'}), '${sel}');` : ''}
      await this.page.click('${sel}');`;

      case 'double-click':
        return `console.log('🖱️🖱️ Double click ${sel}');
      await this.page.waitForSelector('${sel}');
      await this.page.click('${sel}', { clickCount: 2, delay: ${c.delay ?? 50} });`;

      case 'right-click':
        return `console.log('🖱️ Right click ${sel}');
      await this.page.waitForSelector('${sel}');
      await this.page.click('${sel}', { button: 'right' });`;

      case 'hover':
        return `console.log('🪄 Hover ${sel}');
      await this.page.waitForSelector('${sel}');
      await this.page.hover('${sel}');
      ${c.duration ? `await new Promise(r=>setTimeout(r, ${c.duration}));` : ''}`;

      case 'scroll':
        return `console.log('🧭 Scroll ${c.direction||'down'} ${c.amount||300}px');
      if ('${c.element||''}') {
        await this.page.evaluate((s, amt, dir) => {
          const el = document.querySelector(s);
          if (!el) return;
          el.scrollBy({ top: dir==='down'?amt:-amt, left: dir==='right'?amt:-amt, behavior: ${c.smooth ? `'smooth'` : `'auto'`} });
        }, '${c.element}', ${c.amount ?? 300}, '${c.direction||'down'}');
      } else {
        await this.page.evaluate((amt, dir, smooth) => {
          window.scrollBy({ top: dir==='down'?amt:-amt, left: dir==='right'?amt:-amt, behavior: smooth?'smooth':'auto' });
        }, ${c.amount ?? 300}, '${c.direction||'down'}', ${!!c.smooth});
      }`;

      case 'type':
        return `console.log('⌨️ Type ${sel}');
      await this.page.waitForSelector('${sel}');
      ${c.clearFirst ? `await this.page.evaluate((s)=>{const el=document.querySelector(s); if(el) el.value='';}, '${sel}');` : ''}
      await this.page.type('${sel}', resolveTemplate(\`${(c.text||'').replace(/`/g,'\\`')}\`, this.vars), { delay: ${c.speed ?? 50} });`;

      case 'clear-type':
        return `console.log('🧼 Clear & Type ${sel}');
      await this.page.waitForSelector('${sel}');
      await this.page.fill?.('${sel}', '') || this.page.evaluate((s)=>{const el=document.querySelector(s); if(el) el.value='';}, '${sel}');
      await this.page.type('${sel}', resolveTemplate(\`${(c.text||'').replace(/`/g,'\\`')}\`, this.vars), { delay: ${c.speed ?? 50} });`;

      case 'focus':
        return `console.log('🎯 Focus ${sel}');
      await this.page.waitForSelector('${sel}', { timeout: ${c.timeout ?? 10000} });
      ${c.scrollIntoView === false ? '' : `await this.page.evaluate((s)=>document.querySelector(s)?.scrollIntoView({block:'center'}), '${sel}');`}
      await this.page.focus('${sel}');`;

      case 'press-key':
        return `console.log('⌨️ Press ${c.key}${c.modifiers ? ' with '+c.modifiers : ''}');
      ${c.modifiers ? `await this.page.keyboard.down('${c.modifiers.split('+')[0]}');` : ''}
      await this.page.keyboard.press('${c.key}');
      ${c.modifiers ? `await this.page.keyboard.up('${c.modifiers.split('+')[0]}');` : ''}`;

      case 'upload-file':
        return `console.log('📤 Upload file to ${sel}');
      const _fileInput = await this.q$('${sel}');
      if(!_fileInput) throw new Error('File input not found: ${sel}');
      await _fileInput.uploadFile(${JSON.stringify(c.multiple ? (Array.isArray(c.filePath)?c.filePath:[c.filePath]) : [c.filePath])});`;

      case 'check-checkbox':
        return `console.log('☑️ Checkbox ${sel} -> ${c.action||'toggle'}');
      await this.page.waitForSelector('${sel}');
      await this.page.evaluate((s, action) => {
        const el = document.querySelector(s);
        if (!el) return;
        if (action==='check') el.checked = true;
        else if (action==='uncheck') el.checked = false;
        else el.checked = !el.checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, '${sel}', '${c.action||'toggle'}');`;

      case 'radio-select':
        return `console.log('🔘 Radio select ${sel} value=${c.value}');
      await this.page.evaluate((s, val) => {
        const radios = document.querySelectorAll(s);
        for (const r of radios) { if (r.value == val) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); break; } }
      }, '${sel}', '${c.value}');`;

      case 'select-dropdown':
        return `console.log('🧩 Select dropdown ${sel} by ${c.byValue ? 'value' : 'text'} = ${c.value}');
      await this.page.waitForSelector('${sel}');
      ${c.byValue
        ? `await this.page.select('${sel}', '${(c.value||'').replace(/'/g,"\\'")}');`
        : `await this.page.evaluate((s, text) => {
            const el = document.querySelector(s);
            if (!el) return;
            const opts = Array.from(el.options);
            const opt = opts.find(o => o.text.trim() === text.trim());
            if (opt) el.value = opt.value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, '${sel}', '${(c.value||'').replace(/'/g,"\\'")}');`
      }`;

      case 'screenshot':
        return `console.log('📸 Screenshot ${c.fileName||'screenshot.png'}');
      ${c.selector
        ? `const _elShot = await this.q$('${sel}');
      if (!_elShot) throw new Error('Element not found for screenshot');
      await _elShot.screenshot({ path: resolveTemplate('${c.fileName||'screenshot.png'}', this.vars) });`
        : `await this.page.screenshot({ path: resolveTemplate('${c.fileName||'screenshot.png'}', this.vars), fullPage: ${!!c.fullPage} });`
      }`;

      case 'pdf-generate':
        return `console.log('🧾 PDF ${c.fileName||'page.pdf'}');
      try {
        await this.page.emulateMediaType?.('screen');
        await this.page.pdf({ path: resolveTemplate('${c.fileName||'page.pdf'}', this.vars), printBackground: true });
      } catch (e) {
        console.warn('page.pdf may require Chromium headless. Error:', e.message);
      }`;

      case 'download-trigger':
        return `console.log('⬇️ Trigger download via ${sel}');
      await this.page.click('${sel}');
      ${c.downloadPath ? `this.downloadPath = path.resolve('${c.downloadPath}');` : ''}`;

      case 'wait-download':
        return `console.log('⏳ Wait download ${c.fileName||''}');
      ${c.downloadPath ? `this.downloadPath = path.resolve('${c.downloadPath}');` : ''}
      await this.waitForDownload(${c.fileName? `'${c.fileName}'`:'""'}, ${c.timeout ?? 60000}, ${!!c.exactMatch});`;

      case 'download-verify':
        return `console.log('🔍 Verify download ${c.fileName||''}');
      ${c.downloadPath ? `this.downloadPath = path.resolve('${c.downloadPath}');` : ''}
      const _foundDl = await this.waitForDownload(${c.fileName? `'${c.fileName}'`:'""'}, ${c.timeout ?? 60000}, ${!!c.exactMatch});
      ${c.fileSize ? `const _stat = fs.statSync(path.join(this.downloadPath, _foundDl)); if (_stat.size < ${c.fileSize}) throw new Error('Downloaded file smaller than expected');` : ''}`;

      case 'file-rename':
        return `console.log('📝 Rename ${c.currentPath} -> ${c.newPath}');
      ${c.overwrite ? `try { if (fs.existsSync('${c.newPath}')) fs.unlinkSync('${c.newPath}'); } catch {}` : ''}
      fs.renameSync('${c.currentPath}', '${c.newPath}');`;

      case 'file-move':
        return `console.log('📁 Move ${c.sourcePath} -> ${c.destinationPath}');
      const _destDir = path.dirname('${c.destinationPath}');
      ${c.createDirectories === false ? '' : `fs.mkdirSync(_destDir, { recursive: true });`}
      ${c.overwrite ? `try { if (fs.existsSync('${c.destinationPath}')) fs.unlinkSync('${c.destinationPath}'); } catch {}` : ''}
      fs.renameSync('${c.sourcePath}', '${c.destinationPath}');`;

      case 'file-monitor':
        return `console.log('👀 Monitor folder ${c.folderPath} pattern=${c.pattern||'*'}');
      {
        const start = Date.now();
        let found = null;
        while (Date.now() - start < ${c.timeout ?? 30000}) {
          const files = fs.readdirSync('${c.folderPath}');
          const rx = new RegExp('^' + (${JSON.stringify((c.pattern||'*').replace(/\./g,'\\.').replace(/\*/g,'.*'))}) + '$');
          const matches = files.filter(f => rx.test(f));
          if (matches.length) {
            found = ${c.action === 'oldest' ? 'matches.sort((a,b)=>fs.statSync(path.join("'+c.folderPath+'",a)).mtime - fs.statSync(path.join("'+c.folderPath+'",b)).mtime)[0]' :
                c.action === 'all' ? 'matches' : 'matches.sort((a,b)=>fs.statSync(path.join("'+c.folderPath+'",b)).mtime - fs.statSync(path.join("'+c.folderPath+'",a)).mtime)[0]'};
            break;
          }
          await new Promise(r=>setTimeout(r,500));
        }
        if (!found) throw new Error('No files matched within timeout');
        this.vars['${c.saveAs||'fileMonitor'}'] = found;
      }`;

      case 'extract-images':
        return `console.log('🖼️ Extract images ${c.selector||'img'} attr=${c.attribute||'src'}');
      this.vars['${c.saveAs||'images'}'] = await this.page.evaluate((sel, attr, trim) => {
        const list = Array.from(document.querySelectorAll(sel));
        const pick = (el) => attr==='alt' ? (el.getAttribute('alt')||'') : (el.getAttribute(attr)||'');
        return list.map(pick).map(v => trim? v.trim(): v).filter(Boolean);
      }, '${c.selector||'img'}', '${c.attribute||'src'}', ${c.trim !== false});
      ${c.downloadImages ? `{
        const outDir = path.resolve('${c.downloadPath || './images'}');
        fs.mkdirSync(outDir, { recursive: true });
        const urls = this.vars['${c.saveAs||'images'}'];
        const fetch = global.fetch || (await import('node-fetch')).default;
        for (const [i, u] of urls.entries()) {
          try {
            const res = await fetch(u);
            const buf = await res.arrayBuffer();
            fs.writeFileSync(path.join(outDir, 'img_'+String(i+1).padStart(3,'0')+path.extname(new URL(u).pathname)||'.jpg'), Buffer.from(buf));
          } catch (e) { console.warn('Download failed', u, e.message); }
        }
      }` : ''}`;

      case 'extract-table':
        return `console.log('📊 Extract table ${c.selector||'table'}');
      this.vars['${c.saveAs||'tableData'}'] = await this.page.evaluate((sel, includeHeaders) => {
        const table = document.querySelector(sel);
        if (!table) return [];
        const rows = Array.from(table.querySelectorAll('tr'));
        const data = rows.map(r => Array.from(r.children).map(c => (c.textContent||'').trim()));
        if (!includeHeaders) return data.filter((_,i)=>i>0);
        return data;
      }, '${c.selector||'table'}', ${c.includeHeaders !== false});`;

      case 'extract-links':
        return `console.log('🔗 Extract links ${c.selector||'a'} attr=${c.attribute||'href'}');
      this.vars['${c.saveAs||'links'}'] = await this.page.evaluate((sel, attr) => {
        return Array.from(document.querySelectorAll(sel)).map(a => attr==='text'? (a.textContent||'').trim() : a.getAttribute(attr)).filter(Boolean);
      }, '${c.selector||'a'}', '${c.attribute||'href'}');`;

      case 'screenshot-element': // (if any alias)
        return `// Alias handled in 'screenshot'`;

      case 'javascript':
        return `console.log('🧩 Run JS code');
      this.vars['${c.saveAs||'jsResult'}'] = await this.page.evaluate((code) => {
        return (0, eval)(code);
      }, \`${(c.code||'').replace(/`/g,'\\`')}\`);`;

      case 'api-call':
        return `console.log('🌐 API ${c.method||'GET'} ${c.url}');
      {
        const headers = ${c.headers ? JSON.stringify(c.headers) : '{}'};
        const body = ${c.body ? `resolveTemplate(\`${(c.body||'').replace(/`/g,'\\`')}\`, this.vars)` : 'undefined'};
        const res = await (global.fetch || (await import('node-fetch')).default)('${c.url}', {
          method: '${c.method||'GET'}',
          headers,
          ${c.body ? 'body' : ''}
        });
        const text = await res.text();
        try { this.vars['${c.saveAs||'apiResponse'}'] = JSON.parse(text); }
        catch { this.vars['${c.saveAs||'apiResponse'}'] = text; }
      }`;

      case 'email':
      case 'send-email':
        return `console.log('✉️ Send email to ${c.to}');
      // Simple SMTP using nodemailer (requires: npm i nodemailer)
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport(${c.provider==='smtp'
          ? JSON.stringify(c.smtpSettings || {host:'smtp.gmail.com',port:587,secure:false,auth:{user:'',pass:''}})
          : `{} // Configure provider '${c.provider||'smtp'}'`});
        await transporter.sendMail({
          from: ${JSON.stringify((c.from||'noreply@example.com'))},
          to: '${c.to}',
          subject: resolveTemplate(\`${(c.subject||'')?.replace(/`/g,'\\`')}\`, this.vars),
          text: resolveTemplate(\`${(c.message||'')?.replace(/`/g,'\\`')}\`, this.vars),
          attachments: ${c.attachments ? JSON.stringify(String(c.attachments).split(',').map(f=>({path:f.trim()}))) : '[]'}
        });
      } catch (e) { console.warn('Email send skipped/failed:', e.message); }`;

      case 'send-notification':
        return `console.log('🔔 Notification [${c.type||'info'}] ${c.title||''}: ${c.message||''}');`;

      case 'variable-set':
        return `console.log('📦 Set var ${c.name}=' + resolveTemplate(\`${(c.value??'')?.replace(/`/g,'\\`')}\`, this.vars));
      this.vars['${c.name}'] = resolveTemplate(\`${(c.value??'')?.replace(/`/g,'\\`')}\`, this.vars);`;

      case 'variable-get':
        return `console.log('📤 Get var ${c.name} -> ${c.saveAs||c.name}');
      this.vars['${c.saveAs||c.name}'] = this.vars['${c.name}'] ?? ${JSON.stringify(c.defaultValue ?? '')};`;

      case 'condition':
        return `console.log('🔀 Condition ${c.type || ''}');
      // Note: branching cannot remove already-generated steps; we record a flag to let subsequent steps check it if they want.
      this.vars.__lastCondition = (()=>{
        switch ('${c.type}') {
          case 'elementExists': return !!document.querySelector('${sel}');
          case 'textContains': {
            const el = document.querySelector('${sel}');
            return el ? (el.textContent||'').includes('${(c.value||'').replace(/'/g,"\\'")}') : false;
          }
          case 'varEquals': return (this.vars['${c.selector||c.name||''}'] ?? '') == '${(c.value||'').replace(/'/g,"\\'")}';
          default: return false;
        }
      })();`;

      case 'loop':
        return `console.log('🔁 Loop ${c.type||'count'}');
      for (let __i=0; __i<${c.count ?? 1}; __i++) { console.log('  ➤ iteration', __i+1); /* Insert per-iteration steps manually if needed */ }`;

      case 'try-catch':
        return `console.log('🛟 Try-Catch setup');
      // Wrap sensitive steps manually in your own try/catch or extend generator to group steps. Placeholder here.`;

      case 'right-click-element': // alias safety
        return `// Use 'right-click' action`;

      default:
        return `console.log('⚠️ Unsupported step type "${step.type}" - no-op');`;
    }
  };

  // ============ SELENIUM (Python) ============
  const generateSeleniumCode = () => {
    const stepBlocks = workflow.map((step, i) => `            # Step ${i + 1}: ${step.name}
            ${generateSeleniumStepCode(step)}`).join('\n\n');

    return `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time, os, json, base64

# 🐍 Auto-generated Selenium Python Script
# Generated on: ${new Date().toISOString()}

def format_date(fmt, t=None):
    import datetime
    d = t or datetime.datetime.now()
    m = {
        "YYYY": d.strftime("%Y"),
        "MM": d.strftime("%m"),
        "DD": d.strftime("%d"),
        "hh": d.strftime("%H"),
        "mm": d.strftime("%M"),
        "ss": d.strftime("%S"),
    }
    for k,v in m.items():
        fmt = fmt.replace(k,v)
    return fmt

def resolve_template(s, vars):
    if not s: return ""
    def repl_var(m): return str(vars.get(m.group(1), ""))
    import re
    s = re.sub(r"\\{var:([^}]+)\\}", repl_var, s)
    def repl_date(m): 
        return format_date(m.group(1)) if m.group(1) else time.strftime("%Y-%m-%d")
    s = re.sub(r"\\{date(?::([^}]+))?\\}", repl_date, s)
    s = s.replace("{timestamp}", str(int(time.time()*1000)))
    return s

class AutomationRunner:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.vars = {}
        self.download_dir = os.path.abspath('./downloads')
        
    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        prefs = {"download.default_directory": self.download_dir, "download.prompt_for_download": False}
        chrome_options.add_experimental_option("prefs", prefs)
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 30)

    def wait_download(self, expected="", timeout=30, exact=False):
        start = time.time()
        while time.time()-start < timeout:
            try:
                for f in os.listdir(self.download_dir):
                    if (exact and f==expected) or (not expected) or (not exact and expected in f):
                        return f
            except: pass
            time.sleep(0.5)
        raise Exception("Download timeout")
        
    def run_automation(self):
        try:
            print("🚀 Starting Selenium automation...")
            self.setup_driver()

${stepBlocks}

            print("✅ Automation completed!")
        except Exception as e:
            print(f"❌ Error: {e}")
            try: self.driver.save_screenshot('error-screenshot.png')
            except: pass
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    runner = AutomationRunner()
    runner.run_automation()`;
  };

  const pyBy = (c) => {
    switch (c.selectorType) {
      case 'xpath': return 'By.XPATH';
      case 'id': return 'By.ID';
      case 'class': return 'By.CLASS_NAME';
      case 'name': return 'By.NAME';
      case 'tag': return 'By.TAG_NAME';
      default: return 'By.CSS_SELECTOR';
    }
  };

  const generateSeleniumStepCode = (step) => {
    const c = step.config || {};
    const by = pyBy(c);
    const sel = (c.selector || '').replace(/"/g, '\\"');

    switch (step.type) {
      case 'navigate':
        return `print("🌐 Navigating to: ${c.url}")
            self.driver.get("${c.url}")`;

      case 'refresh':
        return `print("🔄 Refresh")
            self.driver.refresh()`;

      case 'back':
        return `print("⬅️ Back")
            self.driver.back()`;

      case 'forward':
        return `print("➡️ Forward")
            self.driver.forward()`;

      case 'wait-time':
        return `print("⏱️ Wait ${c.duration}ms")
            time.sleep(${(c.randomDelay ? Math.max(0, (c.maxDelay ?? 3000)) : (c.duration ?? 1000))} / 1000.0)`;

      case 'wait-element': {
        const cond =
          c.condition === 'visible' ? `EC.visibility_of_element_located((${by}, "${sel}"))` :
          c.condition === 'present' ? `EC.presence_of_element_located((${by}, "${sel}"))` :
          c.condition === 'clickable' ? `EC.element_to_be_clickable((${by}, "${sel}"))` :
          c.condition === 'invisible' ? `EC.invisibility_of_element_located((${by}, "${sel}"))` :
          `EC.presence_of_element_located((${by}, "${sel}"))`;
        return `print("⏳ Wait element ${sel} (${c.condition||'visible'})")
            self.wait.until(${cond})`;
      }

      case 'wait-disappear':
        return `print("🫥 Wait disappear ${sel}")
            self.wait.until(EC.invisibility_of_element_located((${by}, "${sel}")))`;

      case 'wait-text':
        return `print("🔤 Wait text in ${sel}")
            self.wait.until(lambda d: (("${c.expectedText||''}" in d.find_element(${by}, "${sel}").text) if ${c.exact? 'False':'True'} else d.find_element(${by}, "${sel}").text=="${c.expectedText||''}"), "${c.expectedText||''}")`;

      case 'click':
        return `print("🖱️ Click ${sel}")
            el = self.wait.until(EC.element_to_be_clickable((${by}, "${sel}")))
            el.click()`;

      case 'double-click':
        return `print("🖱️🖱️ Double click ${sel}")
            from selenium.webdriver import ActionChains
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            ActionChains(self.driver).double_click(el).perform()`;

      case 'right-click':
        return `print("🖱️ Right click ${sel}")
            from selenium.webdriver import ActionChains
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            ActionChains(self.driver).context_click(el).perform()`;

      case 'hover':
        return `print("🪄 Hover ${sel}")
            from selenium.webdriver import ActionChains
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            ActionChains(self.driver).move_to_element(el).perform()
            ${c.duration ? `time.sleep(${c.duration}/1000.0)` : ''}`;

      case 'scroll':
        return `print("🧭 Scroll ${c.direction||'down'} ${c.amount||300}px")
            if "${c.element||''}":
                el = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${(c.element||'').replace(/"/g,'\\"')}")))
                self.driver.execute_script("arguments[0].scrollBy(0, arguments[1]);", el, ${c.amount ?? 300} if "${c.direction||'down'}"=="down" else -${c.amount ?? 300})
            else:
                self.driver.execute_script("window.scrollBy(arguments[0], arguments[1]);", ${c.direction==='right'? (c.amount??300) : 0}, ${c.direction==='down'||!c.direction ? (c.amount??300) : -(c.amount??300)})`;

      case 'type':
      case 'clear-type':
        return `print("⌨️ Type ${sel}")
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            ${step.type==='clear-type' || c.clearFirst ? 'el.clear()' : ''}
            el.send_keys(resolve_template("${(c.text||'').replace(/"/g,'\\"')}", self.vars))`;

      case 'focus':
        return `print("🎯 Focus ${sel}")
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            el.click()`;

      case 'press-key':
        return `print("⌨️ Press ${c.key}")
            from selenium.webdriver.common.keys import Keys
            el = self.driver.switch_to.active_element
            el.send_keys(Keys.${(c.key||'ENTER').toUpperCase()})`;

      case 'upload-file':
        return `print("📤 Upload ${c.filePath}")
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            el.send_keys(os.path.abspath("${c.filePath}"))`;

      case 'check-checkbox':
        return `print("☑️ Checkbox ${c.action||'toggle'} ${sel}")
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            checked = el.is_selected()
            action = "${c.action||'toggle'}"
            if (action=="check" and not checked) or (action=="uncheck" and checked) or (action=="toggle"):
                el.click()`;

      case 'radio-select':
        return `print("🔘 Radio select ${sel} value=${c.value}")
            els = self.driver.find_elements(${by}, "${sel}")
            for r in els:
                if r.get_attribute("value")== "${c.value}":
                    r.click(); break`;

      case 'select-dropdown':
        return `print("🧩 Select ${sel} by ${c.byValue ? 'value' : 'text'}")
            el = self.wait.until(EC.presence_of_element_located((${by}, "${sel}")))
            Select(el).${c.byValue ? 'select_by_value' : 'select_by_visible_text'}("${c.value||''}")`;

      case 'screenshot':
        return `print("📸 Screenshot ${c.fileName||'screenshot.png'}")
            self.driver.save_screenshot("${c.fileName||'screenshot.png'}")`;

      case 'pdf-generate':
        return `print("🧾 PDF ${c.fileName||'page.pdf'} via DevTools")
            try:
                pdf = self.driver.execute_cdp_cmd("Page.printToPDF", {"printBackground": True})
                with open("${c.fileName||'page.pdf'}","wb") as f:
                    f.write(base64.b64decode(pdf['data']))
            except Exception as e:
                print("PDF failed:", e)`;

      case 'download-trigger':
        return `print("⬇️ Trigger download ${sel}")
            el = self.wait.until(EC.element_to_be_clickable((${by}, "${sel}"))); el.click()`;

      case 'wait-download':
        return `print("⏳ Wait download ${c.fileName||''}")
            f = self.wait_download("${c.fileName||''}", ${Math.floor((c.timeout ?? 60000)/1000)}, ${!!c.exactMatch})`;

      case 'download-verify':
        return `print("🔍 Verify download ${c.fileName||''}")
            f = self.wait_download("${c.fileName||''}", ${Math.floor((c.timeout ?? 60000)/1000)}, ${!!c.exactMatch})
            p = os.path.join(self.download_dir, f)
            ${c.fileSize ? `assert os.path.getsize(p) >= ${c.fileSize}, "Downloaded file too small"` : ''}`;

      case 'file-rename':
        return `print("📝 Rename ${c.currentPath} -> ${c.newPath}")
            ${c.overwrite ? `try:
                os.remove("${c.newPath}")
            except: pass` : ''}
            os.replace("${c.currentPath}", "${c.newPath}")`;

      case 'file-move':
        return `print("📁 Move ${c.sourcePath} -> ${c.destinationPath}")
            os.makedirs(os.path.dirname("${c.destinationPath}"), exist_ok=True)
            ${c.overwrite ? `try: os.remove("${c.destinationPath}")\n            except: pass` : ''}
            os.replace("${c.sourcePath}", "${c.destinationPath}")`;

      case 'file-monitor':
        return `print("👀 Monitor ${c.folderPath}")
            import re
            rx = re.compile('^' + "${(c.pattern||'*').replace(/\./g,'\\.').replace(/\*/g,'.*')}" + '$')
            start = time.time(); found = None
            while time.time()-start < ${Math.floor((c.timeout ?? 30000)/1000)}:
                files = [f for f in os.listdir("${c.folderPath}") if rx.match(f)]
                if files:
                    found = files[0]
                    break
                time.sleep(0.5)
            if not found: raise Exception("No file matched")
            self.vars["${c.saveAs||'fileMonitor'}"] = found`;

      case 'extract-images':
        return `print("🖼️ Extract images ${c.selector||'img'}")
            from bs4 import BeautifulSoup
            html = self.driver.page_source
            soup = BeautifulSoup(html, "html.parser")
            out = []
            for el in soup.select("${c.selector||'img'}"):
                val = el.get("${c.attribute||'src'}") if "${c.attribute||'src'}"!="alt" else (el.get("alt") or "")
                if val: out.append(val.strip())
            self.vars["${c.saveAs||'images'}"] = out`;

      case 'extract-table':
        return `print("📊 Extract table ${c.selector||'table'}")
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, "html.parser")
            table = soup.select_one("${c.selector||'table'}")
            data = []
            if table:
                for tr in table.select("tr"):
                    data.append([ (td.get_text() or "").strip() for td in tr.find_all(["td","th"]) ])
            self.vars["${c.saveAs||'tableData'}"] = data if ${c.includeHeaders !== false} else (data[1:] if len(data)>1 else [])`;

      case 'extract-links':
        return `print("🔗 Extract links ${c.selector||'a'}")
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, "html.parser")
            res = []
            for a in soup.select("${c.selector||'a'}"):
                res.append(a.get("${c.attribute||'href'}") if "${c.attribute||'href'}"!="text" else (a.get_text() or "").strip())
            self.vars["${c.saveAs||'links'}"] = [x for x in res if x]`;

      case 'javascript':
        return `print("🧩 Run JS")
            self.vars["${c.saveAs||'jsResult'}"] = self.driver.execute_script(${JSON.stringify(c.code || '')})`;

      case 'api-call':
        return `print("🌐 API ${c.method||'GET'} ${c.url}")
            import requests
            headers = ${c.headers ? JSON.stringify(c.headers) : '{}'}
            data = ${c.body ? `resolve_template("""${(c.body||'').replace(/"/g,'\\"')}""", self.vars)` : 'None'}
            r = requests.request("${c.method||'GET'}", "${c.url}", headers=headers, data=data)
            try: self.vars["${c.saveAs||'apiResponse'}"] = r.json()
            except: self.vars["${c.saveAs||'apiResponse'}"] = r.text`;

      case 'send-email':
      case 'email':
        return `print("✉️ Send email to ${c.to}")
            # Requires 'smtplib' config; placeholder below
            import smtplib
            from email.mime.text import MIMEText
            msg = MIMEText(resolve_template("""${(c.message||'').replace(/"/g,'\\"')}""", self.vars))
            msg['Subject'] = "${(c.subject||'')}"
            msg['From'] = "${(c.from||'noreply@example.com')}"
            msg['To'] = "${(c.to||'')}"
            try:
                s = smtplib.SMTP("${(c.smtpSettings?.host || 'smtp.gmail.com')}", ${c.smtpSettings?.port || 587})
                s.starttls()
                ${c.smtpSettings?.auth?.user ? `s.login("${c.smtpSettings.auth.user}", "${c.smtpSettings.auth.pass}")` : '# s.login(USER, PASS)'}
                s.send_message(msg)
                s.quit()
            except Exception as e:
                print("Email skipped/failed:", e)`;

      case 'variable-set':
        return `print("📦 Set var ${c.name}")
            self.vars["${c.name}"] = resolve_template("${(c.value??'')}".replace('\\n','\\n'), self.vars)`;

      case 'variable-get':
        return `print("📤 Get var ${c.name} -> ${c.saveAs||c.name}")
            self.vars["${c.saveAs||c.name}"] = self.vars.get("${c.name}", ${JSON.stringify(c.defaultValue ?? '')})`;

      case 'condition':
        return `print("🔀 Condition ${c.type||''} (no branching in generator)")`;

      case 'loop':
        return `print("🔁 Loop ${c.count ?? 1} (place inner steps manually)")`;

      default:
        return `print("⚠️ Unsupported step type: ${step.type}")`;
    }
  };

  // ============ PLAYWRIGHT ============
  const generatePlaywrightCode = () => {
    const stepBlocks = workflow.map((step, i) => `      // Step ${i + 1}: ${step.name}
      ${generatePlaywrightStepCode(step)}`).join('\n\n');

    return `const { chromium } = require('playwright');

// 🎭 Auto-generated Playwright Script
// Generated on: ${new Date().toISOString()}

${jsDateHelper}

class AutomationRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.vars = {};
  }
  async initialize() {
    console.log('🚀 Starting Playwright automation...');
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 800 } });
    this.page = await this.context.newPage();
  }
  async runAutomation() {
    try {
      await this.initialize();

${stepBlocks}

      console.log('✅ Automation completed!');
    } catch (e) {
      console.error('❌ Error:', e);
      try { await this.page.screenshot({ path: 'error-screenshot.png' }); } catch {}
    } finally {
      if (this.browser) await this.browser.close();
    }
  }
}
(async () => {
  const runner = new AutomationRunner();
  await runner.runAutomation();
})();`;
  };

  const generatePlaywrightStepCode = (step) => {
    const c = step.config || {};
    const sel = (c.selector || '').replace(/`/g,'\\`');
    switch (step.type) {
      case 'navigate':
        return `console.log('🌐 Go to ${c.url}'); await this.page.goto('${c.url}', { timeout: ${c.timeout ?? 30000}, waitUntil: '${c.waitForLoad ? 'networkidle' : 'load'}' });`;
      case 'new-tab':
        return `console.log('🆕 New tab'); const _pg = await this.context.newPage(); ${c.url?`await _pg.goto('${c.url}', { timeout: ${c.timeout ?? 10000} });`:''} ${c.switchToTab===false?'':'this.page = _pg;'};`;
      case 'refresh':
        return `console.log('🔄 Refresh'); await this.page.reload({ waitUntil: 'networkidle' });`;
      case 'back':
        return `console.log('⬅️ Back'); await this.page.goBack();`;
      case 'forward':
        return `console.log('➡️ Forward'); await this.page.goForward();`;
      case 'wait-time':
        return `console.log('⏱️ Wait ${c.duration}ms'); await this.page.waitForTimeout(${c.randomDelay ? Math.max(0,(c.maxDelay??3000)) : (c.duration??1000)});`;
      case 'wait-element':
        return `console.log('⏳ Wait element ${sel} (${c.condition||'visible'})'); await this.page.waitForSelector('${sel}', { state: '${c.condition==='present'?'attached':c.condition==='invisible'?'hidden':c.condition==='clickable'?'visible':'visible'}', timeout: ${c.timeout ?? 30000} });`;
      case 'wait-disappear':
        return `console.log('🫥 Wait disappear ${sel}'); await this.page.waitForSelector('${sel}', { state: 'detached', timeout: ${c.timeout ?? 30000} });`;
      case 'wait-text':
        return `console.log('🔤 Wait text'); await this.page.waitForFunction((s, t, ex)=>{const el=document.querySelector(s); if(!el) return false; const txt=(el.textContent||'').trim(); return ex? txt===t: txt.includes(t);}, { timeout: ${c.timeout ?? 30000} }, '${sel}', \`${(c.expectedText||'').replace(/`/g,'\\`')}\`, ${!!c.exact});`;
      case 'wait-page-load':
        return `console.log('📄 Wait page load'); await this.page.waitForLoadState('${c.waitFor||'networkidle'}');`;
      case 'click':
        return `console.log('🖱️ Click ${sel}'); ${c.scrollToElement?`await this.page.locator('${sel}').scrollIntoViewIfNeeded();`:''} await this.page.locator('${sel}').click();`;
      case 'double-click':
        return `console.log('🖱️🖱️ Double click ${sel}'); await this.page.locator('${sel}').dblclick({ delay: ${c.delay ?? 50} });`;
      case 'right-click':
        return `console.log('🖱️ Right click ${sel}'); await this.page.locator('${sel}').click({ button: 'right' });`;
      case 'hover':
        return `console.log('🪄 Hover ${sel}'); await this.page.locator('${sel}').hover(); ${c.duration?`await this.page.waitForTimeout(${c.duration});`:''}`;
      case 'scroll':
        return `console.log('🧭 Scroll ${c.direction||'down'} ${c.amount||300}px'); await this.page.evaluate((sel,amt,dir,smooth)=>{const t=sel?document.querySelector(sel):window; const x=dir==='right'?amt:dir==='left'?-amt:0; const y=dir==='down'?amt:dir==='up'?-amt:0; (t.scrollBy||window.scrollBy).call(t,{left:x, top:y, behavior:smooth?'smooth':'auto'});}, '${c.element||''}', ${c.amount ?? 300}, '${c.direction||'down'}', ${!!c.smooth});`;
      case 'type':
        return `console.log('⌨️ Type ${sel}'); ${c.clearFirst?`await this.page.locator('${sel}').fill('');`:''} await this.page.locator('${sel}').type(resolveTemplate(\`${(c.text||'').replace(/`/g,'\\`')}\`, this.vars), { delay: ${c.speed ?? 50} });`;
      case 'clear-type':
        return `console.log('🧼 Clear & Type ${sel}'); await this.page.locator('${sel}').fill(resolveTemplate(\`${(c.text||'').replace(/`/g,'\\`')}\`, this.vars));`;
      case 'focus':
        return `console.log('🎯 Focus ${sel}'); await this.page.locator('${sel}').focus();`;
      case 'press-key':
        return `console.log('⌨️ Press ${c.key}'); await this.page.keyboard.press('${c.key}');`;
      case 'upload-file':
        return `console.log('📤 Upload file'); await this.page.setInputFiles('${sel}', ${JSON.stringify(c.multiple ? (Array.isArray(c.filePath)?c.filePath:[c.filePath]) : [c.filePath])});`;
      case 'check-checkbox':
        return `console.log('☑️ Checkbox ${c.action||'toggle'}'); const _cb = this.page.locator('${sel}'); ${c.action==='check' ? 'await _cb.check({force:true});' : c.action==='uncheck' ? 'await _cb.uncheck({force:true});' : 'if(await _cb.isChecked()) await _cb.uncheck(); else await _cb.check();'}`;
      case 'radio-select':
        return `console.log('🔘 Radio select ${sel}'); await this.page.locator('${sel}[value="${(c.value||'').replace(/"/g,'\\"')}"]').check();`;
      case 'select-dropdown':
        return `console.log('🧩 Select dropdown'); ${c.byValue ? `await this.page.locator('${sel}').selectOption({ value: '${(c.value||'').replace(/'/g,"\\'")}' });` : `await this.page.locator('${sel}').selectOption({ label: '${(c.value||'').replace(/'/g,"\\'")}' });`}`;
      case 'screenshot':
        return `console.log('📸 Screenshot'); ${c.selector ? `await this.page.locator('${sel}').screenshot({ path: resolveTemplate('${c.fileName||'screenshot.png'}', this.vars) });` : `await this.page.screenshot({ path: resolveTemplate('${c.fileName||'screenshot.png'}', this.vars), fullPage: ${!!c.fullPage} });`}`;
      case 'pdf-generate':
        return `console.log('🧾 PDF (Chromium only, headless)'); try { await this.page.pdf({ path: resolveTemplate('${c.fileName||'page.pdf'}', this.vars), printBackground: true }); } catch (e) { console.warn('page.pdf may require headless Chromium:', e.message); }`;
      case 'download-trigger':
        return `console.log('⬇️ Trigger download'); const [download] = await Promise.all([ this.page.waitForEvent('download'), this.page.locator('${sel}').click() ]);`;
      case 'wait-download':
        return `console.log('⏳ Wait download'); /* Playwright captures download via events; ensure 'download-trigger' awaited above. */`;
      case 'download-verify':
        return `console.log('🔍 Verify download'); /* Use the Download object returned from trigger to save and check size when wiring steps together. */`;
      case 'file-rename':
      case 'file-move':
      case 'file-monitor':
        return `console.log('📁 File ops handled better in Node environment (use Puppeteer generator)');`;
      case 'extract-images':
        return `console.log('🖼️ Extract images'); this.vars['${c.saveAs||'images'}'] = await this.page.$$eval('${c.selector||'img'}', (els, attr) => els.map(e => attr==='alt' ? (e.getAttribute('alt')||'') : (e.getAttribute(attr)||'')).filter(Boolean), '${c.attribute||'src'}');`;
      case 'extract-table':
        return `console.log('📊 Extract table'); this.vars['${c.saveAs||'tableData'}'] = await this.page.$eval('${c.selector||'table'}', (t, includeHeaders) => { const rows=[...t.querySelectorAll('tr')].map(r=>[...r.children].map(c=>c.textContent.trim())); return includeHeaders?rows:rows.slice(1); }, ${c.includeHeaders !== false});`;
      case 'extract-links':
        return `console.log('🔗 Extract links'); this.vars['${c.saveAs||'links'}'] = await this.page.$$eval('${c.selector||'a'}', (els,attr)=>els.map(a=>attr==='text'?(a.textContent||'').trim():a.getAttribute(attr)).filter(Boolean), '${c.attribute||'href'}');`;
      case 'javascript':
        return `console.log('🧩 Run JS'); this.vars['${c.saveAs||'jsResult'}'] = await this.page.evaluate((code)=> (0,eval)(code), \`${(c.code||'').replace(/`/g,'\\`')}\`);`;
      case 'api-call':
        return `console.log('🌐 API ${c.method||'GET'}'); { const res = await fetch('${c.url}', { method: '${c.method||'GET'}', headers: ${c.headers?JSON.stringify(c.headers):'{}'}, ${c.body?`body: resolveTemplate(\`${(c.body||'').replace(/`/g,'\\`')}\`, this.vars)` : ''} }); const txt = await res.text(); try { this.vars['${c.saveAs||'apiResponse'}'] = JSON.parse(txt); } catch { this.vars['${c.saveAs||'apiResponse'}'] = txt; } }`;
      case 'send-email':
      case 'email':
        return `console.log('✉️ Email placeholder (use server-side)');`;
      case 'variable-set':
        return `console.log('📦 Set var'); this.vars['${c.name}'] = resolveTemplate(\`${(c.value??'').replace(/`/g,'\\`')}\`, this.vars);`;
      case 'variable-get':
        return `console.log('📤 Get var'); this.vars['${c.saveAs||c.name}'] = this.vars['${c.name}'] ?? ${JSON.stringify(c.defaultValue ?? '')};`;
      case 'send-notification':
        return `console.log('🔔 Notification [${c.type||'info'}] ${c.title||''}: ${c.message||''}');`;
      case 'condition':
      case 'loop':
      case 'try-catch':
        return `console.log('ℹ️ Control-flow placeholder (branching/grouping requires custom wiring)');`;
      default:
        return `console.log('⚠️ Unsupported step type "${step.type}"');`;
    }
  };

  // ---------- UI actions ----------
  const copyToClipboard = () => {
    const code = generateCode(activeTab);
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = () => {
    const code = generateCode(activeTab);
    const extensions = { puppeteer: 'js', selenium: 'py', playwright: 'js' };
    const filename = `automation-${Date.now()}.${extensions[activeTab]}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded successfully!');
  };

  const tabs = [
    { id: 'puppeteer', name: 'Puppeteer', icon: Code, color: 'from-green-500 to-blue-500' },
    { id: 'selenium',  name: 'Selenium',  icon: Terminal, color: 'from-yellow-500 to-orange-500' },
    { id: 'playwright',name: 'Playwright',icon: FileCode, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Generated Code</h2>
              <p className="text-blue-100">Ready-to-run automation script</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-3 rounded-t-lg transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-3">
            <motion.button
              className="btn-gradient px-4 py-2 rounded-lg text-white flex items-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" /> Copy Code
            </motion.button>

            <motion.button
              className="glass px-4 py-2 rounded-lg hover:bg-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={downloadCode}
            >
              <Download className="w-4 h-4" /> Download
            </motion.button>

            <motion.button
              className="glass px-4 py-2 rounded-lg hover:bg-green-500/20 hover:border-green-400/50 flex items-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => toast.success('Feature coming soon!')}
            >
              <Play className="w-4 h-4" /> Test Run
            </motion.button>
          </div>
        </div>

        {/* Code Display */}
        <div className="p-6 overflow-auto max-h-96">
          <pre className="bg-slate-900/50 rounded-xl p-6 overflow-auto text-sm">
            <code className="text-gray-300 font-mono whitespace-pre-wrap">
{generateCode(activeTab)}
            </code>
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CodeModal;
