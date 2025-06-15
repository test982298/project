'use client'

import React from 'react'
import { Info } from 'lucide-react'

interface InsightCardProps {
  channel: string
  metric: string
  value: string
  type: 'highest' | 'lowest'
  className?: string
}

export function InsightCard({ channel, metric, value, type, className = '' }: InsightCardProps) {
  const bgColor = type === 'highest' ? 'bg-purple-50' : 'bg-purple-50'
  const borderColor = type === 'highest' ? 'border-purple-200' : 'border-purple-200'

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 relative flex flex-col justify-center ${className}`}>
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-purple-700 mb-1">{channel}</h3>
          <p className="text-sm text-gray-700 mb-2">{metric}</p>
          <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
        <Info className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
      </div>
    </div>
  )
}