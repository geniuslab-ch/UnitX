import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { healthAPI } from '../../api/client';
import { getTodayHealthData } from '../../services/health.service';
import dayjs from 'dayjs';

interface DashboardData {
  todayPoints: number;
  todayCalories: number;
  todaySteps: number;
  hasCheckedIn: boolean;
  weeklyTotal: number;
  currentStreak: number;
}

const DashboardScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>({
    todayPoints: 0,
    todayCalories: 0,
    todaySteps: 0,
    hasCheckedIn: false,
    weeklyTotal: 0,
    currentStreak: 0,
  });

  const loadDashboardData = async () => {
    try {
      // Get health data from device
      const healthData = await getTodayHealthData();

      // Get score from backend
      const scoreData = await healthAPI.getMemberScore('today');
      const weeklyData = await healthAPI.getMemberScore('week');
      const statsData = await healthAPI.getMemberStats();

      const todayScore = scoreData.daily_scores[0] || {
        points_checkin: 0,
        points_calories: 0,
        points_bonus: 0,
        total_points: 0,
      };

      setData({
        todayPoints: todayScore.total_points,
        todayCalories: healthData.active_calories,
        todaySteps: healthData.steps,
        hasCheckedIn: todayScore.points_checkin > 0,
        weeklyTotal: weeklyData.totals.total,
        currentStreak: statsData.current_streak,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
        <Text style={styles.date}>{dayjs().format('dddd, MMMM D')}</Text>
      </View>

      {/* Quick Check-in Button */}
      {!data.hasCheckedIn && (
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <Text style={styles.checkinButtonText}>📍 Check In Now</Text>
        </TouchableOpacity>
      )}

      {/* Today's Points Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Points</Text>
        <Text style={styles.pointsLarge}>{data.todayPoints}</Text>
        <View style={styles.pointsBreakdown}>
          <View style={styles.pointsItem}>
            <Text style={styles.pointsLabel}>Check-in</Text>
            <Text style={styles.pointsValue}>
              {data.hasCheckedIn ? '50' : '0'}
            </Text>
          </View>
          <View style={styles.pointsItem}>
            <Text style={styles.pointsLabel}>Calories</Text>
            <Text style={styles.pointsValue}>
              {Math.floor(data.todayCalories / 10)}
            </Text>
          </View>
          <View style={styles.pointsItem}>
            <Text style={styles.pointsLabel}>Bonus</Text>
            <Text style={styles.pointsValue}>0</Text>
          </View>
        </View>
      </View>

      {/* Activity Stats */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>🔥 Active Calories</Text>
          <Text style={styles.statValue}>{data.todayCalories}</Text>
          <Text style={styles.statLabel}>kcal</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>👟 Steps</Text>
          <Text style={styles.statValue}>{data.todaySteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>steps</Text>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.weeklyStats}>
          <View>
            <Text style={styles.weeklyValue}>{data.weeklyTotal}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View>
            <Text style={styles.weeklyValue}>{data.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Club')}
        >
          <Text style={styles.actionText}>📊 View Club Rankings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.actionText}>🏆 League Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  checkinButton: {
    backgroundColor: '#6366f1',
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  halfCard: {
    flex: 1,
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  pointsLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    marginVertical: 10,
  },
  pointsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pointsItem: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  weeklyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginTop: 10,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default DashboardScreen;
