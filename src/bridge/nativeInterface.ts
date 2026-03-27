// src/bridge/nativeInterface.ts

declare global {
  interface Window {
    FlutterBridge?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Sends a message to the Flutter Native layer via JavascriptChannel.
 */
export const sendNativeMessage = (action: string, payload: Record<string, any> = {}) => {
  const message = JSON.stringify({ action, ...payload });
  console.log(`[WebView -> Native] ${message}`);
  
  if (window.FlutterBridge && window.FlutterBridge.postMessage) {
    window.FlutterBridge.postMessage(message);
    return true;
  } else {
    console.warn('FlutterBridge is not available in window object. (Are you running in a standard browser?)');
    return false;
  }
};

export const openDevMenu = () => {
  sendNativeMessage('OPEN_DEV_MENU');
};

export const resetBgService = () => {
  sendNativeMessage('RESET_BG_SERVICE');
};

export const requestBleScan = () => {
  sendNativeMessage('REQUEST_BLE_SCAN');
};

// 추후 추가될 수 있는 Native 호출 명령들
export const startDrivingTracking = () => sendNativeMessage('START_DRIVING_TRACKING');
export const stopDrivingTracking = () => sendNativeMessage('STOP_DRIVING_TRACKING');
export const openNativeCamera = () => sendNativeMessage('OPEN_NATIVE_CAMERA');

export const triggerCheckIn = () => sendNativeMessage('CHECK_IN');
export const triggerCheckOut = () => sendNativeMessage('CHECK_OUT');

export const requestSync = () => sendNativeMessage('REQUEST_SYNC');
export const requestVehicles = () => sendNativeMessage('REQUEST_VEHICLES');
