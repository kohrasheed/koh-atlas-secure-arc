# Koh Atlas - Backup Archives

This directory contains version archives for rollback and reference purposes.

## Available Backups

### 📦 **kohArch-0-2** (v0.2.0 - November 26, 2025) ⭐ LATEST
**Status**: Production Ready  
**Size**: Complete with all files  
**Features**:
- ✅ Flow visualization system with animated tracing
- ✅ Resizable flow log panel (300-800px)
- ✅ Dark theme as default
- ✅ Detailed connection logging
- ✅ Bug fixes (Clear All, panel functionality)

**Restoration**:
```bash
cp -r kohArch-0-2/* .
npm install
npm run dev
```

### 📦 **thisISPoint** (Checkpoint - November 25, 2025)
**Status**: Stable checkpoint  
**Purpose**: Pre-flow-visualization snapshot  
**Use Case**: Rollback point if flow features have issues

**Restoration**:
```bash
cp -r thisISPoint/* .
npm install
npm run dev
```

### 📦 **backup-current** (Working backup)
**Status**: Latest working state  
**Purpose**: Most recent stable version  
**Use Case**: Emergency recovery

**Restoration**:
```bash
cp -r backup-current/* .
npm install
npm run dev
```

### 📦 **backupinit** (Initial backup)
**Status**: Historical reference  
**Purpose**: Original working version  
**Use Case**: Reference for initial implementation

## Backup Information Files

Each backup contains:
- `BACKUP_INFO.md` - Detailed backup documentation
- `QUICK_REFERENCE.md` - Quick restoration guide (kohArch series)
- Complete source code in `src/`
- All configuration files
- Documentation (README, LICENSE, etc.)

## Quick Comparison

| Feature | backupinit | backup-current | thisISPoint | kohArch-0-2 |
|---------|-----------|----------------|-------------|-------------|
| Flow Visualization | ❌ | ❌ | ❌ | ✅ |
| Resizable Panel | ❌ | ❌ | ❌ | ✅ |
| Dark Theme Default | ❌ | ❌ | ❌ | ✅ |
| Container Support | ⚠️ | ✅ | ✅ | ✅ |
| Component Library | ⚠️ | ✅ | ✅ | ✅ |
| Security Analysis | ✅ | ✅ | ✅ | ✅ |
| Attack Paths | ✅ | ✅ | ✅ | ✅ |
| Backup System | ❌ | ✅ | ✅ | ✅ |

## Recommended Usage

### For Production
Use: **kohArch-0-2** (Latest stable with all features)

### For Development
Use: Current working directory with backups as safety net

### For Testing
Use: **thisISPoint** to test without flow features

### For Reference
Use: Any backup to compare implementations

## Creating New Backups

To create a new backup:

```bash
# Create directory
mkdir kohArch-0-X

# Copy files
cp -r src kohArch-0-X/
cp package*.json components.json tailwind.config.js tsconfig.json vite.config.ts index.html theme.json kohArch-0-X/
cp README.md LICENSE PRD.md SECURITY.md kohArch-0-X/

# Create documentation
# Create BACKUP_INFO.md with details
# Create QUICK_REFERENCE.md for restoration
```

## Storage Notes

- Backups stored in project root
- Not included in git (via .gitignore if configured)
- Each backup is ~2-3 MB (without node_modules)
- Keep at least 2-3 recent backups
- Archive old backups if disk space is limited

## Emergency Procedures

### If Application Won't Start
1. Check console for errors
2. Restore from most recent backup
3. Run `npm install` fresh
4. Clear browser cache

### If Features Break
1. Identify last working version
2. Copy backup to temporary directory
3. Compare files to find issue
4. Apply fixes to current version

### If Data Loss
1. Check Backup tab in application
2. Restore from in-app backup system
3. If that fails, use file system backups

## Maintenance

### Regular Tasks
- Create backup before major changes
- Test restoration process monthly
- Document changes in BACKUP_INFO.md
- Update this index when adding backups

### Cleanup
- Keep last 3 major versions
- Archive backups older than 3 months
- Remove obsolete backups after thorough testing

---

**Last Updated**: November 26, 2025  
**Current Version**: 0.2.0 (kohArch-0-2)  
**Backup System**: kohArch series
