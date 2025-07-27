"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Filter, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  value: string
  category?: string
}

interface FilterSelectorProps {
  options: FilterOption[]
  selectedOptions: string[]
  onSelectionChange: (selected: string[]) => void
  maxSelections?: number
  placeholder?: string
  className?: string
  showClearButton?: boolean
  showCounter?: boolean
}

export function FilterSelector({
  options,
  selectedOptions,
  onSelectionChange,
  maxSelections = 5,
  placeholder = "Selecione filtros...",
  className,
  showClearButton = true,
  showCounter = true
}: FilterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOptionToggle = (optionId: string) => {
    const isSelected = selectedOptions.includes(optionId)
    
    if (isSelected) {
      onSelectionChange(selectedOptions.filter(id => id !== optionId))
    } else {
      if (selectedOptions.length < maxSelections) {
        onSelectionChange([...selectedOptions, optionId])
      }
    }
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const selectedLabels = options
    .filter(option => selectedOptions.includes(option.id))
    .map(option => option.label)

  const isAtLimit = selectedOptions.length >= maxSelections

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between text-left font-normal",
          selectedOptions.length > 0 && "border-pink-500 bg-pink-50 dark:bg-pink-950/10"
        )}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <>
              <Filter className="w-4 h-4 text-pink-500" />
              <span className="text-sm">
                {selectedOptions.length} selecionado{selectedOptions.length !== 1 ? 's' : ''}
              </span>
              {showCounter && (
                <Badge variant="secondary" className="text-xs">
                  {selectedOptions.length}/{maxSelections}
                </Badge>
              )}
            </>
          )}
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Filtros
                </h3>
                {showClearButton && selectedOptions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>
              
              {/* Search Input */}
              <input
                type="text"
                placeholder="Buscar filtros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhum filtro encontrado
                </div>
              ) : (
                <div className="p-1">
                  {filteredOptions.map((option) => {
                    const isSelected = selectedOptions.includes(option.id)
                    const isDisabled = !isSelected && isAtLimit
                    
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button
                          onClick={() => handleOptionToggle(option.id)}
                          disabled={isDisabled}
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-150 flex items-center justify-between",
                            isSelected
                              ? "bg-pink-100 dark:bg-pink-900/20 text-pink-900 dark:text-pink-100"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && (
                              <Check className="w-4 h-4 text-pink-500" />
                            )}
                            {option.label}
                          </span>
                          
                          {isDisabled && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Limite atingido
                            </span>
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {isAtLimit && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-950/10">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Máximo de {maxSelections} filtros selecionados
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Options Display */}
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedOptions.map((optionId) => {
              const option = options.find(opt => opt.id === optionId)
              if (!option) return null
              
              return (
                <motion.div
                  key={optionId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-pink-100 dark:bg-pink-900/20 text-pink-900 dark:text-pink-100 hover:bg-pink-200 dark:hover:bg-pink-900/30"
                  >
                    {option.label}
                    <button
                      onClick={() => handleOptionToggle(optionId)}
                      className="ml-1 hover:text-pink-700 dark:hover:text-pink-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 
