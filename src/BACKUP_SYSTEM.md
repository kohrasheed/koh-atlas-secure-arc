# Koh Atlas Backup System

## Overview
The backup system for Koh Atlas provides comprehensive project state management, allowing users to save, restore, and manage their architecture designs with all associated data.

## Features

### 1. Complete Project Backup
Each backup includes:
- **Architecture Components**: All nodes with their positions, types, labels, and properties
- **Connections**: All edges with protocol configurations, ports, and encryption settings
- **Custom Components**: User-created component definitions
- **Security Analysis**: Findings and attack paths from security analysis
- **Settings**: Theme preferences and configuration data
- **Metadata**: Timestamps, version info, and statistics

### 2. Backup Management
- **Create Backups**: Save current project state with custom names and descriptions
- **Load Backups**: Restore any saved backup to current workspace
- **Export/Import**: Save backups as JSON files for external storage
- **Duplicate Backups**: Create copies of existing backups
- **Delete Backups**: Remove unwanted backups
- **Browse History**: View all backups with timestamps and statistics

### 3. Smart Backup Features
- **Automatic Statistics**: Each backup tracks component counts, types, and security findings
- **Version Control**: Backups are versioned and timestamped
- **Data Validation**: Import process validates backup file integrity
- **Conflict Resolution**: Imported backups are automatically renamed to avoid conflicts

## Usage

### Creating a Backup
1. Navigate to the "Backup" tab in the sidebar
2. Click "Create Backup"
3. Enter a descriptive name for your backup
4. Optionally add a description
5. Click "Create Backup" to save

### Loading a Backup
1. Go to the "Backup" tab
2. Click "Load Backup" or click on any backup in the recent list
3. Select the backup you want to restore
4. Click "Load Selected Backup"
5. Your workspace will be restored to the backup state

### Exporting Backups
1. In the "Backup" tab, click the download icon next to any backup
2. Or use "Export Latest" to export the most recent backup
3. The backup will be downloaded as a JSON file

### Importing Backups
1. Click "Import" in the backup section
2. Select a previously exported JSON backup file
3. The backup will be imported and added to your backup list

## Backup File Format

Backups are stored as JSON with the following structure:

```json
{
  "id": "backup-1234567890",
  "name": "My Architecture Design",
  "description": "Secure web application architecture",
  "timestamp": 1234567890000,
  "version": "1.0.0",
  "data": {
    "nodes": [...],
    "edges": [...],
    "customComponents": [...],
    "findings": [...],
    "attackPaths": [...],
    "settings": {
      "darkTheme": "false",
      "lastAnalysis": 1234567890000
    }
  },
  "statistics": {
    "nodeCount": 15,
    "edgeCount": 18,
    "componentTypes": ["web-server", "database", "firewall"],
    "securityFindings": 3
  }
}
```

## Storage

- **Local Storage**: Backups are stored locally using the `useKV` hook
- **Persistent**: Backups persist between browser sessions
- **Cross-Device**: Backups can be exported and imported across devices
- **File-Based**: Backups can be saved as files for external management

## Best Practices

### Naming Conventions
- Use descriptive names that indicate the architecture purpose
- Include version or iteration numbers for design evolution
- Examples: "E-commerce Platform v2", "Microservices Architecture - Draft"

### Backup Frequency
- Create backups before major changes
- Save backups after completing significant design phases
- Export important backups as files for safekeeping

### Organization
- Use descriptions to provide context about design decisions
- Keep backups organized by project or architecture type
- Regularly clean up outdated or experimental backups

## Recovery Scenarios

### Accidental Changes
1. Immediately create a backup of current state if needed
2. Load the most recent stable backup
3. Review changes and re-apply if necessary

### Browser Data Loss
1. Import previously exported backup files
2. Backups stored in browser may be lost, but exported files remain safe
3. Regular exports provide insurance against data loss

### Sharing Designs
1. Export backup files to share complete project state
2. Recipients can import to view/modify the architecture
3. Include documentation in backup descriptions

## Technical Implementation

### Data Integrity
- Deep cloning prevents reference sharing between backups
- JSON serialization ensures data can be safely stored and transported
- Validation checks ensure imported backups are well-formed

### Performance
- Backups are created asynchronously to avoid UI blocking
- Only recent backups are displayed by default
- Efficient storage using browser's built-in JSON handling

### Error Handling
- Import validation prevents corrupted backups from breaking the application
- User-friendly error messages guide recovery from import failures
- Automatic fallbacks ensure system stability

## Security Considerations

### Data Privacy
- Backups contain complete architecture information
- Be cautious when sharing backup files
- Consider sensitive information before exporting

### File Integrity
- Exported files should be stored securely
- Verify backup integrity before relying on restored data
- Regular export schedule provides redundancy

## Future Enhancements

### Planned Features
- **Backup Compression**: Reduce file sizes for large architectures
- **Incremental Backups**: Save only changes between versions
- **Cloud Sync**: Optional cloud storage integration
- **Collaboration**: Multi-user backup sharing
- **Templates**: Convert backups to reusable templates
- **Automated Backups**: Scheduled or trigger-based backup creation

### Integration Points
- **Version Control**: Git-like versioning for architecture designs
- **Documentation**: Backup integration with architecture documentation
- **Compliance**: Audit trails for regulatory requirements
- **Analytics**: Usage patterns and backup statistics

## Troubleshooting

### Common Issues

**Backup Won't Load**
- Check browser console for error messages
- Verify backup file isn't corrupted
- Try importing a fresh export of the backup

**Missing Backups**
- Check if browser data was cleared
- Look for exported backup files
- Verify you're using the same browser/device

**Import Failures**
- Ensure file is a valid Koh Atlas backup
- Check file wasn't truncated during download
- Try exporting and re-importing a known good backup

**Performance Issues**
- Large architectures may take longer to backup/restore
- Consider breaking large designs into smaller components
- Regular cleanup of old backups improves performance

## Support

For backup-related issues:
1. Check browser console for error messages
2. Verify file integrity for import problems
3. Try clearing browser cache if backups seem corrupted
4. Export working backups before troubleshooting

The backup system is designed to be robust and user-friendly, providing confidence that your architecture designs are safely preserved and easily recoverable.