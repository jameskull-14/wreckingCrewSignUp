import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/Tabs.js";
import EventSettingsPanel from "../panels/event-settings/EventSettingsPanel.js";
import OverviewPanel from "../panels/overview/OverviewPanel.js";
import SongDatabasePanel from "../panels/song-database/SongDatabasePanel.js";
import { NavigationContentProps } from "../../../types/componentTypes/navigationContentProps.js";
import ExportPanel from "../panels/export/export-panel.js";


export default function NavigationContent({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo,
    sessionLaunchTrigger,
    activeSession
}: NavigationContentProps) {

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 border border-amber-400/30">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Event Settings</TabsTrigger>
                <TabsTrigger value="database">Session Songs</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <OverviewPanel />
            </TabsContent>

            <TabsContent value="settings">
                <EventSettingsPanel
                    adminSettings = {adminSettings}
                    onUpdateAdminSettings = {onUpdateAdminSettings}
                    adminInfo = {adminInfo}
                />
            </TabsContent>

            <TabsContent value="database">
                <SongDatabasePanel
                    adminInfo={adminInfo}
                    sessionLaunchTrigger={sessionLaunchTrigger}
                    activeSession={activeSession}
                />
            </TabsContent>

            <TabsContent value="export">
                <ExportPanel />
            </TabsContent>
        </Tabs>
    );
}