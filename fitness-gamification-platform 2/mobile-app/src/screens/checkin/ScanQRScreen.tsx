import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { checkinAPI } from '../../api/client';
import { useNavigation } from '@react-navigation/native';

const ScanQRScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const onSuccess = async (e: any) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // Parse QR data
      const qrData = JSON.parse(e.data);
      const { club_id, token, timestamp, expires } = qrData;

      // Validate expiry
      const now = Math.floor(Date.now() / 1000);
      if (now > expires) {
        Alert.alert('QR Code Expired', 'Please scan a new QR code');
        setScanned(false);
        setLoading(false);
        return;
      }

      // Perform check-in
      await checkinAPI.checkIn({
        club_id,
        qr_token: token,
        timestamp,
        device_info: {
          platform: 'mobile',
          // Add more device info if needed
        },
      });

      Alert.alert(
        'Check-in Successful! 🎉',
        'You earned 50 points!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Check-in error:', error);
      Alert.alert(
        'Check-in Failed',
        error.response?.data?.error || 'Please try again',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Checking in...</Text>
        </View>
      ) : (
        <>
          <QRCodeScanner
            onRead={onSuccess}
            flashMode={RNCamera.Constants.FlashMode.auto}
            topContent={
              <View style={styles.topContent}>
                <Text style={styles.title}>Scan Club QR Code</Text>
                <Text style={styles.subtitle}>
                  Point your camera at the QR code displayed at your club
                </Text>
              </View>
            }
            bottomContent={
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            }
            cameraStyle={styles.camera}
            markerStyle={styles.marker}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  topContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  camera: {
    height: '100%',
  },
  marker: {
    borderColor: '#6366f1',
    borderWidth: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: 'transparent',
  },
  cancelButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    margin: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ScanQRScreen;
