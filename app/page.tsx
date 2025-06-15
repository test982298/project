'use client'

import React, { useState, useEffect } from 'react'
import { MarketingChart } from '@/components/MarketingChart'
import { FilterDropdown } from '@/components/FilterDropdown'
import { DigitalChannelModal } from '@/components/DigitalChannelModal'
import { InsightCard } from '@/components/InsightCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MarketingData {
  title: string
  subtitle: string
  channels: Record<string, {
    name: string
    color: string
    data: number[]
  }>
  stages: string[]
  totals: number[]
  insights?: {
    highest: {
      channel: string
      metric: string
      value: string
    }
    lowest: {
      channel: string
      metric: string
      value: string
    }
  }
}

interface FilterOption {
  id: string
  name: string
  checked: boolean
}

export default function Home() {
  const [currentData, setCurrentData] = useState<MarketingData | null>(null)
  const [allData, setAllData] = useState<Record<string, MarketingData>>({})
  const [channelFilters, setChannelFilters] = useState<FilterOption[]>([])
  const [digitalChannelDetails, setDigitalChannelDetails] = useState<{
    title: string
    channels: { name: string; value: number }[]
  } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('studyToDate')
  const [showDigitalModal, setShowDigitalModal] = useState(false)

  useEffect(() => {
    fetch('/marketing-data.json')
      .then(response => response.json())
      .then(data => {
        setAllData({
          studyToDate: data.studyToDate,
          last7Days: data.last7Days,
          last30Days: data.last30Days
        })
        setCurrentData(data.studyToDate)
        setChannelFilters(data.channelFilters)
        setDigitalChannelDetails(data.digitalChannelDetails)
      })
      .catch(error => console.error('Error loading data:', error))
  }, [])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (allData[period]) {
      setCurrentData(allData[period])
    }
  }

  const handleChannelFilterChange = (optionId: string, checked: boolean) => {
    setChannelFilters(prev => 
      prev.map(option => 
        option.id === optionId ? { ...option, checked } : option
      )
    )
  }

  const handleViewDetails = () => {
    setShowDigitalModal(true)
  }

  // Filter channels based on selected filters
  const getFilteredChannels = () => {
    if (!currentData) return {}
    
    const allSelected = channelFilters.find(f => f.id === 'all')?.checked
    if (allSelected) return currentData.channels

    const selectedFilters = channelFilters.filter(f => f.checked && f.id !== 'all')
    if (selectedFilters.length === 0) return currentData.channels

    // Map filter IDs to channel keys
    const filterToChannelMap: Record<string, string> = {
      'webpage': 'digitalMarketing',
      'email': 'digitalMarketing', 
      'directMail': 'directOfflineMarketing',
      'partnershipMarketing': 'partnerRecruitmentOrg',
      'onlineRecruitment': 'partnerRecruitmentOrg',
      'offlineRecruitment': 'directOfflineMarketing',
      'socialMedia': 'digitalMarketing',
      'sms': 'digitalMarketing'
    }

    const channelsToShow = new Set<string>()
    selectedFilters.forEach(filter => {
      const channelKey = filterToChannelMap[filter.id]
      if (channelKey) {
        channelsToShow.add(channelKey)
      }
    })

    const filteredChannels: Record<string, any> = {}
    Object.entries(currentData.channels).forEach(([key, channel]) => {
      if (channelsToShow.has(key)) {
        filteredChannels[key] = channel
      }
    })

    return filteredChannels
  }

  if (!currentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const filteredChannels = getFilteredChannels()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentData.title}</h1>
          <p className="text-gray-600">{currentData.subtitle}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Marketing</span>
            <FilterDropdown
              label="Marketing Channels"
              options={channelFilters}
              onOptionChange={handleChannelFilterChange}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View</span>
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studyToDate">Study to date</SelectItem>
                <SelectItem value="last7Days">Last 7 days</SelectItem>
                <SelectItem value="last30Days">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Chart */}
          <div className="xl:col-span-3">
            <MarketingChart
              channels={filteredChannels}
              stages={currentData.stages}
              totals={currentData.totals}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Sidebar - Full Height Insights */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            {/* Insights - Full Height Cards */}
            {currentData.insights && (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex-1">
                  <InsightCard
                    channel={currentData.insights.highest.channel}
                    metric={currentData.insights.highest.metric}
                    value={currentData.insights.highest.value}
                    type="highest"
                    className="h-full"
                  />
                </div>
                <div className="flex-1">
                  <InsightCard
                    channel={currentData.insights.lowest.channel}
                    metric={currentData.insights.lowest.metric}
                    value={currentData.insights.lowest.value}
                    type="lowest"
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Digital Channel Modal */}
        {digitalChannelDetails && (
          <DigitalChannelModal
            isOpen={showDigitalModal}
            onClose={() => setShowDigitalModal(false)}
            channels={digitalChannelDetails.channels}
            title={digitalChannelDetails.title}
          />
        )}
      </div>
    </div>
  )
}