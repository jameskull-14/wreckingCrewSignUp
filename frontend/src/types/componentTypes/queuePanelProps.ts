import { AdminUserSetting } from "../apiTypes/adminUserSetting";
import { Performer } from "../apiTypes/performer";
import { PerformerSongSelection } from "../apiTypes/performerSongSelection";
import { Session } from "../apiTypes/session";

export interface QueuePanelInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null
    performer: Performer | null
    performerSongSelections: PerformerSongSelection[]
    onEdit?: () => void
    queueNumber: number
    timeSlotStart?: string
    timeSlotEnd?: string
    session: Session | null
    sessionId: string
    performers: Performer[]
    onPerformerCreated?: () => void
}