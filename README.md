# Koh Atlas - Secure Architecture Designer

A powerful, interactive web-based tool for designing and analyzing secure application architectures. Koh Atlas helps security architects, solutions architects, and DevOps teams create secure system designs with built-in security analysis and threat modeling capabilities.

![Koh Atlas](https://img.shields.io/badge/status-production-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![ReactFlow](https://img.shields.io/badge/ReactFlow-12-purple)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-cyan)

## 🚀 Features

### 🎨 **Visual Architecture Design**
- **Drag & Drop Components**: Intuitive component palette with application, security, network, and data components
- **Interactive Canvas**: Built on ReactFlow for smooth, interactive diagramming experience with zoom, pan, and minimap
- **Component Categories**: Pre-built components for web servers, databases, firewalls, load balancers, and more
- **Custom Zones**: Organize components into security zones (DMZ, Web Tier, App Tier, Data Tier, etc.)
- **Real-time Editing**: Edit component labels, zones, and properties in real-time
- **Template System**: Load pre-built secure and vulnerable architecture templates

### 🔒 **Security-First Approach**
- **Built-in Security Controls**: First-class security components (WAF, Firewall, IDS/IPS, etc.)
- **Connection Annotations**: Detailed protocol, port, and encryption settings for all connections
- **Security Zones**: Visual organization by security zones and trust boundaries
- **Compliance Standards**: Mapped to NIST 800-53, ISO 27001, OWASP, and CIS Controls
- **Connection Management**: Create, edit, and delete connections with full property control

### 🔍 **AI-Powered Security Analysis**
- **Automated Vulnerability Detection**: Identifies unencrypted communications, direct database access, missing security controls
- **Risk Scoring**: CVSS-inspired risk scoring with severity levels (Critical, High, Medium, Low)
- **Standards Mapping**: Findings mapped to compliance frameworks (NIST, ISO, OWASP, CIS)
- **Remediation Guidance**: Specific, actionable recommendations for each finding
- **Real-time Analysis**: Run security analysis on-demand with instant results

### 🎯 **Attack Path Visualization**
- **Threat Modeling**: Visual attack path analysis to understand potential threat scenarios
- **Impact Assessment**: Clear visualization of attack impact and likelihood
- **Mitigation Planning**: Suggested security controls to break attack chains
- **Risk Communication**: Easy-to-understand visualizations for stakeholders
- **Attack Scenarios**: Pre-built attack scenarios for common threat vectors

### 🌙 **Modern User Experience**
- **Dark/Light Theme**: Toggle between themes for comfortable viewing with persistent preference
- **Responsive Design**: Works on desktop and tablet devices
- **Persistent State**: Your work is automatically saved locally using advanced state management
- **Template Library**: Pre-built secure and vulnerable architecture templates
- **Professional UI**: Built with shadcn/ui components and Tailwind CSS
- **Keyboard Support**: Full keyboard navigation and shortcuts

## 🛠️ Technical Stack

- **Frontend**: React 19 with TypeScript for type-safe development
- **UI Framework**: Tailwind CSS with shadcn/ui components for modern, accessible design
- **Diagramming**: ReactFlow 12 for interactive canvas with advanced features
- **Icons**: Phosphor Icons for consistent, beautiful iconography
- **State Management**: React hooks with persistent local storage via useKV
- **Build Tool**: Vite for lightning-fast development and optimized builds
- **Styling**: Advanced CSS with OKLCH color space and CSS custom properties
- **Typography**: Inter and JetBrains Mono fonts for professional appearance

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/koh-atlas.git
cd koh-atlas

# Install dependencies
npm install

# Start development server
npm run dev
```

### Quick Start Guide

1. **Load a Template**: Click "Secure" or "Vulnerable" buttons to load pre-built architecture templates
2. **Add Components**: Drag components from the sidebar categories to the canvas
3. **Create Connections**: Drag between component connection points to create links
4. **Configure Properties**: 
   - Click nodes to edit labels, zones, and component properties
   - Click connections to configure protocols, ports, and encryption settings
5. **Delete Elements**: Select nodes or connections and use the delete button in properties panel
6. **Run Analysis**: Click "Analyze" to identify security vulnerabilities and issues
7. **View Attack Paths**: Click "Attacks" to see potential threat scenarios and attack vectors
8. **Toggle Theme**: Use the sun/moon icon to switch between light and dark themes

## 📚 Component Library

### Application Components
- **Web Server**: Frontend web servers (Nginx, Apache, IIS)
- **App Server**: Application servers and middleware
- **API Gateway**: API management and routing (Kong, Apigee)
- **Microservice**: Containerized application services
- **Mobile App**: Mobile client applications

### Data Components
- **Database**: SQL and NoSQL databases (PostgreSQL, MySQL, MongoDB)
- **Cache**: In-memory data stores (Redis, Memcached)
- **Message Queue**: Asynchronous messaging (Kafka, RabbitMQ)

### Security Components
- **Firewall**: Network firewalls and next-gen firewalls
- **WAF**: Web Application Firewalls
- **IDS/IPS**: Intrusion Detection and Prevention Systems
- **Load Balancer**: Traffic distribution and SSL termination

### Network Components
- **Load Balancer**: Application and network load balancers
- **API Gateway**: API management platforms

## 🔍 Security Analysis Rules

### Encryption & Integrity
- Detects unencrypted HTTP communications
- Identifies missing TLS/mTLS on sensitive connections
- Validates database encryption requirements

### Architecture Patterns
- Checks for proper tier separation
- Identifies direct database access bypassing application layer
- Validates security zone boundaries

### Missing Controls
- Detects missing firewalls and WAFs
- Identifies lack of intrusion detection systems
- Validates monitoring and logging coverage

### Standards Compliance
- **NIST 800-53**: Security and privacy controls
- **ISO 27001**: Information security management
- **OWASP**: Web application security standards
- **CIS Controls**: Critical security controls

## 🎯 Attack Path Analysis

The attack path visualization helps understand how attackers might compromise your architecture:

### Attack Scenarios
- **Web Application Attacks**: SQL injection, XSS, authentication bypass
- **Network Lateral Movement**: Privilege escalation and pivot attacks  
- **Data Exfiltration**: Unauthorized access to sensitive data
- **Infrastructure Attacks**: Server compromise and persistence

### Mitigation Strategies
- **Defense in Depth**: Layered security controls
- **Network Segmentation**: Micro-segmentation and zero trust
- **Access Controls**: Authentication, authorization, and monitoring
- **Encryption**: Data protection in transit and at rest

## 🔧 Configuration

### Theme Customization
The application supports both light and dark themes with persistent user preference:

```typescript
// Theme is automatically saved and restored
const [isDarkTheme, setIsDarkTheme] = useKV('dark-theme', 'false');

// Toggle theme
setIsDarkTheme(isDarkTheme === 'true' ? 'false' : 'true');
```

Themes are defined using OKLCH color space in `src/index.css` for better color accuracy and accessibility.

### Custom Components
You can extend the component library by modifying the `componentTypes` array in `App.tsx`:

```typescript
const customComponent = {
  type: 'custom-server',
  label: 'Custom Server',
  icon: <YourIcon />,
  category: 'application',
  color: '#your-color'
};
```

### Security Rules
Add custom security analysis rules by extending the analysis logic in the `runSecurityAnalysis` function:

```typescript
// Example custom rule
if (edgeData.protocol === 'CUSTOM' && !edgeData.encryption) {
  newFindings.push({
    id: `custom-rule-${edge.id}`,
    title: 'Custom Security Issue',
    severity: 'High',
    description: 'Custom protocol without encryption',
    affected: [edge.source!, edge.target!],
    recommendation: 'Enable encryption for custom protocol',
    standards: ['Custom Standard 1.0']
  });
}
```

### Compliance Frameworks
Map findings to your organization's compliance requirements by updating the standards arrays:

```typescript
const standards = [
  'NIST 800-53 SC-8',
  'ISO 27001 A.13.1.1',
  'OWASP ASVS V9.1',
  'CIS Controls 14.4',
  'Your-Custom-Standard 2.1'
];
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/your-org/koh-atlas.git
cd koh-atlas

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Run in development mode
npm run build && npm run preview

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure
```
src/
├── App.tsx              # Main application component
├── index.css           # Global styles and theme definitions
├── main.css            # Structural CSS (do not modify)
├── main.tsx            # Application entry point (do not modify)
├── components/ui/      # shadcn/ui components (pre-installed)
├── lib/utils.ts        # Utility functions
└── assets/             # Static assets (images, fonts, etc.)
```

### Key Development Guidelines
- **Do not modify** `src/main.tsx` or `src/main.css` - these are system files
- Use the `useKV` hook for persistent state that should survive page reloads
- Use regular `useState` for temporary UI state
- Follow the established component patterns and TypeScript interfaces
- Import assets explicitly rather than using string paths
- Maintain accessibility standards with proper ARIA labels and keyboard navigation

## 🏗️ Current Status & Roadmap

### ✅ Production Ready Features
- **Core Architecture Designer**: Fully functional drag-and-drop interface
- **Component Library**: Comprehensive set of application, security, network, and data components
- **Security Analysis Engine**: Real-time vulnerability detection with standards mapping
- **Attack Path Visualization**: Interactive threat modeling capabilities
- **Theme Support**: Complete dark/light theme implementation
- **Properties Management**: Full CRUD operations for nodes and connections
- **Template System**: Pre-built secure and vulnerable architecture examples
- **Persistent State**: Automatic saving and restoration of work

### 🚧 Future Enhancements (V2+)
- **Team Collaboration**: Multi-user editing and comments
- **Cloud Integration**: Import from AWS, Azure, GCP
- **Export Options**: PDF reports, Visio compatibility
- **Custom Rule Engine**: Visual rule builder for security policies
- **Compliance Dashboards**: Interactive compliance status tracking
- **API Integration**: REST API for programmatic access
- **Advanced Analytics**: Historical analysis and trend reporting

## 📋 Backup & Recovery

A comprehensive backup system is included:

### Current Backup Location
- **Path**: `/backup-current/`
- **Contents**: Complete application state including all source files
- **Documentation**: Detailed backup information in `BACKUP_INFO.md`

### Backup Contents
- All source code (`src/` directory)
- Configuration files (`package.json`, `tailwind.config.js`, etc.)
- HTML template (`index.html`)
- Component definitions and styling

### Restoration Process
1. Copy files from backup directory to project root
2. Run `npm install` to restore dependencies
3. Start with `npm run dev` for development

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ReactFlow** for the excellent diagramming foundation and interactive canvas capabilities
- **shadcn/ui** for beautiful, accessible UI components with excellent TypeScript support
- **Tailwind CSS** for utility-first styling and consistent design system
- **Phosphor Icons** for comprehensive, consistent icon library
- **NIST, OWASP, CIS, ISO** for security frameworks and standards guidance
- **Vite** for lightning-fast development experience
- **TypeScript** for type safety and developer experience

## 📞 Support & Community

- **Documentation**: Comprehensive inline documentation and TypeScript definitions
- **Issues**: [GitHub Issues](https://github.com/your-org/koh-atlas/issues) for bug reports and feature requests
- **Discussions**: [GitHub Discussions](https://github.com/your-org/koh-atlas/discussions) for community support
- **Security**: [SECURITY.md](SECURITY.md) for security vulnerability reporting
- **Backup Support**: Automated backup system ensures your work is never lost

## 🔄 Version History

- **v1.0.0**: Initial production release
  - Complete architecture designer
  - Security analysis engine
  - Attack path visualization
  - Dark/light theme support
  - Template system
  - Persistent state management
  - Comprehensive backup system

---

**Built with ❤️ for the security community by security professionals**

*Koh Atlas empowers organizations to design secure architectures with confidence, backed by industry-standard security frameworks and AI-powered analysis.*