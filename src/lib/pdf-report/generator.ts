import React from 'react';
import { pdf } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import type { Node, Edge } from 'reactflow';
import type { ReportData, ReportSecurityFinding, ReportSTRIDEThreat, ReportComplianceResult, ComplianceScore } from './types';
import { PDFReport } from './PDFReport';

/**
 * Collect all data needed for the PDF report
 */
export const collectReportData = async (
  nodes: Node[],
  edges: Edge[],
  findings: any[],
  strideThreats: any[],
  complianceResults: any[],
  attackPaths: any[],
  validationResult: any,
  aiAnalysis: any,
  reactFlowInstance: any,
  projectName: string = 'Unnamed Project'
): Promise<ReportData> => {
  // Generate report ID
  const reportId = `SEC-ARCH-${Date.now().toString(36).toUpperCase()}`;
  
  // Generate report date
  const reportDate = new Date().toISOString();
  
  // Export current architecture diagram as Base64 PNG
  let diagramImage: string | undefined;
  // Skip diagram export for now due to html2canvas color parsing issues with oklch colors
  // Will add diagram in future update
  diagramImage = undefined;
  
  // Calculate score based on findings
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  
  const score = Math.max(0, Math.min(100, 
    100 - (criticalCount * 10 + highCount * 5 + mediumCount * 2 + lowCount * 1)
  ));
  
  // Convert findings to report format
  const reportFindings: ReportSecurityFinding[] = findings.map(f => ({
    title: f.title,
    severity: f.severity,
    category: f.category || 'Security',
    description: f.description,
    affected: f.affected || [],
    risk: f.risk,
    remediation: f.remediation || f.recommendation || '',
    targetState: f.targetState,
    standards: f.standards || [],
    effort: f.effort,
    priority: f.priority,
    isAIEnhanced: f.isAIEnhanced || false
  }));
  
  // Convert STRIDE threats to report format
  const reportThreats: ReportSTRIDEThreat[] = strideThreats.map(t => ({
    component: t.component,
    category: t.category,
    description: t.description,
    likelihood: t.likelihood || 'medium',
    impact: t.impact || 'medium',
    mitigation: t.mitigation,
    status: t.status || 'open'
  }));
  
  // Convert compliance results to report format
  const reportCompliance: ReportComplianceResult[] = [];
  
  // Handle different compliance result formats
  if (Array.isArray(complianceResults)) {
    // Array format
    complianceResults.forEach(c => {
      reportCompliance.push({
        framework: c.framework || 'General',
        control: c.control || '',
        requirement: c.requirement || c.description || '',
        status: c.status || (c.passed ? 'pass' : 'fail'),
        findings: c.findings || []
      });
    });
  } else if (complianceResults && typeof complianceResults === 'object') {
    // Object format with passed/failed arrays
    const { passed = [], failed = [], notApplicable = [] } = complianceResults as any;
    
    passed.forEach((req: any) => {
      reportCompliance.push({
        framework: req.framework || 'General',
        control: req.id || req.control || '',
        requirement: req.requirement || req.description || '',
        status: 'pass',
        findings: []
      });
    });
    
    failed.forEach((req: any) => {
      reportCompliance.push({
        framework: req.framework || 'General',
        control: req.id || req.control || '',
        requirement: req.requirement || req.description || '',
        status: 'fail',
        findings: req.findings || []
      });
    });
    
    notApplicable.forEach((req: any) => {
      reportCompliance.push({
        framework: req.framework || 'General',
        control: req.id || req.control || '',
        requirement: req.requirement || req.description || '',
        status: 'not-applicable',
        findings: []
      });
    });
  }
  
  // Calculate compliance scores by framework
  const complianceScore: Record<string, ComplianceScore> = {};
  
  if (reportCompliance.length > 0) {
    const frameworks = [...new Set(reportCompliance.map(c => c.framework))];
    
    frameworks.forEach(framework => {
      const frameworkResults = reportCompliance.filter(c => c.framework === framework);
      const passedCount = frameworkResults.filter(c => c.status === 'pass').length;
      const totalCount = frameworkResults.filter(c => c.status !== 'not-applicable').length;
      const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
      
      let status: 'pass' | 'fail' | 'partial';
      if (percentage >= 80) status = 'pass';
      else if (percentage >= 50) status = 'partial';
      else status = 'fail';
      
      complianceScore[framework] = {
        percentage,
        status,
        passed: passedCount,
        total: totalCount
      };
    });
  } else {
    // Default if no compliance data
    complianceScore['General'] = {
      percentage: 0,
      status: 'fail',
      passed: 0,
      total: 0
    };
  }
  
  // Prepare report data
  const reportData: ReportData = {
    // Metadata
    reportId,
    reportDate,
    projectName,
    preparedBy: 'Koh Atlas Security Analyzer',
    classification: 'Confidential',
    
    // Architecture data
    nodes,
    edges,
    diagramImage,
    
    // Analysis results
    findings: reportFindings,
    strideThreats: reportThreats,
    complianceResults: reportCompliance,
    attackPaths: attackPaths || [],
    validationResult: validationResult || null,
    
    // Scores
    score,
    complianceScore,
    
    // AI analysis flag
    aiAnalysis: aiAnalysis !== null
  };
  
  return reportData;
};

/**
 * Generate PDF blob from report data
 */
export const generatePDFBlob = async (data: ReportData): Promise<Blob> => {
  const blob = await pdf(<PDFReport data={data} />).toBlob();
  return blob;
};

/**
 * Generate and download PDF report
 */
export const downloadPDFReport = async (data: ReportData): Promise<void> => {
  try {
    const blob = await generatePDFBlob(data);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const dateStr = new Date(data.reportDate).toISOString().split('T')[0];
    const projectSlug = data.projectName.replace(/\s+/g, '-').toLowerCase();
    link.download = `security-report-${projectSlug}-${dateStr}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    throw error;
  }
};

/**
 * Generate PDF and open in new tab (for preview)
 */
export const previewPDFReport = async (data: ReportData): Promise<void> => {
  try {
    const blob = await generatePDFBlob(data);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Note: URL will remain in memory until tab is closed
    // Could implement cleanup with setTimeout if needed
  } catch (error) {
    console.error('Failed to preview PDF report:', error);
    throw error;
  }
};
