import React from 'react';
import { Document } from '@react-pdf/renderer';
import type { ReportData } from './types';

// Import all sections
import { CoverPage } from './sections/CoverPage';
import { ExecutiveSummary } from './sections/ExecutiveSummary';
import { ScopeSection } from './sections/ScopeSection';
import { MethodologySection } from './sections/MethodologySection';
import { ArchitectureOverview } from './sections/ArchitectureOverview';
import { DetailedFindings } from './sections/DetailedFindings';
import { ComplianceSection } from './sections/ComplianceSection';
import { ThreatModelingSection } from './sections/ThreatModelingSection';
import { TargetArchitecture } from './sections/TargetArchitecture';
import { RiskRegister } from './sections/RiskRegister';

interface PDFReportProps {
  data: ReportData;
}

export const PDFReport: React.FC<PDFReportProps> = ({ data }) => {
  // Track page numbers
  let currentPage = 1;
  
  // Calculate number of pages for DetailedFindings section
  const findingsPerPage = 4;
  const findingsPages = Math.ceil(data.findings.length / findingsPerPage) + 1; // +1 for summary page
  
  // Calculate number of pages for RiskRegister
  const risksPerPage = 15;
  const riskPages = Math.ceil(data.findings.length / risksPerPage);
  
  return (
    <Document
      title={`Security Architecture Analysis - ${data.projectName}`}
      author="Koh Atlas Security Analyzer"
      subject="Security Architecture Analysis Report"
      keywords="security, architecture, analysis, STRIDE, compliance"
      creator="Koh Atlas - Secure Architecture Analyzer"
      producer="@react-pdf/renderer"
    >
      {/* Cover Page (page 1) */}
      <CoverPage data={data} />
      
      {/* Executive Summary (page 2) */}
      <ExecutiveSummary data={data} pageNumber={++currentPage} />
      
      {/* Scope of Review (page 3) */}
      <ScopeSection data={data} pageNumber={++currentPage} />
      
      {/* Methodology (page 4) */}
      <MethodologySection data={data} pageNumber={++currentPage} />
      
      {/* Architecture Overview (page 5) */}
      <ArchitectureOverview data={data} pageNumber={++currentPage} />
      
      {/* Detailed Findings (multiple pages) */}
      {DetailedFindings({ data, startPageNumber: ++currentPage })}
      
      {/* Compliance Score (next page) */}
      <ComplianceSection data={data} pageNumber={currentPage + findingsPages} />
      
      {/* Threat Modeling Summary (next page) */}
      <ThreatModelingSection data={data} pageNumber={currentPage + findingsPages + 1} />
      
      {/* Target Architecture (next page) */}
      <TargetArchitecture data={data} pageNumber={currentPage + findingsPages + 2} />
      
      {/* Risk Register (multiple pages) */}
      {RiskRegister({ data, pageNumber: currentPage + findingsPages + 3 })}
    </Document>
  );
};
