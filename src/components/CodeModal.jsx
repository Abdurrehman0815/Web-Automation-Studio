import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download, Play, Code, Terminal, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkflowStore } from '../store/workflowStore';
import TestRunner from './TestRunner';

const CodeModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('puppeteer');
  const [showTestRunner, setShowTestRunner] = useState(false);
  const { workflow } = useWorkflowStore();

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

  const generatePuppeteerCode = () => {
    return `import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

// 🚀 Auto-generated Web Automation Script
// Generated on: ${new Date().toISOString()}
// Total Steps: ${workflow.length}

class AutomationRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.downloadPath = path.resolve('./downloads');
  }

  async initialize() {
    console.log('🚀 Starting automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setDefaultTimeout(30000);
    
    // Setup download path
    const client = await this.page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: this.downloadPath
    });
  }

  async runWorkflow() {
    try {
      await this.initialize();
      
${workflow.map((step, index) => `      // Step ${index + 1}: ${step.name}
      ${generateStepCode(step)}`).join('\n\n')}
      
      console.log('✅ Automation completed successfully!');
      
    } catch (error) {
      console.error('❌ Automation failed:', error);
      await this.page.screenshot({ path: 'error-screenshot.png' });
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Utility Functions
async function waitForDownload(downloadPath, fileName, timeout, exactMatch) {
  const startTime = Date.now();
  let pattern;

  if (!exactMatch) {
    // Convert wildcard to regex
    pattern = new RegExp(fileName.replace(/\\*/g, '.*'));
  }

  console.log('Waiting for download in "' + downloadPath + '"...');

  while (Date.now() - startTime < timeout) {
    try {
      const files = fs.readdirSync(downloadPath);
      const matchingFile = files.find(file => {
        if (exactMatch) {
          return file === fileName;
        }
        return pattern.test(file);
      });

      if (matchingFile) {
        console.log('✅ Download complete: ' + matchingFile);
        return path.join(downloadPath, matchingFile);
      }
    } catch (err) {
      // Folder might not exist yet, ignore
    }
    await new Promise(r => setTimeout(r, 1000)); // Poll every second
  }

  throw new Error('Download timed out after ' + (timeout / 1000) + 's');
}

// Run automation
(async () => {
  const runner = new AutomationRunner();
  await runner.runWorkflow();
})();`;
  };

  const generateSeleniumCode = () => {
    return `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time
import os
import json
import requests
import smtplib
import base64
from email.mime.text import MIMEText

# 🐍 Auto-generated Selenium Python Script
# Generated on: ${new Date().toISOString()}

def wait_for_download(download_path, filename, timeout=60):
    """Waits for a file to be downloaded to a specific folder."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            files = os.listdir(download_path)
            if filename in files:
                print(f"✅ Download complete: {filename}")
                return os.path.join(download_path, filename)
        except FileNotFoundError:
            # Folder might not exist yet, ignore
            pass
        time.sleep(1)  # Poll every second
    raise Exception(f"Download timed out after {timeout}s")

class AutomationRunner:
    def __init__(self):
        self.driver = None
        self.wait = None
        
    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        prefs = {
            "download.default_directory": os.path.abspath('./downloads'),
            "download.prompt_for_download": False
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 30)
        
    def run_automation(self):
        try:
            print("🚀 Starting Selenium automation...")
            self.setup_driver()
            
${workflow.map((step, index) => `            # Step ${index + 1}: ${step.name}
            ${generateSeleniumStepCode(step)}`).join('\n\n')}
            
            print("✅ Automation completed!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            self.driver.save_screenshot('error-screenshot.png')
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    runner = AutomationRunner()
    runner.run_automation()`;
  };

  const generatePlaywrightCode = () => {
    return `const { chromium } = require('playwright');

// 🎭 Auto-generated Playwright Script
// Generated on: ${new Date().toISOString()}

class AutomationRunner {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 Starting Playwright automation...');
    
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async runAutomation() {
    try {
      await this.initialize();
      
${workflow.map((step, index) => `      // Step ${index + 1}: ${step.name}
      ${generatePlaywrightStepCode(step)}`).join('\n\n')}
      
      console.log('✅ Automation completed!');
      
    } catch (error) {
      console.error('❌ Error:', error);
      await this.page.screenshot({ path: 'error-screenshot.png' });
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

(async () => {
  const runner = new AutomationRunner();
  await runner.runAutomation();
})();`;
  };

  const generateStepCode = (step) => {
    switch (step.type) {
      case 'navigate':
        return `console.log('🌐 Navigating to: ${step.config.url}');
      await this.page.goto('${step.config.url}', { waitUntil: 'networkidle2' });`;
      
      case 'wait-time':
        return `console.log('⏰ Waiting ${step.config.duration}ms');
      await new Promise(r => setTimeout(r, ${step.config.duration}));`;
      
      case 'click':
        return `console.log('🖱️ Clicking: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.click('${step.config.selector}');`;
      
      case 'type':
        return `console.log('⌨️ Typing into: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      ${step.config.clearFirst ? `await this.page.evaluate(sel => document.querySelector(sel).value = '', '${step.config.selector}');` : ''}
      await this.page.type('${step.config.selector}', '${step.config.text}');`;

      case 'wait-text':
        return `console.log('⏳ Waiting for text: "${step.config.expectedText}" in ${step.config.selector}');
      await this.page.waitForFunction(
        (selector, text, exact) => {
          const element = document.querySelector(selector);
          if (!element) return false;
          const content = element.textContent;
          return exact ? content === text : content.includes(text);
        },
        { timeout: ${step.config.timeout || 30000} },
        '${step.config.selector}',
        '${step.config.expectedText}',
        ${step.config.exact}
      );`;

      case 'wait-clickable':
        return `console.log('⏳ Waiting for element to be clickable: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}', { visible: true, timeout: ${step.config.timeout || 30000} });`;

      case 'wait-disappear':
        return `console.log('⏳ Waiting for element to disappear: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}', { hidden: true, timeout: ${step.config.timeout || 30000} });`;
      
      case 'download-verify':
        return `console.log('📥 Verifying download...');
      await waitForDownload('${step.config.downloadPath}', '${step.config.fileName}');`;
      
      case 'refresh':
        return `console.log('🔄 Refreshing page');
      await this.page.reload({ waitUntil: 'networkidle2' });`;

      case 'back':
        return `console.log('◀️ Going back');
      await this.page.goBack();`;

      case 'forward':
        return `console.log('▶️ Going forward');
      await this.page.goForward();`;

      case 'wait-page-load':
        return `console.log('⏳ Waiting for page to load...');
      await this.page.waitForNavigation({ waitUntil: '${step.config.waitFor || 'networkidle2'}', timeout: ${step.config.timeout || 30000} });`;

      case 'wait-download':
        return `console.log('⏳ Waiting for download...');
      await waitForDownload(
        '${step.config.downloadPath.replace(/\\/g, '\\\\')}',
        '${step.config.fileName}',
        ${step.config.timeout || 60000},
        ${step.config.exactMatch || false}
      );`;
      
      case 'new-tab':
        return `console.log('Opening new tab');
      const newPage = await this.browser.newPage();
      if ('${step.config.url}') {
        await newPage.goto('${step.config.url}');
      }
      if (${step.config.switchToTab}) {
        this.page = newPage;
      }`;

      case 'clear-type':
        return `console.log('⌨️ Clearing and typing into: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.evaluate(sel => document.querySelector(sel).value = '', '${step.config.selector}');
      await this.page.type('${step.config.selector}', '${step.config.text}');`;

      case 'select-dropdown':
        return `console.log('Selecting from dropdown: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.select('${step.config.selector}', '${step.config.value}');`;

      case 'upload-file':
        return `console.log('Uploading file: ${step.config.filePath}');
      const elementHandle = await this.page.$('${step.config.selector}');
      await elementHandle.uploadFile('${step.config.filePath}');`;

      case 'press-key':
        return `console.log('Pressing key: ${step.config.key}');
      await this.page.keyboard.press('${step.config.key}');`;

      case 'check-checkbox':
        return `console.log('${step.config.action} checkbox: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      const checkbox = await this.page.$('${step.config.selector}');
      const isChecked = await (await checkbox.getProperty('checked')).jsonValue();
      if ('${step.config.action}' === 'check' && !isChecked) {
        await checkbox.click();
      } else if ('${step.config.action}' === 'uncheck' && isChecked) {
        await checkbox.click();
      } else if ('${step.config.action}' === 'toggle') {
        await checkbox.click();
      }`;

      case 'radio-select':
        return `console.log('Selecting radio button: ${step.config.selector} with value ${step.config.value}');
        await this.page.evaluate((selector, value) => {
          const radioButtons = document.querySelectorAll(selector);
          for (const radio of radioButtons) {
            if (radio.value === value) {
              radio.click();
              break;
            }
          }
        }, '${step.config.selector}', '${step.config.value}');`;

      case 'download-trigger':
        return `console.log('Triggering download from: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.click('${step.config.selector}');`;

      case 'file-monitor':
        return `console.log('Monitoring file changes in: ${step.config.folderPath}');
      // This is a placeholder. File monitoring logic needs to be implemented.
      // You might need to use a library like 'chokidar' for this.
      console.log('File monitoring not implemented yet.');`;

      case 'cloud-upload':
        return `console.log('Uploading to cloud: ${step.config.localPath}');
      // This is a placeholder. Cloud upload logic needs to be implemented.
      console.log('Cloud upload not implemented yet.');`;

      case 'file-rename':
        return `console.log('Renaming file from ${step.config.currentPath} to ${step.config.newPath}');
      fs.renameSync('${step.config.currentPath}', '${step.config.newPath}');`;

      case 'file-move':
        return `console.log('Moving file from ${step.config.sourcePath} to ${step.config.destinationPath}');
      fs.renameSync('${step.config.sourcePath}', '${step.config.destinationPath}');`;

      case 'extract-table':
        return `console.log('Extracting table data from: ${step.config.selector}');
      const ${step.config.saveAs} = await this.page.evaluate((selector) => {
        const table = document.querySelector(selector);
        if (!table) return null;
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map(row => {
          const columns = Array.from(row.querySelectorAll('th, td'));
          return columns.map(column => column.innerText);
        });
      }, '${step.config.selector}');`;

      case 'extract-links':
        return `console.log('Extracting links from: ${step.config.selector}');
      const ${step.config.saveAs} = await this.page.evaluate((selector, attribute) => {
        const links = Array.from(document.querySelectorAll(selector));
        return links.map(link => link[attribute]);
      }, '${step.config.selector}', '${step.config.attribute}');`;

      case 'screenshot':
        return `console.log('Taking screenshot: ${step.config.fileName}');
      await this.page.screenshot({ path: '${step.config.fileName}', fullPage: ${step.config.fullPage} });`;

      case 'extract-images':
        return `console.log('Extracting images from: ${step.config.selector}');
      const ${step.config.saveAs} = await this.page.evaluate((selector, attribute) => {
        const images = Array.from(document.querySelectorAll(selector));
        return images.map(img => img[attribute]);
      }, '${step.config.selector}', '${step.config.attribute}');`;

      case 'pdf-generate':
        return `console.log('Generating PDF: ${step.config.fileName}');
      await this.page.pdf({ path: '${step.config.fileName}', format: 'A4' });`;

      case 'double-click':
        return `console.log('Double clicking: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.click('${step.config.selector}', { clickCount: 2 });`;

      case 'right-click':
        return `console.log('Right clicking: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.click('${step.config.selector}', { button: 'right' });`;

      case 'hover':
        return `console.log('Hovering over: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.hover('${step.config.selector}');`;

      case 'scroll':
        return `console.log('Scrolling ${step.config.direction} by ${step.config.amount}');
      await this.page.evaluate((direction, amount) => {
        if (direction === 'down') {
          window.scrollBy(0, amount);
        } else if (direction === 'up') {
          window.scrollBy(0, -amount);
        }
      }, '${step.config.direction}', ${step.config.amount});`;

      case 'focus':
        return `console.log('Focusing on: ${step.config.selector}');
      await this.page.waitForSelector('${step.config.selector}');
      await this.page.focus('${step.config.selector}');`;

      case 'condition':
        return `console.log('Evaluating condition: ${step.config.type}');
      // This is a placeholder. Conditional logic needs to be implemented.
      console.log('Conditional logic not implemented yet.');`;

      case 'loop':
        return `console.log('Starting loop: ${step.config.type}');
      // This is a placeholder. Loop logic needs to be implemented.
      console.log('Loop logic not implemented yet.');`;

      case 'try-catch':
        return `console.log('Starting try-catch block');
      // This is a placeholder. Try-catch logic needs to be implemented.
      console.log('Try-catch logic not implemented yet.');`;

      case 'break':
        return `console.log('Breaking loop');
      break;`;

      case 'variable-set':
        return `console.log('Setting variable: ${step.config.name}');
      const ${step.config.name} = '${step.config.value}';`;

      case 'variable-get':
        return `console.log('Getting variable: ${step.config.name}');
      // This is a placeholder. Variable getting logic needs to be implemented.
      console.log('Variable getting not implemented yet.');`;

      case 'javascript':
        return `console.log('Executing JavaScript');
      await this.page.evaluate(() => {
        ${step.config.code}
      });`;

      case 'api-call':
        return `console.log('Making API call to: ${step.config.url}');
      // This is a placeholder. API call logic needs to be implemented.
      console.log('API call logic not implemented yet.');`;

      case 'database':
        return `console.log('Executing database query');
      // This is a placeholder. Database logic needs to be implemented.
      console.log('Database logic not implemented yet.');`;

      case 'email':
        return `console.log('Sending email to: ${step.config.to}');
      // This is a placeholder. Email sending logic needs to be implemented.
      console.log('Email sending not implemented yet.');`;

      case 'send-notification':
        return `console.log('Sending notification: ${step.config.title}');
      // This is a placeholder. Notification logic needs to be implemented.
      console.log('Notification logic not implemented yet.');`;
      
      default:
        return `console.log('⚠️ Step ${step.type} - implement as needed');`;
    }
  };

  const generateSeleniumStepCode = (step) => {
    switch (step.type) {
      case 'navigate':
        return `print("🌐 Navigating to: ${step.config.url}")
            self.driver.get("${step.config.url}")`;
      case 'click':
        return `print("🖱️ Clicking: ${step.config.selector}")
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "${step.config.selector}")))
            element.click()`;
      case 'type':
        return `print("⌨️ Typing into: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            ${step.config.clearFirst ? 'element.clear()' : ''}
            element.send_keys("${step.config.text}")`;
      case 'refresh':
        return `print("🔄 Refreshing page")
            self.driver.refresh()`;
      case 'back':
        return `print("◀️ Going back")
            self.driver.back()`;
      case 'forward':
        return `print("▶️ Going forward")
            self.driver.forward()`;
      case 'new-tab':
        return `print("Opening new tab")
            self.driver.execute_script("window.open('${step.config.url}');")
            if ${step.config.switchToTab}:
                self.driver.switch_to.window(self.driver.window_handles[-1])`;
      case 'double-click':
        return `print("🖱️ Double clicking: ${step.config.selector}")
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "${step.config.selector}")))
            webdriver.ActionChains(self.driver).double_click(element).perform()`;
      case 'right-click':
        return `print("🖱️ Right clicking: ${step.config.selector}")
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "${step.config.selector}")))
            webdriver.ActionChains(self.driver).context_click(element).perform()`;
      case 'hover':
        return `print("🖱️ Hovering over: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            webdriver.ActionChains(self.driver).move_to_element(element).perform()`;
      case 'scroll':
        return `print("📜 Scrolling ${step.config.direction} by ${step.config.amount}px")
            self.driver.execute_script("window.scrollBy(${step.config.direction === 'left' ? -step.config.amount : step.config.direction === 'right' ? step.config.amount : 0}, ${step.config.direction === 'up' ? -step.config.amount : step.config.direction === 'down' ? step.config.amount : 0})")`;
      case 'focus':
        return `print("🎯 Focusing on: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            self.driver.execute_script("arguments[0].focus();", element)`;
      case 'clear-type':
        return `print("⌨️ Clearing and typing '${step.config.text}' into: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            element.clear()
            element.send_keys("${step.config.text}")`;
      case 'select-dropdown':
        return `print("⏬ Selecting '${step.config.value}' from dropdown: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            select = Select(element)
            if ${step.config.byValue}:
                select.select_by_value("${step.config.value}")
            else:
                select.select_by_visible_text("${step.config.value}")`;
      case 'upload-file':
        return `print("⬆️ Uploading file '${step.config.filePath}' to: ${step.config.selector}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            element.send_keys(os.path.abspath("${step.config.filePath}"))`;
      case 'press-key':
        return `print("🎹 Pressing key: ${step.config.key}")
            ActionChains(self.driver).send_keys(Keys.${step.config.key.toUpperCase()}).perform()`;
      case 'check-checkbox':
        return `print("☑️ Setting checkbox ${step.config.selector} to: ${step.config.action}")
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            is_checked = element.is_selected()
            action = "${step.config.action}"
            if action == "check" and not is_checked:
                element.click()
            elif action == "uncheck" and is_checked:
                element.click()
            elif action == "toggle":
                element.click()`;
      case 'radio-select':
        return `print("🔘 Selecting radio button ${step.config.selector} with value: ${step.config.value}")
            radios = self.driver.find_elements(By.CSS_SELECTOR, "${step.config.selector}")
            for radio in radios:
                if radio.get_attribute("value") == "${step.config.value}":
                    radio.click()
                    break`;
      case 'download-trigger':
        return `print("🔽 Triggering download from: ${step.config.selector}")
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "${step.config.selector}")))
            element.click()`;
      case 'download-verify':
        return `print("📥 Verifying download: ${step.config.fileName}")
            wait_for_download(os.path.abspath('${step.config.downloadPath}'), '${step.config.fileName}', ${step.config.timeout / 1000})`;
      case 'cloud-upload':
        return `print("☁️ Uploading to cloud: ${step.config.localPath}")
            # This is a placeholder. Cloud upload logic needs to be implemented.
            print("⚠️ Step cloud-upload - implement as needed")`;
      case 'file-rename':
        return `print("✍️ Renaming file from ${step.config.currentPath} to ${step.config.newPath}")
            os.rename("${step.config.currentPath}", "${step.config.newPath}")`;
      case 'file-move':
        return `print("🚚 Moving file from ${step.config.sourcePath} to ${step.config.destinationPath}")
            os.rename("${step.config.sourcePath}", "${step.config.destinationPath}")`;
      case 'extract-table':
        return `print(" extracting table data from: ${step.config.selector}")
            table = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))
            headers = [header.text for header in table.find_elements(By.TAG_NAME, "th")]
            rows = []
            for row in table.find_elements(By.TAG_NAME, "tr"):
                rows.append([cell.text for cell in row.find_elements(By.TAG_NAME, "td")])
            ${step.config.saveAs} = {"headers": headers, "rows": rows}
            print(f"Extracted table data and saved to '${step.config.saveAs}'")`;
      case 'extract-links':
        return `print(" extracting links from: ${step.config.selector}")
            elements = self.driver.find_elements(By.CSS_SELECTOR, "${step.config.selector}")
            ${step.config.saveAs} = [element.get_attribute("href") for element in elements]
            print(f"Extracted links and saved to '${step.config.saveAs}'")`;
      case 'screenshot':
        return `print("📸 Taking screenshot: ${step.config.fileName}")
            self.driver.save_screenshot("${step.config.fileName}")`;
      case 'extract-images':
        return `print("🖼️ Extracting images from: ${step.config.selector}")
            elements = self.driver.find_elements(By.CSS_SELECTOR, "${step.config.selector}")
            ${step.config.saveAs} = [element.get_attribute("src") for element in elements]
            print(f"Extracted image sources and saved to '${step.config.saveAs}'")`;
      case 'pdf-generate':
        return `print("📄 Generating PDF: ${step.config.fileName}")
            pdf_options = {
                'landscape': ${step.config.landscape || 'False'},
                'displayHeaderFooter': False,
                'printBackground': True,
                'preferCSSPageSize': True,
            }
            result = self.driver.execute_cdp_cmd("Page.printToPDF", pdf_options)
            with open("${step.config.fileName}", "wb") as f:
                f.write(base64.b64decode(result['data']))`;
      case 'javascript':
        return `print("Executing JavaScript...")
            ${step.config.saveAs ? `${step.config.saveAs} = ` : ''}self.driver.execute_script("""return ${step.config.code}""")`;
      case 'api-call':
        return `print("📞 Making API call to: ${step.config.url}")
            response = requests.request(
                "${step.config.method}",
                "${step.config.url}",
                headers=json.loads("""${step.config.headers || '{}'}"""),
                json=json.loads("""${step.config.body || '{}'}""")
            )
            ${step.config.saveAs} = response.json()
            print("API call successful, response stored in '${step.config.saveAs}'")`;
      case 'database':
        return `print("🗄️ Executing database query...")
            # This is a placeholder. You need to install the appropriate database driver (e.g., psycopg2 for PostgreSQL)
            # import psycopg2
            # conn = psycopg2.connect("${step.config.connectionString}")
            # cur = conn.cursor()
            # cur.execute("""${step.config.query}""", json.loads("""${JSON.stringify(step.config.parameters || {})}"""))
            # ${step.config.saveAs} = cur.fetchall()
            # cur.close()
            # conn.close()
            print("⚠️ Step database - implement with appropriate DB driver")`;
      case 'email':
        return `print("📧 Sending email to: ${step.config.to}")
            msg = MIMEText("""${step.config.message}""")
            msg['Subject'] = "${step.config.subject}"
            msg['From'] = "sender@example.com"  # Replace with your email
            msg['To'] = "${step.config.to}"
            # This is a placeholder for SMTP. Configure your SMTP server details.
            # with smtplib.SMTP('smtp.example.com', 587) as server:
            #     server.starttls()
            #     server.login('your_email', 'your_password')
            #     server.send_message(msg)
            print("⚠️ Step email - implement with your SMTP details")`;
      case 'send-notification':
        return `print(f"🔔 NOTIFICATION [${step.config.type.toUpperCase()}]: ${step.config.title} - ${step.config.message}")`;
      case 'condition':
        return `print("❓ Evaluating condition...")
            # Implement your condition logic here. For example:
            # if self.driver.find_element(By.CSS_SELECTOR, "${step.config.selector}").text == "${step.config.value}":
            #     print("Condition met!")
            # else:
            #     print("Condition not met!")
            print("⚠️ Step condition - implement as needed")`;
      case 'loop':
        return `print("🔄 Starting loop...")
            # Implement your loop logic here. For example, for a count loop:
            # for i in range(${step.config.count || 1}):
            #     print(f"Loop iteration {i + 1}")
            #     # Add your repeated steps here
            print("⚠️ Step loop - implement as needed")`;
      case 'break':
        return `print("🛑 Breaking from loop")
            break`;
      case 'variable-set':
        return `print("✍️ Setting variable '${step.config.name}'")
            ${step.config.name} = "${step.config.value}"`;
      case 'variable-get':
        return `print("📥 Getting variable '${step.config.name}' and saving to '${step.config.saveAs}'")
            ${step.config.saveAs} = ${step.config.name}`;
      case 'wait-time':
        return `print("⏰ Waiting ${step.config.duration}ms")
            time.sleep(${step.config.duration / 1000})`;
      case 'wait-disappear':
        return `print("⏳ Waiting for element to disappear: ${step.config.selector}")
            self.wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, "${step.config.selector}")))`;
      case 'wait-text':
        return `print("⏳ Waiting for text: '${step.config.expectedText}' in ${step.config.selector}")
            self.wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, "${step.config.selector}"), "${step.config.expectedText}"))`;
      case 'wait-clickable':
        return `print("⏳ Waiting for element to be clickable: ${step.config.selector}")
            self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "${step.config.selector}")))`;
      case 'wait-page-load':
        return `print("⏳ Waiting for page to load...")
            # Selenium's get command implicitly waits for page load, so this is mostly for logging.`;
      case 'wait-download':
        return `print("⏳ Waiting for download...")
            # Implement your download verification logic here`;
      default:
        return `print("⚠️ Step ${step.type} - implement as needed")`;
    }
  };

  const generatePlaywrightStepCode = (step) => {
    switch (step.type) {
      case 'navigate':
        return `console.log('🌐 Navigating to: ${step.config.url}');
      await this.page.goto('${step.config.url}');`;
      case 'click':
        return `console.log('🖱️ Clicking: ${step.config.selector}');
      await this.page.click('${step.config.selector}');`;
      case 'type':
        return `console.log('⌨️ Typing into: ${step.config.selector}');
      ${step.config.clearFirst ? `await this.page.fill('${step.config.selector}', '');` : ''}
      await this.page.type('${step.config.selector}', '${step.config.text}');`;
      default:
        return `console.log('⚠️ Step ${step.type} - implement as needed');`;
    }
  };

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
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Code downloaded successfully!');
  };

  const tabs = [
    { id: 'puppeteer', name: 'Puppeteer', icon: Code, color: 'from-green-500 to-blue-500' },
    { id: 'selenium', name: 'Selenium', icon: Terminal, color: 'from-yellow-500 to-orange-500' },
    { id: 'playwright', name: 'Playwright', icon: FileCode, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Generated Code</h2>
              <p className="text-blue-100">Ready-to-run automation script</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </motion.button>
            
            <motion.button
              className="glass px-4 py-2 rounded-lg hover:bg-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCode}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            
            <motion.button
              className="glass px-4 py-2 rounded-lg hover:bg-green-500/20 hover:border-green-400/50 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTestRunner(true)}
            >
              <Play className="w-4 h-4" />
              Test Run
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
        {showTestRunner && (
          <TestRunner
            code={generateCode(activeTab)}
            language={activeTab === 'selenium' ? 'python' : 'javascript'}
            onClose={() => setShowTestRunner(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default CodeModal;
