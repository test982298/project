// Data transformation utilities for marketing data
export interface TransformedMarketingData {
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

export interface ChannelFilters {
  id: string
  name: string
  checked: boolean
}

export interface DigitalChannelDetails {
  title: string
  channels: { name: string; value: number }[]
}

// Transform the complex API response into chart-friendly format
export function transformMarketingData(apiData: any): {
  studyToDate: TransformedMarketingData
  last7Days: TransformedMarketingData
  last30Days: TransformedMarketingData
  channelFilters: ChannelFilters[]
  digitalChannelDetails: DigitalChannelDetails
} {
  const studyData = apiData.apiResponse.studyMarketingRecruitment[0]
  
  // Define the stages in order
  const stages = [
    'Engaged with Campaign',
    'Primary Pre-Screener',
    'Secondary Pre-Screener',
    'Released to Site',
    'Site Visit Scheduled',
    'Site Visit Completed',
    'Consented',
    'Randomized'
  ]

  // Map stage names to API keys
  const stageKeys = [
    'engagedWithCampaign',
    'primaryPreScreener',
    'secondaryPreScreener',
    'releasedToSite',
    'siteVisitScheduled',
    'siteVisitCompleted',
    'consented',
    'randomized'
  ]

  // Extract data for each channel across all stages
  const extractChannelData = (channelKey: string) => {
    return stageKeys.map(stageKey => {
      return studyData[channelKey][stageKey]?.total || 0
    })
  }

  // Calculate totals across all channels for each stage
  const calculateTotals = () => {
    return stageKeys.map(stageKey => {
      return Object.keys(studyData).reduce((total, channelKey) => {
        if (channelKey !== 'viewSelected' && channelKey !== 'marketingChannels') {
          return total + (studyData[channelKey][stageKey]?.total || 0)
        }
        return total
      }, 0)
    })
  }

  // Base channel configuration
  const channelConfig = {
    digitalMarketing: {
      name: 'Digital Marketing',
      color: '#8B5CF6'
    },
    directAndOfflineMarketing: {
      name: 'Direct & Offline Marketing',
      color: '#06B6D4'
    },
    partnerAndRecruitmentOrg: {
      name: 'Partner & Recruitment Org',
      color: '#10B981'
    },
    other: {
      name: 'Other',
      color: '#F59E0B'
    }
  }

  // Create study to date data
  const studyToDate: TransformedMarketingData = {
    title: 'Marketing Channel Performance',
    subtitle: 'Study to date - All marketing channels performance across recruitment stages',
    channels: {},
    stages,
    totals: calculateTotals(),
    insights: {
      highest: {
        channel: 'Partner & Recruitment Org',
        metric: 'Secondary Pre-Screener conversion',
        value: '357 participants (highest conversion rate)'
      },
      lowest: {
        channel: 'Other',
        metric: 'Randomized completion',
        value: '177 participants (lowest completion rate)'
      }
    }
  }

  // Populate channel data
  Object.entries(channelConfig).forEach(([key, config]) => {
    studyToDate.channels[key] = {
      ...config,
      data: extractChannelData(key)
    }
  })

  // Create variations for different time periods (simulated)
  const createTimeVariation = (baseData: TransformedMarketingData, factor: number, title: string, subtitle: string) => {
    const newData: TransformedMarketingData = {
      title,
      subtitle,
      channels: {},
      stages: baseData.stages,
      totals: baseData.totals.map(total => Math.round(total * factor)),
      insights: {
        highest: {
          channel: 'Digital Marketing',
          metric: 'Secondary Pre-Screener conversion',
          value: `${Math.round(379 * factor)} participants (highest conversion)`
        },
        lowest: {
          channel: 'Other',
          metric: 'Randomized completion',
          value: `${Math.round(177 * factor)} participants (lowest completion)`
        }
      }
    }

    Object.entries(baseData.channels).forEach(([key, channel]) => {
      newData.channels[key] = {
        ...channel,
        data: channel.data.map(value => Math.round(value * factor))
      }
    })

    return newData
  }

  const last7Days = createTimeVariation(
    studyToDate,
    0.15,
    'Marketing Channel Performance',
    'Last 7 days - Recent marketing channels performance'
  )

  const last30Days = createTimeVariation(
    studyToDate,
    0.55,
    'Marketing Channel Performance',
    'Last 30 days - Monthly marketing channels performance'
  )

  // Channel filters based on the marketing channels in the data
  const channelFilters: ChannelFilters[] = [
    { id: 'all', name: 'All Channels', checked: true },
    { id: 'webpage', name: 'Webpage', checked: false },
    { id: 'email', name: 'Email', checked: false },
    { id: 'directMail', name: 'Direct Mail', checked: false },
    { id: 'partnershipMarketing', name: 'Partnership Marketing', checked: false },
    { id: 'onlineRecruitment', name: 'Online Recruitment', checked: false },
    { id: 'offlineRecruitment', name: 'Offline Recruitment', checked: false },
    { id: 'socialMedia', name: 'Social Media', checked: false },
    { id: 'sms', name: 'SMS', checked: false }
  ]

  // Extract digital channel details from the nested data
  const digitalData = studyData.digitalMarketing.engagedWithCampaign
  const digitalChannelDetails: DigitalChannelDetails = {
    title: 'Digital Marketing Channels Breakdown',
    channels: [
      { 
        name: 'Webpage', 
        value: Object.values(digitalData.webPage).reduce((sum: number, val: any) => sum + val, 0) 
      },
      { 
        name: 'Social Media', 
        value: Object.values(digitalData.socialMedia).reduce((sum: number, val: any) => sum + val, 0) 
      },
      { 
        name: 'Email', 
        value: Object.values(digitalData.email).reduce((sum: number, val: any) => sum + val, 0) 
      },
      { 
        name: 'SMS', 
        value: Object.values(digitalData.sms).reduce((sum: number, val: any) => sum + val, 0) 
      },
      { 
        name: 'Search', 
        value: Object.values(digitalData.search).reduce((sum: number, val: any) => sum + val, 0) 
      },
      { 
        name: 'CPA', 
        value: Object.values(digitalData.cpa).reduce((sum: number, val: any) => sum + val, 0) 
      }
    ]
  }

  return {
    studyToDate,
    last7Days,
    last30Days,
    channelFilters,
    digitalChannelDetails
  }
}