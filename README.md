# Koh Atlas - Secure Architecture Designer

A powerful, interactive web-based tool for designing and analyzing secure application architectures. Koh Atlas helps security architects, solutions architects, and DevOps teams create secure system designs with built-in security analysis and threat modeling capabilities.

![Koh Atlas](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

### 🎨 **Visual Architecture Design**
- **Drag & Drop Components**: Intuitive component palette with application, security, network, and data components
- **Interactive Canvas**: Built on ReactFlow for smooth, interactive diagramming experience
- **Component Categories**: Pre-built components for web servers, databases, firewalls, load balancers, and more
- **Custom Zones**: Organize components into security zones (DMZ, Web Tier, App Tier, Data Tier, etc.)

### 🔒 **Security-First Approach**
- **Built-in Security Controls**: First-class security components (WAF, Firewall, IDS/IPS, etc.)
- **Connection Annotations**: Detailed protocol, port, and encryption settings for all connections
- **Security Zones**: Visual organization by security zones and trust boundaries
- **Compliance Standards**: Mapped to NIST 800-53, ISO 27001, OWASP, and CIS Controls

### 🔍 **AI-Powered Security Analysis**
- **Automated Vulnerability Detection**: Identifies unencrypted communications, direct database access, missing security controls
- **Risk Scoring**: CVSS-inspired risk scoring with severity levels (Critical, High, Medium, Low)
- **Standards Mapping**: Findings mapped to compliance frameworks (NIST, ISO, OWASP, CIS)
- **Remediation Guidance**: Specific, actionable recommendations for each finding

### 🎯 **Attack Path Visualization**
- **Threat Modeling**: Visual attack path analysis to understand potential threat scenarios
- **Impact Assessment**: Clear visualization of attack impact and likelihood
- **Mitigation Planning**: Suggested security controls to break attack chains
- **Risk Communication**: Easy-to-understand visualizations for stakeholders

### 🌙 **Modern User Experience**
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works on desktop and tablet devices
- **Persistent State**: Your work is automatically saved locally
- **Template Library**: Pre-built secure and vulnerable architecture templates

## 🛠️ Technical Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Diagramming**: ReactFlow for interactive canvas
- **Icons**: Phosphor Icons for consistent iconography
- **State Management**: React hooks with local persistence
- **Build Tool**: Vite for fast development and builds

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

1. **Load a Template**: Click "Secure" or "Vulnerable" to load pre-built architecture templates
2. **Add Components**: Drag components from the sidebar to the canvas
3. **Create Connections**: Drag between component connection points to create links
4. **Configure Properties**: Click nodes/connections to edit protocols, ports, encryption
5. **Run Analysis**: Click "Analyze" to identify security issues
6. **View Attack Paths**: Click "Attacks" to see potential threat scenarios

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
Add custom security analysis rules by extending the analysis logic in the `runSecurityAnalysis` function.

### Compliance Frameworks
Map findings to your organization's compliance requirements by updating the standards arrays.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ReactFlow** for the excellent diagramming foundation
- **shadcn/ui** for beautiful, accessible UI components  
- **Tailwind CSS** for utility-first styling
- **Phosphor Icons** for comprehensive icon library
- **NIST, OWASP, CIS** for security frameworks and standards

## 📞 Support

- **Documentation**: [docs.koh-atlas.dev](https://docs.koh-atlas.dev)
- **Issues**: [GitHub Issues](https://github.com/your-org/koh-atlas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/koh-atlas/discussions)
- **Email**: support@koh-atlas.dev

---

**Built with ❤️ for the security community**