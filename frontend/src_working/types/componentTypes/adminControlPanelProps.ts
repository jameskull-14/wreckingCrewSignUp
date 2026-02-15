import { AdminUserSettingUpdate } from "../apiTypes/adminUserSetting";


export interface AdminControlPanelProps {
    adminSettings: AdminUserSettingUpdate | null;
    onUpdateAdminSettings: (settings: AdminUserSettingUpdate) => void;
}

