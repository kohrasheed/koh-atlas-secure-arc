/**
 * Stub file - Old analyzer removed, using AI-only analysis now
 * This file exists temporarily to prevent import errors during migration
 */

// Empty exports to satisfy TypeScript imports during refactoring
export const COMPLIANCE_FRAMEWORKS: any[] = [];
export const KNOWN_CVES: any[] = [];

export interface ComplianceFramework {}
export interface CVEVulnerability {}

export class SecurityAnalyzer {
  checkCompliance() {
    console.warn('Old SecurityAnalyzer called - use AI analysis instead');
    return { passed: [], failed: [], notApplicable: [], score: 0 };
  }
  
  checkCVEs() {
    console.warn('Old CVE check called - use AI analysis instead');
    return [];
  }
  
  generateSTRIDEThreats() {
    console.warn('Old STRIDE analyzer called - use AI analysis instead');
    return [];
  }
}
