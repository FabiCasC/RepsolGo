import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const NOTIF_PERMISSION_KEY = 'notif_permission_granted'

export const NotificationsService = {
  async requestPermissions(): Promise<boolean> {
    const perms = await Notifications.requestPermissionsAsync()
    const granted = (perms as unknown as { granted: boolean }).granted ?? false
    try {
      await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, granted ? 'true' : 'false')
    } catch {}
    return granted
  },

  async hasPermission(): Promise<boolean> {
    const perms = await Notifications.getPermissionsAsync()
    return (perms as unknown as { granted: boolean }).granted ?? false
  },

  async scheduleLocalNotification(title: string, body: string): Promise<void> {
    const hasPerms = await this.hasPermission()
    if (!hasPerms) return
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    })
  },

  async getStoredPreference(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(NOTIF_PERMISSION_KEY)
      return val === 'true'
    } catch {
      return false
    }
  },

  async setStoredPreference(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, enabled ? 'true' : 'false')
    } catch {}
  },
}
