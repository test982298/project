'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronDown, ChevronUp } from 'lucide-react' 

interface ChannelData {
  name: string
  value: number
  subChannels?: ChannelData[]
}

interface DigitalChannelModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
}

export function DigitalChannelModal({
  isOpen,
  onClose,
  title
}: DigitalChannelModalProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const channels: ChannelData[] = [
    { name: 'Webpage', value: 62 },
    {
      name: 'Social Media',
      subChannels: [
        { name: 'Facebook', value: 52 },
        { name: 'Instagram', value: 43 },
        { name: 'X', value: 20 }
      ],
      value: 0
    },
    { name: 'Email', value: 28 },
    { name: 'SMS', value: 32 },
    { name: 'Search', value: 14 },
    { name: 'CPA', value: 5 }
  ]

  const getTotal = (channel: ChannelData): number => {
    if (channel.subChannels) {
      return channel.subChannels.reduce((acc, sub) => acc + sub.value, 0)
    }
    return channel.value
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-white rounded-md">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
            </button>
          </div>
        </DialogHeader>

        {/* Channel List */}
        <div className="px-4 py-3 space-y-2">
          {channels.map(channel => {
            const isOpen = openSections[channel.name] || false
            const total = getTotal(channel)

            return (
              <div key={channel.name} className="rounded bg-purple-50 px-4 py-2">
                <div
                  className="w-full flex items-center justify-between text-purple-700 font-medium cursor-pointer"
                  onClick={() => toggleSection(channel.name)}
                >
                  {/* Left: Arrow + Name */}
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span>{channel.name}</span>
                  </div>

                  {/* Right: Value */}
                  <span>{total}</span>
                </div>

                {/* Expandable Section */}
                {isOpen && (
                  <div className="pl-6 pt-3 space-y-2">
                    {channel.subChannels?.length ? (
                      channel.subChannels.map(sub => (
                        <div
                          key={sub.name}
                          className="flex justify-between items-center text-sm text-gray-800 px-3 py-2 bg-white rounded shadow-sm"
                        >
                          <span>{sub.name}</span>
                          <span>{sub.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 italic">No additional data</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
