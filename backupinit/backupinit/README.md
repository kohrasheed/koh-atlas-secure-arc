# Koh Atlas - Secure Architecture Designer

A comprehensive web application for designing, analyzing, and securing application architectures with AI-powered threat modeling and attack path visualization.

## Features

### 🎨 **Architecture Design**
- **Drag-and-drop interface** with comprehensive component palette
- **Real-time diagramming** with automated connection management
- **Multi-tier architecture support** (Presentation, App, Data, Management tiers)
- **Security zones** (External, DMZ, Internal, Data, Management)
- **Visual component library** covering web, database, network, security, and platform components

### 🔒 **Security Analysis**
- **AI-powered security scanning** with 50+ built-in security rules
- **Real-time vulnerability detection** for misconfigurations and security gaps
- **Standards compliance mapping** (NIST 800-53, CIS Benchmarks, ISO 27001, OWASP)
- **Auto-fix recommendations** with one-click remediation
- **Risk scoring and prioritization** based on likelihood and impact

### 🎯 **Attack Path Visualization**
- **Threat modeling capabilities** with MITRE ATT&CK framework integration
- **Attack path analysis** showing potential attack vectors from entry points to targets
- **Step-by-step attack simulation** with difficulty assessment and prerequisites
- **Mitigation recommendations** for each identified attack path
- **Interactive path highlighting** on the architecture diagram

### 🌙 **Modern UI/UX**
- **Dark/Light theme support** with system preference detection
- **Responsive design** optimized for desktop and mobile
- **Keyboard shortcuts** for power users (Delete, Ctrl+Enter for analysis)
- **Real-time feedback** with toast notifications and loading states

### 📊 **Export & Reporting**
- **Comprehensive security reports** in JSON format
- **Architecture documentation** with component metadata
- **Risk registers** with finding details and remediation steps
- **Visual diagram exports** (planned feature)

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

3. **Analyze security**
   - Click "Analyze" or use Ctrl+Enter to run security checks
   - Review findings in the Security Analysis panel
   - Apply auto-fixes where available

4. **Explore attack paths**
   - Switch to the "Threats" tab in the analysis panel
   - Select attack paths to see step-by-step simulation
   - View recommended mitigations for each threat

5. **Export results**
   - Generate security reports with findings and recommendations
   - Save architecture designs for future reference

### Keyboard Shortcuts

- **Delete/Backspace**: Remove selected component or connection
- **Ctrl+Enter** (Cmd+Enter on Mac): Run security analysis
- **Escape**: Clear selection

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
- **Frontend**: React 18 + TypeScript
- **Diagramming**: ReactFlow for interactive canvas
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React hooks with persistent storage
- **Icons**: Phosphor Icons
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

## Roadmap

### Version 2.0 (Planned)
- [ ] Real-time collaboration features
- [ ] Cloud provider integrations (AWS, Azure, GCP)
- [ ] Custom threat model templates
- [ ] PDF/PNG diagram exports
- [ ] Advanced compliance reporting
- [ ] API for programmatic access

### Version 1.5 (Current)
- [x] Attack path visualization
- [x] Dark theme support
- [x] Enhanced component library
- [x] Component deletion capabilities
- [x] Connection editing and deletion
- [x] Custom preset designs
- [ ] Improved mobile experience
- [ ] Bulk component import/export

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Koh Atlas** - Securing architectures, one design at a time. 🛡️