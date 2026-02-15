import React, { useEffect, useState } from "react"
import AdminControlPanel from "../components/admin-control-panel/AdminControlPanel.js"
import { Music, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSettingUpdate } from "../types/apiTypes/adminUserSetting.js";

export default function AdminPage () {
    const [adminSettings, setAdminSettings] = useState<AdminUserSettingUpdate | null>(null);

    useEffect(() => {
        // get admin user settings
        fetch('api/admin/settings')
        .then(res => res.json())
        .then(data => setAdminSettings(data))
    },[])

    const updateAdminSettings = async(newSettings: AdminUserSettingUpdate) => {
        await fetch('api/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(newSettings)
        });
        setAdminSettings(newSettings);
    }


    const displayTitle = "Live Karaoke Night";

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
                                <span className="text-amber-300 font-semibold">Admin: James</span>
                            </div>
                        </div>
                    </motion.div>
                    <AdminControlPanel 
                        adminSettings = {adminSettings}
                        onUpdateAdminSettings={updateAdminSettings}
                    />
                </div>
            </div>
        </div>
    );
}
