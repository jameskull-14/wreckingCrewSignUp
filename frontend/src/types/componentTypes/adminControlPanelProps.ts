import { AdminUser } from "../apiTypes/adminUser";
import { AdminUserSetting, AdminUserSettingUpdate } from "../apiTypes/adminUserSetting";
import { Session } from "../apiTypes/session";

export interface AdminControlPanelProps {
    adminSettings: AdminUserSetting | null;
    onUpdateAdminSettings: (settings: AdminUserSettingUpdate) => void;
    adminInfo: AdminUser;
    activeSession: Session | null;
    setActiveSession: (session: Session | null) => void; 
}

