# Koh Atlas - Secure Architecture Designer

A powerful web application for designing secure system architectures with built-in security analysis and threat modeling capabilities.

## Features

### 🎨 Visual Architecture Design
- **Visio-like Experience**: Drag and drop components with intuitive connection handling
- **Smart Connection System**: Click and drag between connection handles to create links
- **Protocol-Aware Connections**: Specify protocols, ports, and encryption for each connection
- **Component Library**: Comprehensive set of application, network, data, and security components

### 🔧 Enhanced Connection Capabilities
- **Connection Handles**: Each component has multiple connection points (top, bottom, left, right)
- **Protocol Selection**: Choose from 15+ predefined protocols (HTTPS, PostgreSQL, gRPC, etc.)
- **Port Configuration**: Automatic port detection with manual override capability
- **Encryption Options**: TLS 1.3, mTLS, SASL_SSL, and unencrypted options
- **Visual Security Indicators**: Encrypted connections appear green, unencrypted appear red
- **Connection Dialog**: Interactive dialog for configuring connection properties
- **Quick Connect**: Smart defaults based on target component type

### 🛡️ Security Analysis
- **Automated Security Scanning**: Detect common misconfigurations and vulnerabilities
- **Standards Mapping**: Align findings with NIST 800-53, ISO 27001, OWASP standards
- **Risk Prioritization**: Severity-based findings with remediation guidance
- **Attack Path Visualization**: Understand potential threat scenarios

### 🌓 Dark/Light Theme
- **Theme Toggle**: Switch between light and dark modes
- **Persistent Preferences**: Theme selection is saved across sessions

### 📋 Template Library
- **Secure Architecture**: Pre-built secure 3-tier web application template
- **Vulnerable Design**: Intentionally vulnerable architecture for training/testing
- **Quick Start**: Load templates to begin designing immediately

## Component Categories

### Application Components
- Web Browser
- Web Server
- App Server
- API Gateway
- Microservice
- Mobile App
- Kubernetes Cluster
- Container

### Network Components
- Global Load Balancer
- Internal Load Balancer
- VPC / VNet
- Subnet
- Network Segmentation

### Data Components
- Database
- Cache (Redis)
- Message Queue

### Security Components
- Firewall
- Web Application Firewall (WAF)
- Intrusion Detection/Prevention System (IDS/IPS)

## Supported Protocols

| Protocol | Default Port | Description |
|----------|--------------|-------------|
| HTTPS | 443 | Secure HTTP over TLS |
| HTTP | 80 | Unencrypted HTTP (not recommended) |
| gRPC | 443 | gRPC over TLS |
| PostgreSQL | 5432 | PostgreSQL database connection |
| MySQL | 3306 | MySQL database connection |
| Redis | 6379 | Redis cache connection |
| MongoDB | 27017 | MongoDB database connection |
| SSH | 22 | Secure Shell protocol |
| RDP | 3389 | Remote Desktop Protocol |
| SMTP | 587 | SMTP email with STARTTLS |
| SMTPS | 465 | SMTP over SSL/TLS |
| DNS | 53 | Domain Name System |
| LDAPS | 636 | LDAP over SSL/TLS |
| KAFKA | 9092 | Apache Kafka messaging |
| ELASTICSEARCH | 9200 | Elasticsearch REST API |

## How to Use

### Creating Connections
1. **Drag Components**: Add components to the canvas from the sidebar
2. **Connect Components**: Click and drag from any connection handle (circular dots on component edges)
3. **Configure Connection**: Use the connection dialog to specify protocol, port, and encryption
4. **Quick Connect**: Use the "Quick Connect" option for smart defaults based on component types

### Editing Connections
1. **Select Connection**: Click on any connection line
2. **Edit Properties**: Use the Properties panel to modify protocol, port, encryption, and description
3. **Security Warnings**: Unencrypted connections display security warnings
4. **Delete Connection**: Use the delete button in the Properties panel

### Security Analysis
1. **Run Analysis**: Click the "Analyze" button to scan for security issues
2. **Review Findings**: Check the Analysis tab for detailed security findings
3. **View Attack Paths**: Click "Attacks" to see potential attack scenarios
4. **Apply Fixes**: Follow remediation guidance to improve security posture

## Architecture Zones

Components can be assigned to different security zones:
- **External**: Internet-facing components
- **DMZ**: Demilitarized zone for edge services
- **Web Tier**: Web server layer
- **App Tier**: Application logic layer
- **Data Tier**: Database and storage layer
- **Security**: Security control layer
- **Management**: Administrative and monitoring layer

## Security Standards Mapping

The tool maps findings to various security frameworks:
- **NIST 800-53**: Security controls catalog
- **ISO 27001**: Information security management standards
- **OWASP**: Web application security guidelines
- **CIS Controls**: Critical security controls
- **PCI DSS**: Payment card industry standards

## Technical Implementation

### Frontend Stack
- **React 18** with TypeScript
- **React Flow** for diagramming capabilities
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **Phosphor Icons** for iconography

### Key Features
- **Persistent Storage**: Uses `useKV` hook for data persistence
- **Real-time Updates**: Live diagram updates with React Flow
- **Responsive Design**: Works on desktop and tablet devices
- **Accessibility**: Keyboard navigation and screen reader support

## Getting Started

1. **Load a Template**: Start with either the secure or vulnerable architecture template
2. **Add Components**: Drag components from the sidebar to the canvas
3. **Create Connections**: Click and drag between connection handles
4. **Configure Security**: Set protocols, ports, and encryption for each connection
5. **Analyze Security**: Run the security analysis to identify potential issues
6. **Review Results**: Check findings and attack paths in the Analysis tab

## Best Practices

### Secure Architecture Design
- **Layer Security**: Use multiple security layers (defense in depth)
- **Encrypt Communications**: Always use TLS 1.3 or mTLS for sensitive data
- **Segment Networks**: Separate different tiers with appropriate controls
- **Minimize Attack Surface**: Reduce exposed services and ports
- **Monitor Traffic**: Include security monitoring and logging capabilities

### Connection Configuration
- **Use Secure Protocols**: Prefer HTTPS over HTTP, LDAPS over LDAP
- **Strong Encryption**: Use TLS 1.3 or mTLS for all communications
- **Appropriate Ports**: Use standard ports unless specific requirements dictate otherwise
- **Document Connections**: Add descriptions for complex or unusual connections

## Backup and Recovery

The application automatically saves your work as you build diagrams. All data is stored locally in your browser's storage system.

---

Built with security-first principles for architects, security professionals, and development teams.