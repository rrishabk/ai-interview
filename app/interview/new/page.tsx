"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, X, ArrowRight, Loader } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import styles from './NewInterview.module.css';

interface InterviewConfig {
  company: string;
  role: string;
  type: 'Technical' | 'Behavioral' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function NewInterview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<InterviewConfig>({
    company: '',
    role: '',
    type: 'Mixed',
    difficulty: 'Medium',
  });

  const [file, setFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Handlers ---
  const handleConfigChange = (field: keyof InterviewConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Invalid file type. Please upload a PDF, DOCX, or TXT.');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 5MB.');
      return;
    }
    
    setErrorMsg(null);
    setFile(selectedFile);
    setUploadStatus('uploading');

    try {
      const data = await apiClient.uploadResume(selectedFile);
      setResumeId(data.resumeId);
      setUploadStatus('success');
    } catch (error: any) {
      console.warn('API Error:', error);
      setErrorMsg(error.message || 'Failed to upload resume. Ensure the backend is running.');
      setUploadStatus('error');
    }
  };

  const handleStartInterview = async () => {
    if (!config.company || !config.role) {
      setErrorMsg('Please fill in both company and role.');
      return;
    }
    if (!resumeId) {
      setErrorMsg('Please upload a resume first.');
      return;
    }

    setIsStarting(true);
    setErrorMsg(null);

    try {
      const data = await apiClient.startInterview({
        resumeId,
        role: config.role,
        company: config.company,
        type: config.type,
        difficulty: config.difficulty
      });

      router.push(`/interview/${data.sessionId}`);
    } catch (err: any) {
      console.warn('API Error:', err);
      setIsStarting(false);
      setErrorMsg(err.message || 'Failed to start interview. Ensure the backend is running.');
    }
  };

  // --- Renders ---
  const isFormValid = config.company.trim() !== '' && config.role.trim() !== '' && uploadStatus === 'success';

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>New Interview</h1>
        <p className={styles.subtitle}>Configure your target role and evaluation parameters.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Candidate Profile</h2>
        
        {!file ? (
          <div 
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            tabIndex={0}
            role="button"
            aria-label="Upload resume file"
          >
            <UploadCloud className={styles.dropzoneIcon} />
            <div className={styles.dropzoneText}>Click to upload or drag and drop</div>
            <div className={styles.dropzoneSubtext}>PDF, DOCX, or TXT (max 5MB)</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileChange}
              tabIndex={-1}
            />
          </div>
        ) : (
          <div className={styles.fileState}>
            <div className={styles.fileInfo}>
              <FileText size={16} className="text-secondary" />
              <span className="text-mono">{file.name}</span>
              {uploadStatus === 'uploading' && <span className="text-secondary" style={{ fontSize: '11px' }}>Uploading...</span>}
              {uploadStatus === 'success' && <span style={{ color: '#16a34a', fontSize: '11px' }}>Processed</span>}
            </div>
            <button 
              className={styles.removeButton}
              onClick={() => { setFile(null); setUploadStatus('idle'); setResumeId(null); }}
              disabled={uploadStatus === 'uploading'}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Target Position</h2>
        <div className={styles.inputRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Company</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. Google"
              value={config.company}
              onChange={(e) => handleConfigChange('company', e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Role</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. Software Engineer Intern"
              value={config.role}
              onChange={(e) => handleConfigChange('role', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Evaluation Parameters</h2>
        <div className={styles.inputRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Interview Type</label>
            <div className={styles.radioGroup}>
              {['Technical', 'Behavioral', 'Mixed'].map((type) => (
                <React.Fragment key={type}>
                  <input 
                    type="radio" 
                    id={`type-${type}`} 
                    name="interviewType" 
                    className={styles.radioInput}
                    checked={config.type === type}
                    onChange={() => handleConfigChange('type', type as any)}
                  />
                  <label htmlFor={`type-${type}`} className={styles.radioLabel}>{type}</label>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Difficulty</label>
            <div className={styles.radioGroup}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <React.Fragment key={diff}>
                  <input 
                    type="radio" 
                    id={`diff-${diff}`} 
                    name="difficulty" 
                    className={styles.radioInput}
                    checked={config.difficulty === diff}
                    onChange={() => handleConfigChange('difficulty', diff as any)}
                  />
                  <label htmlFor={`diff-${diff}`} className={styles.radioLabel}>{diff}</label>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        {errorMsg && <div className={styles.errorText} style={{ marginBottom: 'var(--space-4)' }}>{errorMsg}</div>}
        
        <div className={styles.summary}>
          <strong>{config.company ? config.company.toUpperCase() : 'COMPANY'}</strong>
          <span>{config.role || 'Role unspecified'}</span>
          <span>{config.type}</span>
          <span>{config.difficulty}</span>
          <span>{uploadStatus === 'success' ? 'Resume attached' : 'No resume attached'}</span>
        </div>

        <button 
          className={styles.submitAction}
          disabled={!isFormValid || isStarting}
          onClick={handleStartInterview}
        >
          {isStarting ? <Loader size={16} className="animate-spin" /> : 'Start Interview'}
          {!isStarting && <ArrowRight size={16} />}
        </button>
      </section>
    </div>
  );
}
