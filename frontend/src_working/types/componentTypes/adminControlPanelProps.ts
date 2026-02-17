import { AdminUser } from "../apiTypes/adminUser";
import { AdminUserSetting, AdminUserSettingUpdate } from "../apiTypes/adminUserSetting";


export interface AdminControlPanelProps {
    adminSettings: AdminUserSetting | null;
    onUpdateAdminSettings: (settings: AdminUserSettingUpdate) => void;
    adminInfo: AdminUser
}

