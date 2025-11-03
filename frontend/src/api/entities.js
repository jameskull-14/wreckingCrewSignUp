import { base44 } from './base44Client';
import { Song as LocalSong, AdminTimeSlot as LocalAdminTimeSlot } from './localClient';

export const Song = LocalSong;
export const AdminTimeSlot = LocalAdminTimeSlot;

//Change this soon. All below is based off base44 APIs
//Temporary: Stub entities to remove Base44 auth requirement
// TODO: Implement backend endpoints and proper API clients for these

const createStubEntity = (entityName) => ({
    list: async () => {
        console.warn(`${entityName}.list() called - stub implementation`);
        return [];
    },
    filter: async() => {
        console.warn(`${entityName}.filter() called - stub implementation`);
        return [];
    },
    get: async(id) => {
        console.warn(`${entityName}.get(${id} called - stub implementation)`);
        return null;
    },
    create: async(data) => {
        console.warn(`${entityName}.create() called - stub implementation`, data);
        return { id: Math.random().toString(36).substring(2,9), ...data };
    },
    bulkCreate: async(data) => {
        console.warn(`#{entityName}.bulkCreate() called - stub implementation`);
        return data.map((item, i) => ({ id: `${i}-${Math.random().toString(36).substring(2,9)}`, ...item}));
    },
    update: async(id, data) => {
        console.warn(`${entityName}.update(${id}) called - stub implementation`, data);
        return { id, ...data};
    },
    delete: async(id) => {
        console.warn(`${entityName}.delete(${id}) called - stub implementation`);
        return null;
    }
});

export const Configuration = createStubEntity('Configuration');
export const TimeSlot = createStubEntity('TimeSlot');
export const AdminSession = createStubEntity('AdminSession');
export const AdminSongSelection = createStubEntity('AdminSongSelection');
export const QueueEntry = createStubEntity('QueueEntry');

export const User = {
    login: async({email, password}) => {
        console.warn('User.login() called - stub implementation');
        return {email};
    },
    logout: async() => {
        console.warn('User.logout() called - stub implementation');
    }
}

// export const Configuration = base44.entities.Configuration;

// export const AdminSession = base44.entities.AdminSession;

// export const AdminSongSelection = base44.entities.AdminSongSelection;

// export const AdminTimeSlot = base44.entities.AdminTimeSlot;

// export const QueueEntry = base44.entities.QueueEntry;




// auth sdk:
// export const User = base44.auth;uu789yyuiu