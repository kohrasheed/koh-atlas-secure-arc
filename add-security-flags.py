#!/usr/bin/env python3
"""
Add machine-readable securityFlags to all nodes and edges in kohGrid.json
This allows analyzers to correctly detect encryption, audit logging, and other security controls.
"""

import json
import sys

# Node-specific security flags based on component type
NODE_SECURITY_FLAGS = {
    "1": {  # React Frontend PWA
        "encryptedAtRest": False,  # Browser storage
        "encryptedInTransit": True,  # HTTPS
        "hasFirewall": True,  # WAF protection
        "hasWAF": True,  # CloudFlare WAF
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "Sentry",
        "activityMonitoring": False,
        "networkSegmentation": "public-subnet",
        "directInternetAccess": True,
        "mfaRequired": False,
        "rbacEnabled": False,
        "secretsManagement": "none",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Snyk",
        "complianceFrameworks": ["SOC2", "GDPR"]
    },
    "2": {  # CloudFlare CDN
        "encryptedAtRest": True,  # Edge cache encrypted
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": True,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "CloudFlare Logs",
        "activityMonitoring": True,
        "activityMonitoringTool": "CloudFlare Analytics",
        "networkSegmentation": "edge-network",
        "directInternetAccess": True,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "CloudFlare",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "CloudFlare",
        "complianceFrameworks": ["SOC2", "ISO27001", "PCI-DSS"]
    },
    "3": {  # ModSecurity WAF
        "encryptedAtRest": False,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": True,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "ModSecurity Audit Log",
        "networkSegmentation": "public-subnet",
        "directInternetAccess": False,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Trivy",
        "complianceFrameworks": ["SOC2", "PCI-DSS", "NIST-800-53"]
    },
    "4": {  # HAProxy Load Balancer
        "encryptedAtRest": False,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "HAProxy Stats",
        "hasBackup": False,
        "networkSegmentation": "public-subnet",
        "directInternetAccess": False,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Trivy",
        "complianceFrameworks": ["SOC2", "ISO27001"]
    },
    "5": {  # API Gateway
        "encryptedAtRest": False,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": True,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "Prometheus + Grafana",
        "hasBackup": False,
        "networkSegmentation": "private-subnet",
        "directInternetAccess": False,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Snyk",
        "complianceFrameworks": ["SOC2", "ISO27001", "GDPR", "HIPAA"]
    },
    "6": {  # Vault
        "encryptedAtRest": True,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "Vault Audit Device",
        "hasBackup": True,
        "backupFrequency": "6h",
        "networkSegmentation": "data-subnet",
        "directInternetAccess": False,
        "mfaRequired": True,
        "rbacEnabled": True,
        "secretsManagement": "self",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "HashiCorp Security",
        "complianceFrameworks": ["SOC2", "ISO27001", "HIPAA", "PCI-DSS", "NIST-800-53"]
    },
    "7": {  # PostgreSQL Primary
        "encryptedAtRest": True,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "pgAudit",
        "hasBackup": True,
        "backupFrequency": "5min",
        "networkSegmentation": "data-subnet",
        "directInternetAccess": False,
        "mfaRequired": True,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "AWS Inspector",
        "complianceFrameworks": ["SOC2", "ISO27001", "GDPR", "HIPAA", "PCI-DSS"]
    },
    "8": {  # Redis Cluster
        "encryptedAtRest": True,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "Redis Sentinel",
        "hasBackup": True,
        "backupFrequency": "daily",
        "networkSegmentation": "data-subnet",
        "directInternetAccess": False,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Trivy",
        "complianceFrameworks": ["SOC2", "ISO27001", "PCI-DSS"]
    },
    "9": {  # Background Workers
        "encryptedAtRest": False,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "Prometheus",
        "hasBackup": False,
        "networkSegmentation": "private-subnet",
        "directInternetAccess": False,
        "mfaRequired": False,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Snyk",
        "complianceFrameworks": ["SOC2", "ISO27001"]
    },
    "10": {  # S3 Storage
        "encryptedAtRest": True,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "SIEM",
        "activityMonitoring": True,
        "activityMonitoringTool": "S3 Access Logs",
        "hasBackup": True,
        "backupFrequency": "continuous",
        "networkSegmentation": "isolated-subnet",
        "directInternetAccess": False,
        "mfaRequired": True,
        "rbacEnabled": True,
        "secretsManagement": "AWS KMS",
        "vulnerabilityScanning": False,
        "complianceFrameworks": ["SOC2", "ISO27001", "GDPR", "HIPAA"]
    },
    "11": {  # Monitoring Stack
        "encryptedAtRest": True,
        "encryptedInTransit": True,
        "hasFirewall": True,
        "hasWAF": False,
        "auditLoggingEnabled": True,
        "auditLoggingDestination": "self",
        "activityMonitoring": True,
        "activityMonitoringTool": "self-monitoring",
        "hasBackup": True,
        "backupFrequency": "daily",
        "networkSegmentation": "isolated-subnet",
        "directInternetAccess": False,
        "mfaRequired": True,
        "rbacEnabled": True,
        "secretsManagement": "Vault",
        "vulnerabilityScanning": True,
        "vulnerabilityScanningTool": "Trivy",
        "complianceFrameworks": ["SOC2", "ISO27001"]
    }
}

# Edge security flags template
def get_edge_security_flags(edge_id, protocol, source, target):
    """Generate security flags based on connection details"""
    flags = {
        "encrypted": True,  # All connections are encrypted in this architecture
        "encryptionProtocol": "TLS-1.3",  # Default
        "authenticated": True,
        "authenticationType": "jwt",
        "authorizationEnabled": True,
        "rateLimited": True,
        "rateLimitValue": "100/min",
        "bidirectional": False,
        "dataFlowDirection": "outbound",
        "loggingEnabled": True,
        "networkZone": "internal"
    }
    
    # Customize based on protocol
    if "mTLS" in protocol or "mTLS" in edge_id:
        flags["encryptionProtocol"] = "mTLS"
        flags["authenticationType"] = "mtls"
        flags["rateLimitValue"] = "1000/min"
    elif "HTTPS" in protocol:
        flags["encryptionProtocol"] = "TLS-1.3"
    
    # Client to CDN is public internet
    if source == "1" and target == "2":
        flags["networkZone"] = "internet"
        flags["authenticationType"] = "none"
        flags["authorizationEnabled"] = False
    
    # Database connections
    if target == "7" or source == "7":
        flags["encryptionProtocol"] = "mTLS"
        flags["authenticationType"] = "mtls"
        flags["networkZone"] = "data"
        flags["rateLimitValue"] = "500/min"
    
    # Redis connections
    if target == "8" or source == "8":
        flags["encryptionProtocol"] = "TLS-1.3"
        flags["networkZone"] = "data"
    
    # Vault connections
    if target == "6" or source == "6":
        flags["encryptionProtocol"] = "TLS-1.3"
        flags["authenticationType"] = "jwt"
        flags["networkZone"] = "data"
    
    return flags

def main():
    # Read kohGrid.json
    with open('/workspaces/koh-atlas-secure-arc/kohGrid.json', 'r') as f:
        data = json.load(f)
    
    # Add securityFlags to all nodes
    for node in data.get('nodes', []):
        node_id = node.get('id')
        if node_id in NODE_SECURITY_FLAGS:
            if 'data' not in node:
                node['data'] = {}
            node['data']['securityFlags'] = NODE_SECURITY_FLAGS[node_id]
            print(f"✅ Added securityFlags to node {node_id} ({node['data'].get('label', 'Unknown')})")
    
    # Add securityFlags to all edges
    for edge in data.get('edges', []):
        edge_id = edge.get('id', '')
        source = edge.get('source', '')
        target = edge.get('target', '')
        protocol = edge.get('label', '')
        
        if 'data' not in edge:
            edge['data'] = {}
        
        edge['data']['securityFlags'] = get_edge_security_flags(edge_id, protocol, source, target)
        print(f"✅ Added securityFlags to edge {edge_id} ({source} → {target})")
    
    # Write updated JSON
    with open('/workspaces/koh-atlas-secure-arc/kohGrid.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("\n✅ Successfully added securityFlags to all nodes and edges!")
    print(f"📊 Updated {len(data.get('nodes', []))} nodes and {len(data.get('edges', []))} edges")
    
    # Calculate statistics
    nodes_with_encryption_at_rest = sum(1 for n in data.get('nodes', []) 
                                        if n.get('data', {}).get('securityFlags', {}).get('encryptedAtRest', False))
    edges_encrypted = sum(1 for e in data.get('edges', []) 
                         if e.get('data', {}).get('securityFlags', {}).get('encrypted', False))
    
    print(f"\n📈 Security Statistics:")
    print(f"   - Nodes with encryption at rest: {nodes_with_encryption_at_rest}/{len(data.get('nodes', []))} ({nodes_with_encryption_at_rest*100//len(data.get('nodes', [])) if data.get('nodes') else 0}%)")
    print(f"   - Encrypted connections: {edges_encrypted}/{len(data.get('edges', []))} ({edges_encrypted*100//len(data.get('edges', [])) if data.get('edges') else 0}%)")

if __name__ == '__main__':
    main()
