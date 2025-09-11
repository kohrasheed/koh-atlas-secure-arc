# Koh Atlas - Secure Architecture Designer

A modern web application for designing and analyzing secure system architectures with AI-powered security assessment and automated fix suggestions.

## Features

### 🏗️ Visual Architecture Design
- **Drag-and-drop component palette** with comprehensive security and infrastructure components
- **Interactive canvas** for creating system diagrams (HLD/LLD/DFD)
- **Smart connection system** with port/protocol annotation
- **Real-time editing** with component properties and metadata

### 🔒 Security-First Approach
- **Built-in security controls** as first-class components (WAF, NGFW, IDS/IPS, etc.)
- **Zone-based architecture** with tier enforcement
- **Data classification** and encryption tracking
- **Security overlay visualization**

### 🤖 AI-Powered Analysis
- **Automated security assessment** with 50+ built-in rules
- **Risk scoring** based on exposure, exploitability, and impact
- **Standards mapping** to NIST 800-53, CIS Benchmarks, ISO 27001
- **One-click auto-fix** for common security issues

### 📊 Comprehensive Reporting
- **Risk register export** (JSON/CSV formats)
- **Security findings** with severity classification
- **Compliance mapping** to industry standards
- **Architecture bill-of-materials** (ABOM)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES2022 support

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd koh-atlas

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Choose a starting point**:
   - Select from pre-built templates (Secure Web App, Vulnerable Demo)
   - Start with a blank canvas

2. **Design your architecture**:
   - Drag components from the palette
   - Connect components with annotated links
   - Configure ports, protocols, and security settings

3. **Analyze for security**:
   - Click "Analyze Security" or press Ctrl+Enter
   - Review findings with severity ratings
   - Apply suggested fixes with one click

4. **Export results**:
   - Generate security reports
   - Export diagrams and risk registers

## Component Library

### Application/Infrastructure
- **Web Tier**: Web Server, Load Balancer, CDN, API Gateway
- **Application Tier**: App Server, Microservice, Functions, Containers
- **Data Tier**: SQL/NoSQL Databases, Object Storage, Message Queues
- **Network**: VPN, NAT, DNS, ZTNA Connectors
- **Platform**: IAM/IdP, KMS/HSM, CI/CD, Monitoring

### Security Controls
- **Perimeter**: NGFW, WAF, DDoS Protection, Bot Management
- **Detection**: IDS/IPS, NDR, EDR/XDR, SIEM
- **Data Protection**: DAM, DLP, Tokenization, Encryption
- **Identity**: MFA, SSO, PAM, Directory Services
- **Network**: Micro-segmentation, Service Mesh Policies

## Security Analysis Rules

The analyzer checks for common security issues:

- **Encryption gaps**: Unencrypted protocols (HTTP, FTP, Telnet)
- **Architecture flaws**: Missing tiers, direct database access
- **Exposure risks**: Internet-facing services, open ports
- **Identity weaknesses**: Missing MFA, weak authentication
- **Data protection**: Unmonitored sensitive data flows
- **Detection gaps**: Missing security monitoring

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Canvas**: React Flow for diagram editing
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Phosphor Icons
- **State Management**: Custom hooks with persistence
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with design tokens

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── palette/         # Component palette
│   ├── canvas/          # Diagram canvas
│   └── analysis/        # Security analysis
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and analyzers
├── types/               # TypeScript definitions
└── data/                # Component catalogs and presets
```

## Keyboard Shortcuts

- **Delete/Backspace**: Remove selected component or connection
- **Ctrl+Enter**: Run security analysis
- **Escape**: Clear selection

## Development

### Adding New Components
1. Add component definition to `src/data/component-catalog.ts`
2. Include appropriate icon and metadata
3. Add security analysis rules if needed

### Extending Security Rules
1. Add new rules to `src/lib/security-analyzer.ts`
2. Include severity, category, and fix suggestions
3. Map to relevant security standards

### Custom Themes
Modify CSS variables in `src/index.css` to customize appearance:
- Light and dark theme support
- Design token system for consistency
- OKLCH color space for better gradients

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Security Standards Supported

- **NIST Cybersecurity Framework**
- **NIST 800-53 Security Controls**
- **CIS Benchmarks**
- **ISO 27001**
- **OWASP ASVS**
- **MITRE ATT&CK**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Check the documentation wiki
- Review existing discussions

---

**Built with ❤️ for security architects and engineers**