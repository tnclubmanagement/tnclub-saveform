import { getAllSnapshots, getSettings, getVersions, removeSnapshot, setSettings, setVersions } from '@shared/storage'
import { applyStaticTranslations, translate } from '@shared/i18n'
import { STORAGE_KEYS, versionListKey, type FieldValue, type FormVersion, type Language } from '@shared/types'

const statusEl = document.getElementById('status') as HTMLParagraphElement
const listEl = document.getElementById('snapshot-list') as HTMLUListElement
const formsContainerEl = document.getElementById('forms-container') as HTMLDivElement
const openOptionsEl = document.getElementById('open-options') as HTMLAnchorElement
const autoSaveToggleEl = document.getElementById('autosave-toggle') as HTMLInputElement
const reloadFormsEl = document.getElementById('reload-forms') as HTMLButtonElement
const currentPageEl = document.getElementById('current-page') as HTMLDivElement

let currentLanguage: Language = 'vi'
const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>): string => translate(currentLanguage, key, vars)

async function initSettingsDependentUi(): Promise<void> {
  const settings = await getSettings()
  autoSaveToggleEl.checked = settings.autoSaveEnabled
  currentLanguage = settings.language
  applyStaticTranslations(currentLanguage)
}

autoSaveToggleEl.addEventListener('change', async () => {
  const settings = await getSettings()
  settings.autoSaveEnabled = autoSaveToggleEl.checked
  await setSettings(settings)
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[STORAGE_KEYS.settings]) {
    void initSettingsDependentUi().then(() => render())
  }
})

void initSettingsDependentUi().then(() => render())

interface FormInfo {
  formSelector: string
  fieldCount: number
}

interface TabInfo {
  tabId: number
  hostname: string
  pathname: string
}

openOptionsEl.addEventListener('click', (event) => {
  event.preventDefault()
  chrome.runtime.openOptionsPage()
})

async function currentTabInfo(): Promise<TabInfo | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url) return undefined
  const url = new URL(tab.url)
  return { tabId: tab.id, hostname: url.hostname, pathname: url.pathname }
}

/** Danh sách form đang có trên tab hiện tại, hỏi qua content script. Rỗng nếu chưa có quyền/content script. */
async function listFormsOnTab(tabId: number): Promise<FormInfo[]> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'saveform:list-forms' })
    return (response?.forms as FormInfo[] | undefined) ?? []
  } catch {
    return []
  }
}

async function getFieldsFromTab(tabId: number, formSelector: string): Promise<FieldValue[]> {
  const response = await chrome.tabs.sendMessage(tabId, { type: 'saveform:get-fields', formSelector })
  return (response?.fields as FieldValue[] | undefined) ?? []
}

async function applyFieldsToTab(tabId: number, formSelector: string, fields: FieldValue[]): Promise<void> {
  await chrome.tabs.sendMessage(tabId, { type: 'saveform:apply-fields', formSelector, fields })
}

/**
 * Cap nhat de lai fields + thoi gian cua mot phien ban da co (giu nguyen id va ten).
 * Tra ve false (khong luu) neu doc duoc 0 field - tranh ghi de mot phien ban dang
 * co du lieu that bang du lieu rong do loi tam thoi (content script chua san sang,
 * sai tab, v.v.).
 */
async function overwriteVersion(tabInfo: TabInfo, form: FormInfo, key: string, versions: FormVersion[], versionId: string): Promise<boolean> {
  const fields = await getFieldsFromTab(tabInfo.tabId, form.formSelector)
  if (fields.length === 0) return false

  const updated = versions.map((v): FormVersion => (v.id === versionId ? { ...v, fields, savedAt: Date.now() } : v))
  await setVersions(key, updated)
  return true
}

function renderVersionItem(tabInfo: TabInfo, form: FormInfo, key: string, versions: FormVersion[], version: FormVersion): HTMLLIElement {
  const item = document.createElement('li')
  const saved = new Date(version.savedAt).toLocaleString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US')
  item.innerHTML = `
    <div class="version-info">
      <span class="version-name">${escapeHtml(version.name)}</span>
      <span class="version-time">${saved} · ${t('sidepanel.versionFieldCount', { count: version.fields.length })}</span>
    </div>
    <div class="version-actions">
      <button class="icon-btn icon-btn-restore" type="button" title="${t('sidepanel.restoreVersion.title')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 14 4 9 9 4" />
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
      </button>
      <button class="icon-btn icon-btn-overwrite" type="button" title="${t('sidepanel.overwriteVersion.title')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>
      <button class="icon-btn icon-btn-remove" type="button" title="${t('sidepanel.deleteVersion.title')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  `

  item.querySelector('.icon-btn-restore')?.addEventListener('click', async () => {
    await applyFieldsToTab(tabInfo.tabId, form.formSelector, version.fields)
  })

  const overwriteBtn = item.querySelector('.icon-btn-overwrite') as HTMLButtonElement
  overwriteBtn.addEventListener('click', async () => {
    overwriteBtn.disabled = true
    try {
      const ok = await overwriteVersion(tabInfo, form, key, versions, version.id)
      if (!ok) {
        alert(t('sidepanel.noFieldsToSave'))
        return
      }
      void render()
    } finally {
      overwriteBtn.disabled = false
    }
  })

  item.querySelector('.icon-btn-remove')?.addEventListener('click', async () => {
    if (!confirm(t('sidepanel.confirmDeleteVersion', { name: version.name }))) return

    await setVersions(
      key,
      versions.filter((v) => v.id !== version.id),
    )
    void render()
  })

  return item
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function renderFormBlock(tabInfo: TabInfo, form: FormInfo, versions: FormVersion[]): HTMLDivElement {
  const key = versionListKey(tabInfo.hostname, tabInfo.pathname, form.formSelector)
  const block = document.createElement('div')
  block.className = 'form-block'
  block.innerHTML = `
    <p class="form-block-title">${t('sidepanel.formFieldCount', { count: form.fieldCount })}</p>
    <div class="save-version-row">
      <input type="text" class="version-name-input" placeholder="${t('sidepanel.versionNamePlaceholder')}" />
      <button class="btn btn-primary save-version-btn">${t('sidepanel.save')}</button>
    </div>
    <p class="hint overwrite-hint" style="display: none"></p>
    <ul class="version-list"></ul>
  `

  const nameInput = block.querySelector('.version-name-input') as HTMLInputElement
  const saveBtn = block.querySelector('.save-version-btn') as HTMLButtonElement
  const overwriteHintEl = block.querySelector('.overwrite-hint') as HTMLParagraphElement
  const versionListEl = block.querySelector('.version-list') as HTMLUListElement

  for (const version of versions) {
    versionListEl.appendChild(renderVersionItem(tabInfo, form, key, versions, version))
  }

  const findMatchingVersion = (name: string): FormVersion | undefined =>
    versions.find((v) => v.name.trim().toLowerCase() === name.trim().toLowerCase())

  const updateSaveButtonMode = (): void => {
    const match = findMatchingVersion(nameInput.value)
    saveBtn.textContent = match ? t('sidepanel.overwrite') : t('sidepanel.save')
    overwriteHintEl.style.display = match ? '' : 'none'
    overwriteHintEl.textContent = match ? t('sidepanel.overwriteHint', { name: match.name }) : ''
  }

  const submitVersion = async (): Promise<void> => {
    const name = nameInput.value.trim()
    if (!name) {
      nameInput.focus()
      return
    }

    saveBtn.disabled = true
    try {
      const existing = findMatchingVersion(name)
      if (existing) {
        const ok = await overwriteVersion(tabInfo, form, key, versions, existing.id)
        if (!ok) {
          alert(t('sidepanel.noFieldsToSave'))
          return
        }
      } else {
        const fields = await getFieldsFromTab(tabInfo.tabId, form.formSelector)
        if (fields.length === 0) {
          alert(t('sidepanel.noFieldsToSave'))
          return
        }
        const newVersion: FormVersion = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          fields,
          savedAt: Date.now(),
        }
        await setVersions(key, [...versions, newVersion])
      }
      void render()
    } finally {
      saveBtn.disabled = false
    }
  }

  saveBtn.addEventListener('click', () => void submitVersion())
  nameInput.addEventListener('input', updateSaveButtonMode)
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') void submitVersion()
  })

  return block
}

/**
 * Token tang dan de tranh 2 lan render bi chong cheo: moi lan render() duoc
 * goi (tu bam nut hoac tu chrome.storage.onChanged), mot token moi duoc phat.
 * Render nao khong con giu token moi nhat se tu huy sau moi buoc await, tranh
 * viec 2 lan render cung ghi vao DOM va tao ra dong bi nhan doi.
 */
let renderToken = 0

async function renderVersionsSection(tabInfo: TabInfo, token: number): Promise<void> {
  const forms = await listFormsOnTab(tabInfo.tabId)
  if (token !== renderToken) return

  formsContainerEl.innerHTML = ''

  if (forms.length === 0) {
    formsContainerEl.innerHTML = `<p class="hint">${t('sidepanel.noFormsFound')}</p>`
    return
  }

  for (const form of forms) {
    const key = versionListKey(tabInfo.hostname, tabInfo.pathname, form.formSelector)
    const versions = await getVersions(key)
    if (token !== renderToken) return
    formsContainerEl.appendChild(renderFormBlock(tabInfo, form, versions))
  }
}

async function renderSnapshots(tabInfo: TabInfo | undefined): Promise<void> {
  // Khong xac dinh duoc tab hien tai (vd domain chua duoc allow) -> KHONG hien
  // ban nhap cua bat ky domain nao, tranh lo du lieu cua domain khac.
  if (!tabInfo) {
    statusEl.textContent = t('sidepanel.noActiveTab')
    listEl.innerHTML = ''
    return
  }

  const allSnapshots = await getAllSnapshots()
  const entries = Object.entries(allSnapshots).filter(([, snapshot]) => snapshot.hostname === tabInfo.hostname)

  if (entries.length === 0) {
    statusEl.textContent = t('sidepanel.noDraftsYet')
    listEl.innerHTML = ''
    return
  }

  statusEl.textContent = t('sidepanel.draftCount', { count: entries.length })
  listEl.innerHTML = ''

  for (const [key, snapshot] of entries) {
    const item = document.createElement('li')
    const updated = new Date(snapshot.updatedAt).toLocaleString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US')
    item.innerHTML = `
      <span>${escapeHtml(t('sidepanel.draftItem', { path: snapshot.pathname, count: snapshot.fields.length, time: updated }))}</span>
      <button class="pill-btn remove">${t('sidepanel.delete')}</button>
    `
    item.querySelector('button')?.addEventListener('click', async () => {
      if (!confirm(t('sidepanel.confirmDeleteDraft', { path: snapshot.pathname }))) return

      await removeSnapshot(key)
      void render()
    })
    listEl.appendChild(item)
  }
}

/** Hien ro domain + path cua tab dang xem, de nguoi dung biet chac du lieu dang hien la cua trang nao. */
function renderCurrentPageIndicator(tabInfo: TabInfo | undefined): void {
  currentPageEl.innerHTML = `
    <span class="current-page-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </span>
    <span class="current-page-text">${tabInfo ? escapeHtml(`${tabInfo.hostname}${tabInfo.pathname}`) : t('sidepanel.noActiveTab')}</span>
  `
}

async function render(): Promise<void> {
  const token = ++renderToken
  const tabInfo = await currentTabInfo()
  if (token !== renderToken) return
  renderCurrentPageIndicator(tabInfo)

  await renderSnapshots(tabInfo)
  if (token !== renderToken) return

  if (tabInfo) {
    await renderVersionsSection(tabInfo, token)
  } else {
    // Khong xac dinh duoc tab -> xoa noi dung cu, tranh de lai du lieu cua
    // lan render truoc (domain khac) gay hieu nham la domain nay cung co du lieu.
    formsContainerEl.innerHTML = `<p class="hint">${t('sidepanel.noActiveTab')}</p>`
  }
}

/** Cho phep nguoi dung chu dong bam tai lai danh sach form/phien ban, phong khi
 * content script chua kip san sang hoac danh sach chua tu cap nhat kip. */
reloadFormsEl.addEventListener('click', async () => {
  reloadFormsEl.disabled = true
  reloadFormsEl.classList.add('spinning')
  try {
    await render()
  } finally {
    reloadFormsEl.disabled = false
    reloadFormsEl.classList.remove('spinning')
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return
  const touched = Object.keys(changes).some(
    (key) => key.startsWith(STORAGE_KEYS.snapshotPrefix) || key.startsWith(STORAGE_KEYS.versionPrefix),
  )
  if (touched) void render()
})

chrome.tabs.onActivated.addListener(() => void render())
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status === 'complete') void render()
})
