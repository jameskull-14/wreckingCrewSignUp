import React, {useState, useEffect, useCallback } from 'react';
import {useParams} from 'react-router-dom';
import { AdminTimeSlot, Song, AdminSession, QueueEntry } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
        Music,
        Clock,
        Sparkles,
        RefreshCw
      } from "lucide-react";
import { motion } from "framer-motion";
import TimeSlotGrid from "../components/TimeSlotGrid";
import SongSearchModal from "../components/SongSearchModal";
import QueueView from "../components/QueueView";

const timeToSortable = (timeStr) => {
    if(!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if(modifier === 'PM' && hours < 12){
        hours += 12;
    }
    return hours * 60 + minutes;
};

const formatTime12Hour = (timeStr) => {
    if(!timeStr) return;
    const [hours, minutesStr] = timeStr.split(':');
    const hoursNum = parseInt(hours);
    const minutes = parseInt(minutesStr);

    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    let displayHour = hoursNum % 12;
    if(displayHour === 0){
        dispayHour = 12;
    } 

    return `${displayHour}:${String(minutes).padStart(2,'0')} ${ampm}`
};

export default function PublicKaraokePage() {
    const { adminUsername } = useParams();
    const [timeSlots, setTimeSlots] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [availableSongs, setAvailableSongs] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showSongModal, setShowSongModal] = useState(false);
    const [isLoading, setIsLoading] = useState([]);
    const [queueEntries, setQueueEntries] = useState([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
    })

    
} 