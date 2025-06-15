'use client'

import React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface FilterOption {
  id: string
  name: string
  checked: boolean
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  onOptionChange: (optionId: string, checked: boolean) => void
  className?: string
}

export function FilterDropdown({ label, options, onOptionChange, className = '' }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCount = options.filter(option => option.checked).length
  const allSelected = options.find(option => option.id === 'all')?.checked || false

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="text-gray-700">
          {allSelected ? 'All Channels' : 
           selectedCount === 1 ? options.find(opt => opt.checked && opt.id !== 'all')?.name || 'All Channels' :
           selectedCount > 1 ? `${selectedCount} channels selected` : 'Select channels'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                if (option.id === 'all') {
                  // Toggle all options
                  const newChecked = !option.checked
                  options.forEach(opt => onOptionChange(opt.id, newChecked))
                } else {
                  onOptionChange(option.id, !option.checked)
                }
              }}
            >
              <Checkbox
                checked={option.checked}
                onChange={() => {}}
                className="pointer-events-none"
              />
              <span className={`text-sm ${option.id === 'all' ? 'font-medium text-purple-700' : 'text-gray-700'}`}>
                {option.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}