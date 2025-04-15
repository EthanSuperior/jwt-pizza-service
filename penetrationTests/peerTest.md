# Deliverable 12

##### Evan Chase and Sam Jones

## Self Attacks

#### Evan Chase

- Attack 1
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Identification and Authentication Failures |
  | Severity       | 2 |
  | Description    | Admin password was too weak, vulnerable to dictionary attack. |
  | Images         | [Admin Account Access](/penetrationTests/admin_access.png) |
  | Corrections    | Change admin password to something much more secure. |
- Attack 2
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Insecure Design |
  | Severity       | 3 |
  | Description    | Pizza prices are sent from website, can be modified to be free |
  | Images         | [Image Description](/penetrationTests/free_pizza.png)  |
  | Corrections    | Use prices from database, not request |
- Attack 3
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Security Misconfiguration |
  | Severity       | 4 |
  | Description    | Stack trace is visible with SQL errors. |
  | Images         | [Image Description](/penetrationTests/stack_trace.png)  |
  | Corrections    | Remove `stack` from error response in `service.js`. |
- Attack 4
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Security Misconfiguration |
  | Severity       | 4 |
  | Description    | Viewing `/docs` gives url of both database and factory. |
  | Images         | [Image Description](/penetrationTests/database_url.png)  |
  | Corrections    | Remove `config` from `/docs` response |

#### Sam Jones

- Attack 1
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 2
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 3
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 4
  |Item            | Result |
  |:---            |:---|
  | Date           | April 11, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |

## Peer Attacks

#### Evan Chase (Attacking Sam Jones)

- Attack 1
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Identification and Authentication Failures |
  | Severity       | 2 |
  | Description    | Admin password was too weak, vulnerable to dictionary attack. |
  | Images         | [Admin Account Access](/penetrationTests/admin_access.png) |
  | Corrections    | Change admin password to something much more secure. |
- Attack 2
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Insecure Design |
  | Severity       | 3 |
  | Description    | Pizza prices are sent from website, can be modified to be free |
  | Images         | [Image Description](/penetrationTests/free_pizza.png)  |
  | Corrections    | Use prices from database, not request |
- Attack 3
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Security Misconfiguration |
  | Severity       | 4 |
  | Description    | Stack trace is visible with SQL errors. |
  | Images         | [Image Description](/penetrationTests/stack_trace.png)  |
  | Corrections    | Remove `stack` from error response in `service.js`. |
- Attack 4
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.sjones.click |
  | Classification | Security Misconfiguration |
  | Severity       | 4 |
  | Description    | Viewing `/docs` gives url of both database and factory. |
  | Images         | [Image Description](/penetrationTests/database_url.png)  |
  | Corrections    | Remove `config` from `/docs` response |

#### Sam Jones (Attacking Evan Chase)

- Attack 1
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 2
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 3
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |
- Attack 4
  |Item            | Result |
  |:---            |:---|
  | Date           | April 15, 2025 |
  | Target         | pizza.evankchase.click |
  | Classification | Injection |
  | Severity       | 1 |
  | Description    | SQL injection deleted database. All application data destroyed. |
  | Images         | [Image Description](/penetrationTests/)  |
  | Corrections    | Sanitize user inputs. |

## Summary
