"use client";

import React, { useState, useMemo, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { HistoryRecord, apiClient } from '../../services/apiClient';
import styles from './InterviewHistory.module.css';

type SortField = keyof HistoryRecord;
type SortOrder = 'asc' | 'desc';

export default function InterviewHistory() {
  const router = useRouter();

  const [data, setData] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    apiClient.getHistory()
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to fetch history.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [minScore, setMinScore] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sort
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Keyboard Selection
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Filter & Sort Logic
  const filteredAndSortedData = useMemo(() => {
    let currentData = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      currentData = currentData.filter(d => 
        d.company.toLowerCase().includes(q) || 
        d.role.toLowerCase().includes(q)
      );
    }

    // Type
    if (typeFilter !== 'All') {
      currentData = currentData.filter(d => d.type === typeFilter);
    }

    // Min Score
    if (minScore && !isNaN(Number(minScore))) {
      const min = Number(minScore);
      currentData = currentData.filter(d => d.score !== null && d.score >= min);
    }

    // Date
    if (dateFilter) {
      currentData = currentData.filter(d => d.date === dateFilter);
    }

    // Sort
    currentData.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null) return 1; // nulls last
      if (bVal === null) return -1;

      const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * orderMultiplier;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * orderMultiplier;
      }
      return 0;
    });

    return currentData;
  }, [data, search, typeFilter, minScore, dateFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  
  // Enforce page bounds after filter changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (totalPages === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new fields (usually better for dates/scores)
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < paginatedData.length) {
        router.push(`/reports/${paginatedData[selectedIndex].id}`);
      }
    }
  };

  // Render Helpers
  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    if (!isActive) return <ChevronDown className={styles.sortIcon} />;
    return sortOrder === 'asc' ? 
      <ChevronUp className={`${styles.sortIcon} ${styles.active}`} /> : 
      <ChevronDown className={`${styles.sortIcon} ${styles.active}`} />;
  };

  return (
    <div className={`animate-fade-in ${styles.container}`} onKeyDown={handleKeyDown} tabIndex={0}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interview History</h1>
        <p className={styles.subtitle}>A complete log of all conducted evaluation sessions.</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search company or role..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Type</label>
          <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Min Score</label>
          <input 
            type="number" 
            className={styles.select} 
            placeholder="e.g. 75" 
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            style={{ width: '80px' }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date</label>
          <input 
            type="date" 
            className={styles.dateInput}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>
                <div className={styles.thContent}>Date <SortIcon field="date" /></div>
              </th>
              <th onClick={() => handleSort('company')}>
                <div className={styles.thContent}>Company <SortIcon field="company" /></div>
              </th>
              <th onClick={() => handleSort('role')}>
                <div className={styles.thContent}>Role <SortIcon field="role" /></div>
              </th>
              <th onClick={() => handleSort('type')}>
                <div className={styles.thContent}>Type <SortIcon field="type" /></div>
              </th>
              <th onClick={() => handleSort('score')}>
                <div className={styles.thContent}>Score <SortIcon field="score" /></div>
              </th>
              <th onClick={() => handleSort('duration')}>
                <div className={styles.thContent}>Duration <SortIcon field="duration" /></div>
              </th>
              <th onClick={() => handleSort('status')}>
                <div className={styles.thContent}>Status <SortIcon field="status" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                   <Loader size={16} className="animate-spin" style={{ margin: '0 auto var(--space-4)' }} />
                   Loading history...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className={styles.emptyState} style={{ color: '#dc2626' }}>
                   {error}<br/>
                   <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Backend API is missing.</span>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((record, index) => (
                <tr 
                  key={record.id}
                  className={`${styles.tableRow} ${index === selectedIndex ? styles.selected : ''}`}
                  onClick={() => router.push(`/reports/${record.id}`)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <td className={styles.monoCell} style={{ color: 'var(--text-secondary)' }}>{record.date}</td>
                  <td style={{ fontWeight: 500 }}>{record.company}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{record.role}</td>
                  <td>{record.type}</td>
                  <td className={styles.monoCell}>{record.score !== null ? record.score : '--'}</td>
                  <td className={styles.monoCell}>{record.duration}</td>
                  <td>
                    <span className={styles.badge}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No interviews found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div>Showing {paginatedData.length} of {filteredAndSortedData.length} records</div>
        <div className={styles.pageControls}>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(p => p - 1); setSelectedIndex(-1); }}
          >
            Prev
          </button>
          <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => { setCurrentPage(p => p + 1); setSelectedIndex(-1); }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

