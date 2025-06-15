'use client'

import React, { useState, useEffect } from 'react'

interface MarketingData {
  name: string
  color: string
  data: number[]
}

interface MarketingChartProps {
  channels: Record<string, MarketingData>
  stages: string[]
  totals: number[]
  className?: string
  onViewDetails?: () => void
  digitalChannelData?: { name: string; value: number }[]
}

export function MarketingChart({ 
  channels, 
  stages, 
  totals, 
  className = '', 
  onViewDetails,
  digitalChannelData = []
}: MarketingChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    channel: string
    value: number
    x: number
    y: number
    stage: string
    stageIndex: number
  } | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showHoverPopup, setShowHoverPopup] = useState(false)
  const [hoverPopupPosition, setHoverPopupPosition] = useState({ x: 0, y: 0 })
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoveredStageIndex, setHoveredStageIndex] = useState<number | null>(null)
  const [fixedPoint, setFixedPoint] = useState<{
    channel: string
    value: number
    x: number
    y: number
    stage: string
    stageIndex: number
  } | null>(null)

  const channelArray = Object.values(channels)
  const chartHeight = 300
  const chartWidth = 900
  const padding = { top: 20, right: 40, bottom: 80, left: 60 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const xStep = plotWidth / (stages.length - 1)

  // Find max value for Y-axis scaling
  const maxValue = Math.max(
    ...channelArray.flatMap(channel => channel.data),
    ...totals
  )
  const yAxisMax = Math.ceil(maxValue / 100) * 100 // Round up to nearest 100

  const getY = (value: number) => {
    return padding.top + plotHeight - (value / yAxisMax) * plotHeight
  }

  const getX = (index: number) => {
    return padding.left + index * xStep
  }

  // Y-axis grid lines based on data range
  const yAxisValues = Array.from({ length: 6 }, (_, i) => (yAxisMax / 5) * i)

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    // Don't show hover popup if there's a fixed point
    if (fixedPoint) return

    const rect = event.currentTarget.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    // Find the closest stage index
    let closestIndex = 0
    let minDistance = Math.abs(mouseX - getX(0))
    
    for (let i = 1; i < stages.length; i++) {
      const distance = Math.abs(mouseX - getX(i))
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }

    // Only show hover line if mouse is within the plot area
    if (mouseX >= padding.left && mouseX <= chartWidth - padding.right &&
        mouseY >= padding.top && mouseY <= chartHeight - padding.bottom) {
      setHoverX(getX(closestIndex))
      setHoveredStageIndex(closestIndex)
      
      // Position the popup above the vertical line
      setHoverPopupPosition({ 
        x: getX(closestIndex), 
        y: padding.top - 10
      })
      setShowHoverPopup(true)
    } else {
      setHoverX(null)
      setHoveredStageIndex(null)
      setShowHoverPopup(false)
    }
  }

  // Add a ref and a leave timer for the hover popup
  const hoverPopupRef = React.useRef<HTMLDivElement | null>(null)
  const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Helper to clear leave timer
  const clearLeaveTimer = () => {
    if (leaveTimer) {
      clearTimeout(leaveTimer)
      setLeaveTimer(null)
    }
  }

  // Modified handleMouseLeave to delay hiding if mouse enters popup
  const handleMouseLeave = (e?: React.MouseEvent) => {
    // Don't clear hover states if there's a fixed point
    if (fixedPoint) return
    // If mouse is moving to popup, don't hide
    if (hoverPopupRef.current && e && hoverPopupRef.current.contains(e.relatedTarget as Node)) {
      return
    }
    // Delay hiding
    const timer = setTimeout(() => {
      setHoverX(null)
      setHoveredStageIndex(null)
      setShowHoverPopup(false)
      setShowTooltip(false)
      setHoveredPoint(null)
      setLeaveTimer(null)
    }, 300)
    setLeaveTimer(timer)
  }

  // Mouse enter/leave handlers for popup
  const handlePopupMouseEnter = () => {
    clearLeaveTimer()
  }
  const handlePopupMouseLeave = () => {
    // Hide after short delay
    const timer = setTimeout(() => {
      setHoverX(null)
      setHoveredStageIndex(null)
      setShowHoverPopup(false)
      setShowTooltip(false)
      setHoveredPoint(null)
      setLeaveTimer(null)
    }, 300)
    setLeaveTimer(timer)
  }

  const handlePointClick = (channel: MarketingData, value: number, index: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const pointData = {
      channel: channel.name,
      value,
      x,
      y,
      stage: stages[index],
      stageIndex: index
    }

    // Set fixed point and show tooltip
    setFixedPoint(pointData)
    setHoveredPoint(pointData)
    setShowTooltip(true)
    setShowHoverPopup(false) // Hide hover popup when showing tooltip

    // Set fixed vertical line
    setHoverX(getX(index))
    setHoveredStageIndex(index)

    // Clear existing timer
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }
  }

  const handleViewDetailsClick = () => {
    setShowTooltip(false)
    setShowHoverPopup(false)
    setHoveredPoint(null)
    setFixedPoint(null)
    setHoverX(null)
    setHoveredStageIndex(null)
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }
    if (onViewDetails) {
      onViewDetails()
    }
  }

  // Handle clicks outside to clear fixed point
  const handleChartClick = (event: React.MouseEvent<SVGSVGElement>) => {
    // If clicking on empty space, clear fixed point
    const target = event.target as SVGElement
    if (target.tagName === 'svg' || target.tagName === 'g') {
      setFixedPoint(null)
      setShowTooltip(false)
      setHoverX(null)
      setHoveredStageIndex(null)
    }
  }

  useEffect(() => {
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer)
      }
    }
  }, [tooltipTimer])

  // Get Digital Marketing channel data for the hovered stage
  const getDigitalMarketingDataForStage = (stageIndex: number) => {
    const digitalChannel = channels['digitalMarketing']
    if (!digitalChannel) return null
    
    const stageValue = digitalChannel.data[stageIndex]
    return {
      channel: 'Digital Marketing',
      value: stageValue,
      stage: stages[stageIndex],
      stageIndex
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 relative ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap gap-6 mb-6">
        {channelArray.map((channel) => (
          <div key={channel.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: channel.color }}
            />
            <span className="text-sm text-gray-700">{channel.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleChartClick}
        >
          {/* Grid lines */}
          {yAxisValues.map((value) => (
            <g key={value}>
              <line
                x1={padding.left}
                y1={getY(value)}
                x2={chartWidth - padding.right}
                y2={getY(value)}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={getY(value) + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(value)}
              </text>
            </g>
          ))}

          {/* Hover/Fixed vertical line */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={padding.top}
              x2={hoverX}
              y2={chartHeight - padding.bottom}
              stroke="#6366F1"
              strokeWidth="2"
              className="pointer-events-none"
            />
          )}

          {/* Channel lines */}
          {channelArray.map((channel) => (
            <g key={channel.name}>
              {/* Line path */}
              <path
                d={`M ${channel.data.map((value, index) => 
                  `${getX(index)},${getY(value)}`
                ).join(' L ')}`}
                fill="none"
                stroke={channel.color}
                strokeWidth="2"
                className="hover:stroke-4 transition-all duration-200"
              />
              
              {/* Data points */}
              {channel.data.map((value, index) => {
                const isHovered = hoveredStageIndex === index
                const isFixed = fixedPoint && fixedPoint.stageIndex === index && fixedPoint.channel === channel.name
                return (
                  <circle
                    key={index}
                    cx={getX(index)}
                    cy={getY(value)}
                    r={isHovered || isFixed ? "6" : "4"}
                    fill={channel.color}
                    stroke={isHovered || isFixed ? "#fff" : channel.color}
                    strokeWidth={isHovered || isFixed ? "2" : "0"}
                    className="transition-all duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePointClick(channel, value, index, e)
                    }}
                    style={{
                      filter: isHovered || isFixed ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                    }}
                  />
                )
              })}
            </g>
          ))}

          {/* X-axis labels */}
          {stages.map((stage, index) => {
            // Split stage into words
            const words = stage.split(' ')
            let firstLine = words[0] || ''
            let secondLine = ''
            if (words.length > 1) {
              firstLine = words[0] + (words[1] ? ' ' + words[1] : '')
              secondLine = words.slice(2).join(' ')
            }
            return (
              <g key={index}>
                <text
                  x={getX(index)}
                  y={chartHeight - padding.bottom + 22}
                  textAnchor="middle"
                  className="fill-gray-700"
                  style={{ fontSize: '9px', maxWidth: '80px' }}
                >
                  <tspan x={getX(index)} dy="0">{firstLine}</tspan>
                  {secondLine && (
                    <tspan x={getX(index)} dy="11">{secondLine}</tspan>
                  )}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Popup for Digital Marketing */}
        {showHoverPopup && hoveredStageIndex !== null && channels['digitalMarketing'] && (
          <div
            ref={hoverPopupRef}
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30 min-w-80 pointer-events-auto"
            style={{
              left: `${hoverPopupPosition.x}px`,
              top: `${hoverPopupPosition.y - 20}px`,
              transform: 'translateX(-50%) translateY(-100%)',
              minWidth: '320px',
              maxWidth: '400px',
            }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Digital Marketing Channels</h3>
              <p className="text-sm text-gray-600">{stages[hoveredStageIndex]}</p>
            </div>
            <div className="space-y-3">
              {digitalChannelData.map((channel, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{channel.name}:</span>
                  <span className="text-sm font-semibold text-gray-900">{channel.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleViewDetailsClick}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors duration-200"
            >
              View Details
            </button>
          </div>
        )}

        {/* Digital Marketing Overlay (when clicking View Details) */}
        {showTooltip && hoveredPoint && hoveredPoint.channel === 'Digital Marketing' && (
          <div
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 min-w-80"
            style={{
              right: 0,
              top: `50%`,
              transform: 'translateY(-50%)',
              position: 'absolute',
              marginRight: '24px',
              minWidth: '320px',
              maxWidth: '400px',
            }}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 text-right">Digital Marketing Channels</h3>
            </div>
            <div className="space-y-3">
              {digitalChannelData.map((channel, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{channel.name}:</span>
                  <span className="text-sm font-semibold text-gray-900">{channel.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleViewDetailsClick}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors duration-200 text-right"
              style={{ float: 'right' }}
            >
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Bottom totals */}
      <div className="mt-6 grid grid-cols-8 gap-4 text-center">
        {stages.map((stage, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-600 mb-1">All Channels</div>
            <div className="text-lg font-semibold text-gray-900">{totals[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}