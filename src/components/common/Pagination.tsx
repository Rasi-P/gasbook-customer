import React from 'react'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize?: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  disabled = false,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalItems === 0 || totalPages <= 1) {
    return null
  }

  const handlePrev = () => {
    if (currentPage > 1 && !disabled) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) onPageChange(currentPage + 1)
  }

  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
      <button
        onClick={handlePrev}
        disabled={currentPage === 1 || disabled}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: currentPage === 1 || disabled ? '#f8fafc' : '#fff',
          color: currentPage === 1 || disabled ? '#94a3b8' : '#334155',
          cursor: currentPage === 1 || disabled ? 'not-allowed' : 'pointer',
          fontWeight: 500,
        }}
      >
        Previous
      </button>

      <span style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || disabled}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: currentPage === totalPages || disabled ? '#f8fafc' : '#fff',
          color: currentPage === totalPages || disabled ? '#94a3b8' : '#334155',
          cursor: currentPage === totalPages || disabled ? 'not-allowed' : 'pointer',
          fontWeight: 500,
        }}
      >
        Next
      </button>
    </div>
  )
}
