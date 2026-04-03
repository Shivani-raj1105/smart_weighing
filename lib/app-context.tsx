"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type MeasurementStatus =
  | "stable"
  | "measuring"
  | "overload"
  | "disconnected"

export interface MeasurementReading {
  id: string
  weight: number
  timestamp: Date
  status: MeasurementStatus
  unit: "kg"
}

export interface Device {
  id: string
  name: string
  status: "online" | "offline"
  battery: number
  lastCalibration: Date
  isConnected: boolean
}

export interface Alert {
  id: string
  type: "warning" | "error" | "info" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  sex?: "male" | "female" | "other"
  height?: number
  avatar?: string
}

interface AppContextType {
  isAuthenticated: boolean
  user: User | null
  setIsAuthenticated: (value: boolean) => void
  setUser: (user: User | null) => void

  currentWeight: number
  setCurrentWeight: (weight: number) => void
  measurementStatus: MeasurementStatus
  setMeasurementStatus: (status: MeasurementStatus) => void

  measurementHistory: MeasurementReading[]
  addMeasurement: (reading: Omit<MeasurementReading, "id">) => void
  removeLastMeasurement: () => void

  devices: Device[]
  setDevices: (devices: Device[]) => void

  alerts: Alert[]
  addAlert: (alert: Omit<Alert, "id">) => void
  markAlertRead: (id: string) => void
  dismissAlert: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mock data
const mockHistory: MeasurementReading[] = [
  { id: "1", weight: 45.5, timestamp: new Date(Date.now() - 3600000), status: "stable", unit: "kg" },
  { id: "2", weight: 78.2, timestamp: new Date(Date.now() - 7200000), status: "stable", unit: "kg" },
  { id: "3", weight: 125.0, timestamp: new Date(Date.now() - 10800000), status: "stable", unit: "kg" },
  { id: "4", weight: 210.5, timestamp: new Date(Date.now() - 14400000), status: "overload", unit: "kg" },
  { id: "5", weight: 62.8, timestamp: new Date(Date.now() - 18000000), status: "stable", unit: "kg" },
]

const mockDevices: Device[] = [
  { id: "1", name: "Scale Unit A", status: "online", battery: 85, lastCalibration: new Date(Date.now() - 86400000 * 7), isConnected: true },
  { id: "2", name: "Scale Unit B", status: "offline", battery: 23, lastCalibration: new Date(Date.now() - 86400000 * 30), isConnected: false },
  { id: "3", name: "Scale Unit C", status: "online", battery: 100, lastCalibration: new Date(Date.now() - 86400000 * 2), isConnected: false },
]

const mockAlerts: Alert[] = [
  { id: "1", type: "warning", title: "Low Battery", message: "Scale Unit B battery is below 25%", timestamp: new Date(Date.now() - 1800000), read: false },
  { id: "2", type: "info", title: "Calibration Due", message: "Scale Unit B needs calibration", timestamp: new Date(Date.now() - 86400000), read: true },
  { id: "3", type: "success", title: "Device Connected", message: "Scale Unit A is now online", timestamp: new Date(Date.now() - 3600000), read: true },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentWeight, setCurrentWeight] = useState(0)
  const [measurementStatus, setMeasurementStatus] =
    useState<MeasurementStatus>("stable")

  // ✅ Ensure initial data is sorted (latest first)
  const [measurementHistory, setMeasurementHistory] =
    useState<MeasurementReading[]>(
      [...mockHistory].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )
    )

  const [devices, setDevices] = useState<Device[]>(mockDevices)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  // ✅ Always insert newest at top + keep sorted
  const addMeasurement = (reading: Omit<MeasurementReading, "id">) => {
    const newReading: MeasurementReading = {
      ...reading,
      id: Date.now().toString(),
    }

    setMeasurementHistory((prev) =>
      [newReading, ...prev].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )
    )
  }
  // ✅ Instantly removes the top item from Recent Activity
  // ✅ Instantly removes the top item from Recent Activity
  const removeLastMeasurement = () => {
    setMeasurementHistory((prev) => {
      if (prev.length === 0) return prev;
      
      console.log("🗑️ TARE CLICKED: Deleting record ->", prev[0].weight, "kg");
      
      // Grabs the ID of the top item and filters it out
      const idToRemove = prev[0].id;
      return prev.filter(item => item.id !== idToRemove);
    });
  }
  const addAlert = (alert: Omit<Alert, "id">) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
    }
    setAlerts((prev) => [newAlert, ...prev])
  }
  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    )
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        currentWeight,
        setCurrentWeight,
        measurementStatus,
        setMeasurementStatus,
        measurementHistory,
        addMeasurement,
        removeLastMeasurement,
        devices,
        setDevices,
        alerts,
        addAlert,
        markAlertRead,
        dismissAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}