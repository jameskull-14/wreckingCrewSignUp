import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/Tabs.js";
import EventSettingsPanel from "../panels/event-settings/EventSettingsPanel.js";
import OverviewPanel from "../panels/overview/OverviewPanel.js";
import SongDatabasePanel from "../panels/song-database/SongDatabasePanel.js";
import { AdminControlPanelProps } from "../../../types/componentTypes/AdminControlPanelProps.js";


export default function NavigationContent({
    adminSettings,
    onUpdateAdminSettings
}: AdminControlPanelProps) {

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 border border-amber-400/30">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Event Settings</TabsTrigger>
                <TabsTrigger value="database">Song Database</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <OverviewPanel />
            </TabsContent>

            <TabsContent value="settings">
                <EventSettingsPanel 
                    adminSettings = {adminSettings}
                    onUpdateAdminSettings = {onUpdateAdminSettings}
                />
            </TabsContent>

            <TabsContent value="database">
                <SongDatabasePanel />
            </TabsContent>
        </Tabs>
    );
}