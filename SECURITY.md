# Security Policy

## Supported Versions

We take security seriously and actively maintain the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in TeraTrace, please help us by reporting it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:
- **security@tera-trace.dev** (if this email exists)
- Or create a private security advisory on GitHub

### What to Include

When reporting a security vulnerability, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations
- Your contact information for follow-up

### Our Process

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Investigation**: We will investigate the issue and determine its severity
3. **Fix Development**: We will develop and test a fix
4. **Disclosure**: We will coordinate disclosure with you
5. **Release**: We will release the fix and publish a security advisory

### Security Considerations

TeraTrace is designed for local development use only and includes several security measures:

- **Local-only binding**: Server binds exclusively to 127.0.0.1
- **No external data transmission**: Logs never leave your machine
- **No authentication**: No security layer (by design for local use)
- **Transparent operation**: Open source for security auditing

⚠️ **Important**: Never run TeraTrace on production systems or expose it to external networks.

## Known Security Considerations

- **Antivirus False Positives**: Some antivirus software may flag the binary due to embedded web server functionality
- **Local Network Access**: Only accessible from localhost
- **Data Persistence**: Logs are stored in memory only (configurable limit)

## Contact

For security-related questions or concerns:
- Create a GitHub Discussion for general security questions
- Use the private security reporting method for vulnerabilities

Thank you for helping keep TeraTrace secure! 🛡️