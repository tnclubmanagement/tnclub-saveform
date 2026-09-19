import contentScriptPath from '../content/content-script.ts?script'
import { getAllSnapshots, getSettings } from '@shared/storage'
import { hostToMatchPattern } from '@shared/host'

const CONTENT_SCRIPT_ID = 'saveform-content-script'
const CLEANUP_ALARM = 'saveform-cleanup'

/** Dang ky lai content script cho dung danh sach host hien duoc phep. */
async function syncContentScripts(): Promise<void> {
  const settings = await getSettings()
  await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] }).catch(() => {})

  if (settings.allowedHosts.length === 0) return

  await chrome.scripting.registerContentScripts([
    {
      id: CONTENT_SCRIPT_ID,
      js: [contentScriptPath],
      matches: settings.allowedHosts.map(hostToMatchPattern),
      runAt: 'document_idle',
    },
  ])
}

async function cleanupOldSnapshots(): Promise<void> {
  const settings = await getSettings()
  const maxAgeMs = settings.retentionDays * 24 * 60 * 60 * 1000
  const now = Date.now()
  const snapshots = await getAllSnapshots()

  const staleKeys = Object.entries(snapshots)
    .filter(([, snapshot]) => now - snapshot.updatedAt > maxAgeMs)
    .map(([key]) => key)

  if (staleKeys.length > 0) {
    await chrome.storage.local.remove(staleKeys)
  }
}

chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})

chrome.runtime.onInstalled.addListener(() => {
  void syncContentScripts()
  chrome.alarms.create(CLEANUP_ALARM, { periodInMinutes: 60 * 24 })
})

chrome.runtime.onStartup.addListener(() => {
  void syncContentScripts()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CLEANUP_ALARM) {
    void cleanupOldSnapshots()
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes['saveform:settings']) {
    void syncContentScripts()
  }
})
