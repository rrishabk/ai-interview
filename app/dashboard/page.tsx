"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { TrendChart } from '../../components/ui/TrendChart';
import {
  mockMetrics,
  mockPerformanceTrend,
  mockRecentInterviews,
  mockPerformanceBreakdown
} from '../../src/data/mockDashboard';
import styles from './Overview.module.css';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Good morning</h1>
          <p className={styles.subtitle}>Your interview performance at a glance.</p>
        </div>
        <Link href="/interviews/new" className={styles.primaryAction}>
          Start new interview <ArrowRight size={14} />
        </Link>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Interviews</div>
          <div className={styles.metricValue}>{mockMetrics.totalInterviews}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average Score</div>
          <div className={styles.metricValue}>{mockMetrics.averageScore}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Technical Score</div>
          <div className={styles.metricValue}>{mockMetrics.technicalScore}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Communication</div>
          <div className={styles.metricValue}>{mockMetrics.communicationScore}</div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Performance Trend</h2>
        <div className={styles.trendContainer}>
          <TrendChart data={mockPerformanceTrend} height={160} />
        </div>
      </section>

      <div className={styles.columns}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Recent Interviews</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentInterviews.map((interview) => (
                  <tr 
                    key={interview.id} 
                    className={styles.tableRow}
                    onClick={() => router.push(`/reports/${interview.id}`)}
                  >
                    <td>{interview.role}</td>
                    <td className="text-secondary">{interview.company}</td>
                    <td className={styles.monoCell}>{interview.score}</td>
                    <td className={`${styles.monoCell} text-secondary`}>{interview.date}</td>
                    <td><span className={styles.badge}>{interview.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Performance Breakdown</h2>
          <div className={styles.breakdownContainer}>
            {mockPerformanceBreakdown.map((item) => (
              <div key={item.category} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>{item.category}</div>
                <div className={styles.breakdownTrack}>
                  <div 
                    className={styles.breakdownFill} 
                    style={{ width: `${item.score}%` }} 
                  />
                </div>
                <div className={styles.breakdownScore}>{item.score}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
