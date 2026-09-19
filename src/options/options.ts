import { getSettings, setSettings } from '@shared/storage'
import { applyStaticTranslations, translate } from '@shared/i18n'
import { hostToMatchPattern } from '@shared/host'
import type { Language } from '@shared/types'

const addHostForm = document.getElementById('add-host-form') as HTMLFormElement
const hostInput = document.getElementById('host-input') as HTMLInputElement
const hostError = document.getElementById('host-error') as HTMLParagraphElement
const hostList = document.getElementById('host-list') as HTMLUListElement
const retentionInput = document.getElementById('retention-input') as HTMLInputElement
const languageSelect = document.getElementById('language-select') as HTMLSelectElement

// Cho phep: domain thuong (example.com), localhost, IPv4, va tuy chon co
// port (vd: localhost:9443, 127.0.0.1:8080, example.com:3000).
const HOSTNAME_RE = /^(localhost|(?:\d{1,3}\.){3}\d{1,3}|(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,})(:\d{1,5})?$/i

let currentLanguage: Language = 'vi'
const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>): string => translate(currentLanguage, key, vars)

function normalizeHost(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

async function renderHosts(): Promise<void> {
  const settings = await getSettings()
  hostList.innerHTML = ''
  retentionInput.value = String(settings.retentionDays)
  currentLanguage = settings.language
  languageSelect.value = settings.language
  applyStaticTranslations(currentLanguage)

  for (const host of settings.allowedHosts) {
    const item = document.createElement('li')
    item.innerHTML = `<span>${host}</span><button data-host="${host}">${t('options.delete')}</button>`
    item.querySelector('button')?.addEventListener('click', async () => {
      await removeHost(host)
    })
    hostList.appendChild(item)
  }
}

async function removeHost(host: string): Promise<void> {
  if (!confirm(t('options.confirmRemoveHost', { host }))) return

  const settings = await getSettings()
  settings.allowedHosts = settings.allowedHosts.filter((h) => h !== host)
  await setSettings(settings)
  await chrome.permissions.remove({ origins: [hostToMatchPattern(host)] }).catch(() => {})
  await renderHosts()
}

addHostForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  hostError.textContent = ''
  const host = normalizeHost(hostInput.value)

  if (!HOSTNAME_RE.test(host)) {
    hostError.textContent = t('options.domainInvalid')
    return
  }

  const settings = await getSettings()
  if (settings.allowedHosts.includes(host)) {
    hostError.textContent = t('options.domainExists')
    return
  }

  const granted = await chrome.permissions.request({ origins: [hostToMatchPattern(host)] })
  if (!granted) {
    hostError.textContent = t('options.permissionDenied')
    return
  }

  settings.allowedHosts.push(host)
  await setSettings(settings)
  hostInput.value = ''
  await renderHosts()
})

retentionInput.addEventListener('change', async () => {
  const settings = await getSettings()
  const value = Number(retentionInput.value)
  settings.retentionDays = Number.isFinite(value) && value > 0 ? value : settings.retentionDays
  await setSettings(settings)
})

languageSelect.addEventListener('change', async () => {
  const settings = await getSettings()
  settings.language = languageSelect.value === 'en' ? 'en' : 'vi'
  await setSettings(settings)
  await renderHosts()
})

void renderHosts()
