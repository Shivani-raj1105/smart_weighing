"use client"

import { motion } from "framer-motion"
import { AmmeterCompass } from "@/components/ammeter-compass"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { RotateCcw, Save, Scale, Activity, TrendingUp, Clock } from "lucide-react"

export function HomeScreen() {
  const {
    currentWeight,
    setCurrentWeight,
    measurementStatus,
    setMeasurementStatus,
    addMeasurement,
    measurementHistory,
    removeLastMeasurement,
  } = useAppContext()

  // ✅ Tare = reset + delete latest log
  const handleTare = () => {
    setCurrentWeight(0)
    setMeasurementStatus("stable")
    removeLastMeasurement()
  }

  // ✅ Reset = only reset (NO deletion)
  const handleReset = () => {
    setCurrentWeight(0)
    setMeasurementStatus("stable")
  }

  const handleSave = () => {
    addMeasurement({
      weight: currentWeight,
      timestamp: new Date(),
      status: currentWeight > 200 ? "overload" : "stable",
      unit: "kg",
    })
  }

  const handleWeightChange = (value: number[]) => {
    const newWeight = value[0]
    setCurrentWeight(newWeight)
    
    if (newWeight > 200) {
      setMeasurementStatus("overload")
    } else if (newWeight > 0) {
      setMeasurementStatus("measuring")
      setTimeout(() => setMeasurementStatus("stable"), 500)
    } else {
      setMeasurementStatus("stable")
    }
  }

  // Stats
  const todayReadings = measurementHistory.filter(
    (r) => new Date(r.timestamp).toDateString() === new Date().toDateString()
  )

  const avgWeight =
    measurementHistory.length > 0
      ? measurementHistory.reduce((sum, r) => sum + r.weight, 0) /
        measurementHistory.length
      : 0

  const getBackgroundGradient = () => {
    const percentage = Math.min(currentWeight / 200, 1)
    const lightness = 8 + percentage * 2
    return `radial-gradient(ellipse at center top, oklch(${lightness}% 0.03 ${
      195 - percentage * 30
    }) 0%, oklch(8% 0.02 250) 70%)`
  }

  return (
    <motion.div
      className="min-h-screen pb-20"
      style={{ background: getBackgroundGradient() }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Weight Scale</h1>
            <p className="text-sm text-muted-foreground">
              Precision Measurement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                measurementStatus === "stable"
                  ? "bg-green-400"
                  : measurementStatus === "measuring"
                  ? "bg-yellow-400 animate-pulse"
                  : measurementStatus === "overload"
                  ? "bg-red-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {measurementStatus}
            </span>
          </div>
        </div>

        {/* Compass */}
        <AmmeterCompass
          weight={currentWeight}
          maxWeight={200}
          minWeight={0}
          status={measurementStatus}
        />

        {/* Slider */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Adjust Weight
              </span>
              <span className="text-sm font-mono text-primary">
                {currentWeight.toFixed(1)} kg
              </span>
            </div>
            <Slider
              value={[currentWeight]}
              onValueChange={handleWeightChange}
              max={200}
              min={0}
              step={0.1}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleTare} className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" />
            Tare
          </Button>

          <Button onClick={handleReset} className="flex-1 gap-2">
            <Scale className="w-4 h-4" />
            Reset
          </Button>

          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4">{todayReadings.length} Today</CardContent></Card>
          <Card><CardContent className="p-4">{avgWeight.toFixed(1)} Avg</CardContent></Card>
          <Card><CardContent className="p-4">{measurementHistory.length} Total</CardContent></Card>
        </div>

        {/* Recent */}
        <div>
          <h3 className="text-sm mb-2">Recent Activity</h3>
          {measurementHistory.slice(0, 3).map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 flex justify-between">
                <span>{r.weight.toFixed(1)} kg</span>
                <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  )
}