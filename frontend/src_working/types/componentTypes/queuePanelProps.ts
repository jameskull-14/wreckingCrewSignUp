import { AdminUserSetting } from "../apiTypes/adminUserSetting";
import { Performer } from "../apiTypes/performer";
import { PerformerSongSelection } from "../apiTypes/performerSongSelection";

export interface QueuePanelInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null
    performer: Performer
    performerSongSelections: PerformerSongSelection[]
    onEdit?: () => void
}