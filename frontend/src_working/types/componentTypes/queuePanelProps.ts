import { AdminUserSetting } from "../apiTypes/adminUserSetting";
import { Performer } from "../apiTypes/performer";

export interface QueuePanelInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null
    performer: Performer
}