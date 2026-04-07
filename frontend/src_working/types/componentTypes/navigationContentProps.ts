import { AdminUser } from "../apiTypes/adminUser";
import { AdminUserSetting, AdminUserSettingUpdate } from "../apiTypes/adminUserSetting";
import { Session } from "../apiTypes/session";

// Base props for components that need admin settings but not session state
// Used by NavigationContent, EventSettingsPanel, SessionModePanel, etc.
export interface SettingsPanelBaseProps {
    adminSettings: AdminUserSetting | null;
    onUpdateAdminSettings: (settings: AdminUserSettingUpdate) => void;
    adminInfo: AdminUser;
    activeSession?: Session | null;
}

// NavigationContent props - includes session launch trigger and active session
export interface NavigationContentProps extends SettingsPanelBaseProps {
    sessionLaunchTrigger?: number;
    activeSession?: Session | null;
}
