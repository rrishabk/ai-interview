"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TrendChart } from '../../../components/ui/TrendChart';
import { apiClient, ReportResponse } from '../../../services/apiClient';
import styles from './Report.module.css';

export default function Report() {
  const params = useParams();
  const id = params?.id as string;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    apiClient.getReport(id as string)
      .then(data => {
        setReport(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load report.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const toggleRow = (questionId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (isLoading) {
    return <div className="animate-fade-in" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading report data...</div>;
  }

  if (error || !report) {
    return (
      <div className="animate-fade-in" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626', marginBottom: 'var(--space-4)' }}>Error Loading Report</h2>
        <p className="text-secondary">{error}</p>
        <p className="text-tertiary" style={{ fontSize: '12px', marginTop: 'var(--space-2)' }}>Backend API is missing.</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.reportHeader}>
        <div>
          <div className={styles.reportTitle}>INTERVIEW REPORT</div>
          <h1 className={styles.roleTitle}>{report.role}</h1>
          <div className={styles.companyDate}>
            <strong>{report.company}</strong>
            <span>•</span>
            {report.date}
          </div>
        </div>
        <div className={styles.overallScoreBox}>
          <div className={styles.scoreLabel}>Overall Score</div>
          <div className={styles.scoreValue}>
            {report.overallScore} <span className={styles.scoreTotal}>/ 100</span>
          </div>
        </div>
      </header>

      <div className={styles.gridTwoCol}>
        <div>
          <h2 className={styles.sectionTitle}>Performance Breakdown</h2>
          <div>
            {report.breakdown.map((item) => (
              <div key={item.label} className={styles.meterRow}>
                <div className={styles.meterLabel}>{item.label}</div>
                <div className={styles.meterTrack}>
                  <div className={styles.meterFill} style={{ width: `${item.score}%` }} />
                </div>
                <div className={styles.meterValue}>{item.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Performance Overview</h2>
          <div className={styles.chartContainer}>
             <TrendChart data={report.scoreProgression} height={140} />
          </div>
        </div>
      </div>

      <div className={styles.gridTwoCol}>
        <div>
          <h2 className={styles.sectionTitle}>Strengths</h2>
          <div className={styles.listContainer}>
            {report.strengths.map((str, i) => (
              <div key={i} className={styles.listItem}>
                <span className="text-mono" style={{ color: 'var(--text-primary)', marginTop: '-2px' }}>+</span>
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Weaknesses</h2>
          <div className={styles.listContainer}>
            {report.weaknesses.map((wk, i) => (
              <div key={i} className={styles.listItem}>
                <span className="text-mono" style={{ color: 'var(--text-tertiary)', marginTop: '-2px' }}>-</span>
                <span>{wk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className={styles.sectionTitle}>Recommendations</h2>
        <div className={styles.listContainer}>
          {report.recommendations.map((rec, i) => (
            <div key={i} className={styles.listItem}>
              <span className="text-mono" style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginRight: '4px' }}>{(i+1).toString().padStart(2, '0')}</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Question-by-Question Breakdown</h2>
        <div className={styles.accordion}>
          {report.questions.map((q) => {
            const isExpanded = expandedRows[q.id];
            return (
              <div key={q.id} className={styles.accordionRow}>
                <div className={styles.accordionHeader} onClick={() => toggleRow(q.id)}>
                  <div className={styles.accQuestionNum}>Question {String(q.number).padStart(2, '0')}</div>
                  <div className={styles.accScore}>{q.score}</div>
                  <div className={styles.accCategory}>{q.category}</div>
                  <div className={styles.accAction}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className={`${styles.accordionContent} animate-slide-up`}>
                    <div className={styles.questionBlock}>{q.questionText}</div>
                    
                    <div className={styles.dataGrid}>
                      <div className={styles.dataBlock}>
                        <div className={styles.dataLabel}>Candidate Answer (Transcript)</div>
                        <div className={styles.dataValue}>{q.candidateAnswer || 'Not available'}</div>
                      </div>
                      <div className={styles.dataBlock}>
                        <div className={styles.dataLabel}>Evaluation</div>
                        <div className={styles.dataValue}>{q.evaluation || 'Not available'}</div>
                      </div>
                      <div className={styles.dataBlock} style={{ gridColumn: '1 / -1' }}>
                        <div className={styles.dataLabel}>Actionable Feedback</div>
                        <div className={styles.dataValue}>{q.feedback || 'Not available'}</div>
                      </div>
                    </div>

                    <div className={styles.evidenceGrid}>
                      <div className={styles.evidenceBlock}>
                        <div className={styles.evidenceLabel}>Speech Analysis</div>
                        <div className={styles.evidenceValue}>{q.speechAnalysis || 'Not available'}</div>
                      </div>
                      <div className={styles.evidenceBlock}>
                        <div className={styles.evidenceLabel}>Emotion Analysis</div>
                        <div className={styles.evidenceValue}>{q.emotionAnalysis || 'Not available'}</div>
                      </div>
                      <div className={styles.evidenceBlock}>
                        <div className={styles.evidenceLabel}>Communication Signals</div>
                        <div className={styles.evidenceValue}>{q.communicationSignals || 'Not available'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

