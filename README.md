# Koh Atlas - Secure Architecture Designer

**Version 0.3.0** | Last Updated: November 26, 2025

A comprehensive web application for designing, analyzing, and securing application architectures with AI-powered threat modeling, attack path visualization, architectural validation, and interactive data flow simulation.

## 🎯 What's New in v0.3.1 (November 27, 2024)

### **🔄 Legacy Format Import Support**
- **Auto-conversion** - Import architecture JSON in `{components, connections}` format
- **Smart detection** - Automatically recognizes and converts legacy formats
- **Security highlighting** - Insecure connections (HTTP, Telnet, ANY-ANY) shown in red
- **Zone-based layout** - Components auto-positioned by network zone (External, DMZ, Application, etc.)
- **Global risks preservation** - Imports documented security risks into metadata
- **30+ component type mappings** - Supports network-zone, appliance, service, application, database, etc.
- **See IMPORT_GUIDE.md** - Full documentation and examples

## 🎯 What's New in v0.3.0

### **Architectural Validation Engine**
- **15+ validation rules** - Comprehensive architecture best practices checking
- **5 validation categories** - Connectivity, Security Zones, Redundancy, Anti-patterns, Compliance
- **Scoring system** - 0-100 score with weighted penalties (errors: 10pts, warnings: 3pts, info: 1pt)
- **Real-time validation** - Run architectural validation alongside security analysis
- **Detailed reports** - Export validation results with recommendations

### **Enhanced STRIDE Threat Modeling**
- **Improved component detection** - Case-insensitive matching for all cloud providers (AWS, Azure, GCP)
- **Comprehensive coverage** - Detects threats across all 6 STRIDE categories
- **Component-specific threats** - Tailored threats for databases, web servers, APIs, containers, Kubernetes
- **Better mitigations** - More specific and actionable mitigation recommendations
- **Fixed empty threats bug** - STRIDE now generates threats for all architecture types

### **Modern UI/UX Improvements**
- **Searchable component palette** - Instant search across 70+ components
- **Categorized by cloud provider** - Collapsible AWS, Azure, GCP, and Generic sections
- **Component count badges** - See number of components in each category
- **Floating canvas toolbar** - Quick access to undo/redo, align, and delete actions
- **Empty state guidance** - Welcome card with 3-step guide and pro tips for new users
- **Hover effects** - Visual feedback on component palette buttons

## 🎯 What's New in v0.2

### **Flow Visualization System**
- **Interactive data flow tracing** - Visualize how traffic flows through your architecture
- **Animated path highlighting** - Watch data traverse through connected components with smooth animations
- **Resizable flow panel** - Detailed real-time logs with protocol, port, and encryption information
- **Bi-directional analysis** - Trace both upstream and downstream connections
- **Adjustable animation speed** - 1.5 second intervals for clear visualization

### **Enhanced User Experience**
- **Dark theme by default** - Easier on the eyes for long design sessions
- **Fixed "Clear All" functionality** - Properly removes all components and connections
- **Debug logging** - Console output for troubleshooting flow visualization

## Features

### 🎨 **Architecture Design**
- **Drag-and-drop interface** with comprehensive component palette
- **Real-time diagramming** with automated connection management
- **Container support** - VPC/VNet, Subnets, and Network Segmentation zones
- **Component resizing** - Drag corners or set exact dimensions via textboxes
- **Multi-tier architecture support** (Presentation, App, Data, Management tiers)
- **Security zones** (External, DMZ, Internal, Data, Management)
- **Visual component library** covering web, database, network, security, and platform components
- **Custom component library** - Import and manage your own reusable components

### 🔒 **Security Analysis**
- **AI-powered security scanning** with 50+ built-in security rules
- **Real-time vulnerability detection** for misconfigurations and security gaps
- **Standards compliance mapping** (NIST 800-53, CIS Benchmarks, ISO 27001, OWASP)
- **Auto-fix recommendations** with one-click remediation
- **Risk scoring and prioritization** based on likelihood and impact
- **STRIDE threat modeling** with all 6 categories (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

### 🏗️ **Architectural Validation**
- **Architecture best practices** - 15+ validation rules across 5 categories
- **Connectivity validation** - Detects firewall-to-firewall connections, exposed databases, load balancer anti-patterns
- **Security zone validation** - Identifies missing firewalls and trust boundary violations
- **Redundancy checks** - Finds single points of failure and orphaned nodes
- **Anti-pattern detection** - Spots god components, circular dependencies, unencrypted connections
- **Compliance validation** - Checks for monitoring, authentication, backup strategies
- **Architecture scoring** - 0-100 score with detailed breakdown and recommendations

### 🎯 **Attack Path Visualization**
- **Threat modeling capabilities** with MITRE ATT&CK framework integration
- **Attack path analysis** showing potential attack vectors from entry points to targets
- **Step-by-step attack simulation** with difficulty assessment and prerequisites
- **Mitigation recommendations** for each identified attack path
- **Interactive path highlighting** on the architecture diagram

### 🔄 **Data Flow Visualization**
- **Interactive flow tracing** - Click "Show Flow" to see how data moves through your architecture
- **Animated connections** - Pulsing edges show active data paths
- **Node highlighting** - Active components glow, inactive ones dim
- **Resizable log panel** - Drag to resize between 300-800px width
- **Detailed flow logs** - Timestamp, protocol, port, encryption, and depth tracking
- **Real-time updates** - Watch logs populate as the animation progresses
- **Minimizable panel** - Hide/show flow logs without losing data

### 🌙 **Modern UI/UX**
- **Searchable component palette** - Instant search across 70+ components with real-time filtering
- **Cloud provider categorization** - Collapsible sections for AWS, Azure, GCP, and Generic components
- **Component count badges** - Visual indicators showing number of components in each category
- **Floating canvas toolbar** - Always-accessible undo/redo, align, and delete controls
- **Empty state guidance** - Welcome card with step-by-step instructions and pro tips
- **Dark/Light theme support** - Dark theme enabled by default
- **Responsive design** optimized for desktop and mobile
- **Keyboard shortcuts** for power users (Delete, Ctrl+Enter for analysis, Ctrl+Z/Y for undo/redo)
- **Real-time feedback** with toast notifications and loading states
- **Auto-layout** - Reorganize components into logical tiers automatically
- **Hover effects** - Visual feedback on interactive elements

### 📊 **Backup & Management**
- **Project backups** with full state preservation
- **Restore functionality** to load previous designs
- **Backup statistics** showing node/edge counts
- **Comprehensive security reports** in JSON format
- **Architecture documentation** with component metadata
- **Risk registers** with finding details and remediation steps

## Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koh-atlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

### Basic Workflow

1. **Choose a starting point**
   - Select from pre-built templates (Secure Design, Vulnerable Design)
   - Start with a blank canvas for custom architecture

2. **Design your architecture**
   - Drag components from the palette to the canvas
   - Connect components by dragging between connection points
   - Configure component properties and connection details

3. **Visualize data flow**
   - Select any component on the canvas
   - Click "Show Flow" button in the sidebar
   - Watch animated data flow through connections
   - Review detailed logs in the resizable right panel
   - See protocol, port, encryption, and depth information

4. **Analyze security**
   - Click "Analyze" or use Ctrl+Enter to run security checks
   - Review findings in the Security Analysis panel
   - Apply auto-fixes where available

5. **Run architectural validation**
   - Switch to the "Validation" tab in the analysis panel
   - Click "Run Validation" to check architecture best practices
   - Review validation score (0-100) and detailed issues
   - Address errors (10pt penalty), warnings (3pt penalty), and info items (1pt penalty)

6. **Explore attack paths**
   - Switch to the "Threats" tab in the analysis panel
   - Select attack paths to see step-by-step simulation
   - View recommended mitigations for each threat

6. **Save your work**
   - Use the Backup tab to save project snapshots
   - Restore previous versions when needed
   - Export architecture designs for future reference

### Keyboard Shortcuts

- **Delete/Backspace**: Remove selected component or connection
- **Ctrl+Enter** (Cmd+Enter on Mac): Run security analysis
- **Ctrl+Z** (Cmd+Z on Mac): Undo last action
- **Ctrl+Y** (Cmd+Y on Mac): Redo last action
- **Ctrl+F**: Open component search
- **Escape**: Clear selection

### Flow Visualization

1. **Starting a flow visualization**
   - Select any component by clicking on it
   - Click the "Show Flow" button that appears in the sidebar
   - Or use the "Visualize Flow" button in the Properties tab

2. **Understanding the animation**
   - **Blue glow**: Active nodes in the flow path
   - **Pulsing edges**: Active connections being traced
   - **Dimmed components**: Not part of current flow
   - **1.5s intervals**: Each level of the flow advances every 1.5 seconds

3. **Reading flow logs**
   - **Start logs**: Initial configuration and starting node
   - **Connection logs**: Protocol, port, encryption for each hop
   - **Node logs**: Each component reached in the flow
   - **Complete logs**: Summary with total nodes and connections

4. **Managing the flow panel**
   - **Resize**: Drag the left edge of the panel (300-800px)
   - **Minimize**: Click the `>` button in panel header
   - **Reopen**: Click the floating "Flow Log (X)" button
   - **Clear**: Use the Clear button to reset logs

### Component Categories

#### **Application/Infrastructure**
- **Client/UI**: Browser, Mobile App, API Client, IoT Device
- **Web/App**: Web Server, API Gateway, Microservice, Container/Pod
- **Data**: PostgreSQL, MongoDB, Redis, Object Store, Message Queue
- **Network**: Load Balancer, CDN, DNS, VPN, ZTNA Connector
- **Platform**: IdP/SSO, KMS/HSM, SIEM, CI/CD, Monitoring

#### **Security Controls**
- **Perimeter**: Firewall, NGFW, WAF, DDoS Protection
- **Detection**: IDS/IPS, EDR/XDR, SIEM/SOAR
- **Data Protection**: DLP, KMS, Secrets Manager, Database Activity Monitoring
- **Identity**: MFA, SSO, PAM, Directory Services
- **Network**: Micro-segmentation, VLANs, Service Mesh

## Architecture

### Technology Stack
- **Framework**: React 18.3.1 + TypeScript 5.6.3
- **Build Tool**: Vite 6.3.5
- **Diagramming**: ReactFlow (@xyflow/react 12.3.4)
- **UI Components**: shadcn/ui with Tailwind CSS 4.0
- **State Management**: React hooks + localStorage persistence
- **Icons**: Phosphor Icons
- **Notifications**: Sonner toast
- **Styling**: Tailwind CSS with custom design system

### Project Structure
```
src/
├── components/           # React components
│   ├── analysis/        # Security analysis components
│   ├── canvas/          # Diagram canvas components
│   ├── palette/         # Component palette
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── data/                # Static data and templates
```

### Key Components

- **App.tsx**: Main application component with state management
- **DiagramCanvas**: Interactive architecture diagram editor
- **SecurityAnalysis**: Security findings and threat modeling interface
- **AttackPathVisualization**: Threat modeling and attack simulation
- **ComponentPalette**: Draggable component library
- **SecurityAnalyzer**: Core security analysis engine

## Security Rules

The application includes 50+ built-in security rules covering:

### **Encryption & Communication**
- Unencrypted HTTP traffic detection
- Missing TLS/mTLS on sensitive connections
- Weak encryption protocols and ciphers

### **Architecture Patterns**
- Direct database access from web tier
- Missing application tier validation
- Flat network topology issues

### **Access Control**
- Missing multi-factor authentication
- Overprivileged service accounts
- Inadequate network segmentation

### **Data Protection**
- Unmonitored database access
- Missing data loss prevention
- Inadequate backup and recovery

### **Cloud Security**
- Misconfigured storage buckets
- Overly permissive security groups
- Missing encryption at rest

## Attack Path Analysis

### Threat Modeling Features

- **Entry Point Detection**: Automatically identifies external-facing components
- **Target Identification**: Locates high-value assets (databases, identity providers)
- **Path Generation**: Calculates shortest attack paths using graph algorithms
- **Risk Scoring**: Combines likelihood and impact for prioritization
- **Mitigation Mapping**: Provides specific controls for each attack step

### MITRE ATT&CK Integration

Attack paths are mapped to MITRE ATT&CK techniques:
- Initial Access
- Execution
- Persistence
- Privilege Escalation
- Defense Evasion
- Credential Access
- Discovery
- Lateral Movement
- Collection
- Exfiltration
- Impact

## Customization

### Adding New Components

1. Update the component data in `src/data/components.ts`
2. Add appropriate security rules in `src/lib/security-analyzer.ts`
3. Include attack path logic if applicable

### Custom Security Rules

Create new rules in the SecurityAnalyzer class:

```typescript
{
  id: 'custom-rule',
  title: 'Custom Security Check',
  category: 'Custom',
  severity: 'high',
  check: (components, connections) => {
    // Rule logic here
    return findings;
  }
}
```

### Theming

Modify CSS variables in `src/index.css` to customize colors:

```css
:root {
  --primary: oklch(0.25 0.08 240);
  --secondary: oklch(0.90 0.02 240);
  /* ... other variables */
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new security rules
- Update documentation for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version History

### Version 0.3.0 (Current - November 26, 2025)
- [x] **Architectural Validation Engine** - 15+ rules across 5 categories with 0-100 scoring
- [x] **Enhanced STRIDE Threat Modeling** - Improved detection for all cloud providers
- [x] **Searchable Component Palette** - Instant search with cloud provider categorization
- [x] **Floating Canvas Toolbar** - Quick access to undo/redo, align, and delete
- [x] **Empty State Guidance** - Welcome card with instructions and pro tips
- [x] **UI/UX Polish** - Hover effects, badges, collapsible sections

### Version 0.2.0 (November 26, 2025)
- [x] **Flow visualization system** with animated data tracing
- [x] **Resizable flow log panel** with detailed connection info
- [x] **Dark theme as default** for better user experience
- [x] **Bug fixes** - Clear All button, panel resizing
- [x] **Enhanced logging** - Console output and toast notifications

### Version 0.1.0 (Initial Release)
- [x] Attack path visualization
- [x] Dark/Light theme support
- [x] Enhanced component library with containers
- [x] Component deletion and editing capabilities
- [x] Connection management and configuration
- [x] Custom preset designs
- [x] Backup and restore functionality
- [x] Security analysis with 50+ rules

## Roadmap

### Version 0.4.0 (Planned - Q1 2026)
- [ ] Enhanced PDF export with architectural validation reports
- [ ] Context menus (right-click) for quick actions
- [ ] Keyboard shortcuts help overlay (Ctrl+?)
- [ ] Contextual tooltips throughout the application
- [ ] Better toast notifications with more details
- [ ] Node hover effects and improved selection styling
- [ ] Template library (Microservices, 3-tier, Serverless architectures)

### Version 1.0.0 (Planned - Q2 2026)
- [ ] AI-powered security assessment with GPT-4 integration
- [ ] Real-time collaboration features
- [ ] Cloud provider integrations (AWS, Azure, GCP)
- [ ] Custom threat model templates
- [ ] Advanced compliance reporting (GDPR, HIPAA, PCI-DSS)
- [ ] API for programmatic access
- [ ] Infrastructure as Code export (Terraform, CloudFormation)
- [ ] Windows Desktop Application

## Backup Archives

The project includes version archives for rollback capability:

### **kohArch-0-2** (v0.2.0 - November 26, 2025)
- Flow visualization system
- Resizable panel with logs
- Dark theme default
- Complete source code and configuration

### **thisISPoint** (Working snapshot)
- Configuration checkpoint before flow visualization
- Source code backup

### **backup-current** (Latest stable)
- Most recent stable version
- Automatic backup system

### Restoring from Backup

To restore a specific version:

```bash
# Copy files from backup archive
cp -r kohArch-0-2/* .

# Reinstall dependencies (if needed)
npm install

# Start the application
npm run dev
```

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Diagrams powered by [React Flow](https://reactflow.dev/)
- Icons from [Phosphor Icons](https://phosphoricons.com/)

---

**Koh Atlas v0.3.0** - Securing architectures, one design at a time. 🛡️