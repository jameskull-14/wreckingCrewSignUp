import { AdminUser } from "../apiTypes/adminUser";
import { AdminUserSetting, AdminUserSettingUpdate } from "../apiTypes/adminUserSetting";

// Base props for components that need admin settings but not session state
// Used by NavigationContent, EventSettingsPanel, SessionModePanel, etc.
export interface SettingsPanelBaseProps {
    adminSettings: AdminUserSetting | null;
    onUpdateAdminSettings: (settings: AdminUserSettingUpdate) => void;
    adminInfo: AdminUser;
}

// Alias for backward compatibility
export interface NavigationContentProps extends SettingsPanelBaseProps {}
