# Import Guide for Koh Atlas

## ✅ **GOOD NEWS: Auto-Conversion Now Supported!**

As of **November 27, 2024**, Koh Atlas automatically converts legacy architecture formats!

### Supported Formats

1. **React Flow Format** (native):
   ```json
   {
     "nodes": [...],
     "edges": [...]
   }
   ```

2. **Legacy Architecture Format** (auto-converted):
   ```json
   {
     "components": [...],
     "connections": [...],
     "global_risks": [...]
   }
   ```

## 🚀 How to Import

1. Click **"Import from JSON"** button in Koh Atlas
2. Select your JSON file (either format works!)
3. Koh Atlas will:
   - ✅ Auto-detect the format
   - ✅ Convert if needed
   - ✅ Highlight security issues (red = insecure connections)
   - ✅ Preserve global risks in metadata
   - ✅ Auto-layout by network zone

## 📋 Example: Legacy Format

See `example-legacy-format.json` for a working example with:
- 10 components across 4 network zones
- 9 connections (some insecure)
- 3 documented global security risks

## 🔍 What Gets Converted

### Component Types Mapping

| Legacy Type | Maps To |
|------------|---------|
| `network-zone` | `vpc-vnet` (container) |
| `appliance` | `firewall` |
| `application` | `web-server` |
| `service` | `api-gateway` |
| `server` | `app-server` |
| `database` | `database` |
| `storage` | `object-storage` |
| `vpn` | `vpn-gateway` |
| `container` | `container-service` |
| `kubernetes` | `kubernetes-cluster` |

### Connection Security Highlighting

Connections are automatically analyzed:
- 🔴 **Red dashed line**: Insecure (HTTP, Telnet, FTP, ANY-ANY)
- 🟢 **Green solid line**: Secure (HTTPS, SSH, TLS)

### Zone-Based Layout

Components are auto-positioned by zone:
- **External**: Top-left (internet-facing)
- **Perimeter**: Top-center (firewalls, edge)
- **DMZ**: Top-right (public services)
- **Internal**: Middle-left (private apps)
- **Application**: Middle-center (app tier)
- **Database**: Middle-right (data tier)
- **Management**: Bottom-left (admin tools)
- **OT/ICS**: Bottom-center/right (operational tech)

## 🛠️ Technical Details

The converter (`/src/lib/import-converter.ts`):
1. Maps component types to Koh Atlas equivalents
2. Calculates positions based on zone (4-column grid per zone)
3. Converts `from/to` → `source/target`
4. Generates unique edge IDs
5. Flags insecure protocols (animated red edges)
6. Preserves `global_risks` in metadata

## ❓ Troubleshooting

**Import fails with "Unsupported JSON format"**
- Check that your JSON has either `nodes`/`edges` OR `components`/`connections`
- Validate JSON syntax at jsonlint.com

**Components appear in wrong locations**
- Converter uses zone-based auto-layout
- You can drag components to rearrange after import

**Missing connections**
- Ensure `from`/`to` IDs match component IDs exactly
- Check console for errors

## 📚 More Examples

Need more examples? Check:
- `example-legacy-format.json` - Small example (10 components)
- Your original JSON works as-is now!

