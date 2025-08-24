# Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting information for the GCP MCP Server, covering common issues, diagnostic procedures, and resolution strategies. Whether you're experiencing installation problems, authentication failures, or performance issues, this guide will help you identify and resolve problems quickly.

## Quick Diagnosis

### Health Check Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify GCP CLI installation
gcloud --version

# Check authentication status
gcloud auth list

# Test default credentials
gcloud auth application-default print-access-token

# Verify project access
gcloud projects list

# Test server installation
npx gcp-mcp-server --version
```

### Environment Verification

```bash
# Check environment variables
env | grep -E "(NODE|NPM|GOOGLE|GCP)"

# Verify working directory
pwd
ls -la

# Check disk space
df -h

# Check network connectivity
curl -I https://googleapis.com
```

## Common Issues and Solutions

### Installation Problems

#### Issue: NPM Installation Fails

**Symptoms:**

```bash
$ npm install -g gcp-mcp-server
npm ERR! code EACCES
npm ERR! permission denied
```

**Diagnosis:**

- Permission issues with global npm installation
- Node.js/npm not properly configured

**Solutions:**

1. **Use npx (Recommended):**

   ```bash
   npx gcp-mcp-server
   ```

2. **Fix npm permissions:**

   ```bash
   # Create global directory for npm packages
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'

   # Add to PATH (add to ~/.bashrc or ~/.zshrc)
   export PATH=~/.npm-global/bin:$PATH

   # Install globally
   npm install -g gcp-mcp-server
   ```

3. **Use Node Version Manager:**

   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Install latest Node.js
   nvm install node
   nvm use node

   # Install package
   npm install -g gcp-mcp-server
   ```

#### Issue: Package Not Found

**Symptoms:**

```bash
$ npx gcp-mcp-server
npm ERR! 404 Not Found - GET https://registry.npmjs.org/gcp-mcp-server
```

**Diagnosis:**

- Package name incorrect
- NPM registry issues
- Network connectivity problems

**Solutions:**

1. **Verify package name:**

   ```bash
   npm search gcp-mcp-server
   ```

2. **Check npm registry:**

   ```bash
   npm config get registry
   npm config set registry https://registry.npmjs.org/
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

### Authentication Issues

#### Issue: GCP Authentication Failed

**Symptoms:**

```
Error: Authentication failed
Could not load the default credentials
```

**Diagnosis:**

- No GCP credentials configured
- Expired or invalid credentials
- Incorrect project permissions

**Solutions:**

1. **Set up Application Default Credentials:**

   ```bash
   gcloud auth application-default login
   ```

2. **Use Service Account Key:**

   ```bash
   # Download service account key from GCP Console
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
   ```

3. **Verify credentials:**

   ```bash
   gcloud auth application-default print-access-token
   ```

4. **Check project permissions:**
   ```bash
   gcloud projects get-iam-policy PROJECT_ID
   ```

#### Issue: Insufficient Permissions

**Symptoms:**

```
Error: Permission denied
The caller does not have permission to list instances
```

**Diagnosis:**

- Service account lacks required IAM roles
- Project-level permissions not configured

**Solutions:**

1. **Grant required roles:**

   ```bash
   # Basic viewer role
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
     --role="roles/viewer"

   # Compute Engine viewer
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
     --role="roles/compute.viewer"

   # Storage viewer
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
     --role="roles/storage.objectViewer"
   ```

2. **Create custom role with minimal permissions:**

   ```bash
   gcloud iam roles create gcpMcpServerRole \
     --project=PROJECT_ID \
     --file=custom-role.yaml
   ```

   **custom-role.yaml:**

   ```yaml
   title: 'GCP MCP Server Role'
   description: 'Minimum permissions for GCP MCP Server'
   stage: 'GA'
   includedPermissions:
     - resourcemanager.projects.list
     - compute.instances.list
     - storage.buckets.list
     - bigquery.datasets.get
     - cloudsql.instances.list
   ```

### Connection and Network Issues

#### Issue: Network Timeout

**Symptoms:**

```
Error: Request timeout
Failed to connect to googleapis.com
```

**Diagnosis:**

- Network connectivity issues
- Firewall blocking requests
- DNS resolution problems

**Solutions:**

1. **Test network connectivity:**

   ```bash
   # Test Google APIs endpoint
   curl -v https://compute.googleapis.com/compute/v1/projects

   # Test DNS resolution
   nslookup googleapis.com

   # Check firewall rules
   telnet googleapis.com 443
   ```

2. **Configure proxy (if needed):**

   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

3. **Increase timeout values:**
   ```bash
   export TIMEOUT_MS=60000
   ```

#### Issue: SSL Certificate Errors

**Symptoms:**

```
Error: certificate verify failed
unable to verify the first certificate
```

**Diagnosis:**

- Corporate firewall with SSL inspection
- Outdated certificate store
- System clock issues

**Solutions:**

1. **Update system certificates:**

   ```bash
   # macOS
   brew install ca-certificates

   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ca-certificates

   # CentOS/RHEL
   sudo yum update ca-certificates
   ```

2. **Disable SSL verification (temporary):**

   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

3. **Check system clock:**
   ```bash
   date
   # Ensure system time is accurate
   ```

### Claude Desktop Integration

#### Issue: Server Not Recognized in Claude Desktop

**Symptoms:**

- Server doesn't appear in Claude Desktop
- Connection fails silently
- No error messages in Claude

**Diagnosis:**

- Configuration file syntax errors
- Incorrect server path
- Permission issues

**Solutions:**

1. **Verify configuration file location:**

   ```bash
   # macOS
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Windows
   dir "%APPDATA%\Claude\claude_desktop_config.json"

   # Linux
   ls -la ~/.config/claude/claude_desktop_config.json
   ```

2. **Check configuration syntax:**

   ```json
   {
     "mcpServers": {
       "gcp": {
         "command": "npx",
         "args": ["-y", "gcp-mcp-server"]
       }
     }
   }
   ```

3. **Validate JSON syntax:**

   ```bash
   # Use online JSON validator or
   python -m json.tool claude_desktop_config.json
   ```

4. **Check server executable:**
   ```bash
   # Test if server can be executed
   npx -y gcp-mcp-server --version
   ```

#### Issue: MCP Protocol Errors

**Symptoms:**

```
MCP protocol error: Invalid message format
Connection terminated unexpectedly
```

**Diagnosis:**

- Protocol version mismatch
- Invalid message format
- Server crash or timeout

**Solutions:**

1. **Check protocol version:**

   ```bash
   # Server should support MCP protocol version 2024-11-05
   npx gcp-mcp-server --protocol-version
   ```

2. **Enable debug logging:**

   ```json
   {
     "mcpServers": {
       "gcp": {
         "command": "npx",
         "args": ["-y", "gcp-mcp-server"],
         "env": {
           "LOG_LEVEL": "debug"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop:**
   - Completely quit Claude Desktop
   - Wait 5 seconds
   - Restart application

### Performance Issues

#### Issue: Slow Response Times

**Symptoms:**

- Tools take longer than 30 seconds to respond
- Timeouts on large queries
- High CPU or memory usage

**Diagnosis:**

- Large datasets being processed
- Network latency to GCP APIs
- Inefficient queries

**Solutions:**

1. **Add pagination and filtering:**

   ```bash
   # Use specific zones/regions instead of listing all
   gcp-tool list-compute-instances --zone=us-central1-a

   # Limit results
   gcp-tool list-storage-buckets --max-results=50
   ```

2. **Optimize network settings:**

   ```bash
   export TIMEOUT_MS=60000
   export MAX_RETRIES=3
   export RETRY_DELAY=1000
   ```

3. **Monitor resource usage:**

   ```bash
   # Monitor while running
   top -p $(pgrep -f gcp-mcp-server)

   # Memory usage
   ps aux | grep gcp-mcp-server
   ```

#### Issue: Memory Leaks

**Symptoms:**

- Memory usage continuously increases
- Server becomes unresponsive over time
- System slowdown

**Solutions:**

1. **Restart server periodically:**

   ```bash
   # Add to cron job (every hour)
   0 * * * * pkill -f gcp-mcp-server && sleep 5 && npx gcp-mcp-server
   ```

2. **Monitor memory usage:**

   ```bash
   # Monitor memory over time
   while true; do
     ps aux | grep gcp-mcp-server | grep -v grep
     sleep 60
   done
   ```

3. **Use process manager:**

   ```bash
   # Install PM2
   npm install -g pm2

   # Start with PM2
   pm2 start "npx gcp-mcp-server" --name gcp-mcp

   # Monitor
   pm2 monit
   ```

### Tool-Specific Issues

#### Issue: BigQuery Query Failures

**Symptoms:**

```
Error: Invalid query syntax
Job failed with error: Table not found
```

**Solutions:**

1. **Verify table existence:**

   ```bash
   gcloud bigquery ls --project_id=PROJECT_ID DATASET_ID
   ```

2. **Check query syntax:**

   ```sql
   -- Use fully qualified table names
   SELECT * FROM `project.dataset.table` LIMIT 10;
   ```

3. **Verify permissions:**
   ```bash
   gcloud projects get-iam-policy PROJECT_ID | grep bigquery
   ```

#### Issue: Cloud SQL Connection Failures

**Symptoms:**

```
Error: Cloud SQL instance not accessible
Connection timeout
```

**Solutions:**

1. **Check instance status:**

   ```bash
   gcloud sql instances list
   gcloud sql instances describe INSTANCE_NAME
   ```

2. **Verify network access:**

   ```bash
   # Check authorized networks
   gcloud sql instances describe INSTANCE_NAME | grep authorizedNetworks
   ```

3. **Test connectivity:**
   ```bash
   # If using Cloud SQL Proxy
   cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:3306
   ```

## Debugging Procedures

### Enable Debug Mode

**Environment Variables:**

```bash
export DEBUG=gcp-mcp-server:*
export LOG_LEVEL=debug
export NODE_ENV=development
```

**Debug Configuration for Claude Desktop:**

```json
{
  "mcpServers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"],
      "env": {
        "DEBUG": "gcp-mcp-server:*",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Log Analysis

**Log Locations:**

- **Claude Desktop logs**: Check Console.app on macOS, Event Viewer on Windows
- **Server logs**: Stdout/stderr from the server process
- **GCP audit logs**: Available in Cloud Logging

**Key Log Messages:**

```
# Successful initialization
INFO: MCP server initialized successfully
INFO: Connected to GCP with project: PROJECT_ID

# Authentication issues
ERROR: Failed to initialize GCP client: Authentication failed
ERROR: Invalid credentials or insufficient permissions

# Network issues
ERROR: Request timeout after 30000ms
ERROR: Network unreachable

# Tool execution
DEBUG: Executing tool: list-compute-instances
DEBUG: Tool completed successfully in 1234ms
```

### Performance Profiling

**CPU Profiling:**

```bash
# Start with profiling
node --prof dist/index.js

# Generate profile report
node --prof-process isolate-*.log > profile.txt
```

**Memory Profiling:**

```bash
# Heap dump
node --inspect dist/index.js
# In Chrome DevTools: Memory > Take heap snapshot

# Memory usage tracking
node --track-heap-objects dist/index.js
```

**Network Profiling:**

```bash
# Monitor network traffic
sudo tcpdump -i any -w gcp-traffic.pcap host googleapis.com

# Analyze with Wireshark
wireshark gcp-traffic.pcap
```

## Recovery Procedures

### Server Recovery

**Graceful Restart:**

```bash
# Find process ID
ps aux | grep gcp-mcp-server

# Send SIGTERM
kill -TERM PID

# Wait for graceful shutdown
sleep 5

# Start new instance
npx gcp-mcp-server
```

**Force Restart:**

```bash
# Kill all instances
pkill -f gcp-mcp-server

# Clean up resources
rm -f /tmp/gcp-mcp-server.*

# Restart
npx gcp-mcp-server
```

### Configuration Recovery

**Reset to Defaults:**

```bash
# Backup current config
cp claude_desktop_config.json claude_desktop_config.json.backup

# Create minimal config
cat > claude_desktop_config.json << EOF
{
  "mcpServers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"]
    }
  }
}
EOF
```

### Credential Recovery

**Reset Authentication:**

```bash
# Clear existing credentials
gcloud auth revoke --all

# Reauthenticate
gcloud auth login
gcloud auth application-default login

# Set default project
gcloud config set project PROJECT_ID
```

## Getting Help

### Information Collection

When reporting issues, please collect:

1. **System Information:**

   ```bash
   uname -a
   node --version
   npm --version
   gcloud --version
   ```

2. **Configuration:**

   ```bash
   cat claude_desktop_config.json
   echo $GOOGLE_APPLICATION_CREDENTIALS
   gcloud config list
   ```

3. **Logs:**

   ```bash
   # Run with debug enabled and capture output
   DEBUG=gcp-mcp-server:* npx gcp-mcp-server 2>&1 | tee debug.log
   ```

4. **Error Messages:**
   - Complete error message text
   - Stack traces (if available)
   - Steps to reproduce

### Support Channels

1. **GitHub Issues**: [Report bugs and feature requests](https://github.com/startupmanch/gcp-mcp-server/issues)
2. **Documentation**: Check [project documentation](../README.md)
3. **Community**: Search existing issues and discussions

### Creating Effective Bug Reports

**Issue Template:**

```markdown
## Bug Description

Brief description of the issue

## Environment

- OS: [macOS/Windows/Linux]
- Node.js version:
- Package version:
- GCP CLI version:

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Error Messages
```

Complete error output

```

## Additional Context
Any other relevant information
```

## Prevention

### Best Practices

1. **Regular Updates:**

   ```bash
   # Update to latest version
   npm update -g gcp-mcp-server

   # Check for updates
   npm outdated -g
   ```

2. **Monitoring:**
   - Set up health checks
   - Monitor log files
   - Track performance metrics

3. **Backup Configuration:**

   ```bash
   # Backup Claude config
   cp claude_desktop_config.json claude_desktop_config.json.$(date +%Y%m%d)
   ```

4. **Test Environment:**
   - Validate changes in test environment first
   - Use separate GCP projects for testing
   - Test with minimal permissions

5. **Documentation:**
   - Keep configuration documented
   - Track changes and updates
   - Maintain troubleshooting notes

For additional support, please refer to the [development guide](DEVELOPMENT.md) or [open an issue](https://github.com/startupmanch/gcp-mcp-server/issues) with detailed information about your problem.
