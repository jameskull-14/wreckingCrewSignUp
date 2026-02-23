import { AdminUserSetting } from "../apiTypes/adminUserSetting";

export interface QueuePanelInterface{
    pageView: string,
    adminSettings: AdminUserSetting | null
}