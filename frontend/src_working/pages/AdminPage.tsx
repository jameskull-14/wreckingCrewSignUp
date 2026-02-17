import { useEffect, useState } from "react"
import AdminControlPanel from "../components/admin-control-panel/AdminControlPanel.js"
import { Music, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSetting, AdminUserSettingUpdate } from "../types/apiTypes/adminUserSetting.js";

export default function AdminPage ({ adminInfo }: { adminInfo: AdminUser }) {
    const [adminSettings, setAdminSettings] = useState<AdminUserSetting | null>(null);
    const [adminData, setAdminData] = useState<AdminUser | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try{
                const settingsRes = await fetch(`api/admin-user-settings?admin_user_id=${adminInfo.admin_user_id}`);
                const settings = await settingsRes.json();

                console.log('Settings response:', settings);
                console.log('Is array?', Array.isArray(settings));
                console.log('First element:', settings[0]);

                // API returns array, take first element
                const adminSetting = Array.isArray(settings) && settings.length > 0 ? settings[0] : null;
                console.log('Setting adminSettings to:', adminSetting);
                setAdminSettings(adminSetting);
                setAdminData(adminInfo);
            }
            catch(error){
                console.error('Failed to load Admin data: ', error);
            }
        };
        loadData();
    }, [adminInfo.admin_user_id])

    const updateAdminSettings = async(newSettings: AdminUserSettingUpdate) => {
        if (!adminSettings?.admin_setting_id) {
            console.error('No admin_setting_id found');
            return;
        }

        await fetch(`api/admin-user-settings/${adminSettings.admin_setting_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newSettings)
        });

        // Merge the update with existing settings
        setAdminSettings(prev => prev ? { ...prev, ...newSettings } : null);
    }


    const displayTitle = "Karaoke Live";

    return(
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600')] bg-cover bg-center opacity-5" />
            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                            <Music className="w-8 h-8 text-gray-900" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            {displayTitle}
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <p className="text-amber-200/80 text-lg">Sign up • Sing • Shine</p>
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        </div>

                        <div className="flex justify-center items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="text-amber-300 font-semibold">Admin: {adminData?.first_name || "Unkown User"}</span>
                            </div>
                        </div>
                    </motion.div>
                    <AdminControlPanel 
                        adminSettings = {adminSettings}
                        onUpdateAdminSettings={updateAdminSettings}
                        adminInfo = {adminInfo}
                    />
                </div>
            </div>
        </div>
    );
}
