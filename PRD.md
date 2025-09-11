# Koh Atlas — Secure Architecture Designer PRD

Koh Atlas is a visual architecture design tool that enables security architects to create network diagrams, annotate connections with security metadata, and receive AI-driven security analysis with actionable remediation guidance.

**Experience Qualities**:
1. **Professional** - Clean, enterprise-grade interface that inspires confidence in security reviews
2. **Intuitive** - Drag-and-drop simplicity that makes complex security modeling accessible
3. **Actionable** - Every finding comes with concrete next steps, not just theoretical advice

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-faceted tool requiring sophisticated state management, canvas interactions, rule engine, and comprehensive security knowledge base

## Essential Features

### Visual Architecture Designer
- **Functionality**: Drag-and-drop canvas for placing components (web servers, databases, firewalls) and drawing connections
- **Purpose**: Enable rapid creation of high-level and low-level design diagrams
- **Trigger**: User opens new project or existing diagram
- **Progression**: Select component from palette → Drag to canvas → Connect with other components → Annotate connections
- **Success criteria**: Can create a 3-tier web application diagram in under 2 minutes

### Security Analysis Engine
- **Functionality**: AI-powered analysis that identifies security misconfigurations and compliance gaps
- **Purpose**: Proactively catch security issues before deployment
- **Trigger**: User clicks "Analyze" button after creating diagram
- **Progression**: Parse diagram structure → Apply security rules → Generate findings list → Prioritize by risk
- **Success criteria**: Identifies 90%+ of common security anti-patterns with <5% false positives

### Connection Annotation System
- **Functionality**: Rich metadata capture for each connection (ports, protocols, encryption, data classification)
- **Purpose**: Provide security context needed for accurate risk assessment
- **Trigger**: User selects a connection line between components
- **Progression**: Click connection → Side panel opens → Fill in protocol/port/security details → Save annotations
- **Success criteria**: All critical security metadata can be captured in standardized format

### Automated Remediation Guidance
- **Functionality**: One-click application of security fixes with before/after preview
- **Purpose**: Accelerate remediation and reduce security expertise burden
- **Trigger**: User clicks "Fix" button on a security finding
- **Progression**: Review suggested fix → Preview diagram changes → Apply fix → Update risk assessment
- **Success criteria**: 80% of findings can be auto-remediated with sensible defaults

### Standards Compliance Mapping
- **Functionality**: Map findings to security frameworks (NIST, CIS, ISO 27001)
- **Purpose**: Support compliance reporting and audit evidence
- **Trigger**: Automatic during analysis, viewable in standards matrix
- **Progression**: Analysis generates findings → Map to relevant controls → Export compliance report
- **Success criteria**: Coverage of major enterprise security frameworks with exportable evidence

## Edge Case Handling
- **Invalid Connections**: Prevent nonsensical links (e.g., database to firewall) with helpful error messages
- **Large Diagrams**: Graceful performance degradation with virtualization for 1000+ components
- **Corrupted Data**: Auto-recovery and version history to prevent data loss
- **Offline Usage**: Local caching for air-gapped security reviews
- **Export Failures**: Retry mechanisms and fallback formats for critical deliverables

## Design Direction
The design should feel authoritative and trustworthy, like enterprise security tooling used by Fortune 500 companies. Clean, minimal interface that lets complex security information shine through without visual clutter. Professional but not intimidating - approachable enough for DevOps teams while sophisticated enough for security architects.

## Color Selection
Complementary (opposite colors) - Using deep navy blue as primary with warm orange accents to create professional contrast that draws attention to critical security findings while maintaining enterprise credibility.

- **Primary Color**: Deep Navy Blue (oklch(0.25 0.08 240)) - Communicates trust, security, and enterprise professionalism
- **Secondary Colors**: Cool Gray (oklch(0.85 0.02 240)) for backgrounds and Light Gray (oklch(0.95 0.01 240)) for cards
- **Accent Color**: Warm Orange (oklch(0.70 0.15 45)) - Attention-grabbing highlight for security alerts and CTAs
- **Foreground/Background Pairings**: 
  - Background White (oklch(1 0 0)): Dark Navy text (oklch(0.25 0.08 240)) - Ratio 8.2:1 ✓
  - Primary Navy (oklch(0.25 0.08 240)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent Orange (oklch(0.70 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Card Gray (oklch(0.95 0.01 240)): Dark Navy text (oklch(0.25 0.08 240)) - Ratio 7.8:1 ✓

## Font Selection
Typography should convey technical precision and clarity, using clean sans-serif fonts that remain legible at small sizes for detailed annotations and large sizes for clear hierarchy.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Component Labels): Inter Medium/16px/normal spacing
  - Body Text: Inter Regular/14px/relaxed line height
  - Code/Technical: JetBrains Mono/13px/monospace for ports and protocols

## Animations
Subtle and purposeful animations that enhance the professional feel without being distracting. Motion should guide attention to security findings and provide feedback for canvas interactions.

- **Purposeful Meaning**: Smooth component placement reinforces precision, gentle highlights draw attention to security issues, loading states communicate analysis progress
- **Hierarchy of Movement**: Security alerts get priority animation treatment, followed by user interactions, then ambient canvas animations

## Component Selection
- **Components**: Heavy use of Card for component library and findings, Dialog for component properties, Sheet for analysis results, Button with variants for security severity levels, Badge for protocol/port labels, Tooltip for quick help
- **Customizations**: Custom canvas component using React Flow, specialized security severity indicators, custom icon set for security controls
- **States**: Buttons show loading during analysis, components highlight on hover/select, connections show different styles for encrypted/unencrypted
- **Icon Selection**: Phosphor icons for general UI, custom security-specific icons for firewalls, databases, encryption states
- **Spacing**: Consistent 16px grid system with 8px micro-spacing for tight layouts
- **Mobile**: Responsive sidebar that collapses to overlay, canvas optimized for touch interactions, priority given to findings list on mobile