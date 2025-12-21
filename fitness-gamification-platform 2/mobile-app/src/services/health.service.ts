import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {
  initialize,
  requestPermission,
  readRecords,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import dayjs from 'dayjs';

// ============================================================================
// PERMISSIONS
// ============================================================================

const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [],
  },
};

const HEALTH_CONNECT_PERMISSIONS = [
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
];

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initializeHealthKit = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      resolve();
      return;
    }

    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error: string) => {
      if (error) {
        console.error('HealthKit init error:', error);
        reject(error);
      } else {
        console.log('✅ HealthKit initialized');
        resolve();
      }
    });
  });
};

export const initializeHealthConnect = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const isAvailable = await initialize();
    console.log('Health Connect availability:', isAvailable);

    if (isAvailable === SdkAvailabilityStatus.SDK_AVAILABLE) {
      console.log('✅ Health Connect initialized');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Health Connect init error:', error);
    return false;
  }
};

// ============================================================================
// PERMISSIONS REQUEST
// ============================================================================

export const requestHealthPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      await initializeHealthKit();
      return true;
    } else if (Platform.OS === 'android') {
      const initialized = await initializeHealthConnect();
      if (!initialized) {
        return false;
      }

      const granted = await requestPermission(HEALTH_CONNECT_PERMISSIONS);
      console.log('Health Connect permissions granted:', granted);
      return granted;
    }

    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

// ============================================================================
// DATA READING - iOS (HealthKit)
// ============================================================================

const getActiveCaloriesIOS = (date: Date): Promise<number> => {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: dayjs(date).startOf('day').toISOString(),
      endDate: dayjs(date).endOf('day').toISOString(),
    };

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (error: string, results: HealthValue[]) => {
        if (error) {
          reject(error);
          return;
        }

        // Sum all active energy for the day
        const total = results.reduce((sum, item) => sum + (item.value || 0), 0);
        resolve(Math.round(total));
      }
    );
  });
};

const getStepsIOS = (date: Date): Promise<number> => {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: dayjs(date).startOf('day').toISOString(),
      endDate: dayjs(date).endOf('day').toISOString(),
    };

    AppleHealthKit.getStepCount(options, (error: string, results: HealthValue) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Math.round(results.value || 0));
    });
  });
};

// ============================================================================
// DATA READING - Android (Health Connect)
// ============================================================================

const getActiveCaloriesAndroid = async (date: Date): Promise<number> => {
  try {
    const records = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: dayjs(date).startOf('day').toISOString(),
        endTime: dayjs(date).endOf('day').toISOString(),
      },
    });

    // Sum all active calories
    const total = records.reduce((sum: number, record: any) => {
      return sum + (record.energy?.inKilocalories || 0);
    }, 0);

    return Math.round(total);
  } catch (error) {
    console.error('Error reading active calories:', error);
    return 0;
  }
};

const getStepsAndroid = async (date: Date): Promise<number> => {
  try {
    const records = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: dayjs(date).startOf('day').toISOString(),
        endTime: dayjs(date).endOf('day').toISOString(),
      },
    });

    const total = records.reduce((sum: number, record: any) => {
      return sum + (record.count || 0);
    }, 0);

    return Math.round(total);
  } catch (error) {
    console.error('Error reading steps:', error);
    return 0;
  }
};

// ============================================================================
// UNIFIED API
// ============================================================================

export interface HealthData {
  date: string;
  active_calories: number;
  steps: number;
  workout_minutes: number;
  source: 'HEALTHKIT' | 'HEALTH_CONNECT';
}

export const getHealthDataForDate = async (date: Date): Promise<HealthData> => {
  try {
    let activeCalories = 0;
    let steps = 0;
    let source: 'HEALTHKIT' | 'HEALTH_CONNECT' = 'HEALTHKIT';

    if (Platform.OS === 'ios') {
      [activeCalories, steps] = await Promise.all([
        getActiveCaloriesIOS(date),
        getStepsIOS(date),
      ]);
      source = 'HEALTHKIT';
    } else if (Platform.OS === 'android') {
      [activeCalories, steps] = await Promise.all([
        getActiveCaloriesAndroid(date),
        getStepsAndroid(date),
      ]);
      source = 'HEALTH_CONNECT';
    }

    return {
      date: dayjs(date).format('YYYY-MM-DD'),
      active_calories: activeCalories,
      steps,
      workout_minutes: 0, // TODO: Calculate from workout sessions
      source,
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

export const getTodayHealthData = async (): Promise<HealthData> => {
  return getHealthDataForDate(new Date());
};

export const getHealthDataRange = async (
  startDate: Date,
  endDate: Date
): Promise<HealthData[]> => {
  const days: HealthData[] = [];
  let currentDate = dayjs(startDate);
  const end = dayjs(endDate);

  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    try {
      const data = await getHealthDataForDate(currentDate.toDate());
      days.push(data);
    } catch (error) {
      console.error(`Error fetching data for ${currentDate.format('YYYY-MM-DD')}:`, error);
    }
    currentDate = currentDate.add(1, 'day');
  }

  return days;
};

export default {
  initializeHealthKit,
  initializeHealthConnect,
  requestHealthPermissions,
  getHealthDataForDate,
  getTodayHealthData,
  getHealthDataRange,
};
