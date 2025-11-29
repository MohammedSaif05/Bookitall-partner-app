/**
 * OperatingHours Screen
 * Fourth and final screen in onboarding flow for setting business operating hours
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import {
  PageIndicators,
  OnboardingCTAButton,
} from '../../components/onboarding';
import BackIcon from '../../assets/svg/icons/back.svg';
import ClockIcon from '../../assets/svg/icons/clock.svg';
import InfoIcon from '../../assets/svg/icons/info.svg';
import DropdownIcon from '../../assets/svg/icons/dropdown.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import { vendorService } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';

type OperatingHoursProps = AuthStackScreenProps<'OperatingHours'>;

type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type DayAbbr = 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S';

interface BreakPeriod {
  id: string;
  start: string;
  end: string;
}

interface DayTiming {
  startTime: string;
  endTime: string;
  hasBreakHours: boolean;
  breakPeriods: BreakPeriod[];
}

const DAYS: { label: DayAbbr; value: Day }[] = [
  { label: 'M', value: 'Monday' },
  { label: 'T', value: 'Tuesday' },
  { label: 'W', value: 'Wednesday' },
  { label: 'T', value: 'Thursday' },
  { label: 'F', value: 'Friday' },
  { label: 'S', value: 'Saturday' },
  { label: 'S', value: 'Sunday' },
];

/**
 * OperatingHours - Onboarding Page 4
 */
const OperatingHours: React.FC<OperatingHoursProps> = ({ navigation }) => {
  const [selectedDays, setSelectedDays] = useState<Day[]>(['Monday', 'Tuesday', 'Wednesday']);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [hasBreakHours, setHasBreakHours] = useState<boolean>(false);
  const [breakPeriods, setBreakPeriods] = useState<BreakPeriod[]>([
    { id: '1', start: '', end: '' },
  ]);
  const [showTimePicker, setShowTimePicker] = useState<{
    visible: boolean;
    type: 'start' | 'end' | 'breakStart' | 'breakEnd';
    breakIndex?: number;
    day?: Day;
  }>({ visible: false, type: 'start' });
  const [timePickerValue, setTimePickerValue] = useState<{ hour: number; minute: number }>({ hour: 8, minute: 0 });
  const [errors, setErrors] = useState<{
    workingDays?: string;
    startTime?: string;
    endTime?: string;
    startEndSame?: string;
    breakStart?: string;
    breakEnd?: string;
    breakSameTime?: string;
  }>({});
  const [breakErrors, setBreakErrors] = useState<Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }>>({});
  const [showWorkingDaysTooltip, setShowWorkingDaysTooltip] = useState(false);
  
  // Day-wise timings state
  const [differentTimingsPerDay, setDifferentTimingsPerDay] = useState<boolean>(false);
  const [dayTimings, setDayTimings] = useState<Record<Day, DayTiming>>({
    Monday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Tuesday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Wednesday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Thursday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Friday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Saturday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
    Sunday: { startTime: '', endTime: '', hasBreakHours: false, breakPeriods: [{ id: '1', start: '', end: '' }] },
  });
  const [expandedDays, setExpandedDays] = useState<Set<Day>>(new Set());
  const [dayBreakErrors, setDayBreakErrors] = useState<Record<Day, Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }>>>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });
  const [dayErrors, setDayErrors] = useState<Record<Day, { startTime?: string; endTime?: string; startEndSame?: string }>>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Convert time string (e.g., "9:00 AM") to minutes since midnight for comparison
  const timeToMinutes = (timeString: string): number | null => {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return hour * 60 + minute;
  };

  // Convert time string (e.g., "9:00 AM") to 24-hour format (e.g., "09:00")
  const convertTo24HourFormat = (timeString: string): string => {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Validate break periods don't overlap
  const validateBreakPeriods = (periods: BreakPeriod[]): void => {
    const newBreakErrors: Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }> = {};
    
    periods.forEach((currentPeriod, index) => {
      if (!currentPeriod.start.trim() || !currentPeriod.end.trim()) {
        return; // Skip validation if period is incomplete
      }

      const currentStart = timeToMinutes(currentPeriod.start);
      const currentEnd = timeToMinutes(currentPeriod.end);
      
      if (currentStart === null || currentEnd === null) {
        return;
      }

      // Check for overlaps with other break periods
      periods.forEach((otherPeriod, otherIndex) => {
        if (index === otherIndex || !otherPeriod.start.trim() || !otherPeriod.end.trim()) {
          return; // Skip self or incomplete periods
        }

        const otherStart = timeToMinutes(otherPeriod.start);
        const otherEnd = timeToMinutes(otherPeriod.end);
        
        if (otherStart === null || otherEnd === null) {
          return;
        }

        // Check for overlap: periods overlap if one starts before the other ends
        const hasOverlap = 
          (currentStart < otherEnd && currentEnd > otherStart) ||
          (currentStart === otherStart) ||
          (currentEnd === otherEnd) ||
          (currentStart === otherEnd) ||
          (currentEnd === otherStart);

        if (hasOverlap) {
          if (!newBreakErrors[currentPeriod.id]) {
            newBreakErrors[currentPeriod.id] = {};
          }
          newBreakErrors[currentPeriod.id].overlap = 'Break periods cannot overlap or have the same times.';
        }
      });
    });

    // Update errors for all affected periods
    setBreakErrors((prev) => {
      const updated = { ...prev };
      
      // Update or clear errors for all periods
      Object.keys(updated).forEach((breakId) => {
        if (newBreakErrors[breakId]) {
          // Update with new errors
          updated[breakId] = { ...updated[breakId], ...newBreakErrors[breakId] };
        } else {
          // Clear overlap error if period no longer has issues
          if (updated[breakId]?.overlap) {
            const newBreakError = { ...updated[breakId] };
            delete newBreakError.overlap;
            // If no other errors, remove the entry entirely
            if (Object.keys(newBreakError).length === 0) {
              delete updated[breakId];
            } else {
              updated[breakId] = newBreakError;
            }
          }
        }
      });
      
      // Add new errors for periods that weren't in prev
      Object.keys(newBreakErrors).forEach((breakId) => {
        if (!updated[breakId]) {
          updated[breakId] = newBreakErrors[breakId];
        }
      });
      
      return updated;
    });
  };

  const handleDayToggle = (day: Day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
    if (errors.workingDays) {
      setErrors((prev) => ({ ...prev, workingDays: undefined }));
    }
  };

  const handleTimeFieldPress = (type: 'start' | 'end' | 'breakStart' | 'breakEnd', breakIndex?: number) => {
    // Get current time value if exists
    let currentHour = 8;
    let currentMinute = 0;
    
    if (type === 'start' && startTime) {
      const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        currentHour = h;
        currentMinute = m;
      }
    } else if (type === 'end' && endTime) {
      const match = endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        currentHour = h;
        currentMinute = m;
      }
    } else if ((type === 'breakStart' || type === 'breakEnd') && breakIndex !== undefined) {
      const breakPeriod = breakPeriods[breakIndex];
      const timeValue = type === 'breakStart' ? breakPeriod.start : breakPeriod.end;
      if (timeValue) {
        const match = timeValue.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const period = match[3].toUpperCase();
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          currentHour = h;
          currentMinute = m;
        }
      }
    }

    setTimePickerValue({ hour: currentHour, minute: currentMinute });
    setShowTimePicker({ visible: true, type, breakIndex });
  };

  const handleTimeSelect = () => {
    // Check if this is for day-wise timings
    if (showTimePicker.day) {
      handleDayTimeSelect();
      return;
    }

    const formattedTime = formatTime(timePickerValue.hour, timePickerValue.minute);
    
    if (showTimePicker.type === 'start') {
      setStartTime(formattedTime);
      // Clear errors
      setErrors((prev) => ({ ...prev, startTime: undefined, startEndSame: undefined }));
      
      // Validate if end time is set and they're the same
      if (endTime && endTime === formattedTime) {
        setErrors((prev) => ({ ...prev, startEndSame: 'Start time and end time cannot be the same.' }));
      }
      
      // Validate if end time is set and start time is after end time
      if (endTime) {
        const startMinutes = timeToMinutes(formattedTime);
        const endMinutes = timeToMinutes(endTime);
        if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
          setErrors((prev) => ({ ...prev, startEndSame: 'Start time must be before end time.' }));
        }
      }
    } else if (showTimePicker.type === 'end') {
      setEndTime(formattedTime);
      // Clear errors
      setErrors((prev) => ({ ...prev, endTime: undefined, startEndSame: undefined }));
      
      // Validate if start time is set and they're the same
      if (startTime && startTime === formattedTime) {
        setErrors((prev) => ({ ...prev, startEndSame: 'Start time and end time cannot be the same.' }));
      }
      
      // Validate if start time is set and end time is before start time
      if (startTime) {
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(formattedTime);
        if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
          setErrors((prev) => ({ ...prev, startEndSame: 'End time must be after start time.' }));
        }
      }
    } else if (showTimePicker.type === 'breakStart' && showTimePicker.breakIndex !== undefined) {
      const updated = [...breakPeriods];
      updated[showTimePicker.breakIndex].start = formattedTime;
      setBreakPeriods(updated);
      
      // Clear errors for this break period
      const breakId = updated[showTimePicker.breakIndex].id;
      setBreakErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[breakId]) {
          newErrors[breakId] = { ...newErrors[breakId], start: undefined, sameTime: undefined, overlap: undefined };
        }
        return newErrors;
      });
      
      // Validate if break end is set
      const breakEnd = updated[showTimePicker.breakIndex].end;
      if (breakEnd) {
        if (breakEnd === formattedTime) {
          setBreakErrors((prev) => ({
            ...prev,
            [breakId]: { ...prev[breakId], sameTime: 'Break start and end times cannot be the same.' },
          }));
        } else {
          // Check if break start is after break end
          const startMinutes = timeToMinutes(formattedTime);
          const endMinutes = timeToMinutes(breakEnd);
          if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
            setBreakErrors((prev) => ({
              ...prev,
              [breakId]: { ...prev[breakId], sameTime: 'Break start time must be before break end time.' },
            }));
          } else {
            // Clear sameTime error if validation passes
            setBreakErrors((prev) => {
              const newErrors = { ...prev };
              if (newErrors[breakId]?.sameTime) {
                const updatedError = { ...newErrors[breakId] };
                delete updatedError.sameTime;
                if (Object.keys(updatedError).length > 0) {
                  newErrors[breakId] = updatedError;
                } else {
                  delete newErrors[breakId];
                }
              }
              return newErrors;
            });
            // Validate overlaps with other break periods
            validateBreakPeriods(updated);
          }
        }
      } else {
        // Validate overlaps even if end is not set (check if start conflicts)
        validateBreakPeriods(updated);
      }
    } else if (showTimePicker.type === 'breakEnd' && showTimePicker.breakIndex !== undefined) {
      const updated = [...breakPeriods];
      updated[showTimePicker.breakIndex].end = formattedTime;
      setBreakPeriods(updated);
      
      // Clear errors for this break period
      const breakId = updated[showTimePicker.breakIndex].id;
      setBreakErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[breakId]) {
          newErrors[breakId] = { ...newErrors[breakId], end: undefined, sameTime: undefined, overlap: undefined };
        }
        return newErrors;
      });
      
      // Validate if break start is set
      const breakStart = updated[showTimePicker.breakIndex].start;
      if (breakStart) {
        if (breakStart === formattedTime) {
          setBreakErrors((prev) => ({
            ...prev,
            [breakId]: { ...prev[breakId], sameTime: 'Break start and end times cannot be the same.' },
          }));
        } else {
          // Check if break end is before break start
          const startMinutes = timeToMinutes(breakStart);
          const endMinutes = timeToMinutes(formattedTime);
          if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
            setBreakErrors((prev) => ({
              ...prev,
              [breakId]: { ...prev[breakId], sameTime: 'Break end time must be after break start time.' },
            }));
          } else {
            // Clear sameTime error if validation passes
            setBreakErrors((prev) => {
              const newErrors = { ...prev };
              if (newErrors[breakId]?.sameTime) {
                const updatedError = { ...newErrors[breakId] };
                delete updatedError.sameTime;
                if (Object.keys(updatedError).length > 0) {
                  newErrors[breakId] = updatedError;
                } else {
                  delete newErrors[breakId];
                }
              }
              return newErrors;
            });
            // Validate overlaps with other break periods
            validateBreakPeriods(updated);
          }
        }
      } else {
        // Validate overlaps even if start is not set (check if end conflicts)
        validateBreakPeriods(updated);
      }
    }
    
    setShowTimePicker({ visible: false, type: 'start' });
  };

  const handleAddBreak = () => {
    setBreakPeriods([...breakPeriods, { id: Date.now().toString(), start: '', end: '' }]);
  };

  const handleRemoveBreak = (id: string) => {
    if (breakPeriods.length > 1) {
      setBreakPeriods(breakPeriods.filter((bp) => bp.id !== id));
      // Clear errors for removed break period
      setBreakErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Day-wise timings handlers
  const handleDayExpand = (day: Day) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const handleDayTimeFieldPress = (day: Day, type: 'start' | 'end' | 'breakStart' | 'breakEnd', breakIndex?: number) => {
    const dayTiming = dayTimings[day];
    let currentHour = 8;
    let currentMinute = 0;
    
    if (type === 'start' && dayTiming.startTime) {
      const match = dayTiming.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        currentHour = h;
        currentMinute = m;
      }
    } else if (type === 'end' && dayTiming.endTime) {
      const match = dayTiming.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        currentHour = h;
        currentMinute = m;
      }
    } else if ((type === 'breakStart' || type === 'breakEnd') && breakIndex !== undefined) {
      const breakPeriod = dayTiming.breakPeriods[breakIndex];
      const timeValue = type === 'breakStart' ? breakPeriod.start : breakPeriod.end;
      if (timeValue) {
        const match = timeValue.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const period = match[3].toUpperCase();
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          currentHour = h;
          currentMinute = m;
        }
      }
    }

    setTimePickerValue({ hour: currentHour, minute: currentMinute });
    setShowTimePicker({ visible: true, type, breakIndex, day });
  };

  const handleDayTimeSelect = () => {
    const formattedTime = formatTime(timePickerValue.hour, timePickerValue.minute);
    const day = showTimePicker.day;
    
    if (!day) return;

    setDayTimings((prev) => {
      const updated = { ...prev };
      const dayTiming = { ...updated[day] };

      if (showTimePicker.type === 'start') {
        dayTiming.startTime = formattedTime;
        setDayErrors((prevErrors) => ({
          ...prevErrors,
          [day]: { ...prevErrors[day], startTime: undefined, startEndSame: undefined },
        }));

        if (dayTiming.endTime && dayTiming.endTime === formattedTime) {
          setDayErrors((prevErrors) => ({
            ...prevErrors,
            [day]: { ...prevErrors[day], startEndSame: 'Start time and end time cannot be the same.' },
          }));
        } else if (dayTiming.endTime) {
          const startMinutes = timeToMinutes(formattedTime);
          const endMinutes = timeToMinutes(dayTiming.endTime);
          if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
            setDayErrors((prevErrors) => ({
              ...prevErrors,
              [day]: { ...prevErrors[day], startEndSame: 'Start time must be before end time.' },
            }));
          }
        }
      } else if (showTimePicker.type === 'end') {
        dayTiming.endTime = formattedTime;
        setDayErrors((prevErrors) => ({
          ...prevErrors,
          [day]: { ...prevErrors[day], endTime: undefined, startEndSame: undefined },
        }));

        if (dayTiming.startTime && dayTiming.startTime === formattedTime) {
          setDayErrors((prevErrors) => ({
            ...prevErrors,
            [day]: { ...prevErrors[day], startEndSame: 'Start time and end time cannot be the same.' },
          }));
        } else if (dayTiming.startTime) {
          const startMinutes = timeToMinutes(dayTiming.startTime);
          const endMinutes = timeToMinutes(formattedTime);
          if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
            setDayErrors((prevErrors) => ({
              ...prevErrors,
              [day]: { ...prevErrors[day], startEndSame: 'End time must be after start time.' },
            }));
          }
        }
      } else if (showTimePicker.type === 'breakStart' && showTimePicker.breakIndex !== undefined) {
        const updatedBreakPeriods = [...dayTiming.breakPeriods];
        updatedBreakPeriods[showTimePicker.breakIndex].start = formattedTime;
        dayTiming.breakPeriods = updatedBreakPeriods;

        const breakId = updatedBreakPeriods[showTimePicker.breakIndex].id;
        setDayBreakErrors((prevErrors) => {
          const dayBreakErrorsLocal = { ...prevErrors[day] };
          if (dayBreakErrorsLocal[breakId]) {
            dayBreakErrorsLocal[breakId] = { ...dayBreakErrorsLocal[breakId], start: undefined, sameTime: undefined, overlap: undefined };
          }
          return { ...prevErrors, [day]: dayBreakErrorsLocal };
        });

        const breakEnd = updatedBreakPeriods[showTimePicker.breakIndex].end;
        if (breakEnd) {
          if (breakEnd === formattedTime) {
            setDayBreakErrors((prevErrors) => ({
              ...prevErrors,
              [day]: {
                ...prevErrors[day],
                [breakId]: { ...prevErrors[day][breakId], sameTime: 'Break start and end times cannot be the same.' },
              },
            }));
          } else {
            const startMinutes = timeToMinutes(formattedTime);
            const endMinutes = timeToMinutes(breakEnd);
            if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
              setDayBreakErrors((prevErrors) => ({
                ...prevErrors,
                [day]: {
                  ...prevErrors[day],
                  [breakId]: { ...prevErrors[day][breakId], sameTime: 'Break start time must be before break end time.' },
                },
              }));
            } else {
              validateDayBreakPeriods(day, updatedBreakPeriods);
            }
          }
        } else {
          validateDayBreakPeriods(day, updatedBreakPeriods);
        }
      } else if (showTimePicker.type === 'breakEnd' && showTimePicker.breakIndex !== undefined) {
        const updatedBreakPeriods = [...dayTiming.breakPeriods];
        updatedBreakPeriods[showTimePicker.breakIndex].end = formattedTime;
        dayTiming.breakPeriods = updatedBreakPeriods;

        const breakId = updatedBreakPeriods[showTimePicker.breakIndex].id;
        setDayBreakErrors((prevErrors) => {
          const dayBreakErrorsLocal = { ...prevErrors[day] };
          if (dayBreakErrorsLocal[breakId]) {
            dayBreakErrorsLocal[breakId] = { ...dayBreakErrorsLocal[breakId], end: undefined, sameTime: undefined, overlap: undefined };
          }
          return { ...prevErrors, [day]: dayBreakErrorsLocal };
        });

        const breakStart = updatedBreakPeriods[showTimePicker.breakIndex].start;
        if (breakStart) {
          if (breakStart === formattedTime) {
            setDayBreakErrors((prevErrors) => ({
              ...prevErrors,
              [day]: {
                ...prevErrors[day],
                [breakId]: { ...prevErrors[day][breakId], sameTime: 'Break start and end times cannot be the same.' },
              },
            }));
          } else {
            const startMinutes = timeToMinutes(breakStart);
            const endMinutes = timeToMinutes(formattedTime);
            if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
              setDayBreakErrors((prevErrors) => ({
                ...prevErrors,
                [day]: {
                  ...prevErrors[day],
                  [breakId]: { ...prevErrors[day][breakId], sameTime: 'Break end time must be after break start time.' },
                },
              }));
            } else {
              validateDayBreakPeriods(day, updatedBreakPeriods);
            }
          }
        } else {
          validateDayBreakPeriods(day, updatedBreakPeriods);
        }
      }

      updated[day] = dayTiming;
      return updated;
    });

    setShowTimePicker({ visible: false, type: 'start' });
  };

  const validateDayBreakPeriods = (day: Day, periods: BreakPeriod[]) => {
    const newBreakErrors: Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }> = {};

    for (let i = 0; i < periods.length; i++) {
      const bp1 = periods[i];
      if (!bp1.start.trim() || !bp1.end.trim()) continue;

      const start1 = timeToMinutes(bp1.start);
      const end1 = timeToMinutes(bp1.end);
      if (start1 === null || end1 === null) continue;

      for (let j = i + 1; j < periods.length; j++) {
        const bp2 = periods[j];
        if (!bp2.start.trim() || !bp2.end.trim()) continue;

        const start2 = timeToMinutes(bp2.start);
        const end2 = timeToMinutes(bp2.end);
        if (start2 === null || end2 === null) continue;

        const overlaps =
          (start1 < end2 && end1 > start2) ||
          (start1 === start2) ||
          (end1 === end2) ||
          (start1 === end2) ||
          (end1 === start2);

        if (overlaps) {
          if (!newBreakErrors[bp1.id]) newBreakErrors[bp1.id] = {};
          if (!newBreakErrors[bp2.id]) newBreakErrors[bp2.id] = {};
          newBreakErrors[bp1.id].overlap = 'Break periods cannot overlap.';
          newBreakErrors[bp2.id].overlap = 'Break periods cannot overlap.';
        }
      }
    }

    setDayBreakErrors((prevErrors) => {
      const dayBreakErrorsLocal = { ...prevErrors[day] };
      Object.keys(newBreakErrors).forEach((breakId) => {
        if (dayBreakErrorsLocal[breakId]) {
          dayBreakErrorsLocal[breakId] = { ...dayBreakErrorsLocal[breakId], ...newBreakErrors[breakId] };
        } else {
          dayBreakErrorsLocal[breakId] = newBreakErrors[breakId];
        }
      });

      // Clear overlap errors for periods that no longer have issues
      Object.keys(dayBreakErrorsLocal).forEach((breakId) => {
        if (!newBreakErrors[breakId] && dayBreakErrorsLocal[breakId]?.overlap) {
          const updated = { ...dayBreakErrorsLocal[breakId] };
          delete updated.overlap;
          if (Object.keys(updated).length > 0) {
            dayBreakErrorsLocal[breakId] = updated;
          } else {
            delete dayBreakErrorsLocal[breakId];
          }
        }
      });

      return { ...prevErrors, [day]: dayBreakErrorsLocal };
    });
  };

  const handleDayAddBreak = (day: Day) => {
    setDayTimings((prev) => {
      const updated = { ...prev };
      updated[day] = {
        ...updated[day],
        breakPeriods: [...updated[day].breakPeriods, { id: Date.now().toString(), start: '', end: '' }],
      };
      return updated;
    });
  };

  const handleDayRemoveBreak = (day: Day, id: string) => {
    setDayTimings((prev) => {
      const updated = { ...prev };
      if (updated[day].breakPeriods.length > 1) {
        updated[day] = {
          ...updated[day],
          breakPeriods: updated[day].breakPeriods.filter((bp) => bp.id !== id),
        };
      }
      return updated;
    });

    setDayBreakErrors((prevErrors) => {
      const dayBreakErrorsLocal = { ...prevErrors[day] };
      delete dayBreakErrorsLocal[id];
      return { ...prevErrors, [day]: dayBreakErrorsLocal };
    });
  };

  const handleDayBreakToggle = (day: Day) => {
    setDayTimings((prev) => {
      const updated = { ...prev };
      updated[day] = {
        ...updated[day],
        hasBreakHours: !updated[day].hasBreakHours,
      };
      return updated;
    });
  };

  const isFormComplete = differentTimingsPerDay
    ? selectedDays.length > 0 &&
      selectedDays.every((day) => {
        const dayTiming = dayTimings[day];
        if (!dayTiming.startTime.trim() || !dayTiming.endTime.trim()) return false;
        if (dayTiming.startTime === dayTiming.endTime) return false;
        
        const startMins = timeToMinutes(dayTiming.startTime);
        const endMins = timeToMinutes(dayTiming.endTime);
        if (startMins === null || endMins === null || startMins >= endMins) return false;
        
        if (dayTiming.hasBreakHours) {
          if (!dayTiming.breakPeriods.every((bp) => {
            if (!bp.start.trim() || !bp.end.trim() || bp.start === bp.end) return false;
            const bpStartMins = timeToMinutes(bp.start);
            const bpEndMins = timeToMinutes(bp.end);
            return bpStartMins !== null && bpEndMins !== null && bpStartMins < bpEndMins;
          })) {
            return false;
          }
          
          // Check for overlaps
          for (let i = 0; i < dayTiming.breakPeriods.length; i++) {
            const bp1 = dayTiming.breakPeriods[i];
            if (!bp1.start.trim() || !bp1.end.trim()) continue;
            
            const start1 = timeToMinutes(bp1.start);
            const end1 = timeToMinutes(bp1.end);
            if (start1 === null || end1 === null) continue;
            
            for (let j = i + 1; j < dayTiming.breakPeriods.length; j++) {
              const bp2 = dayTiming.breakPeriods[j];
              if (!bp2.start.trim() || !bp2.end.trim()) continue;
              
              const start2 = timeToMinutes(bp2.start);
              const end2 = timeToMinutes(bp2.end);
              if (start2 === null || end2 === null) continue;
              
              const overlaps =
                (start1 < end2 && end1 > start2) ||
                (start1 === start2) ||
                (end1 === end2) ||
                (start1 === end2) ||
                (end1 === start2);
              
              if (overlaps) return false;
            }
          }
        }
        
        return true;
      })
    : selectedDays.length > 0 &&
      startTime.trim().length > 0 &&
      endTime.trim().length > 0 &&
      startTime !== endTime &&
      (() => {
        const startMins = timeToMinutes(startTime);
        const endMins = timeToMinutes(endTime);
        return startMins !== null && endMins !== null && startMins < endMins;
      })() &&
      (!hasBreakHours || (() => {
        // Check each break period is valid
        if (!breakPeriods.every((bp) => {
          if (!bp.start.trim() || !bp.end.trim() || bp.start === bp.end) return false;
          const startMins = timeToMinutes(bp.start);
          const endMins = timeToMinutes(bp.end);
          return startMins !== null && endMins !== null && startMins < endMins;
        })) {
          return false;
        }
        
        // Check for overlaps between break periods
        for (let i = 0; i < breakPeriods.length; i++) {
          const bp1 = breakPeriods[i];
          if (!bp1.start.trim() || !bp1.end.trim()) continue;
          
          const start1 = timeToMinutes(bp1.start);
          const end1 = timeToMinutes(bp1.end);
          if (start1 === null || end1 === null) continue;
          
          for (let j = i + 1; j < breakPeriods.length; j++) {
            const bp2 = breakPeriods[j];
            if (!bp2.start.trim() || !bp2.end.trim()) continue;
            
            const start2 = timeToMinutes(bp2.start);
            const end2 = timeToMinutes(bp2.end);
            if (start2 === null || end2 === null) continue;
            
            // Check for overlap
            const overlaps = 
              (start1 < end2 && end1 > start2) ||
              (start1 === start2) ||
              (end1 === end2) ||
              (start1 === end2) ||
              (end1 === start2);
            
            if (overlaps) {
              return false;
            }
          }
        }
        
        return true;
      })());

  const handleSaveAndContinue = async () => {
    if (isSubmitting) {
      return;
    }

    if (differentTimingsPerDay) {
      // Validate day-wise timings
      const newDayErrors: Record<Day, { startTime?: string; endTime?: string; startEndSame?: string }> = {
        Monday: {},
        Tuesday: {},
        Wednesday: {},
        Thursday: {},
        Friday: {},
        Saturday: {},
        Sunday: {},
      };
      
      let hasErrors = false;
      
      if (selectedDays.length === 0) {
        setErrors({ workingDays: 'Please select at least one working day.' });
        return;
      }
      
      selectedDays.forEach((day) => {
        const dayTiming = dayTimings[day];
        const dayError: { startTime?: string; endTime?: string; startEndSame?: string } = {};
        
        if (!dayTiming.startTime.trim()) {
          dayError.startTime = 'Please select start time.';
          hasErrors = true;
        }
        if (!dayTiming.endTime.trim()) {
          dayError.endTime = 'Please select end time.';
          hasErrors = true;
        }
        if (dayTiming.startTime.trim() && dayTiming.endTime.trim()) {
          if (dayTiming.startTime === dayTiming.endTime) {
            dayError.startEndSame = 'Start time and end time cannot be the same.';
            hasErrors = true;
          } else {
            const startMins = timeToMinutes(dayTiming.startTime);
            const endMins = timeToMinutes(dayTiming.endTime);
            if (startMins !== null && endMins !== null && startMins >= endMins) {
              dayError.startEndSame = 'Start time must be before end time.';
              hasErrors = true;
            }
          }
        }
        
        if (dayTiming.hasBreakHours) {
          const newBreakErrors: Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }> = {};
          
          dayTiming.breakPeriods.forEach((bp, bpIndex) => {
            const periodErrors: { start?: string; end?: string; sameTime?: string; overlap?: string } = {};
            
            if (!bp.start.trim()) {
              periodErrors.start = 'Please select break start time.';
              hasErrors = true;
            }
            if (!bp.end.trim()) {
              periodErrors.end = 'Please select break end time.';
              hasErrors = true;
            }
            if (bp.start.trim() && bp.end.trim()) {
              if (bp.start === bp.end) {
                periodErrors.sameTime = 'Break start and end times cannot be the same.';
                hasErrors = true;
              } else {
                const startMins = timeToMinutes(bp.start);
                const endMins = timeToMinutes(bp.end);
                if (startMins !== null && endMins !== null && startMins >= endMins) {
                  periodErrors.sameTime = 'Break start time must be before break end time.';
                  hasErrors = true;
                } else if (startMins !== null && endMins !== null) {
                  // Check for overlaps
                  dayTiming.breakPeriods.forEach((otherBp, otherIndex) => {
                    if (bpIndex !== otherIndex && otherBp.start.trim() && otherBp.end.trim()) {
                      const otherStartMins = timeToMinutes(otherBp.start);
                      const otherEndMins = timeToMinutes(otherBp.end);
                      if (otherStartMins !== null && otherEndMins !== null) {
                        const hasOverlap =
                          (startMins < otherEndMins && endMins > otherStartMins) ||
                          (startMins === otherStartMins) ||
                          (endMins === otherEndMins) ||
                          (startMins === otherEndMins) ||
                          (endMins === otherStartMins);
                        if (hasOverlap) {
                          periodErrors.overlap = 'Break periods cannot overlap or have the same times.';
                          hasErrors = true;
                        }
                      }
                    }
                  });
                }
              }
            }
            
            if (Object.keys(periodErrors).length > 0) {
              newBreakErrors[bp.id] = periodErrors;
            }
          });
          
          setDayBreakErrors((prev) => ({ ...prev, [day]: newBreakErrors }));
        }
        
        if (Object.keys(dayError).length > 0) {
          newDayErrors[day] = dayError;
        }
      });
      
      setDayErrors(newDayErrors);
      
      if (hasErrors) {
        return;
      }

      // Get userId from storage
      const userId = await userStorage.getUserId();
      if (!userId) {
        showError('User ID not found. Please login again.');
        return;
      }

      setIsSubmitting(true);
      try {
        // Build days array for different timings mode
        const days = selectedDays.map((day) => {
          const dayTiming = dayTimings[day];
          const breaks: Array<{ break_start: string; break_end: string }> = [];
          
          if (dayTiming.hasBreakHours) {
            dayTiming.breakPeriods.forEach((bp) => {
              if (bp.start.trim() && bp.end.trim()) {
                breaks.push({
                  break_start: convertTo24HourFormat(bp.start),
                  break_end: convertTo24HourFormat(bp.end),
                });
              }
            });
          }

          return {
            day,
            start_time: convertTo24HourFormat(dayTiming.startTime),
            end_time: convertTo24HourFormat(dayTiming.endTime),
            breaks,
          };
        });

        await vendorService.updateOperatingHours({
          userId,
          step: 4,
          different_timings_each_day: true,
          days,
        });

        showSuccess('Operating hours saved successfully!');
        navigation.navigate('SuccessScreen');
      } catch (error) {
        // Error is already handled by the API interceptor and flash message
        console.error('Error updating operating hours:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Original validation for same timings
      const validationErrors: typeof errors = {};

      if (selectedDays.length === 0) {
        validationErrors.workingDays = 'Please select at least one working day.';
      }
      if (!startTime.trim()) {
        validationErrors.startTime = 'Please select start time.';
      }
      if (!endTime.trim()) {
        validationErrors.endTime = 'Please select end time.';
      }
      if (startTime.trim() && endTime.trim()) {
        if (startTime === endTime) {
          validationErrors.startEndSame = 'Start time and end time cannot be the same.';
        } else {
          const startMins = timeToMinutes(startTime);
          const endMins = timeToMinutes(endTime);
          if (startMins !== null && endMins !== null && startMins >= endMins) {
            validationErrors.startEndSame = 'Start time must be before end time.';
          }
        }
      }
      if (hasBreakHours) {
      const newBreakErrors: Record<string, { start?: string; end?: string; sameTime?: string; overlap?: string }> = {};
      breakPeriods.forEach((bp, bpIndex) => {
        const periodErrors: { start?: string; end?: string; sameTime?: string; overlap?: string } = {};
        
        if (!bp.start.trim()) {
          periodErrors.start = 'Please select break start time.';
          validationErrors.breakStart = 'Please select break start time.';
        }
        if (!bp.end.trim()) {
          periodErrors.end = 'Please select break end time.';
          validationErrors.breakEnd = 'Please select break end time.';
        }
        if (bp.start.trim() && bp.end.trim()) {
          if (bp.start === bp.end) {
            periodErrors.sameTime = 'Break start and end times cannot be the same.';
            validationErrors.breakSameTime = 'Break start and end times cannot be the same.';
          } else {
            const startMins = timeToMinutes(bp.start);
            const endMins = timeToMinutes(bp.end);
            if (startMins !== null && endMins !== null && startMins >= endMins) {
              periodErrors.sameTime = 'Break start time must be before break end time.';
              validationErrors.breakSameTime = 'Break start time must be before break end time.';
            } else if (startMins !== null && endMins !== null) {
              // Check for overlaps with other break periods
              breakPeriods.forEach((otherBp, otherIndex) => {
                if (bpIndex !== otherIndex && otherBp.start.trim() && otherBp.end.trim()) {
                  const otherStartMins = timeToMinutes(otherBp.start);
                  const otherEndMins = timeToMinutes(otherBp.end);
                  if (otherStartMins !== null && otherEndMins !== null) {
                    const hasOverlap = 
                      (startMins < otherEndMins && endMins > otherStartMins) ||
                      (startMins === otherStartMins) ||
                      (endMins === otherEndMins) ||
                      (startMins === otherEndMins) ||
                      (endMins === otherStartMins);
                    if (hasOverlap) {
                      periodErrors.overlap = 'Break periods cannot overlap or have the same times.';
                      validationErrors.breakSameTime = 'Break periods cannot overlap or have the same times.';
                    }
                  }
                }
              });
            }
          }
        }
        
        if (Object.keys(periodErrors).length > 0) {
          newBreakErrors[bp.id] = periodErrors;
        }
      });
      setBreakErrors(newBreakErrors);
    }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Get userId from storage
      const userId = await userStorage.getUserId();
      if (!userId) {
        showError('User ID not found. Please login again.');
        return;
      }

      setIsSubmitting(true);
      try {
        // Build breaks array
        const breaks: Array<{ break_start: string; break_end: string }> = [];
        if (hasBreakHours) {
          breakPeriods.forEach((bp) => {
            if (bp.start.trim() && bp.end.trim()) {
              breaks.push({
                break_start: convertTo24HourFormat(bp.start),
                break_end: convertTo24HourFormat(bp.end),
              });
            }
          });
        }

        await vendorService.updateOperatingHours({
          userId,
          step: 4,
          different_timings_each_day: false,
          working_days: selectedDays,
          start_time: convertTo24HourFormat(startTime),
          end_time: convertTo24HourFormat(endTime),
          has_break_hours: hasBreakHours,
          breaks,
        });

        showSuccess('Operating hours saved successfully!');
        navigation.navigate('SuccessScreen');
      } catch (error) {
        // Error is already handled by the API interceptor and flash message
        console.error('Error updating operating hours:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setShowWorkingDaysTooltip(false);
      }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackIcon
                width={ms(18)}
                height={ms(18)}
                stroke={colors.text.primary}
              />
            </TouchableOpacity>
            <PageIndicators totalSteps={4} currentStep={3} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => {
              Keyboard.dismiss();
              setShowWorkingDaysTooltip(false);
            }}
          >
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                {differentTimingsPerDay ? 'Set day-wise timings' : 'Set operating hours'}
              </Text>
              <Text style={styles.subtitle}>
                {differentTimingsPerDay
                  ? 'Customize operating hours for each day.'
                  : 'Choose when your business is open for bookings.'}
              </Text>
            </View>

            <View style={styles.fieldsWrapper}>
              {/* Working Days */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRowContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>
                      Working days <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowWorkingDaysTooltip((prev) => !prev)}
                      activeOpacity={0.8}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <InfoIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  {showWorkingDaysTooltip && (
                    <View style={styles.tooltipWrapper}>
                      <View style={styles.tooltipBubble}>
                        <Text style={styles.tooltipText}>Select the days your business is open</Text>
                      </View>
                      <View style={styles.tooltipArrow} />
                    </View>
                  )}
                </View>
                <View style={styles.daysContainer}>
                  {DAYS.map((day, index) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={`${day.value}-${index}`}
                        style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                        onPress={() => handleDayToggle(day.value)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.workingDays && (
                  <Text style={styles.errorText}>{errors.workingDays}</Text>
                )}
              </View>

              {/* Toggle for different timings per day */}
              <View style={styles.fieldContainer}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setDifferentTimingsPerDay(!differentTimingsPerDay)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toggleLabel}>Set different timings for each day</Text>
                  <View style={[styles.toggleSwitch, differentTimingsPerDay && styles.toggleSwitchActive]}>
                    <View style={[styles.toggleThumb, differentTimingsPerDay && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Conditional rendering: Same timings or Day-wise timings */}
              {!differentTimingsPerDay ? (
                <>
                  {/* Start Time and End Time */}
                  <View style={styles.timeRow}>
                <View style={styles.halfField}>
                  <View style={[styles.fieldContainer, styles.timeFieldContainer]}>
                    <View style={styles.labelRowContainer}>
                      <View style={styles.labelRow}>
                        <Text style={styles.label}>
                          Start time <Text style={styles.asterisk}>*</Text>
                        </Text>
                        <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.timeField}
                      onPress={() => handleTimeFieldPress('start')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.timeText, !startTime && styles.timePlaceholder]}>
                        {startTime || 'Select time'}
                      </Text>
                    </TouchableOpacity>
                    {errors.startTime && (
                      <Text style={styles.errorText}>{errors.startTime}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.halfField}>
                  <View style={[styles.fieldContainer, styles.timeFieldContainer]}>
                    <View style={styles.labelRowContainer}>
                      <View style={styles.labelRow}>
                        <Text style={styles.label}>
                          End time <Text style={styles.asterisk}>*</Text>
                        </Text>
                        <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.timeField}
                      onPress={() => handleTimeFieldPress('end')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.timeText, !endTime && styles.timePlaceholder]}>
                        {endTime || 'Select time'}
                      </Text>
                    </TouchableOpacity>
                    {errors.endTime && (
                      <Text style={styles.errorText}>{errors.endTime}</Text>
                    )}
                  </View>
                </View>
              </View>
              {errors.startEndSame && (
                <Text style={styles.errorText}>{errors.startEndSame}</Text>
              )}

              {/* Break Hours */}
              <View style={[styles.fieldContainer, styles.breakHoursFieldContainer]}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setHasBreakHours(!hasBreakHours)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, hasBreakHours && styles.checkboxChecked]}>
                    {hasBreakHours && (
                      <Text style={styles.checkboxTick}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>I have break hours</Text>
                </TouchableOpacity>

                {hasBreakHours && (
                  <View style={styles.breakHoursContainer}>
                    {breakPeriods.map((breakPeriod, index) => (
                      <View key={breakPeriod.id} style={styles.breakPeriodContainer}>
                        <View style={styles.timeRow}>
                          <View style={styles.halfField}>
                            <View style={[styles.fieldContainer, styles.breakTimeFieldContainer]}>
                              <View style={styles.labelRowContainer}>
                                <View style={styles.labelRow}>
                                  <Text style={styles.label}>
                                    Break start <Text style={styles.asterisk}>*</Text>
                                  </Text>
                                  <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                </View>
                              </View>
                              <TouchableOpacity
                                style={styles.timeField}
                                onPress={() => handleTimeFieldPress('breakStart', index)}
                                activeOpacity={0.8}
                              >
                                <Text style={[styles.timeText, !breakPeriod.start && styles.timePlaceholder]}>
                                  {breakPeriod.start || 'Select time'}
                                </Text>
                              </TouchableOpacity>
                              {breakErrors[breakPeriod.id]?.start && (
                                <Text style={styles.errorText}>{breakErrors[breakPeriod.id].start}</Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.halfField}>
                            <View style={[styles.fieldContainer, styles.breakTimeFieldContainer]}>
                              <View style={styles.labelRowContainer}>
                                <View style={styles.labelRow}>
                                  <Text style={styles.label}>
                                    Break end <Text style={styles.asterisk}>*</Text>
                                  </Text>
                                  <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                </View>
                              </View>
                              <TouchableOpacity
                                style={styles.timeField}
                                onPress={() => handleTimeFieldPress('breakEnd', index)}
                                activeOpacity={0.8}
                              >
                                <Text style={[styles.timeText, !breakPeriod.end && styles.timePlaceholder]}>
                                  {breakPeriod.end || 'Select time'}
                                </Text>
                              </TouchableOpacity>
                              {breakErrors[breakPeriod.id]?.end && (
                                <Text style={styles.errorText}>{breakErrors[breakPeriod.id].end}</Text>
                              )}
                            </View>
                          </View>
                        </View>
                        {(breakErrors[breakPeriod.id]?.sameTime || breakErrors[breakPeriod.id]?.overlap) && (
                          <Text style={styles.errorText}>
                            {breakErrors[breakPeriod.id].sameTime || breakErrors[breakPeriod.id].overlap}
                          </Text>
                        )}
                        {breakPeriods.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeBreakButton}
                            onPress={() => handleRemoveBreak(breakPeriod.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.removeBreakText}>Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addBreakButton}
                      onPress={handleAddBreak}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addBreakText}>+ Add break</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
                </>
              ) : (
                <>
                  {/* Day-wise timings */}
                  <View style={styles.dayWiseContainer}>
                    {selectedDays.map((day, dayIndex) => {
                      const dayTiming = dayTimings[day];
                      const isExpanded = expandedDays.has(day);
                      const dayError = dayErrors[day] || {};
                      const dayBreakError = dayBreakErrors[day] || {};

                      return (
                        <View key={day}>
                          <TouchableOpacity
                            style={styles.dayListItem}
                            onPress={() => handleDayExpand(day)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.dayListItemText}>{day}</Text>
                            <DropdownIcon
                              width={ms(20)}
                              height={ms(20)}
                              stroke={colors.text.primary}
                              style={[styles.dayListItemIcon, isExpanded && styles.dayListItemIconExpanded]}
                            />
                          </TouchableOpacity>

                          {isExpanded && (
                            <View style={styles.dayListItemContent}>
                              {/* Start Time and End Time */}
                              <View style={styles.timeRow}>
                                <View style={styles.halfField}>
                                  <View style={[styles.fieldContainer, styles.timeFieldContainer]}>
                                    <View style={styles.labelRowContainer}>
                                      <View style={styles.labelRow}>
                                        <Text style={styles.label}>
                                          Start time <Text style={styles.asterisk}>*</Text>
                                        </Text>
                                        <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                      </View>
                                    </View>
                                    <TouchableOpacity
                                      style={styles.timeField}
                                      onPress={() => handleDayTimeFieldPress(day, 'start')}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={[styles.timeText, !dayTiming.startTime && styles.timePlaceholder]}>
                                        {dayTiming.startTime || 'Select time'}
                                      </Text>
                                    </TouchableOpacity>
                                    {dayError.startTime && (
                                      <Text style={styles.errorText}>{dayError.startTime}</Text>
                                    )}
                                  </View>
                                </View>
                                <View style={styles.halfField}>
                                  <View style={[styles.fieldContainer, styles.timeFieldContainer]}>
                                    <View style={styles.labelRowContainer}>
                                      <View style={styles.labelRow}>
                                        <Text style={styles.label}>
                                          End time <Text style={styles.asterisk}>*</Text>
                                        </Text>
                                        <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                      </View>
                                    </View>
                                    <TouchableOpacity
                                      style={styles.timeField}
                                      onPress={() => handleDayTimeFieldPress(day, 'end')}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={[styles.timeText, !dayTiming.endTime && styles.timePlaceholder]}>
                                        {dayTiming.endTime || 'Select time'}
                                      </Text>
                                    </TouchableOpacity>
                                    {dayError.endTime && (
                                      <Text style={styles.errorText}>{dayError.endTime}</Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                              {dayError.startEndSame && (
                                <Text style={styles.errorText}>{dayError.startEndSame}</Text>
                              )}

                              {/* Break Hours */}
                              <View style={[styles.fieldContainer, styles.breakHoursFieldContainer]}>
                                <TouchableOpacity
                                  style={styles.checkboxRow}
                                  onPress={() => handleDayBreakToggle(day)}
                                  activeOpacity={0.8}
                                >
                                  <View style={[styles.checkbox, dayTiming.hasBreakHours && styles.checkboxChecked]}>
                                    {dayTiming.hasBreakHours && (
                                      <Text style={styles.checkboxTick}>✓</Text>
                                    )}
                                  </View>
                                  <Text style={styles.checkboxLabel}>I have break hours</Text>
                                </TouchableOpacity>

                                {dayTiming.hasBreakHours && (
                                  <View style={styles.breakHoursContainer}>
                                    {dayTiming.breakPeriods.map((breakPeriod, index) => (
                                      <View key={breakPeriod.id} style={styles.breakPeriodContainer}>
                                        <View style={styles.timeRow}>
                                          <View style={styles.halfField}>
                                            <View style={[styles.fieldContainer, styles.breakTimeFieldContainer]}>
                                              <View style={styles.labelRowContainer}>
                                                <View style={styles.labelRow}>
                                                  <Text style={styles.label}>
                                                    Break start <Text style={styles.asterisk}>*</Text>
                                                  </Text>
                                                  <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                                </View>
                                              </View>
                                              <TouchableOpacity
                                                style={styles.timeField}
                                                onPress={() => handleDayTimeFieldPress(day, 'breakStart', index)}
                                                activeOpacity={0.8}
                                              >
                                                <Text style={[styles.timeText, !breakPeriod.start && styles.timePlaceholder]}>
                                                  {breakPeriod.start || 'Select time'}
                                                </Text>
                                              </TouchableOpacity>
                                              {dayBreakError[breakPeriod.id]?.start && (
                                                <Text style={styles.errorText}>{dayBreakError[breakPeriod.id].start}</Text>
                                              )}
                                            </View>
                                          </View>
                                          <View style={styles.halfField}>
                                            <View style={[styles.fieldContainer, styles.breakTimeFieldContainer]}>
                                              <View style={styles.labelRowContainer}>
                                                <View style={styles.labelRow}>
                                                  <Text style={styles.label}>
                                                    Break end <Text style={styles.asterisk}>*</Text>
                                                  </Text>
                                                  <ClockIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                                                </View>
                                              </View>
                                              <TouchableOpacity
                                                style={styles.timeField}
                                                onPress={() => handleDayTimeFieldPress(day, 'breakEnd', index)}
                                                activeOpacity={0.8}
                                              >
                                                <Text style={[styles.timeText, !breakPeriod.end && styles.timePlaceholder]}>
                                                  {breakPeriod.end || 'Select time'}
                                                </Text>
                                              </TouchableOpacity>
                                              {dayBreakError[breakPeriod.id]?.end && (
                                                <Text style={styles.errorText}>{dayBreakError[breakPeriod.id].end}</Text>
                                              )}
                                            </View>
                                          </View>
                                        </View>
                                        {(dayBreakError[breakPeriod.id]?.sameTime || dayBreakError[breakPeriod.id]?.overlap) && (
                                          <Text style={styles.errorText}>
                                            {dayBreakError[breakPeriod.id].sameTime || dayBreakError[breakPeriod.id].overlap}
                                          </Text>
                                        )}
                                        {dayTiming.breakPeriods.length > 1 && (
                                          <TouchableOpacity
                                            style={styles.removeBreakButton}
                                            onPress={() => handleDayRemoveBreak(day, breakPeriod.id)}
                                            activeOpacity={0.8}
                                          >
                                            <Text style={styles.removeBreakText}>Remove</Text>
                                          </TouchableOpacity>
                                        )}
                                      </View>
                                    ))}
                                    <TouchableOpacity
                                      style={styles.addBreakButton}
                                      onPress={() => handleDayAddBreak(day)}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={styles.addBreakText}>+ Add break</Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                          {dayIndex < selectedDays.length - 1 && <View style={styles.dayListSeparator} />}
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <OnboardingCTAButton
              label={isSubmitting ? 'Saving...' : 'Save & Continue'}
              onPress={handleSaveAndContinue}
              disabled={!isFormComplete || isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker({ visible: false, type: 'start' })}
      >
        <TouchableWithoutFeedback onPress={() => setShowTimePicker({ visible: false, type: 'start' })}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <View style={styles.timePickerContainer}>
                  <View style={styles.timePickerRow}>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        // Decrease hour in 12-hour format
                        const current12Hour = timePickerValue.hour === 0 ? 12 : timePickerValue.hour > 12 ? timePickerValue.hour - 12 : timePickerValue.hour;
                        const isPM = timePickerValue.hour >= 12;
                        let new12Hour = current12Hour - 1;
                        if (new12Hour < 1) new12Hour = 12;
                        const newHour = isPM ? (new12Hour === 12 ? 12 : new12Hour + 12) : (new12Hour === 12 ? 0 : new12Hour);
                        setTimePickerValue({ ...timePickerValue, hour: newHour });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↑</Text>
                    </TouchableOpacity>
                    <View style={styles.timePickerValueContainer}>
                      <Text style={styles.timePickerValue}>
                        {(() => {
                          const displayHour = timePickerValue.hour === 0 ? 12 : timePickerValue.hour > 12 ? timePickerValue.hour - 12 : timePickerValue.hour;
                          return displayHour.toString().padStart(2, '0');
                        })()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        // Increase hour in 12-hour format
                        const current12Hour = timePickerValue.hour === 0 ? 12 : timePickerValue.hour > 12 ? timePickerValue.hour - 12 : timePickerValue.hour;
                        const isPM = timePickerValue.hour >= 12;
                        let new12Hour = current12Hour + 1;
                        if (new12Hour > 12) new12Hour = 1;
                        const newHour = isPM ? (new12Hour === 12 ? 12 : new12Hour + 12) : (new12Hour === 12 ? 0 : new12Hour);
                        setTimePickerValue({ ...timePickerValue, hour: newHour });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.timePickerSeparator}>:</Text>
                  <View style={styles.timePickerRow}>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        const newMinute = timePickerValue.minute === 0 ? 59 : timePickerValue.minute - 1;
                        setTimePickerValue({ ...timePickerValue, minute: newMinute });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↑</Text>
                    </TouchableOpacity>
                    <View style={styles.timePickerValueContainer}>
                      <Text style={styles.timePickerValue}>
                        {timePickerValue.minute.toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        const newMinute = timePickerValue.minute === 59 ? 0 : timePickerValue.minute + 1;
                        setTimePickerValue({ ...timePickerValue, minute: newMinute });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timePickerRow}>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        let newHour = timePickerValue.hour;
                        // Toggle AM/PM
                        if (newHour >= 12) {
                          newHour -= 12;
                        } else {
                          newHour += 12;
                        }
                        setTimePickerValue({ ...timePickerValue, hour: newHour });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↑</Text>
                    </TouchableOpacity>
                    <View style={styles.timePickerValueContainer}>
                      <Text style={styles.timePickerValue}>
                        {timePickerValue.hour >= 12 ? 'PM' : 'AM'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        let newHour = timePickerValue.hour;
                        // Toggle AM/PM
                        if (newHour >= 12) {
                          newHour -= 12;
                        } else {
                          newHour += 12;
                        }
                        setTimePickerValue({ ...timePickerValue, hour: newHour });
                      }}
                    >
                      <Text style={styles.timePickerButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowTimePicker({ visible: false, type: 'start' })}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleTimeSelect}
                  >
                    <Text style={styles.modalConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: hs(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
  },
  titleWrapper: {
    paddingTop: vs(12),
    paddingBottom: vs(24),
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(12),
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  fieldsWrapper: {
    paddingBottom: vs(24),
  },
  fieldContainer: {
    marginBottom: vs(20),
  },
  timeFieldContainer: {
    marginBottom: vs(4),
  },
  breakTimeFieldContainer: {
    marginBottom: 0,
  },
  labelRowContainer: {
    position: 'relative',
    marginBottom: vs(6),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
  },
  asterisk: {
    color: colors.text.primary,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(12),
    marginTop: vs(8),
  },
  dayButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  dayButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: colors.text.white,
  },
  timeRow: {
    flexDirection: 'row',
    gap: hs(12),
  },
  halfField: {
    flex: 1,
  },
  timeField: {
    paddingVertical: vs(12),
    paddingTop: vs(2),
  },
  timeText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  timePlaceholder: {
    color: colors.text.secondary,
    fontWeight: '400',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
  },
  checkbox: {
    width: ms(20),
    height: ms(20),
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: ms(4),
    backgroundColor: colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: hs(12),
  },
  checkboxChecked: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  checkboxTick: {
    color: colors.text.white,
    fontSize: ms(14),
    fontWeight: 'bold',
    lineHeight: ms(14),
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  breakHoursFieldContainer: {
    marginTop: vs(4),
  },
  breakHoursContainer: {
    marginTop: vs(16),
  },
  breakPeriodContainer: {
    marginBottom: 0,
  },
  addBreakButton: {
    marginTop: vs(8),
    paddingTop: vs(8),
    paddingBottom: vs(12),
    alignItems: 'center',
  },
  removeBreakButton: {
    marginTop: vs(8),
    paddingTop: vs(8),
    paddingBottom: vs(8),
    alignItems: 'center',
  },
  addBreakText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  removeBreakText: {
    ...typography.bodySmall,
    color: colors.status.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: vs(6),
  },
  tooltipWrapper: {
    position: 'absolute',
    top: vs(28),
    right: 0,
    alignItems: 'flex-end',
    zIndex: 1000,
    elevation: 10,
  },
  tooltipBubble: {
    paddingVertical: vs(8),
    paddingHorizontal: ms(12),
    backgroundColor: colors.button.primary,
    borderRadius: ms(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -ms(6),
    right: ms(10),
    width: ms(12),
    height: ms(12),
    backgroundColor: colors.button.primary,
    transform: [{ rotate: '45deg' }],
    borderRadius: ms(2),
  },
  tooltipText: {
    ...typography.bodySmall,
    color: colors.text.white,
  },
  footer: {
    paddingBottom: vs(32),
    paddingTop: vs(12),
    gap: vs(12),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  toggleSwitch: {
    width: ms(48),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.border.medium,
    justifyContent: 'center',
    paddingHorizontal: ms(2),
  },
  toggleSwitchActive: {
    backgroundColor: colors.button.primary,
  },
  toggleThumb: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: colors.background.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  dayWiseContainer: {
    gap: 0,
  },
  dayListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: vs(20),
    minHeight: vs(60),
    backgroundColor: 'transparent',
  },
  dayListItemText: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: ms(20),
    lineHeight: ms(28),
    flex: 1,
    textAlign: 'left',
  },
  dayListItemIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dayListItemIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  dayListSeparator: {
    height: 1.5,
    backgroundColor: colors.text.primary,
    opacity: 0.3,
    marginVertical: vs(1),
  },
  dayListItemContent: {
    paddingHorizontal: 0,
    paddingBottom: vs(16),
    paddingTop: vs(8),
    backgroundColor: 'transparent',
    gap: vs(16),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderRadius: ms(16),
    padding: hs(24),
    width: '85%',
    maxWidth: ms(400),
  },
  modalTitle: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(24),
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: vs(24),
    gap: hs(16),
  },
  timePickerRow: {
    alignItems: 'center',
    gap: vs(8),
  },
  timePickerButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(8),
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerButtonText: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: ms(20),
  },
  timePickerValueContainer: {
    minWidth: ms(50),
    alignItems: 'center',
  },
  timePickerValue: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: ms(24),
    fontWeight: '700',
  },
  timePickerSeparator: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: ms(24),
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: hs(12),
    marginTop: vs(16),
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: vs(12),
    alignItems: 'center',
    borderRadius: ms(12),
    backgroundColor: colors.background.primary,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.text.primary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: vs(12),
    alignItems: 'center',
    borderRadius: ms(12),
    backgroundColor: colors.button.primary,
  },
  modalConfirmText: {
    ...typography.button,
    color: colors.text.white,
  },
});

export default OperatingHours;

