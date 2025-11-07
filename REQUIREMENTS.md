# **People & Organisation Management Web App — Enhanced Requirements Specification**

**Version:** 1.0
**Last Updated:** 2025-11-07
**Status:** Draft

---

## **Table of Contents**

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Goals](#2-business-context--goals)
3. [User Personas](#3-user-personas)
4. [Core Entities & Data Model](#4-core-entities--data-model)
5. [Functional Requirements](#5-functional-requirements)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [Security & Compliance](#9-security--compliance)
10. [API Specification](#10-api-specification)
11. [Data Integrity & Business Rules](#11-data-integrity--business-rules)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment & Operations](#13-deployment--operations)
14. [Future Enhancements](#14-future-enhancements)

---

## **1. Executive Summary**

A **responsive, cloud-native web application** that serves as the **single source of truth** for organisational management, providing comprehensive people lifecycle management from candidate to alumni. The system supports:

- **Multi-location operations** across 5+ global sites
- **Matrix management** with hard and dotted-line reporting
- **Virtual squad management** for agile/project-based work
- **End-to-end hiring pipeline** with approval workflows
- **Complete employee journey** tracking
- **Real-time analytics** and insights
- **Enterprise-grade security** with SSO and RBAC

### **Key Metrics**
- Support for **10,000+ employees**
- **500+ concurrent squads**
- **5 geographic locations** (expandable)
- **99.9% uptime** SLA
- **<2s page load** time
- **GDPR & SOC 2 compliant**

---

## **2. Business Context & Goals**

### **2.1 Problem Statement**

Current organisational data is fragmented across:
- HR systems (Workday/BambooHR)
- Spreadsheets for org charts
- Email threads for hiring approvals
- Wiki pages for squad assignments
- Separate alumni databases

This fragmentation leads to:
- ❌ Data inconsistencies and version conflicts
- ❌ Poor visibility into organisational structure
- ❌ Inefficient hiring and approval processes
- ❌ Lost institutional knowledge when people leave
- ❌ Inability to track matrix relationships

### **2.2 Business Goals**

1. **Unified Data Source**: Single system of record for all people and org data
2. **Process Efficiency**: Reduce hiring approval time by 50%
3. **Organisational Transparency**: Enable self-service org chart exploration
4. **Talent Retention**: Improve offboarding/alumni engagement to increase boomerang hires by 20%
5. **Data-Driven Decisions**: Provide real-time insights on headcount, attrition, and capacity
6. **Compliance**: Ensure GDPR, right-to-work, and audit trail requirements

### **2.3 Success Criteria**

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Adoption | 90% active users within 3 months | Monthly active users |
| Data Accuracy | 98% profile completeness | Data quality audit |
| Hiring Cycle Time | 30 days (down from 45) | Average time to fill |
| System Uptime | 99.9% | Monthly uptime monitoring |
| User Satisfaction | NPS > 50 | Quarterly surveys |

---

## **3. User Personas**

### **3.1 HR Administrator (Sarah)**
- **Goals**: Maintain accurate employee records, manage compliance, generate reports
- **Pain Points**: Manual data entry, reconciling multiple systems, audit trail gaps
- **Key Features**: Bulk import, audit logs, compliance dashboards

### **3.2 Hiring Manager (Raj)**
- **Goals**: Fill open roles quickly, assess team capacity, track candidates
- **Pain Points**: Slow approval processes, lack of pipeline visibility
- **Key Features**: Hiring needs workflow, candidate tracking, approval dashboard

### **3.3 Department Head (Emma)**
- **Goals**: Understand team structure, plan capacity, manage budget
- **Pain Points**: No clear view of dotted-line relationships, squad commitments
- **Key Features**: Org chart views, headcount analytics, squad utilisation reports

### **3.4 Employee (Alex)**
- **Goals**: View org structure, find colleagues, understand career paths
- **Pain Points**: Difficult to navigate org, unclear reporting lines
- **Key Features**: People directory, org chart search, profile updates

### **3.5 Executive (James)**
- **Goals**: Strategic workforce planning, cost management, trend analysis
- **Pain Points**: Delayed reports, lack of predictive insights
- **Key Features**: Executive dashboards, attrition forecasts, cost center analysis

---

## **4. Core Entities & Data Model**

### **4.1 Enhanced Entity-Relationship Diagram**

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Person    │─────────│     Role     │─────────│ Department  │
└─────────────┘  1:N    └──────────────┘  N:1    └─────────────┘
      │                        │
      │ 1:N                    │ 1:1
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│ CareerEvent │         │ HiringNeed   │
└─────────────┘         └──────────────┘

┌─────────────┐         ┌──────────────┐
│    Squad    │◄────────│ SquadMember  │───────►Person
└─────────────┘  1:N    └──────────────┘  N:1

┌─────────────┐         ┌──────────────┐
│  Location   │◄────────│    Person    │
└─────────────┘  1:N    └──────────────┘

┌─────────────┐         ┌──────────────┐
│   Alumni    │◄────────│    Person    │───────►ExitRecord
└─────────────┘  1:1    └──────────────┘  1:1
```

---

### **4.2 Entity Definitions**

#### **Entity: Person**

Core entity representing any individual in the system lifecycle.

```typescript
interface Person {
  // Identity
  person_id: UUID;                    // Primary key
  employee_number?: string;           // Unique employee ID (null for candidates)

  // Personal Information
  first_name: string;                 // Required, 2-50 chars
  last_name: string;                  // Required, 2-50 chars
  preferred_name?: string;            // Optional display name
  legal_name?: string;                // For compliance documents

  // Contact
  email: string;                      // Required, unique, validated
  secondary_email?: string;           // Personal email for alumni
  phone?: string;                     // E.164 format
  work_phone?: string;

  // Location & Organisation
  location_id: UUID;                  // FK → Location
  primary_office?: string;            // Specific office/building
  remote_status: 'Office' | 'Hybrid' | 'Remote';
  timezone: string;                   // IANA timezone

  // Employment
  employment_status: EmploymentStatus;
  employment_type: 'FullTime' | 'PartTime' | 'Contract' | 'Intern' | 'Consultant';
  start_date?: Date;
  end_date?: Date;
  probation_end_date?: Date;

  // Role & Hierarchy
  job_title: string;
  department_id?: UUID;               // FK → Department
  cost_centre?: string;
  grade_level?: string;               // e.g., IC1-IC6, M1-M3
  role_id?: UUID;                     // FK → Role (current role)

  // Reporting Lines
  manager_id?: UUID;                  // FK → Person (hard line)
  dotted_line_manager_ids: UUID[];    // Array of Person IDs

  // Capacity & Allocation
  full_time_equivalent: number;       // 0.0 - 1.0
  weekly_hours?: number;              // Contracted hours

  // Skills & Competencies
  skills: Skill[];                    // Array of skill objects
  certifications: Certification[];
  languages: Language[];

  // Career History
  career_events: UUID[];              // FKs → CareerEvent

  // Squad Membership
  squad_memberships: UUID[];          // FKs → SquadMember

  // Personal
  profile_photo_url?: string;
  bio?: string;                       // 500 char limit
  interests?: string[];

  // System
  created_at: DateTime;
  updated_at: DateTime;
  created_by: UUID;                   // FK → Person
  updated_by: UUID;                   // FK → Person
  deleted_at?: DateTime;              // Soft delete
  version: number;                    // Optimistic locking
}

enum EmploymentStatus {
  Candidate = 'Candidate',
  Offer = 'Offer',
  Onboarding = 'Onboarding',
  Active = 'Active',
  Leave = 'Leave',                    // Sabbatical, parental leave, etc.
  Offboarding = 'Offboarding',
  Alumni = 'Alumni',
  Archived = 'Archived'
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience?: number;
  last_used?: Date;
}

interface Certification {
  name: string;
  issuer: string;
  issue_date: Date;
  expiry_date?: Date;
  credential_id?: string;
  credential_url?: string;
}

interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}
```

**Validation Rules:**
- `email` must be unique and valid format
- `employee_number` must be unique when present
- `full_time_equivalent` must be between 0 and 1
- `manager_id` cannot reference self
- At least one of `manager_id` or `dotted_line_manager_ids` should be present for Active employees
- `start_date` must be before `end_date` if both present

**Indexes:**
```sql
CREATE INDEX idx_person_email ON person(email);
CREATE INDEX idx_person_employee_number ON person(employee_number);
CREATE INDEX idx_person_manager ON person(manager_id);
CREATE INDEX idx_person_location ON person(location_id);
CREATE INDEX idx_person_status ON person(employment_status);
CREATE INDEX idx_person_department ON person(department_id);
```

---

#### **Entity: Department**

Organisational unit grouping roles and people.

```typescript
interface Department {
  department_id: UUID;
  name: string;                       // Unique
  code: string;                       // Unique short code (e.g., 'ENG', 'HR')
  description?: string;
  parent_department_id?: UUID;        // FK → Department (for hierarchy)
  head_of_department_id?: UUID;       // FK → Person
  cost_centre: string;
  budget_code?: string;
  location_id?: UUID;                 // Primary location
  active: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}
```

---

#### **Entity: Location**

Physical office or geographic location.

```typescript
interface Location {
  location_id: UUID;
  name: string;                       // e.g., "London Office"
  code: string;                       // Short code: LON, WOL, CHT

  // Address
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_code: string;               // ISO 3166-1 alpha-2

  // Details
  timezone: string;                   // IANA timezone
  region: string;                     // EMEA, APAC, Americas
  office_type: 'Headquarters' | 'Regional' | 'Satellite' | 'Remote';
  capacity?: number;                  // Desk count

  // Status
  active: boolean;
  opened_date?: Date;
  closed_date?: Date;

  // System
  created_at: DateTime;
  updated_at: DateTime;
}
```

**Validation Rules:**
- `code` must be unique
- `country_code` must be valid ISO code
- `capacity` must be positive integer
- `opened_date` must be before `closed_date`

---

#### **Entity: Role**

A position in the organisation (filled or vacant).

```typescript
interface Role {
  role_id: UUID;

  // Role Definition
  title: string;
  department_id: UUID;                // FK → Department
  level: string;                      // Grade/seniority
  role_type: 'Permanent' | 'Contract' | 'Intern';

  // Location
  location_id: UUID;                  // FK → Location
  remote_eligible: boolean;

  // Financial
  cost_centre: string;
  budget_allocation?: number;
  salary_band_min?: number;
  salary_band_max?: number;
  currency?: string;                  // ISO 4217

  // Requirements
  required_skills: string[];
  preferred_skills: string[];
  required_certifications: string[];
  experience_years_min?: number;
  job_description?: string;           // Rich text/markdown

  // Status
  status: 'Active' | 'Vacant' | 'Frozen' | 'Eliminated';
  filled_by_person_id?: UUID;         // FK → Person (null if vacant)
  reports_to_role_id?: UUID;          // FK → Role (org hierarchy)

  // Hiring
  hiring_need_id?: UUID;              // FK → HiringNeed

  // System
  created_at: DateTime;
  updated_at: DateTime;
  created_by: UUID;
  effective_date: Date;               // When role becomes active
  end_date?: Date;
}
```

**Business Rules:**
- A role can only be filled by one person at a time
- `filled_by_person_id` must be null if `status` is 'Vacant'
- Cannot delete role if `filled_by_person_id` is not null

---

#### **Entity: HiringNeed**

Request to fill a role or create a new position.

```typescript
interface HiringNeed {
  hiring_need_id: UUID;

  // Request Details
  request_type: 'Backfill' | 'NewRole' | 'Expansion';
  role_id?: UUID;                     // FK → Role (null for new roles)
  proposed_title?: string;            // For new roles
  department_id: UUID;                // FK → Department
  location_id: UUID;                  // FK → Location

  // Justification
  business_justification: string;     // Required, min 100 chars
  impact_if_not_filled?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';

  // Request Metadata
  requested_by: UUID;                 // FK → Person
  requested_date: Date;
  required_start_date?: Date;

  // Approval Workflow
  approval_status: ApprovalStatus;
  current_approver_id?: UUID;         // FK → Person
  approval_chain: ApprovalStep[];

  // Sourcing
  sourcing_status: SourcingStatus;
  internal_candidates: UUID[];        // FKs → Person
  external_candidate_sources: string[];
  recruiter_id?: UUID;                // FK → Person

  // Outcome
  filled_by_person_id?: UUID;         // FK → Person
  filled_date?: Date;
  withdrawn_date?: Date;
  withdrawal_reason?: string;

  // Financial
  budget_allocated?: number;
  currency?: string;

  // System
  created_at: DateTime;
  updated_at: DateTime;
}

enum ApprovalStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Withdrawn = 'Withdrawn'
}

enum SourcingStatus {
  NotStarted = 'NotStarted',
  Sourcing = 'Sourcing',
  Screening = 'Screening',
  Interviewing = 'Interviewing',
  OfferStage = 'OfferStage',
  Filled = 'Filled',
  Cancelled = 'Cancelled'
}

interface ApprovalStep {
  step_number: number;
  approver_id: UUID;                  // FK → Person
  approver_role: string;              // 'Manager', 'Finance', 'Executive'
  status: 'Pending' | 'Approved' | 'Rejected';
  decision_date?: DateTime;
  comments?: string;
}
```

**Business Rules:**
- Must have at least one approver in `approval_chain`
- Cannot move to `Sourcing` status until `Approved`
- `required_start_date` must be in the future
- `filled_by_person_id` must be populated when `sourcing_status` is `Filled`

---

#### **Entity: Squad**

Virtual cross-functional team for projects or initiatives.

```typescript
interface Squad {
  squad_id: UUID;

  // Squad Details
  name: string;
  code?: string;                      // Short identifier
  description: string;
  objective: string;

  // Timeline
  start_date: Date;
  planned_end_date?: Date;
  actual_end_date?: Date;

  // Ownership
  owner_id: UUID;                     // FK → Person (squad lead)
  sponsor_id?: UUID;                  // FK → Person (executive sponsor)

  // Membership
  members: UUID[];                    // FKs → SquadMember
  target_size?: number;

  // Classification
  squad_type: 'Project' | 'Initiative' | 'Workstream' | 'Guild';
  status: SquadStatus;

  // Links
  related_initiative?: string;
  jira_project_key?: string;
  slack_channel?: string;
  confluence_space?: string;

  // System
  created_at: DateTime;
  updated_at: DateTime;
  created_by: UUID;
}

enum SquadStatus {
  Planning = 'Planning',
  Active = 'Active',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}
```

---

#### **Entity: SquadMember**

Junction table for Squad membership with allocation details.

```typescript
interface SquadMember {
  squad_member_id: UUID;
  squad_id: UUID;                     // FK → Squad
  person_id: UUID;                    // FK → Person

  // Role & Allocation
  role_in_squad: string;              // 'Lead', 'Engineer', 'Designer', etc.
  allocation_percentage: number;      // 0-100
  hours_per_week?: number;

  // Timeline
  join_date: Date;
  planned_leave_date?: Date;
  actual_leave_date?: Date;

  // Status
  status: 'Active' | 'Transitioning' | 'Completed';

  // System
  created_at: DateTime;
  updated_at: DateTime;
}
```

**Business Rules:**
- `allocation_percentage` must be between 0 and 100
- Total allocation for a person across all active squads must not exceed 100%
- `actual_leave_date` must be after `join_date`

---

#### **Entity: CareerEvent**

Historical record of significant career milestones.

```typescript
interface CareerEvent {
  event_id: UUID;
  person_id: UUID;                    // FK → Person

  // Event Details
  event_type: CareerEventType;
  event_date: Date;
  effective_date?: Date;              // When change takes effect

  // Changes
  previous_values?: Record<string, any>; // JSON snapshot
  new_values?: Record<string, any>;      // JSON snapshot

  // Context
  reason?: string;
  notes?: string;
  approved_by?: UUID;                 // FK → Person

  // Related Entities
  from_role_id?: UUID;                // FK → Role
  to_role_id?: UUID;                  // FK → Role
  from_location_id?: UUID;            // FK → Location
  to_location_id?: UUID;              // FK → Location
  from_manager_id?: UUID;             // FK → Person
  to_manager_id?: UUID;               // FK → Person

  // System
  created_at: DateTime;
  created_by: UUID;
}

enum CareerEventType {
  Hire = 'Hire',
  Promotion = 'Promotion',
  Demotion = 'Demotion',
  Transfer = 'Transfer',              // Dept/location change
  Secondment = 'Secondment',
  RoleChange = 'RoleChange',
  ReportingChange = 'ReportingChange',
  ContractChange = 'ContractChange',  // FTE, hours, etc.
  Leave = 'Leave',                    // Start of leave
  ReturnFromLeave = 'ReturnFromLeave',
  PerformanceReview = 'PerformanceReview',
  Exit = 'Exit'
}
```

---

#### **Entity: ExitRecord**

Detailed record of employee departure.

```typescript
interface ExitRecord {
  exit_id: UUID;
  person_id: UUID;                    // FK → Person (unique)

  // Exit Details
  exit_type: ExitType;
  exit_category: 'Voluntary' | 'Involuntary';
  resignation_date?: Date;            // Date resignation submitted
  notice_period_days: number;
  notice_waived: boolean;
  last_working_day: Date;

  // Reason & Feedback
  primary_reason: string;
  secondary_reasons: string[];
  destination?: string;               // Next company/role
  exit_interview_completed: boolean;
  exit_interview_date?: Date;
  exit_interview_notes?: string;      // Encrypted/restricted
  manager_feedback?: string;

  // Offboarding
  offboarding_checklist_id?: UUID;
  assets_returned: boolean;
  access_revoked_date?: Date;
  final_payroll_processed: boolean;

  // Re-employment
  eligible_for_rehire: boolean;
  rehire_eligibility_reason?: string;
  do_not_rehire_flag: boolean;        // Hard block

  // System
  created_at: DateTime;
  updated_at: DateTime;
  created_by: UUID;
}

enum ExitType {
  Resignation = 'Resignation',
  Termination = 'Termination',
  Redundancy = 'Redundancy',
  Retirement = 'Retirement',
  ContractEnd = 'ContractEnd',
  Deceased = 'Deceased',
  Other = 'Other'
}
```

---

#### **Entity: Alumni**

Former employees who have left the organisation.

```typescript
interface Alumni {
  alumni_id: UUID;
  person_id: UUID;                    // FK → Person (unique)
  exit_record_id: UUID;               // FK → ExitRecord

  // Alumni Program
  participation_status: 'Active' | 'Dormant' | 'Opted Out';
  program_join_date: Date;
  opt_out_date?: Date;

  // Contact
  personal_email?: string;
  linkedin_url?: string;
  preferred_contact_method?: string;

  // Tenure Summary
  total_tenure_days: number;
  roles_held: string[];               // Historical roles
  departments: string[];              // Historical departments
  final_title: string;

  // Engagement
  newsletter_subscribed: boolean;
  event_invites_enabled: boolean;
  referral_program_active: boolean;
  last_engagement_date?: Date;
  engagement_score?: number;          // 0-100

  // Re-hire
  rehire_eligible: boolean;
  rehired: boolean;
  rehire_date?: Date;
  boomerang_bonus_eligible?: boolean;

  // System
  created_at: DateTime;
  updated_at: DateTime;
}
```

**Business Rules:**
- Can only be created when `Person.employment_status` = 'Alumni'
- `personal_email` required if `participation_status` = 'Active'
- Alumni data subject to stricter GDPR retention policies

---

#### **Entity: AuditTrail**

Immutable log of all system changes.

```typescript
interface AuditTrail {
  audit_id: UUID;

  // What Changed
  entity_type: string;                // 'Person', 'Role', 'Squad', etc.
  entity_id: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

  // Change Details
  field_changes: FieldChange[];
  before_state?: Record<string, any>; // Full snapshot (JSON)
  after_state?: Record<string, any>;  // Full snapshot (JSON)

  // Who & When
  changed_by: UUID;                   // FK → Person
  changed_at: DateTime;
  ip_address?: string;
  user_agent?: string;

  // Context
  reason?: string;                    // User-provided reason
  api_endpoint?: string;
  request_id?: string;                // For correlation

  // Compliance
  retention_policy: string;           // How long to keep
  archived: boolean;
}

interface FieldChange {
  field_name: string;
  old_value: any;
  new_value: any;
  data_classification?: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
}
```

**Characteristics:**
- **Append-only**: Never update or delete audit records
- **Indexed**: On entity_type, entity_id, changed_by, changed_at
- **Partitioned**: By month for performance
- **Retention**: 7 years for compliance

---

#### **Entity: Permission**

RBAC permissions for fine-grained access control.

```typescript
interface Permission {
  permission_id: UUID;

  // Permission Definition
  resource_type: string;              // 'Person', 'Squad', 'HiringNeed'
  action: string;                     // 'create', 'read', 'update', 'delete'
  permission_code: string;            // 'person:create', 'squad:read'

  // Display
  name: string;
  description: string;

  // Constraints
  scope: 'Global' | 'Department' | 'Location' | 'Self';
  conditions?: Record<string, any>;   // Additional filters (JSON)

  // System
  created_at: DateTime;
  active: boolean;
}
```

---

#### **Entity: UserRole**

Roles that bundle permissions (RBAC).

```typescript
interface UserRole {
  role_id: UUID;
  role_name: string;                  // 'HR Admin', 'Manager', 'Employee'
  role_description: string;
  permissions: UUID[];                // FKs → Permission

  // Hierarchy
  inherits_from?: UUID[];             // FK → UserRole (role inheritance)

  // System
  is_system_role: boolean;            // Cannot be deleted
  created_at: DateTime;
  updated_at: DateTime;
}
```

**Predefined Roles:**
- **Super Admin**: Full system access
- **HR Admin**: Manage all people, roles, and hiring
- **Department Head**: View department, manage direct reports, approve hiring
- **Manager**: Manage direct reports, view dotted-line reports
- **Employee**: View self and public org data
- **Recruiter**: Manage hiring needs and candidates
- **Finance Approver**: Approve hiring needs with budget impact
- **Alumni Coordinator**: Manage alumni program

---

### **4.3 Database Schema Considerations**

**Soft Deletes:**
- All primary entities use `deleted_at` timestamp for soft deletion
- Queries should filter `WHERE deleted_at IS NULL` by default
- Hard deletes reserved for GDPR "right to be forgotten" requests

**Optimistic Locking:**
- Use `version` field for concurrency control
- Increment version on every UPDATE
- Fail transaction if version mismatch

**Partitioning Strategy:**
- `AuditTrail`: Partition by month (RANGE on `changed_at`)
- `CareerEvent`: Partition by year
- Large tables >1M rows: Consider partitioning

**Indexes:**
- Created for all foreign keys
- Composite indexes for common query patterns
- Full-text search indexes for name, title, skills

---

## **5. Functional Requirements**

### **5.1 Organisation Management**

#### **FR-ORG-001: Interactive Organisation Chart**

**Description:** Display hierarchical org chart with drill-down capabilities.

**Requirements:**
- Visualise reporting structure from CEO down to individual contributors
- Support both **tree view** (traditional hierarchy) and **matrix view** (including dotted lines)
- Toggle between views: by Manager, by Department, by Location
- Click on any person to:
  - View profile
  - See direct reports
  - See dotted-line reports
  - View squad memberships
- Zoom and pan controls
- Export as PNG, PDF, or SVG
- Print-optimized view

**UI Components:**
- Org chart canvas (D3.js or React Flow)
- Person card (photo, name, title, location)
- Minimap for large orgs
- Filter panel (department, location, level)
- Search bar

**Performance:**
- Render 1000+ nodes within 3 seconds
- Lazy load branches (expand on demand)
- Virtualization for large trees

---

#### **FR-ORG-002: Org Chart Editing (Admin)**

**Description:** HR admins can restructure the organisation.

**Requirements:**
- Drag-and-drop people to new managers
- Add new roles to the hierarchy
- Mark roles as vacant
- Bulk operations:
  - Move entire team to new manager
  - Reassign department
  - Change location for group
- Preview changes before committing
- Require approval for major changes (>10 people)

**Audit:**
- Log all org structure changes
- Capture reason for restructure
- Notify affected employees

---

#### **FR-ORG-003: Matrix Reporting**

**Description:** Support multiple reporting relationships.

**Requirements:**
- Assign one **primary manager** (hard line)
- Assign 0-5 **dotted-line managers** (functional/project reporting)
- Visual distinction in org chart (solid vs dashed lines)
- Reporting line history (who reported to whom when)
- Percentage split of time allocation (optional)

**Business Rules:**
- Every active employee must have a primary manager
- Cannot have circular reporting relationships (A → B → C → A)
- Dotted lines must be in different department or squad context

---

#### **FR-ORG-004: Location Views**

**Description:** View organisation by geographic location.

**Requirements:**
- List all locations with headcount
- Filter org chart by location
- Show remote vs office-based split
- Timezone overlay for collaboration planning
- Location capacity vs utilisation

---

### **5.2 People Management**

#### **FR-PPL-001: People Directory**

**Description:** Searchable directory of all people.

**Requirements:**
- Search by:
  - Name (fuzzy matching)
  - Email
  - Job title
  - Department
  - Location
  - Skills
  - Manager
- Filters:
  - Employment status
  - Location
  - Department
  - Start date range
  - Grade level
- Sort by: Name, Start Date, Department, Location
- Pagination (50 results per page)
- Bulk export (CSV, Excel)

**Search Performance:**
- Return results within 500ms for <10k records
- Use Elasticsearch or PostgreSQL full-text search

---

#### **FR-PPL-002: Person Profile Page**

**Description:** Comprehensive profile view.

**Sections:**
1. **Header:**
   - Profile photo
   - Name, preferred name
   - Job title, department
   - Location, timezone
   - Contact info
   - Manager (clickable)

2. **Overview Tab:**
   - Start date, tenure
   - Employment type, FTE
   - Grade level, cost centre
   - Skills & certifications
   - Bio

3. **Reporting Tab:**
   - Reports to (hard line)
   - Dotted lines
   - Direct reports
   - Extended team (reports of reports)

4. **Career Tab:**
   - Timeline of career events
   - Promotions, transfers, role changes
   - Performance review history

5. **Squads Tab:**
   - Current squad memberships
   - Allocation % per squad
   - Historical squads

6. **Documents Tab:** (restricted access)
   - Contract documents
   - Performance reviews
   - Certifications

**Permissions:**
- **Self:** View and edit own profile (limited fields)
- **Manager:** View direct reports full profile
- **HR:** View and edit all profiles
- **Others:** View public fields only (name, title, location, bio)

---

#### **FR-PPL-003: Profile Editing**

**Description:** Update person information.

**Editable by Employee:**
- Profile photo
- Preferred name
- Phone (personal)
- Bio
- Skills (self-assessment)
- Interests

**Editable by HR/Manager:**
- Job title
- Department
- Location
- Manager
- FTE
- Employment status
- Salary, grade
- Performance ratings

**Validation:**
- Email must be unique
- Phone must be valid format
- Profile photo max 5MB, accepted formats: JPG, PNG, WEBP

**Audit:**
- Log all profile changes
- Notify person and manager on significant changes (title, manager, location)

---

#### **FR-PPL-004: Bulk Import**

**Description:** Import people data from CSV/Excel.

**Requirements:**
- Download CSV template
- Upload CSV file (max 1000 rows)
- Validation preview:
  - Highlight errors (missing required fields, invalid formats)
  - Show warnings (duplicates, unknown managers)
- Option to:
  - Create new people
  - Update existing (match by email or employee_number)
  - Skip errors or abort entire import
- Progress indicator
- Summary report:
  - X created, Y updated, Z errors
  - Download error log

**Supported Fields:**
- All Person entity fields
- Relationships (manager email, location code)

---

#### **FR-PPL-005: Bulk Export**

**Description:** Export filtered people list.

**Requirements:**
- Export current search/filter results
- Format: CSV, Excel, JSON
- Include/exclude columns (column picker)
- Export all or selected rows
- Max 10,000 rows per export
- Background job for large exports with email notification

---

### **5.3 Squad Management**

#### **FR-SQD-001: Squad Creation**

**Description:** Create cross-functional squads.

**Requirements:**
- Form fields:
  - Name (required, unique)
  - Code (optional, 2-10 chars)
  - Description & objective (rich text)
  - Squad type (dropdown)
  - Start date, planned end date
  - Owner (person picker)
  - Sponsor (person picker)
  - Target size
  - Related initiative (free text or dropdown)
  - External links (Jira, Slack, Confluence)
- Save as draft or publish
- Auto-generate squad code if not provided (e.g., SQ-001)

---

#### **FR-SQD-002: Squad Member Management**

**Description:** Add/remove members and manage allocations.

**Requirements:**
- **Add Member:**
  - Person picker (search by name)
  - Role in squad (dropdown or free text)
  - Allocation % (0-100)
  - Join date (default: today)
  - Planned leave date (optional)
- **Edit Member:**
  - Change role or allocation
  - Adjust dates
  - Mark as transitioning or completed
- **Remove Member:**
  - Set actual leave date
  - Reason (free text)
  - Reassign work (optional)
- **Validation:**
  - Warn if person's total allocation > 100%
  - Show current allocation across all squads
  - Highlight conflicts

---

#### **FR-SQD-003: Squad Dashboard**

**Description:** Overview of squad status and health.

**Metrics:**
- Total members
- Avg allocation %
- Current capacity (FTE equivalent)
- Vacant roles
- Members joining/leaving soon
- Squad status (active, on-hold, etc.)

**Visualisations:**
- Member allocation chart (stacked bar)
- Timeline (Gantt-style)
- Skill matrix (members vs required skills)

---

#### **FR-SQD-004: Capacity View**

**Description:** See allocation across all squads for capacity planning.

**Requirements:**
- Table view:
  - Rows: People
  - Columns: Squads
  - Cells: Allocation %
  - Row total: Total allocation %
- Highlight:
  - Over-allocated (>100%) in red
  - Under-utilised (<50%) in yellow
  - Optimal (50-100%) in green
- Filter by:
  - Department
  - Location
  - Squad status
- Export to Excel

---

### **5.4 Hiring Management**

#### **FR-HIR-001: Create Hiring Need**

**Description:** Request to fill a role.

**Workflow:**
1. **Request Form:**
   - Type: Backfill existing role OR New role
   - If backfill: Select role (dropdown)
   - If new: Enter proposed title, dept, level
   - Location (dropdown)
   - Required start date
   - Business justification (min 100 chars)
   - Priority (dropdown)
   - Budget allocation (optional)
2. **Review:**
   - Preview hiring need
   - Estimated cost (based on salary band)
   - Impact analysis (current vacancies in dept)
3. **Submit:**
   - Saves as "Draft" or "Pending Approval"
   - Triggers approval workflow

---

#### **FR-HIR-002: Approval Workflow**

**Description:** Multi-step approval process.

**Default Workflow:**
1. **Manager Approval** (auto-determined by requester's manager)
2. **Finance Approval** (if budget > threshold, e.g., £50k)
3. **Executive Approval** (if Director+ role)

**Approval Actions:**
- Approve (with optional comments)
- Reject (must provide reason)
- Request changes (send back to requester)

**Notifications:**
- Email to current approver
- Reminder after 3 business days
- Escalation after 7 business days

**Audit:**
- Log all approval decisions
- Track time at each stage

---

#### **FR-HIR-003: Candidate Tracking**

**Description:** Track candidates through hiring pipeline.

**Requirements:**
- Add candidate:
  - Internal (link to Person)
  - External (enter name, email, resume)
- Pipeline stages:
  - Sourcing
  - Screening
  - Phone Interview
  - Technical Interview
  - Final Interview
  - Offer
  - Accepted/Declined
- Drag-and-drop between stages
- Add interview feedback
- Schedule interviews (integration with calendar)
- Send offer letters (template + DocuSign)

**Note:** This is lightweight tracking. For full ATS, integrate with Greenhouse/Lever/Workday Recruiting.

---

#### **FR-HIR-004: Hiring Dashboard**

**Description:** View hiring pipeline health.

**Widgets:**
- Open roles by department (bar chart)
- Time to fill (avg days by role type)
- Hiring funnel (conversion rates)
- Ageing roles (roles open >90 days)
- Approval bottlenecks
- Candidate pipeline by stage

**Filters:**
- Date range
- Department
- Location
- Priority

---

### **5.5 Employee Journey**

#### **FR-JNY-001: Pre-boarding (Candidate → Offer → Onboarding)**

**Triggers:** When hiring need is marked "Filled" and offer accepted.

**Actions:**
- Create Person record (if external) with status "Offer"
- Send welcome email
- Assign onboarding buddy
- Create checklist:
  - Contract signed
  - Right-to-work documents
  - Background check
  - IT equipment ordered
  - Security pass requested
  - Desk assigned
  - First day agenda shared
- Track checklist completion %
- Automated reminders to HR and hiring manager

---

#### **FR-JNY-002: Onboarding (First 90 Days)**

**Triggers:** Start date arrives; status changes to "Onboarding".

**Onboarding Plan:**
- **Week 1:**
  - Office tour
  - IT setup
  - Meet manager
  - Team intro
  - Review role expectations
- **Week 2-4:**
  - Training modules (e.g., compliance, security)
  - Meet key stakeholders
  - Shadow team members
  - First project assignment
- **Day 30, 60, 90 Check-ins:**
  - Automated survey to new hire
  - Manager feedback form
  - HR follow-up

**Checklist:**
- Tracked in app with completion status
- Manager and HR visibility
- Probation review at end of 90 days

**Auto-transition:**
- After 90 days and probation passed, status → "Active"

---

#### **FR-JNY-003: Development & Performance**

**Features:**
- **Skills Tracking:**
  - Self-assessment
  - Manager endorsement
  - Skill gap analysis
- **Training & Certifications:**
  - Completed courses
  - Upcoming renewals (e.g., cert expiry)
- **Performance Reviews:**
  - Link to CareerEvent
  - Review cycle tracking (annual, bi-annual)
  - Goals and OKRs (lightweight)
- **Career Pathing:**
  - View potential next roles
  - Promotion timeline (avg time in grade)

---

#### **FR-JNY-004: Internal Mobility**

**Description:** Facilitate internal transfers and promotions.

**Requirements:**
- **Internal Job Board:**
  - List open roles
  - Allow employees to express interest
  - Manager can nominate reports for roles
- **Transfer Workflow:**
  - Employee applies or is nominated
  - Current manager approval
  - Hiring manager interview
  - Offer and acceptance
  - Career event created (Transfer)
  - Update reporting line and department
- **Promotions:**
  - Manager initiates promotion request
  - HR approval
  - Update grade, title, salary
  - Create CareerEvent (Promotion)

---

#### **FR-JNY-005: Offboarding**

**Triggers:**
- Manager or employee initiates resignation
- Termination decision
- Contract end

**Offboarding Workflow:**
1. **Notice Period:**
   - Resignation date recorded
   - Last working day calculated (notice period)
   - Status → "Offboarding"
   - Notify HR, IT, manager
2. **Offboarding Checklist:**
   - Exit interview scheduled
   - Knowledge transfer plan
   - Return assets (laptop, phone, pass)
   - Revoke access (systems, building, Slack)
   - Final payroll processed
   - Collect feedback
3. **Exit Interview:**
   - Form with structured questions
   - Stored in ExitRecord (restricted access)
   - Aggregate insights for HR
4. **Transition to Alumni:**
   - Status → "Alumni"
   - Offer to join alumni program
   - Create Alumni record
   - Send goodbye email / thank you note

---

#### **FR-JNY-006: Alumni Programme**

**Description:** Engage former employees.

**Features:**
- **Alumni Portal:**
  - Opt-in to mailing list
  - Subscribe to newsletter
  - Enable event invitations
  - Referral programme (refer candidates, earn rewards)
- **Alumni Directory:**
  - Searchable list of opted-in alumni
  - Where are they now (current company, optional)
  - LinkedIn links
- **Engagement Tracking:**
  - Last interaction date
  - Engagement score (based on opens, clicks, referrals)
- **Boomerang Hiring:**
  - Mark alumni as rehire eligible
  - Fast-track application process
  - Boomerang bonus (financial incentive)

---

### **5.6 Analytics & Dashboards**

#### **FR-DAS-001: Executive Dashboard**

**Target Users:** C-suite, VPs

**Widgets:**
- **Headcount:**
  - Total employees
  - By location (map)
  - By department (bar chart)
  - Trend line (last 12 months)
- **Attrition:**
  - Rolling 12-month attrition rate
  - Voluntary vs involuntary
  - Attrition by department
  - High-risk roles (high turnover)
- **Hiring:**
  - Open roles vs filled
  - Time to fill (avg)
  - Offer acceptance rate
- **Diversity (if applicable):**
  - Gender balance
  - Location distribution
- **Cost:**
  - Total headcount cost
  - Cost per department
  - Budget vs actual

**Refresh:** Real-time or daily batch

---

#### **FR-DAS-002: Hiring Pipeline Dashboard**

**Target Users:** Recruiters, hiring managers

**Widgets:**
- Hiring funnel (stage conversion)
- Open roles by priority
- Time in stage (avg days)
- Interview-to-offer ratio
- Source effectiveness (where candidates come from)
- Bottlenecks (stalled roles)

---

#### **FR-DAS-003: Department Dashboard**

**Target Users:** Department heads

**Widgets:**
- Team roster
- Reporting structure
- Headcount vs budget
- Open roles in dept
- Attrition risk (based on tenure, performance trends)
- Squad commitments (capacity view)
- Skill inventory

---

#### **FR-DAS-004: Skills Dashboard**

**Description:** Organisational capability view.

**Widgets:**
- Skill heatmap (who has what skills)
- Skill gaps (required vs available)
- Top skills by frequency
- Expiring certifications (alert)
- Training needs (skills with low coverage)

---

#### **FR-DAS-005: Squad Utilisation Dashboard**

**Description:** Cross-squad capacity view.

**Widgets:**
- Active squads (count)
- Total allocated capacity (FTE)
- Over-allocated people (list)
- Under-utilised people (list)
- Squads by status (pie chart)
- Upcoming squad milestones

---

### **5.7 Search & Filtering**

#### **FR-SRC-001: Global Search**

**Description:** Quick search across all entities.

**Requirements:**
- Search bar in header (always visible)
- Search across:
  - People (name, email, title)
  - Roles (title, department)
  - Squads (name, code, objective)
  - Locations (name, city)
- Real-time suggestions (autocomplete)
- Keyboard shortcuts (Cmd+K / Ctrl+K)
- Recent searches
- Jump to entity detail page

---

#### **FR-SRC-002: Advanced Filters**

**Description:** Multi-criteria filtering on list views.

**Available on:**
- People directory
- Squad list
- Hiring needs list
- Role list

**Filter Types:**
- Multi-select dropdowns (location, department, status)
- Date ranges (start date, end date)
- Text search (name, title)
- Numeric ranges (FTE, allocation)
- Boolean flags (remote, vacant, rehire eligible)

**Filter Behaviour:**
- AND logic between different filters
- OR logic within same filter (e.g., multiple locations)
- Apply button
- Clear all button
- Save filter presets (user-specific)

---

### **5.8 Notifications & Alerts**

#### **FR-NOT-001: Email Notifications**

**Trigger Events:**
- Profile changes (title, manager, location)
- Hiring need approvals (approval required, approved, rejected)
- Squad changes (added to squad, allocation changed)
- Onboarding milestones (first day reminder, 30/60/90 check-ins)
- Offboarding (resignation accepted, last day reminder)
- Expiring certifications (30 days before)
- Over-allocation warning (squad allocation >100%)

**Email Format:**
- Plain text + HTML
- Branded template
- CTA button (e.g., "View Profile", "Approve Request")
- Unsubscribe link (for non-critical emails)

---

#### **FR-NOT-002: In-App Notifications**

**Description:** Notification center in app.

**Requirements:**
- Bell icon in header with unread count
- Dropdown list of recent notifications
- Notification types:
  - Info (blue)
  - Warning (yellow)
  - Error (red)
  - Success (green)
- Mark as read
- Clear all
- Link to relevant entity

---

#### **FR-NOT-003: Slack Integration (Optional)**

**Description:** Post updates to Slack channels.

**Use Cases:**
- New hire announcement (company-wide)
- Promotion/transfer announcement
- Hiring need approval reminders (to approvers)
- Squad milestone reached

**Configuration:**
- Admin panel to configure Slack webhook
- Choose which events trigger Slack messages
- Message templates

---

### **5.9 Integrations**

#### **FR-INT-001: HRIS Integration**

**Description:** Bi-directional sync with Workday/BambooHR/SAP SuccessFactors.

**Sync Direction:**
- **From HRIS → App:**
  - Person data (name, email, title, start date)
  - Org structure (manager, department)
  - Employment status changes
  - Compensation data (if permitted)
- **From App → HRIS:**
  - Hiring needs (new role requests)
  - Onboarding status
  - Exit records

**Sync Frequency:**
- Real-time via webhooks (preferred)
- Batch sync every 4 hours (fallback)

**Conflict Resolution:**
- HRIS is source of truth for employment data
- App is source of truth for squads, hiring needs
- Timestamp-based wins for overlapping fields

---

#### **FR-INT-002: Identity Provider (SSO)**

**Description:** Single sign-on via Azure AD / Okta / Auth0.

**Requirements:**
- OAuth 2.0 / SAML 2.0
- Auto-provision users on first login
- Sync groups from IdP to app roles
- JIT (Just-In-Time) provisioning
- Support MFA (handled by IdP)

---

#### **FR-INT-003: Calendar Integration**

**Description:** Sync onboarding meetings and interviews.

**Requirements:**
- Google Calendar / Microsoft Outlook integration
- Create calendar events:
  - Onboarding check-ins (30/60/90 days)
  - Interview schedules
  - Exit interviews
- Send invites to participants
- Update event status

---

#### **FR-INT-004: Document Storage (Optional)**

**Description:** Store and retrieve documents (contracts, reviews).

**Integration Options:**
- **SharePoint / OneDrive**
- **Google Drive**
- **Box**
- **S3 + CloudFront** (custom)

**Requirements:**
- Upload documents from app
- View/download documents in app
- Access control (HR only for sensitive docs)
- Versioning
- Audit trail (who accessed when)

---

## **6. User Stories & Acceptance Criteria**

### **Epic: Organisation Management**

#### **User Story: ORG-001**
**As a** department head
**I want to** view my department's org chart with all reporting lines
**So that** I understand the structure and identify gaps

**Acceptance Criteria:**
- [ ] Can filter org chart by my department
- [ ] See both hard and dotted reporting lines
- [ ] Click on any person to view their profile
- [ ] See vacancy indicators for unfilled roles
- [ ] Export chart as PDF for presentations

---

#### **User Story: ORG-002**
**As an** HR admin
**I want to** restructure the organisation by moving people to new managers
**So that** the org chart reflects recent changes

**Acceptance Criteria:**
- [ ] Can drag-and-drop a person to a new manager
- [ ] System validates no circular reporting (error if A→B→A)
- [ ] Preview changes before saving
- [ ] All changes logged in audit trail with reason
- [ ] Affected employees notified via email

---

### **Epic: People Management**

#### **User Story: PPL-001**
**As an** employee
**I want to** search for colleagues by name, skill, or department
**So that** I can find the right person to help with my work

**Acceptance Criteria:**
- [ ] Search bar available on people directory page
- [ ] Search returns results within 1 second
- [ ] Can filter by location, department, skills
- [ ] Results show profile photo, name, title, location
- [ ] Click on result navigates to person's profile

---

#### **User Story: PPL-002**
**As a** manager
**I want to** view my direct reports' profiles
**So that** I can see their career history and current assignments

**Acceptance Criteria:**
- [ ] "My Team" section on dashboard
- [ ] List of direct reports with photos
- [ ] Click to view full profile
- [ ] See each report's:
  - Current role and title
  - Start date and tenure
  - Squad memberships
  - Recent career events
- [ ] Can edit certain fields (title, FTE) if I have permission

---

#### **User Story: PPL-003**
**As an** HR admin
**I want to** bulk import employee data from Excel
**So that** I can onboard multiple new hires efficiently

**Acceptance Criteria:**
- [ ] Download CSV template with required columns
- [ ] Upload CSV (up to 1000 rows)
- [ ] System validates each row and highlights errors
- [ ] Preview import with summary (X new, Y updated, Z errors)
- [ ] Can skip errors or fix and re-upload
- [ ] On success, displays summary and downloads import log
- [ ] All created/updated records logged in audit trail

---

### **Epic: Squad Management**

#### **User Story: SQD-001**
**As a** product manager
**I want to** create a new squad for my initiative
**So that** I can assign cross-functional team members

**Acceptance Criteria:**
- [ ] Form with fields: name, description, start/end dates, owner
- [ ] Can add external links (Jira, Slack, Confluence)
- [ ] Save as draft or publish immediately
- [ ] On publish, squad appears in squad list
- [ ] Owner receives notification

---

#### **User Story: SQD-002**
**As a** squad lead
**I want to** add members to my squad with allocation percentages
**So that** I track who is working on what and their capacity

**Acceptance Criteria:**
- [ ] "Add Member" button on squad page
- [ ] Search for person by name
- [ ] Enter role in squad (free text or dropdown)
- [ ] Enter allocation % (0-100, required)
- [ ] System warns if person's total allocation > 100%
- [ ] On save, person appears in squad member list
- [ ] Person receives notification of squad assignment

---

#### **User Story: SQD-003**
**As an** engineering manager
**I want to** see a capacity view of my team across all squads
**So that** I can identify over-allocated or under-utilised engineers

**Acceptance Criteria:**
- [ ] Capacity view table with rows = people, columns = squads
- [ ] Cells show allocation %
- [ ] Row total shows total allocation %
- [ ] Over-allocated (>100%) highlighted in red
- [ ] Can filter by department or location
- [ ] Export to Excel

---

### **Epic: Hiring Management**

#### **User Story: HIR-001**
**As a** hiring manager
**I want to** create a hiring need for a new role
**So that** I can get approval and start recruiting

**Acceptance Criteria:**
- [ ] Form with fields: role type (new/backfill), title, department, location, justification
- [ ] Business justification required (min 100 chars)
- [ ] Preview estimated cost based on salary band
- [ ] On submit, status = "Pending Approval"
- [ ] Approval workflow initiated
- [ ] First approver (my manager) receives email notification

---

#### **User Story: HIR-002**
**As a** finance approver
**I want to** review and approve/reject hiring needs
**So that** I ensure budget compliance

**Acceptance Criteria:**
- [ ] "Pending Approvals" section on my dashboard
- [ ] List of hiring needs awaiting my approval
- [ ] Click to view full hiring need details
- [ ] Can see:
  - Role details
  - Business justification
  - Budget impact
  - Requester
- [ ] Buttons: Approve, Reject, Request Changes
- [ ] If reject, must enter reason
- [ ] On approve, moves to next approver or status = "Approved"
- [ ] Requester notified of decision

---

#### **User Story: HIR-003**
**As a** recruiter
**I want to** track candidates through the hiring pipeline
**So that** I know where each candidate is in the process

**Acceptance Criteria:**
- [ ] Kanban board with columns = pipeline stages
- [ ] Drag candidate cards between stages
- [ ] Click card to view candidate details
- [ ] Add interview feedback
- [ ] Mark candidate as hired → creates Person record
- [ ] Mark candidate as declined/rejected → removes from pipeline

---

### **Epic: Employee Journey**

#### **User Story: JNY-001**
**As an** HR coordinator
**I want to** create an onboarding checklist for new hires
**So that** nothing is forgotten in the first 90 days

**Acceptance Criteria:**
- [ ] Pre-defined onboarding template (Week 1, 2-4, Day 30/60/90)
- [ ] Can customise checklist per role or department
- [ ] Assign tasks to specific people (HR, IT, Manager)
- [ ] Track completion % on dashboard
- [ ] Send reminders for overdue tasks
- [ ] New hire can view their own onboarding plan

---

#### **User Story: JNY-002**
**As a** new hire
**I want to** see my onboarding checklist and mark tasks complete
**So that** I know what to expect in my first weeks

**Acceptance Criteria:**
- [ ] "My Onboarding" page with checklist
- [ ] Tasks grouped by week/phase
- [ ] Can check off completed tasks
- [ ] See assigned buddy and manager contact info
- [ ] Receive reminders for upcoming milestones (Day 30/60/90 check-ins)

---

#### **User Story: JNY-003**
**As a** manager
**I want to** initiate offboarding for a resigning employee
**So that** HR and IT are notified and tasks are completed

**Acceptance Criteria:**
- [ ] "Initiate Offboarding" button on employee profile
- [ ] Enter resignation date and last working day
- [ ] Select exit reason (dropdown)
- [ ] System calculates notice period (based on contract or default)
- [ ] Status changes to "Offboarding"
- [ ] Offboarding checklist auto-generated
- [ ] HR and IT receive notification
- [ ] Exit interview scheduled (optional)

---

## **7. Non-Functional Requirements**

### **7.1 Performance**

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **Page Load Time** | ≤ 2s (95th percentile) | Web vitals (LCP) |
| **API Response Time** | ≤ 1s for standard queries | Server-side monitoring |
| **Database Query Time** | ≤ 200ms for typical queries | APM tools |
| **Search Results** | ≤ 500ms | Client-side tracking |
| **Org Chart Render** | ≤ 3s for 1000 nodes | Performance profiling |
| **Bulk Import** | Process 1000 rows in ≤ 30s | Background job monitoring |
| **Dashboard Refresh** | ≤ 2s | Cache-first strategy |

**Optimisation Strategies:**
- Frontend: Code splitting, lazy loading, image optimisation
- Backend: Database indexing, query optimisation, N+1 prevention
- Caching: Redis for frequently accessed data (org chart, person profiles)
- CDN for static assets
- API pagination and cursor-based navigation

---

### **7.2 Scalability**

**Capacity Targets:**
- **Users:** 10,000 employees (concurrent: ~500)
- **Data Volume:**
  - 10,000 people
  - 15,000 roles (historical + current)
  - 5,000 career events/year
  - 500 active squads
  - 2,000 hiring needs/year
  - 100,000+ audit trail entries/year
- **API Throughput:** 1000 req/s
- **Storage:** 500 GB (including documents)

**Scaling Strategy:**
- **Horizontal scaling:** Stateless API servers (add more instances)
- **Database:** Read replicas for analytics queries
- **Caching:** Redis cluster (master-slave replication)
- **Background jobs:** Queue-based processing (Bull/BullMQ with Redis)
- **File storage:** Object storage (S3/Azure Blob) with CDN

---

### **7.3 Availability & Reliability**

**Uptime SLA:** 99.9% (max ~45 min downtime/month)

**Strategies:**
- **Multi-AZ deployment** (AWS) or **Availability Zones** (Azure)
- **Health checks** and auto-restart for crashed services
- **Load balancer** with health monitoring
- **Database backups:**
  - Automated daily backups (retained 30 days)
  - Point-in-time recovery (PITR) enabled
  - Cross-region backup for disaster recovery
- **Monitoring & Alerting:**
  - Uptime monitoring (Pingdom, Uptime Robot)
  - Alert on downtime, high error rate, slow response times
  - On-call rotation for critical incidents

---

### **7.4 Security**

#### **Authentication & Authorization**

**Authentication:**
- **SSO via SAML 2.0 / OAuth 2.0** (Azure AD, Okta)
- **Multi-Factor Authentication (MFA)** enforced for admin roles
- **Session management:**
  - JWT tokens with 1-hour expiry
  - Refresh tokens with 7-day expiry
  - Token rotation on refresh
- **Password policy** (for local accounts, if any):
  - Min 12 characters
  - Uppercase, lowercase, number, special char
  - No password reuse (last 5)
  - Max age: 90 days

**Authorization (RBAC):**
- Role-based access control (see UserRole entity)
- Permission checks on every API request
- Fine-grained permissions (e.g., `person:read:own`, `person:update:department`)
- Scope-based access:
  - **Global:** All entities
  - **Department:** Only entities in user's department
  - **Location:** Only entities in user's location
  - **Self:** Only user's own record

**Sensitive Data Access:**
- Salary, performance reviews, exit feedback: **HR only**
- SSN, passport, bank details: **Restricted** (encrypted at rest, access logged)
- Alumni personal contact info: Requires opt-in consent

---

#### **Data Protection**

**Encryption:**
- **At rest:** AES-256 encryption for database and file storage
- **In transit:** TLS 1.3 for all API communication
- **Sensitive fields:** Additional field-level encryption (e.g., SSN, bank account)

**Data Classification:**
- **Public:** Name, job title, department, location, profile photo
- **Internal:** Email, phone, manager, career history
- **Confidential:** Salary, performance ratings, hiring feedback
- **Restricted:** SSN, passport, health records (if any)

**Data Retention:**
- **Active employees:** Indefinite
- **Alumni:** 7 years after exit (compliance requirement)
- **Candidates:** 1 year after application (GDPR)
- **Audit logs:** 7 years
- **Backups:** 30 days rolling, 1 year archive

**Data Deletion:**
- **Soft delete** for most entities (deleted_at timestamp)
- **Hard delete** for GDPR "right to be forgotten" requests
- **Anonymization:** PII removed, aggregated data retained for analytics

---

#### **Security Best Practices**

- **Input Validation:**
  - Sanitize all user inputs
  - Parameterized queries (prevent SQL injection)
  - Escape HTML (prevent XSS)
- **Output Encoding:**
  - Encode data before rendering (XSS prevention)
- **Rate Limiting:**
  - API: 100 req/min per user
  - Auth: 5 login attempts per 15 min (lockout after)
- **CORS Policy:**
  - Whitelist allowed origins
  - No wildcard (\*) in production
- **Security Headers:**
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security (HSTS)
- **Dependency Scanning:**
  - Automated CVE scanning (Snyk, Dependabot)
  - Monthly dependency updates
- **Penetration Testing:**
  - Annual third-party pentest
  - Quarterly internal security audit

---

### **7.5 Usability & Accessibility**

**Responsive Design:**
- **Desktop:** Optimised for 1920x1080 and above
- **Tablet:** 768px - 1024px (iPad, Surface)
- **Mobile:** 375px - 768px (iPhone, Android)
- Progressive Web App (PWA) features:
  - Installable on mobile home screen
  - Offline-first for read-only views
  - Push notifications (with permission)

**Accessibility (WCAG 2.1 Level AA):**
- **Keyboard Navigation:**
  - All actions accessible via keyboard
  - Tab order logical
  - Visible focus indicators
- **Screen Reader Support:**
  - Semantic HTML5 (nav, main, article)
  - ARIA labels where needed
  - Alt text for images
- **Colour Contrast:**
  - Text: 4.5:1 contrast ratio (AAA for body text)
  - UI elements: 3:1 contrast ratio
  - No colour-only indicators (use icons + colour)
- **Text:**
  - Resizable up to 200% without breaking layout
  - Font size ≥ 14px for body text
- **Forms:**
  - Clear labels associated with inputs
  - Error messages descriptive and positioned near field
  - Required fields marked with asterisk and aria-required
- **Testing:**
  - Automated testing (axe, Lighthouse)
  - Manual testing with screen reader (NVDA, JAWS, VoiceOver)

---

### **7.6 Internationalization (i18n)**

**Phase 1 (MVP):**
- English (UK) only
- Date format: DD/MM/YYYY
- Number format: 1,000.00
- Currency: GBP (£)
- Timezone: UTC, Europe/London

**Future Phases:**
- Support additional languages (if multi-country expansion)
- Use i18n library (e.g., react-i18next)
- Externalise strings to JSON locale files
- Right-to-left (RTL) support if needed (Arabic, Hebrew)

---

### **7.7 Browser & Device Support**

**Browsers:**
- **Desktop:**
  - Chrome (last 2 versions)
  - Firefox (last 2 versions)
  - Safari (last 2 versions)
  - Edge (last 2 versions)
- **Mobile:**
  - iOS Safari (last 2 versions)
  - Chrome Android (last 2 versions)

**Polyfills:**
- Include polyfills for ES6+ features if targeting older browsers

---

## **8. Technical Architecture**

### **8.1 Architecture Overview**

**Architecture Style:** 3-Tier Web Application with API-first approach

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Web App (React + Next.js)                           │   │
│  │  - Pages, Components, State Management               │   │
│  │  - API Client (Axios/Fetch)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Gateway (NestJS / Express)                      │   │
│  │  - REST + GraphQL Endpoints                          │   │
│  │  - Authentication & Authorization                    │   │
│  │  - Validation, Rate Limiting                         │   │
│  │  - Business Logic Layer                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Background Workers (Bull/BullMQ)                    │   │
│  │  - Email sending                                     │   │
│  │  - Bulk imports                                      │   │
│  │  - Report generation                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                              │
│  ┌─────────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  PostgreSQL     │  │   Redis     │  │  Azure Blob /  │  │
│  │  (Primary DB)   │  │  (Cache +   │  │  S3 (Files)    │  │
│  │                 │  │   Queue)    │  │                │  │
│  └─────────────────┘  └─────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Workday /   │  │  Azure AD /  │  │  SendGrid /     │   │
│  │  BambooHR    │  │  Okta (SSO)  │  │  AWS SES        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### **8.2 Technology Stack**

#### **Frontend**

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | **React 18** | Industry standard, large ecosystem, component reusability |
| **Meta-framework** | **Next.js 14** (App Router) | SSR/SSG for performance, API routes, file-based routing |
| **Language** | **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| **Styling** | **TailwindCSS** + **shadcn/ui** | Utility-first, fast development, consistent design system |
| **State Management** | **Zustand** or **TanStack Query** | Lightweight, simple API, server state management |
| **Forms** | **React Hook Form** + **Zod** | Performance, validation schema, type inference |
| **Data Fetching** | **TanStack Query** (React Query) | Caching, auto-refetch, optimistic updates |
| **Visualisations** | **Recharts** / **D3.js** | Charts/graphs for dashboards, org chart |
| **Tables** | **TanStack Table** | Headless, flexible, performant |
| **Testing** | **Jest** + **React Testing Library** | Unit and integration testing |
| **E2E Testing** | **Playwright** | Cross-browser, reliable |

#### **Backend**

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Runtime** | **Node.js 20 LTS** | JavaScript/TypeScript full-stack, large ecosystem |
| **Framework** | **NestJS** | Structured, TypeScript-first, built-in DI, scalable |
| **Alternative** | **.NET 8** (C#) | Enterprise-grade, high performance, strong typing |
| **API Style** | **REST** (primary) + **GraphQL** (optional) | REST for simplicity, GraphQL for complex queries |
| **Validation** | **class-validator** + **class-transformer** | Decorator-based validation, works with NestJS |
| **ORM** | **Prisma** (Node) / **Entity Framework** (.NET) | Type-safe queries, migrations, schema management |
| **Authentication** | **Passport.js** + **JWT** | Strategies for SSO, flexible |
| **Background Jobs** | **BullMQ** (Node) / **Hangfire** (.NET) | Reliable queue, retries, scheduling |
| **Testing** | **Jest** (Node) / **xUnit** (.NET) | Unit and integration testing |

#### **Database**

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Primary DB** | **PostgreSQL 16** | ACID, JSON support (JSONB), full-text search, mature |
| **Caching** | **Redis 7** | In-memory, fast, pub/sub, session storage |
| **Search** | **PostgreSQL Full-Text** (MVP) <br> **Elasticsearch** (future) | Built-in for MVP, Elasticsearch for advanced search |
| **File Storage** | **Azure Blob Storage** / **AWS S3** | Scalable, durable, CDN integration |

#### **Infrastructure**

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Hosting** | **Azure App Service** / **AWS Elastic Beanstalk** | Managed, auto-scaling, easy deployment |
| **Containerisation** | **Docker** | Consistent environments, easy local development |
| **Orchestration** | **Kubernetes** (future) / **Azure Container Apps** | Scalability, resilience (if needed) |
| **CI/CD** | **GitHub Actions** / **Azure DevOps** | Automate build, test, deploy |
| **Monitoring** | **Application Insights** / **Datadog** | APM, logging, alerting |
| **Logging** | **Winston** (Node) / **Serilog** (.NET) + **Azure Log Analytics** | Structured logging, centralised |
| **CDN** | **Azure CDN** / **CloudFront** | Fast asset delivery globally |

#### **External Services**

| Service | Technology | Purpose |
|---------|------------|---------|
| **Email** | **SendGrid** / **AWS SES** | Transactional emails, high deliverability |
| **Authentication** | **Azure AD** / **Okta** | SSO, SAML/OAuth |
| **Document Signing** | **DocuSign** | Offer letters, contracts |
| **Calendar** | **Microsoft Graph API** / **Google Calendar API** | Meeting scheduling |
| **HRIS Integration** | **Workday API** / **BambooHR API** | Employee data sync |

---

### **8.3 API Design**

#### **REST API Conventions**

**Base URL:** `https://api.peopleflow.company.com/v1`

**Resource Naming:**
- Use plural nouns: `/people`, `/roles`, `/squads`
- Use kebab-case for multi-word resources: `/hiring-needs`
- Use IDs in path for specific resources: `/people/{person_id}`

**HTTP Methods:**
- `GET`: Retrieve resource(s)
- `POST`: Create new resource
- `PUT`: Replace entire resource
- `PATCH`: Partially update resource
- `DELETE`: Delete resource (soft delete)

**Status Codes:**
- `200 OK`: Success (GET, PATCH, PUT)
- `201 Created`: Resource created (POST)
- `204 No Content`: Success with no response body (DELETE)
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorised (permission denied)
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate or constraint violation
- `422 Unprocessable Entity`: Business logic validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Response Format (JSON):**

Success:
```json
{
  "data": { /* resource or array */ },
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 237
  },
  "links": {
    "self": "/people?page=1",
    "next": "/people?page=2",
    "prev": null
  }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  }
}
```

---

#### **Example Endpoints**

**People**
```
GET    /api/v1/people                    # List all (with filters)
GET    /api/v1/people/{id}               # Get one
POST   /api/v1/people                    # Create
PATCH  /api/v1/people/{id}               # Update
DELETE /api/v1/people/{id}               # Soft delete
GET    /api/v1/people/{id}/career-events # Get career history
GET    /api/v1/people/{id}/squads        # Get squad memberships
GET    /api/v1/people/search?q={query}   # Search
```

**Roles**
```
GET    /api/v1/roles
GET    /api/v1/roles/{id}
POST   /api/v1/roles
PATCH  /api/v1/roles/{id}
DELETE /api/v1/roles/{id}
GET    /api/v1/roles?status=vacant       # Filter vacant roles
```

**Squads**
```
GET    /api/v1/squads
GET    /api/v1/squads/{id}
POST   /api/v1/squads
PATCH  /api/v1/squads/{id}
DELETE /api/v1/squads/{id}
POST   /api/v1/squads/{id}/members       # Add member
PATCH  /api/v1/squads/{id}/members/{member_id}
DELETE /api/v1/squads/{id}/members/{member_id}
GET    /api/v1/squads/{id}/capacity      # Capacity report
```

**Hiring Needs**
```
GET    /api/v1/hiring-needs
GET    /api/v1/hiring-needs/{id}
POST   /api/v1/hiring-needs
PATCH  /api/v1/hiring-needs/{id}
DELETE /api/v1/hiring-needs/{id}
POST   /api/v1/hiring-needs/{id}/approve  # Approve
POST   /api/v1/hiring-needs/{id}/reject   # Reject
```

**Org Chart**
```
GET    /api/v1/orgchart                  # Full org hierarchy (JSON)
GET    /api/v1/orgchart?root={person_id} # Sub-tree from specific person
GET    /api/v1/orgchart?department={id}  # Dept-specific
```

**Dashboards**
```
GET    /api/v1/dashboards/executive      # Executive summary
GET    /api/v1/dashboards/hiring         # Hiring metrics
GET    /api/v1/dashboards/department/{dept_id}
GET    /api/v1/dashboards/skills         # Skills inventory
```

**Reports (Async)**
```
POST   /api/v1/reports/headcount         # Generate report (returns job_id)
GET    /api/v1/reports/{job_id}/status   # Check status
GET    /api/v1/reports/{job_id}/download # Download when ready
```

---

#### **GraphQL (Optional)**

**Endpoint:** `https://api.peopleflow.company.com/graphql`

**Benefits:**
- Flexible queries (fetch only needed fields)
- Single request for complex data (person + manager + squads)
- Strongly typed schema

**Example Query:**
```graphql
query GetPerson($id: UUID!) {
  person(id: $id) {
    id
    firstName
    lastName
    email
    jobTitle
    location {
      name
      country
    }
    manager {
      id
      firstName
      lastName
    }
    squads {
      squad {
        name
        status
      }
      allocationPercentage
    }
  }
}
```

**Tools:**
- **Apollo Server** (Node) / **Hot Chocolate** (.NET)
- **GraphQL Playground** for API exploration

---

### **8.4 Data Flow Examples**

#### **Example 1: Create Hiring Need**

```mermaid
sequenceDiagram
    User->>Frontend: Fill hiring need form
    Frontend->>API: POST /api/v1/hiring-needs
    API->>Auth: Validate JWT token
    Auth-->>API: User authenticated
    API->>Validation: Validate request body
    Validation-->>API: Valid
    API->>DB: Insert HiringNeed record
    DB-->>API: Record created
    API->>DB: Insert ApprovalStep records
    API->>Queue: Enqueue approval notification job
    Queue->>Worker: Process job
    Worker->>Email: Send email to first approver
    API-->>Frontend: 201 Created + hiring need data
    Frontend-->>User: Show success message
```

#### **Example 2: Add Person to Squad**

```mermaid
sequenceDiagram
    User->>Frontend: Add member to squad
    Frontend->>API: POST /api/v1/squads/{id}/members
    API->>Auth: Check permission (squad:manage)
    Auth-->>API: Authorised
    API->>DB: Get person's current allocations
    DB-->>API: Current total: 80%
    API->>Business Logic: Check if total will exceed 100%
    Business Logic-->>API: Total = 95% (OK)
    API->>DB: Insert SquadMember record
    DB-->>API: Success
    API->>Cache: Invalidate squad cache
    API->>Queue: Enqueue notification job
    API-->>Frontend: 201 Created
    Frontend-->>User: Member added, show warning "Person at 95% capacity"
```

---

### **8.5 Caching Strategy**

**Cache Layers:**

1. **Browser Cache:**
   - Static assets (CSS, JS, images): 1 year (immutable)
   - API responses: No cache or short TTL (use ETag)

2. **CDN Cache:**
   - Static assets: Edge caching
   - Profile photos: 24 hours

3. **Application Cache (Redis):**
   - **Person profiles:** 1 hour TTL, invalidate on update
   - **Org chart:** 30 min TTL, invalidate on structure change
   - **Dashboard data:** 5 min TTL
   - **Search results:** 10 min TTL
   - **Sessions:** 1 hour (JWT), 7 days (refresh token)

**Cache Invalidation:**
- **Event-driven:** On update/delete, publish event to Redis pub/sub
- **TTL-based:** Expire after time limit
- **Manual:** Admin can clear cache

**Cache Keys:**
```
person:{person_id}
orgchart:full
orgchart:dept:{dept_id}
squad:{squad_id}
dashboard:executive:{date}
```

---

### **8.6 Background Jobs**

**Job Queue:** BullMQ (Redis-backed)

**Job Types:**

| Job | Trigger | Processing Time | Priority |
|-----|---------|-----------------|----------|
| **Send Email** | Various events | <5s | High |
| **Bulk Import** | User upload | 10-60s | Medium |
| **Generate Report** | User request | 30-120s | Medium |
| **HRIS Sync** | Scheduled (hourly) | 5-10 min | Low |
| **Data Cleanup** | Scheduled (daily) | 10-30 min | Low |
| **Offboarding Access Revocation** | Offboarding initiated | 1-2 min | High |
| **Audit Log Archival** | Scheduled (monthly) | 1-2 hours | Low |

**Job Configuration:**
- **Retries:** 3 attempts with exponential backoff
- **Timeout:** Configurable per job type
- **Dead Letter Queue:** Failed jobs after retries
- **Monitoring:** Job dashboard (Bull Board)

---

## **9. Security & Compliance**

### **9.1 GDPR Compliance**

**Right to Access:**
- Employees can download their data (profile, career history)
- API endpoint: `GET /api/v1/me/data-export` (JSON or PDF)

**Right to Rectification:**
- Employees can request corrections via profile edit or HR ticket

**Right to Erasure (Right to be Forgotten):**
- **Hard delete** option for alumni after retention period
- Anonymise data for analytical purposes (replace names with UUIDs)
- Delete workflow:
  1. HR approves deletion request
  2. System anonymises PII
  3. Audit log entry created (cannot be deleted)
  4. Backups rotated out after 30 days

**Data Portability:**
- Export personal data in JSON or CSV format

**Consent Management:**
- Alumni opt-in for communications
- Checkbox for "I consent to alumni program participation"
- Revocable at any time

**Data Retention Policy:**
- **Active employees:** Retained as long as employed
- **Alumni:** 7 years (UK legal requirement for employment records)
- **Candidates:** 1 year after application
- **Audit logs:** 7 years (compliance)
- **Anonymised data:** Indefinite (for analytics)

**Data Processor Agreements:**
- Ensure third-party services (SendGrid, Workday) are GDPR-compliant
- Sign Data Processing Addendum (DPA)

---

### **9.2 SOC 2 Compliance (Optional for Enterprise)**

**Type II Controls:**

1. **Security:**
   - Access controls (RBAC)
   - Encryption at rest and in transit
   - Penetration testing annually

2. **Availability:**
   - 99.9% uptime SLA
   - Redundant infrastructure (multi-AZ)
   - Disaster recovery plan (RTO: 4 hours, RPO: 1 hour)

3. **Confidentiality:**
   - Sensitive data encryption
   - Access logs for confidential data
   - NDA with employees

4. **Processing Integrity:**
   - Input validation
   - Automated testing (CI/CD)
   - Audit trail for all changes

5. **Privacy:**
   - GDPR compliance (see above)
   - Privacy policy published
   - User consent management

---

### **9.3 Role-Based Access Control (RBAC) Matrix**

| Action | Super Admin | HR Admin | Dept Head | Manager | Employee | Recruiter |
|--------|-------------|----------|-----------|---------|----------|-----------|
| **View own profile** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit own profile** | ✅ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ (limited) |
| **View all people** | ✅ | ✅ | ✅ (dept only) | ✅ (team only) | ✅ (public fields) | ✅ |
| **Edit any person** | ✅ | ✅ | ❌ | ✅ (direct reports) | ❌ | ❌ |
| **Delete person** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View org chart** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit org structure** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create hiring need** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Approve hiring need** | ✅ | ✅ | ✅ (dept) | ❌ | ❌ | ❌ |
| **Manage candidates** | ✅ | ✅ | ❌ | ✅ (own reqs) | ❌ | ✅ |
| **Create squad** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage squad** | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ |
| **View dashboards** | ✅ | ✅ | ✅ (dept) | ✅ (team) | ❌ | ✅ (hiring) |
| **Access alumni data** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Export data** | ✅ | ✅ | ✅ (dept) | ✅ (team) | ✅ (own) | ✅ (candidates) |

---

## **10. API Specification**

### **10.1 OpenAPI/Swagger Documentation**

**Approach:**
- Use **OpenAPI 3.0** specification
- Auto-generate from code:
  - **NestJS:** @nestjs/swagger decorators
  - **.NET:** Swashbuckle/NSwag
- Serve interactive docs at `/api/docs`
- Export spec as `openapi.yaml`

**Documentation Includes:**
- All endpoints with descriptions
- Request/response schemas
- Authentication requirements
- Example requests/responses
- Error codes

---

### **10.2 API Versioning**

**Strategy:** URL Path Versioning

**Format:** `/api/v{version}/{resource}`

**Example:**
- v1: `/api/v1/people`
- v2: `/api/v2/people` (breaking changes)

**Deprecation Policy:**
- Support previous version for 6 months
- Announce deprecation 3 months in advance
- Include `Deprecation: true` header
- Provide migration guide

---

### **10.3 Rate Limiting**

**Limits:**
- **Authenticated users:** 1000 req/hour (avg ~17 req/min)
- **Admin users:** 5000 req/hour
- **Public endpoints (if any):** 100 req/hour per IP

**Response:**
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699458000
Retry-After: 3600

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

## **11. Data Integrity & Business Rules**

### **11.1 Validation Rules**

**Person:**
- `email` must be unique and valid format (RFC 5322)
- `employee_number` must be unique and alphanumeric (6-10 chars)
- `manager_id` cannot reference self (no circular: A→A)
- `start_date` ≤ `end_date` (if both present)
- `full_time_equivalent` must be 0.0 - 1.0
- At least one of `manager_id` or `dotted_line_manager_ids` required for Active employees

**Role:**
- `title` + `department_id` + `location_id` combination should be unique (warn if duplicate)
- `filled_by_person_id` must be null if `status` = 'Vacant'
- `salary_band_max` ≥ `salary_band_min`

**Squad:**
- `start_date` ≤ `planned_end_date` (if present)
- `members` total allocation should not exceed `target_size` * 100% (warning)

**SquadMember:**
- `allocation_percentage` must be 0-100
- Total allocation for a `person_id` across all active squads ≤ 100% (warning, not hard block)

**HiringNeed:**
- `business_justification` min 100 characters
- `required_start_date` must be future date
- `approval_chain` must have at least one approver
- Cannot approve if not current approver

---

### **11.2 Business Rules**

**BR-001: Circular Reporting Prevention**
- System must detect and prevent circular reporting chains (A → B → C → A)
- Implementation: Graph traversal on manager hierarchy
- Error message: "Cannot assign manager: This would create a circular reporting relationship."

**BR-002: Unique Email Enforcement**
- Only one active Person can have a given email address
- Alumni with same email: Allowed if `employment_status` = 'Alumni' and `secondary_email` is used

**BR-003: Role Vacancy Consistency**
- If `Role.status` = 'Vacant', then `Role.filled_by_person_id` must be null
- If `Role.filled_by_person_id` is set, then `Role.status` must be 'Active'
- Enforced via database constraint or application logic

**BR-004: Hiring Need State Transitions**
- Cannot move to `Sourcing` unless `approval_status` = 'Approved'
- Cannot mark `Filled` unless `filled_by_person_id` is set
- Cannot `Reopen` once `Filled` (must create new hiring need)

**BR-005: Onboarding to Active Transition**
- Person must have `start_date` ≤ today
- Onboarding checklist completion ≥ 80% (recommended)
- Manager approval (optional workflow)

**BR-006: Offboarding Access Revocation**
- On status change to 'Offboarding', trigger background job:
  - Revoke system access (disable accounts)
  - Notify IT to collect equipment
  - Mark calendar as OOO
  - Remove from Slack active members (optional)
- Job runs on `last_working_day` or immediately if termination

**BR-007: Alumni Data Retention**
- When `employment_status` → 'Alumni':
  - Create `Alumni` record
  - Copy person data to `Alumni` entity (snapshot)
  - Anonymise after 7 years (scheduled job)
  - If opt-out, anonymise immediately except aggregated data

**BR-008: Squad Allocation Warning**
- If total allocation > 100%, show warning (not error)
- Allow override with confirmation: "This person is over-allocated. Continue?"
- Log override in audit trail

---

### **11.3 Database Constraints**

**Unique Constraints:**
```sql
ALTER TABLE person ADD CONSTRAINT person_email_unique UNIQUE (email) WHERE deleted_at IS NULL;
ALTER TABLE person ADD CONSTRAINT person_employee_number_unique UNIQUE (employee_number) WHERE deleted_at IS NULL;
ALTER TABLE location ADD CONSTRAINT location_code_unique UNIQUE (code);
ALTER TABLE department ADD CONSTRAINT department_code_unique UNIQUE (code);
```

**Foreign Key Constraints:**
```sql
ALTER TABLE person ADD CONSTRAINT fk_person_manager FOREIGN KEY (manager_id) REFERENCES person(person_id) ON DELETE SET NULL;
ALTER TABLE person ADD CONSTRAINT fk_person_location FOREIGN KEY (location_id) REFERENCES location(location_id);
ALTER TABLE role ADD CONSTRAINT fk_role_filled_by FOREIGN KEY (filled_by_person_id) REFERENCES person(person_id) ON DELETE SET NULL;
ALTER TABLE squad_member ADD CONSTRAINT fk_squad_member_person FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE;
ALTER TABLE squad_member ADD CONSTRAINT fk_squad_member_squad FOREIGN KEY (squad_id) REFERENCES squad(squad_id) ON DELETE CASCADE;
```

**Check Constraints:**
```sql
ALTER TABLE person ADD CONSTRAINT chk_person_fte CHECK (full_time_equivalent >= 0 AND full_time_equivalent <= 1);
ALTER TABLE squad_member ADD CONSTRAINT chk_squad_allocation CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100);
ALTER TABLE role ADD CONSTRAINT chk_role_salary_band CHECK (salary_band_max >= salary_band_min);
```

---

## **12. Testing Strategy**

### **12.1 Testing Pyramid**

```
          /\
         /  \        E2E Tests (10%)
        /____\       - Critical user flows
       /      \      - Cross-browser
      /        \
     /__________\    Integration Tests (30%)
    /            \   - API endpoints
   /              \  - Database interactions
  /________________\
 /                  \ Unit Tests (60%)
/____________________\ - Business logic
                       - Utility functions
```

---

### **12.2 Unit Testing**

**Scope:** Test individual functions, classes, components in isolation.

**Frontend (React):**
- **Tool:** Jest + React Testing Library
- **Coverage:** Components, hooks, utils
- **Example:**
  ```typescript
  describe('PersonCard', () => {
    it('renders person name and title', () => {
      const person = { firstName: 'John', lastName: 'Doe', jobTitle: 'Engineer' };
      render(<PersonCard person={person} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Engineer')).toBeInTheDocument();
    });
  });
  ```

**Backend (NestJS):**
- **Tool:** Jest
- **Coverage:** Services, controllers, validators
- **Example:**
  ```typescript
  describe('PersonService', () => {
    it('should create a new person', async () => {
      const dto = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };
      const result = await service.createPerson(dto);
      expect(result).toHaveProperty('person_id');
      expect(result.email).toBe('jane@example.com');
    });

    it('should throw error for duplicate email', async () => {
      const dto = { firstName: 'Jane', lastName: 'Doe', email: 'existing@example.com' };
      await expect(service.createPerson(dto)).rejects.toThrow('Email already exists');
    });
  });
  ```

**Target Coverage:** ≥80% code coverage

---

### **12.3 Integration Testing**

**Scope:** Test API endpoints, database interactions, external service integrations.

**Approach:**
- Use test database (PostgreSQL test instance or SQLite in-memory)
- Seed data before tests
- Clean up after each test

**Tools:**
- **Supertest** (API request simulation)
- **Testcontainers** (Docker containers for DB)

**Example:**
```typescript
describe('GET /api/v1/people', () => {
  beforeAll(async () => {
    await seedDatabase(); // Insert test data
  });

  it('should return list of people', async () => {
    const response = await request(app)
      .get('/api/v1/people')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should filter by location', async () => {
    const response = await request(app)
      .get('/api/v1/people?location_id=london-uuid')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.data.every(p => p.location_id === 'london-uuid')).toBe(true);
  });
});
```

---

### **12.4 End-to-End (E2E) Testing**

**Scope:** Test critical user flows from UI to backend using both traditional selector-based and AI-powered automation.

**Tools:**
- **Playwright** - Core automation framework (traditional approach)
- **Stagehand** - AI-powered automation layer built on Playwright/CDP (resilient, natural language)

---

#### **12.4.1 Testing Approach: Hybrid Strategy**

We'll use a **hybrid approach** combining both Playwright and Stagehand:

| Scenario Type | Tool | Rationale |
|--------------|------|-----------|
| **Stable, Critical Flows** | Playwright | Fast, reliable, deterministic with fixed selectors |
| **Dynamic UI, Complex Interactions** | Stagehand | Self-healing, adapts to UI changes, natural language |
| **Data Extraction/Verification** | Stagehand | AI-powered extraction with schema validation |
| **Cross-Browser Compatibility** | Playwright | Standard browser automation |
| **Exploratory Testing** | Stagehand | Natural language instructions for ad-hoc testing |

---

#### **12.4.2 Setup & Installation**

**Install Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Install Stagehand:**
```bash
npx create-browser-app
# OR manually
npm install @browserbasehq/stagehand
```

**Configuration (`playwright.config.ts`):**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

**Stagehand Configuration (`.env`):**
```bash
BROWSERBASE_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key  # or ANTHROPIC_API_KEY
STAGEHAND_LOG_LEVEL=info
```

---

#### **12.4.3 Test Scenarios**

##### **Scenario 1: Login Flow (Playwright)**

**Why Playwright:** Stable, critical path with fixed selectors.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'admin@company.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user name displayed
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Admin User');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@company.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should enforce MFA for admin users', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@company.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Verify MFA prompt
    await expect(page.locator('[data-testid="mfa-input"]')).toBeVisible();
    await page.fill('[data-testid="mfa-input"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

##### **Scenario 2: Create Person (Playwright - Traditional)**

**Why Playwright:** Form submission with known fields.

```typescript
import { test, expect } from '@playwright/test';

test.describe('People Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'HRPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new person successfully', async ({ page }) => {
    await page.goto('/people');
    await page.click('button:has-text("Add New Person")');

    // Fill form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `john.doe.${Date.now()}@company.com`);
    await page.selectOption('select[name="location"]', { label: 'London Office' });
    await page.selectOption('select[name="department"]', { label: 'Engineering' });
    await page.fill('input[name="jobTitle"]', 'Software Engineer');

    // Select manager (using autocomplete)
    await page.fill('input[name="manager"]', 'Jane Smith');
    await page.click('li:has-text("Jane Smith - Engineering Manager")');

    // Set start date
    await page.fill('input[name="startDate"]', '2025-12-01');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.toast-success')).toContainText('Person created successfully');
    await expect(page).toHaveURL(/\/people\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('John Doe');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/people/new');

    // Submit without filling form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('.field-error')).toHaveCount(5); // firstName, lastName, email, location, jobTitle
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should prevent duplicate email', async ({ page }) => {
    await page.goto('/people/new');

    await page.fill('input[name="firstName"]', 'Duplicate');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'existing@company.com'); // Pre-existing email
    await page.selectOption('select[name="location"]', { label: 'London Office' });
    await page.fill('input[name="jobTitle"]', 'Analyst');

    await page.click('button[type="submit"]');

    // Verify error
    await expect(page.locator('.toast-error')).toContainText('Email already exists');
  });
});
```

---

##### **Scenario 3: Create Person (Stagehand - AI-Powered)**

**Why Stagehand:** Resilient to UI changes, natural language, dynamic form handling.

```typescript
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

test.describe('People Management (AI-Powered)', () => {
  let stagehand: Stagehand;

  test.beforeEach(async () => {
    stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
      headless: false, // Set to true in CI
    });
    await stagehand.init();

    // Login using AI
    const page = stagehand.page;
    await page.goto(process.env.BASE_URL + '/login');

    await stagehand.act('enter email "hr@company.com" in the email field');
    await stagehand.act('enter password "HRPassword123!" in the password field');
    await stagehand.act('click the login button');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/);
  });

  test.afterEach(async () => {
    await stagehand.close();
  });

  test('should create a new employee using natural language', async () => {
    const page = stagehand.page;
    await page.goto(process.env.BASE_URL + '/people');

    // Use AI to navigate and fill form
    await stagehand.act('click on the button to add a new person');

    // Fill form using natural language
    await stagehand.act('enter "Alice" as the first name');
    await stagehand.act('enter "Johnson" as the last name');
    await stagehand.act(`enter "alice.johnson.${Date.now()}@company.com" as the email`);
    await stagehand.act('select "Wolverhampton Office" as the location');
    await stagehand.act('select "Product" as the department');
    await stagehand.act('enter "Product Manager" as the job title');
    await stagehand.act('search for and select "Emma Williams" as the manager');
    await stagehand.act('set the start date to December 15, 2025');

    // Submit form
    await stagehand.act('click the submit button to create the person');

    // Extract data to verify
    const personData = await stagehand.extract(
      'extract the person details from the profile page',
      z.object({
        fullName: z.string().describe('The full name displayed on the page'),
        jobTitle: z.string().describe('The job title'),
        department: z.string().describe('The department name'),
        location: z.string().describe('The office location'),
      })
    );

    expect(personData.fullName).toBe('Alice Johnson');
    expect(personData.jobTitle).toBe('Product Manager');
    expect(personData.department).toBe('Product');
    expect(personData.location).toContain('Wolverhampton');
  });

  test('should handle form validation gracefully', async () => {
    const page = stagehand.page;
    await page.goto(process.env.BASE_URL + '/people/new');

    // Try to submit without filling required fields
    await stagehand.act('click the submit button');

    // Use AI to extract validation errors
    const errors = await stagehand.extract(
      'extract all validation error messages visible on the form',
      z.object({
        errors: z.array(z.string()).describe('List of error messages shown to the user'),
      })
    );

    expect(errors.errors.length).toBeGreaterThan(0);
    expect(errors.errors.some(e => e.includes('required'))).toBe(true);
  });
});
```

---

##### **Scenario 4: Create and Approve Hiring Need (Stagehand - Multi-Step)**

**Why Stagehand:** Complex multi-step workflow across different user roles.

```typescript
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

test.describe('Hiring Workflow (AI-Powered)', () => {
  test('should create hiring need and complete approval workflow', async () => {
    const stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
    });
    await stagehand.init();
    const page = stagehand.page;

    try {
      // ===== STEP 1: Login as Hiring Manager =====
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login with email "manager@company.com" and password "ManagerPass123!"');
      await page.waitForURL(/\/dashboard/);

      // ===== STEP 2: Create Hiring Need =====
      await stagehand.act('navigate to hiring needs section');
      await stagehand.act('click the button to create a new hiring request');

      // Use AI agent for complex form filling
      const agent = stagehand.agent();
      await agent.execute(`
        Fill out the hiring need form with the following details:
        - Request type: New Role
        - Title: Senior Data Scientist
        - Department: Engineering
        - Location: London Office
        - Priority: High
        - Required start date: March 1, 2026
        - Business justification: We need a data scientist to build ML models for our recommendation engine. This is critical for Q1 2026 product launch. Without this hire, we risk delaying the launch by 3 months.
        - Submit the form
      `);

      // Extract hiring need ID
      const hiringNeedData = await stagehand.extract(
        'extract the hiring need details',
        z.object({
          id: z.string().describe('The hiring need ID or reference number'),
          status: z.string().describe('The current status of the hiring need'),
          title: z.string().describe('The role title'),
        })
      );

      expect(hiringNeedData.status).toContain('Pending Approval');
      expect(hiringNeedData.title).toBe('Senior Data Scientist');

      const hiringNeedId = hiringNeedData.id;

      // ===== STEP 3: Logout and Login as Manager (First Approver) =====
      await stagehand.act('logout from the application');
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login with email "director@company.com" and password "DirectorPass123!"');
      await page.waitForURL(/\/dashboard/);

      // ===== STEP 4: Approve Hiring Need (Manager) =====
      await stagehand.act('navigate to pending approvals');
      await stagehand.act(`click on the hiring need for ${hiringNeedId} or Senior Data Scientist`);

      // Review and approve
      await stagehand.act('enter approval comment: "Approved. Critical for product roadmap."');
      await stagehand.act('click the approve button');

      // Verify approval
      const statusAfterManagerApproval = await stagehand.extract(
        'extract the current status',
        z.object({
          status: z.string().describe('The approval status'),
        })
      );

      // Status might be "Approved" or "Pending Finance Approval" depending on workflow
      expect(statusAfterManagerApproval.status).toMatch(/Approved|Finance Approval/);

      // ===== STEP 5: Login as Finance Approver =====
      await stagehand.act('logout from the application');
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login with email "finance@company.com" and password "FinancePass123!"');
      await page.waitForURL(/\/dashboard/);

      // ===== STEP 6: Final Approval (Finance) =====
      await stagehand.act('navigate to pending approvals');
      await stagehand.act(`click on the hiring need for Senior Data Scientist`);
      await stagehand.act('click the approve button');

      // Verify final status
      const finalStatus = await stagehand.extract(
        'extract the final approval status',
        z.object({
          status: z.string().describe('The approval status'),
          approvalChain: z.array(z.object({
            approver: z.string(),
            decision: z.string(),
          })).describe('The list of approvers and their decisions'),
        })
      );

      expect(finalStatus.status).toBe('Approved');
      expect(finalStatus.approvalChain).toHaveLength(2);
      expect(finalStatus.approvalChain.every(a => a.decision === 'Approved')).toBe(true);

    } finally {
      await stagehand.close();
    }
  });
});
```

---

##### **Scenario 5: Squad Management with Capacity Validation (Stagehand)**

**Why Stagehand:** Dynamic UI, complex capacity calculations, natural language.

```typescript
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

test.describe('Squad Management (AI-Powered)', () => {
  let stagehand: Stagehand;

  test.beforeEach(async () => {
    stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
    });
    await stagehand.init();

    const page = stagehand.page;
    await page.goto(process.env.BASE_URL + '/login');
    await stagehand.act('login with email "pm@company.com" and password "PMPass123!"');
    await page.waitForURL(/\/dashboard/);
  });

  test.afterEach(async () => {
    await stagehand.close();
  });

  test('should create squad and add members with allocation', async () => {
    // Navigate and create squad
    await stagehand.act('navigate to squads section');
    await stagehand.act('click the button to create a new squad');

    // Fill squad details using AI agent
    const agent = stagehand.agent();
    await agent.execute(`
      Create a new squad with the following details:
      - Name: AI Platform Initiative
      - Code: AI-PLAT
      - Description: Building core AI infrastructure and ML platform
      - Objective: Deliver production-ready ML platform by Q2 2026
      - Squad type: Initiative
      - Start date: January 1, 2026
      - Planned end date: June 30, 2026
      - Owner: Select "Emma Williams"
      - Submit the form
    `);

    // Extract squad details
    const squadData = await stagehand.extract(
      'extract squad information',
      z.object({
        name: z.string(),
        code: z.string(),
        status: z.string(),
      })
    );

    expect(squadData.name).toBe('AI Platform Initiative');
    expect(squadData.code).toBe('AI-PLAT');
    expect(squadData.status).toContain('Active');
  });

  test('should add member and validate capacity', async () => {
    const page = stagehand.page;

    // Navigate to existing squad
    await stagehand.act('navigate to squads');
    await stagehand.act('click on the first active squad in the list');

    // Add member
    await stagehand.act('click the button to add a new member to the squad');

    // Search for person
    await stagehand.act('search for and select "John Doe" as the member');
    await stagehand.act('enter "Tech Lead" as the role in squad');
    await stagehand.act('set allocation to 60%');
    await stagehand.act('click save or add member button');

    // Extract member list to verify
    const members = await stagehand.extract(
      'extract the list of squad members',
      z.object({
        members: z.array(z.object({
          name: z.string(),
          role: z.string(),
          allocation: z.number().describe('Allocation percentage'),
        })).describe('List of squad members'),
      })
    );

    const johnDoe = members.members.find(m => m.name.includes('John Doe'));
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.allocation).toBe(60);
  });

  test('should warn when member is over-allocated', async () => {
    const page = stagehand.page;

    // Navigate to squad
    await stagehand.act('navigate to squads');
    await stagehand.act('click on the first squad');

    // Try to add member with high allocation (assuming they already have allocations)
    await stagehand.act('click add member button');
    await stagehand.act('search for and select "Alice Johnson"'); // Assume already allocated 80%
    await stagehand.act('set allocation to 50%'); // This would exceed 100%
    await stagehand.act('click save');

    // Check for warning message
    const warnings = await stagehand.extract(
      'check if there are any warning messages about over-allocation',
      z.object({
        hasWarning: z.boolean().describe('Whether a warning about over-allocation is displayed'),
        warningMessage: z.string().optional().describe('The warning message text if present'),
      })
    );

    expect(warnings.hasWarning).toBe(true);
    expect(warnings.warningMessage).toMatch(/over.*allocated|exceeds.*100/i);
  });

  test('should display capacity view correctly', async () => {
    await stagehand.act('navigate to squads section');
    await stagehand.act('switch to capacity view or click capacity dashboard');

    // Extract capacity data
    const capacityData = await stagehand.extract(
      'extract capacity allocation data for all people visible',
      z.object({
        people: z.array(z.object({
          name: z.string(),
          totalAllocation: z.number().describe('Total allocation percentage across all squads'),
          status: z.enum(['optimal', 'under-utilised', 'over-allocated']).describe('Allocation status indicator'),
        })),
      })
    );

    expect(capacityData.people.length).toBeGreaterThan(0);

    // Verify over-allocated people are flagged
    const overAllocated = capacityData.people.filter(p => p.totalAllocation > 100);
    overAllocated.forEach(person => {
      expect(person.status).toBe('over-allocated');
    });
  });
});
```

---

##### **Scenario 6: Org Chart Navigation (Stagehand)**

**Why Stagehand:** Complex interactive visualization, dynamic rendering.

```typescript
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

test.describe('Organisation Chart (AI-Powered)', () => {
  let stagehand: Stagehand;

  test.beforeEach(async () => {
    stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
    });
    await stagehand.init();

    const page = stagehand.page;
    await page.goto(process.env.BASE_URL + '/login');
    await stagehand.act('login as employee');
    await page.waitForURL(/\/dashboard/);
  });

  test.afterEach(async () => {
    await stagehand.close();
  });

  test('should navigate org chart and view person details', async () => {
    const page = stagehand.page;

    // Navigate to org chart
    await stagehand.act('navigate to organisation chart');

    // Use AI agent for exploration
    const agent = stagehand.agent();
    await agent.execute(`
      Navigate the organisation chart to find the Engineering department.
      Click on the Engineering department head.
      Then view their profile details.
    `);

    // Extract person data from profile
    const personData = await stagehand.extract(
      'extract the person details from the current view',
      z.object({
        name: z.string(),
        title: z.string(),
        department: z.string(),
        directReports: z.number().describe('Number of direct reports'),
        dottedLineReports: z.number().optional().describe('Number of dotted-line reports'),
      })
    );

    expect(personData.department).toBe('Engineering');
    expect(personData.directReports).toBeGreaterThan(0);
  });

  test('should filter org chart by location', async () => {
    await stagehand.act('navigate to organisation chart');
    await stagehand.act('open filter options');
    await stagehand.act('select "London Office" as the location filter');
    await stagehand.act('apply filters');

    // Verify all visible people are from London
    const orgData = await stagehand.extract(
      'extract all people visible in the org chart',
      z.object({
        people: z.array(z.object({
          name: z.string(),
          location: z.string(),
        })),
      })
    );

    orgData.people.forEach(person => {
      expect(person.location).toContain('London');
    });
  });

  test('should switch between hierarchy and matrix views', async () => {
    await stagehand.act('navigate to organisation chart');

    // Default hierarchy view
    const hierarchyCount = await stagehand.extract(
      'count the number of reporting lines shown',
      z.object({
        reportingLines: z.number().describe('Number of visible reporting lines'),
      })
    );

    // Switch to matrix view
    await stagehand.act('switch to matrix view or toggle matrix reporting view');

    // Matrix view should show more lines (including dotted lines)
    const matrixCount = await stagehand.extract(
      'count the number of reporting lines shown including dotted lines',
      z.object({
        reportingLines: z.number().describe('Number of visible reporting lines'),
        dottedLines: z.number().describe('Number of dotted-line relationships'),
      })
    );

    expect(matrixCount.reportingLines).toBeGreaterThanOrEqual(hierarchyCount.reportingLines);
    expect(matrixCount.dottedLines).toBeGreaterThan(0);
  });
});
```

---

#### **12.4.4 Data Extraction Examples (Stagehand)**

**Stagehand excels at extracting structured data from pages:**

```typescript
// Extract dashboard metrics
const dashboardMetrics = await stagehand.extract(
  'extract all key metrics from the executive dashboard',
  z.object({
    totalEmployees: z.number(),
    activeHiringNeeds: z.number(),
    attritionRate: z.number().describe('12-month rolling attrition rate as percentage'),
    averageTimeToFill: z.number().describe('Average days to fill open roles'),
    departmentBreakdown: z.array(z.object({
      department: z.string(),
      headcount: z.number(),
    })),
  })
);

// Extract hiring pipeline status
const hiringPipeline = await stagehand.extract(
  'extract hiring pipeline data',
  z.object({
    stages: z.array(z.object({
      stage: z.string(),
      count: z.number(),
      avgTimeInStage: z.number().optional(),
    })),
    totalCandidates: z.number(),
    offerAcceptanceRate: z.number().optional(),
  })
);

// Extract person profile data
const personProfile = await stagehand.extract(
  'extract complete person profile information',
  z.object({
    personalInfo: z.object({
      fullName: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      location: z.string(),
    }),
    employment: z.object({
      title: z.string(),
      department: z.string(),
      startDate: z.string(),
      manager: z.string(),
      employmentType: z.string(),
    }),
    skills: z.array(z.string()),
    squads: z.array(z.object({
      squadName: z.string(),
      role: z.string(),
      allocation: z.number(),
    })),
  })
);
```

---

#### **12.4.5 Test Organization & Best Practices**

**Directory Structure:**
```
tests/
├── e2e/
│   ├── playwright/              # Traditional Playwright tests
│   │   ├── auth.spec.ts
│   │   ├── people-crud.spec.ts
│   │   ├── roles.spec.ts
│   │   └── navigation.spec.ts
│   ├── stagehand/               # AI-powered Stagehand tests
│   │   ├── hiring-workflow.spec.ts
│   │   ├── squad-management.spec.ts
│   │   ├── org-chart.spec.ts
│   │   ├── complex-forms.spec.ts
│   │   └── data-extraction.spec.ts
│   └── fixtures/
│       ├── test-data.json
│       └── auth-helpers.ts
├── integration/                 # API integration tests
└── unit/                        # Unit tests
```

**Best Practices:**

1. **Use Playwright for:**
   - Authentication flows
   - Critical paths with stable selectors
   - Performance-sensitive tests
   - Cross-browser compatibility tests

2. **Use Stagehand for:**
   - Complex multi-step workflows
   - Dynamic UI interactions
   - Data extraction and verification
   - Tests that need to adapt to UI changes
   - Exploratory testing scenarios

3. **General Guidelines:**
   - **Page Object Pattern:** Encapsulate page interactions
   - **Test Data Management:** Use factories or fixtures
   - **Cleanup:** Reset database state between tests (use transactions or test DB)
   - **Parallelization:** Run tests in parallel but avoid conflicts
   - **Retry Strategy:** Retry flaky tests (max 2-3 times)
   - **Screenshots/Videos:** Capture on failure for debugging
   - **CI Integration:** Run on every PR and merge to main

4. **Stagehand-Specific Tips:**
   - **Enable Caching:** Reuse AI-generated selectors for speed
   - **Clear Instructions:** Be specific in natural language prompts
   - **Schema Validation:** Use Zod schemas for type-safe extraction
   - **Cost Management:** Cache results, use smaller models for simple tasks
   - **Fallback to Playwright:** For speed-critical paths, use Playwright

---

#### **12.4.6 CI/CD Integration**

**GitHub Actions Workflow (`.github/workflows/e2e-tests.yml`):**

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  playwright-tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: peopleflow_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/peopleflow_test

      - name: Seed test data
        run: npm run db:seed:test

      - name: Start application
        run: npm run start:test &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/peopleflow_test

      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000/health --timeout 60000

      - name: Run Playwright tests
        run: npx playwright test --project=chromium
        env:
          BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  stagehand-tests:
    name: Stagehand AI E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    # Only run Stagehand tests on main branch (to save API costs)
    if: github.ref == 'refs/heads/main'

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: peopleflow_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/peopleflow_test

      - name: Seed test data
        run: npm run db:seed:test

      - name: Start application
        run: npm run start:test &
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/peopleflow_test

      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000/health --timeout 60000

      - name: Run Stagehand tests
        run: npm run test:stagehand
        env:
          BASE_URL: http://localhost:3000
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          STAGEHAND_LOG_LEVEL: info
          STAGEHAND_ENABLE_CACHING: true

      - name: Upload test artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: stagehand-artifacts
          path: test-results/
          retention-days: 7
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:stagehand": "playwright test tests/e2e/stagehand",
    "test:playwright": "playwright test tests/e2e/playwright",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

#### **12.4.7 Test Reporting & Monitoring**

**Playwright HTML Reporter:**
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
});
```

**Custom Stagehand Reporter:**
```typescript
// tests/stagehand/reporter.ts
export class StagehandReporter {
  onTestEnd(test: TestCase, result: TestResult) {
    // Log AI API calls and costs
    console.log(`Test: ${test.title}`);
    console.log(`AI Calls: ${result.aiCallCount}`);
    console.log(`Total Cost: $${result.aiCost}`);
    console.log(`Duration: ${result.duration}ms`);
  }
}
```

**Metrics to Track:**
- Test execution time
- Pass/fail rate
- Flaky test detection
- AI API costs (for Stagehand)
- Screenshot count
- Coverage of critical paths

---

**Frequency:**
- **Playwright tests:** Run on every PR
- **Stagehand tests:** Run on merge to main (cost optimization)
- **Full regression:** Nightly builds

---

### **12.5 Load & Performance Testing**

**Tool:** k6 or Apache JMeter

**Scenarios:**

1. **Normal Load:**
   - 100 concurrent users
   - 1000 req/min
   - Duration: 10 minutes
   - Target: ≤1s response time (p95)

2. **Peak Load:**
   - 500 concurrent users
   - 5000 req/min
   - Duration: 5 minutes
   - Target: ≤2s response time (p95)

3. **Stress Test:**
   - Gradually increase load until failure
   - Identify breaking point
   - Target: Graceful degradation (not crash)

**Example (k6):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const response = http.get('https://api.peopleflow.company.com/v1/people', {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  });
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

### **12.6 Security Testing**

**Approaches:**

1. **Automated Scanning:**
   - **OWASP ZAP** or **Burp Suite** for vulnerability scanning
   - Run weekly in CI/CD

2. **Dependency Scanning:**
   - **Snyk** or **Dependabot** for CVE detection
   - Automated PRs for security patches

3. **Penetration Testing:**
   - Annual external pentest by certified firm
   - Focus on:
     - Authentication bypass
     - SQL injection
     - XSS
     - IDOR (Insecure Direct Object References)
     - Privilege escalation
     - Data leakage

4. **Manual Security Review:**
   - Code review for security best practices
   - Check for hardcoded secrets (use GitGuardian)

---

### **12.7 CI/CD Testing Pipeline**

**Stages:**

```yaml
# Example GitHub Actions workflow
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm run test:unit
      - name: Integration tests
        run: npm run test:integration
      - name: E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        run: npx codecov

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Dependency scan
        run: npm audit
      - name: OWASP ZAP scan
        run: docker run -t owasp/zap2docker-stable zap-baseline.py -t ${{ secrets.STAGING_URL }}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t app:${{ github.sha }} .
      - name: Push to registry
        run: docker push app:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: kubectl set image deployment/app app=app:${{ github.sha }}
```

---

## **13. Deployment & Operations**

### **13.1 Deployment Strategy**

**Environment Structure:**
- **Local:** Developer machines (Docker Compose)
- **Development:** Shared dev environment (auto-deploy on commit to `develop`)
- **Staging:** Pre-production (mirrors production, auto-deploy on commit to `main`)
- **Production:** Live environment (manual approval after staging validation)

**Deployment Method:**
- **Infrastructure as Code (IaC):** Terraform or Azure ARM templates
- **Container Orchestration:** Docker + Kubernetes (or Azure Container Apps)
- **CI/CD:** GitHub Actions or Azure DevOps Pipelines
- **Blue-Green Deployment:** Zero-downtime deployments
  - Deploy new version (green)
  - Run smoke tests
  - Switch traffic to green
  - Keep blue as rollback

---

### **13.2 Infrastructure Requirements**

**Production Environment:**

**Compute:**
- **API Servers:** 2-4 instances (auto-scaling)
  - Type: 2 vCPU, 4 GB RAM (Azure B2s / AWS t3.medium)
- **Workers:** 2 instances
  - Type: 2 vCPU, 4 GB RAM

**Database:**
- **PostgreSQL:** Azure Database for PostgreSQL (Basic or General Purpose tier)
  - 2 vCores, 4 GB RAM
  - 50 GB storage (auto-scaling to 500 GB)
  - Automated backups (daily, 30-day retention)
  - Read replica for analytics (optional)

**Cache:**
- **Redis:** Azure Cache for Redis (Standard tier)
  - 1 GB cache
  - Replication enabled

**Storage:**
- **Blob/S3:** Azure Blob Storage or AWS S3
  - Hot tier for recent files
  - Cool tier for archived files
  - 500 GB initial allocation

**CDN:**
- Azure CDN or CloudFront
- Edge caching for static assets and profile photos

---

### **13.3 Monitoring & Alerting**

**Application Performance Monitoring (APM):**
- **Tool:** Application Insights (Azure) or Datadog
- **Metrics:**
  - Request rate (req/s)
  - Response time (p50, p95, p99)
  - Error rate (5xx errors)
  - Dependency call duration (DB queries, external APIs)

**Infrastructure Monitoring:**
- **Tool:** Azure Monitor or CloudWatch
- **Metrics:**
  - CPU utilisation
  - Memory usage
  - Disk I/O
  - Network throughput

**Logging:**
- **Tool:** Azure Log Analytics or ELK Stack (Elasticsearch, Logstash, Kibana)
- **Log Levels:** ERROR, WARN, INFO, DEBUG
- **Structured Logging:** JSON format with correlation IDs

**Alerting:**
- **Channels:** Email, Slack, PagerDuty
- **Alert Rules:**
  - API error rate > 1% for 5 minutes → P1 alert
  - Response time p95 > 3s for 10 minutes → P2 alert
  - Database CPU > 80% for 15 minutes → P2 alert
  - Disk usage > 90% → P2 alert
  - Service down (health check fails) → P1 alert (immediate)

**Health Checks:**
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-11-07T10:30:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "queue": "healthy"
    }
  }
  ```
- **Frequency:** Every 30 seconds
- **Timeout:** 5 seconds

---

### **13.4 Backup & Disaster Recovery**

**Backup Strategy:**

1. **Database:**
   - **Automated daily backups** (Azure/AWS managed)
   - **Point-in-time recovery (PITR):** Last 30 days
   - **Manual snapshots** before major releases
   - **Cross-region backup** for disaster recovery (weekly)

2. **File Storage:**
   - **Geo-redundant storage (GRS)** for Azure Blob / S3 cross-region replication
   - **Versioning enabled** (retain 5 versions)

3. **Configuration:**
   - Store in Git (Infrastructure as Code)
   - Secrets in Azure Key Vault or AWS Secrets Manager

**Recovery Objectives:**
- **RTO (Recovery Time Objective):** 4 hours (time to restore service)
- **RPO (Recovery Point Objective):** 1 hour (max data loss)

**Disaster Recovery Plan:**

1. **Scenario: Database Failure**
   - Switch to read replica (promote to master)
   - Update connection strings
   - Restore from latest backup if no replica

2. **Scenario: Region Outage**
   - Failover to secondary region (if multi-region setup)
   - Restore database from cross-region backup
   - Update DNS to point to new region

3. **Scenario: Ransomware/Data Corruption**
   - Isolate affected systems
   - Restore database from backup (before corruption)
   - Investigate attack vector and patch

**Testing:**
- Quarterly disaster recovery drills
- Document runbooks for each scenario

---

### **13.5 Incident Response**

**Incident Severity Levels:**

| Level | Definition | Response Time | Example |
|-------|------------|---------------|---------|
| **P1** | Service down, critical data loss | 15 minutes | Database corruption, API completely down |
| **P2** | Major feature broken, significant performance degradation | 1 hour | Login fails, slow page loads |
| **P3** | Minor feature broken, workaround available | 4 hours | Export fails, minor UI bug |
| **P4** | Cosmetic issue, no functional impact | Next business day | Typo, styling issue |

**Incident Response Process:**

1. **Detection:** Automated alert or user report
2. **Triage:** On-call engineer assesses severity
3. **Escalation:** Page additional team members if needed (P1/P2)
4. **Investigation:** Identify root cause (check logs, metrics)
5. **Mitigation:** Apply temporary fix (rollback, config change)
6. **Communication:** Update status page, notify stakeholders
7. **Resolution:** Apply permanent fix
8. **Post-Mortem:** Document incident, action items to prevent recurrence

**Communication:**
- **Internal:** Slack incident channel
- **External:** Status page (e.g., status.peopleflow.company.com)
- **Frequency:** Updates every 30 min for P1, every 2 hours for P2

---

## **14. Future Enhancements**

### **Phase 2 (6-12 months)**

1. **Advanced Analytics:**
   - Predictive attrition modelling (ML)
   - Skills gap analysis with recommendations
   - Succession planning (identify high-potential employees)
   - Diversity & inclusion dashboards

2. **Mobile App:**
   - iOS and Android native apps
   - Core features: people directory, org chart, profile updates
   - Push notifications for approvals and check-ins

3. **Enhanced Integrations:**
   - Slack bot (search people, view profiles)
   - Microsoft Teams app
   - Jira integration (auto-link squads to Jira projects)
   - Google Workspace / Microsoft 365 sync

4. **Performance Management:**
   - Goal setting (OKRs)
   - Performance reviews with 360-degree feedback
   - 1:1 meeting notes and action items
   - Career development plans

5. **Learning & Development:**
   - Track training courses and certifications
   - Recommend courses based on skill gaps
   - Integration with LMS (Learning Management System)

---

### **Phase 3 (12-24 months)**

1. **AI/ML Features:**
   - Chatbot for HR queries ("Who is the HR contact for the London office?")
   - Resume parsing (auto-populate candidate profiles)
   - Interview scheduling optimisation (find best time slots)
   - Sentiment analysis on exit feedback

2. **Compensation Management:**
   - Salary bands and pay equity analysis
   - Bonus and equity tracking
   - Budgeting and forecasting

3. **Advanced Reporting:**
   - Custom report builder (drag-and-drop)
   - Scheduled reports (email weekly/monthly)
   - Data warehouse for historical analysis (BigQuery, Snowflake)

4. **Workflow Automation:**
   - No-code workflow builder (Zapier-like)
   - Automate onboarding, offboarding, transfers
   - Conditional logic (if X then Y)

5. **Global Expansion:**
   - Multi-currency support
   - Multi-language UI
   - Country-specific compliance (e.g., France labour laws)
   - Local payroll integrations

---

## **15. Glossary**

| Term | Definition |
|------|------------|
| **Alumni** | Former employees who have left the organisation |
| **Boomerang Hire** | Re-hiring a former employee who left in good standing |
| **Cost Centre** | Accounting code for budgeting and expense tracking |
| **Dotted Line** | Informal or secondary reporting relationship (matrix management) |
| **FTE** | Full-Time Equivalent (1.0 = full-time, 0.5 = part-time) |
| **Hard Line** | Primary direct reporting relationship (manager) |
| **HRIS** | Human Resources Information System (e.g., Workday, BambooHR) |
| **Matrix Management** | Organisational structure with multiple reporting lines |
| **Onboarding** | Process of integrating a new employee into the organisation |
| **Offboarding** | Process of managing an employee's departure |
| **Squad** | Cross-functional team formed for a specific project or initiative |
| **Talent Pipeline** | Pool of potential candidates for future roles |
| **Tenure** | Length of time an employee has worked at the organisation |

---

## **Appendices**

### **Appendix A: User Interface Mockups**

_(To be created by design team)_

- Dashboard (Executive view)
- Org chart (interactive)
- Person profile page
- Squad management page
- Hiring need creation form
- Approval workflow UI

---

### **Appendix B: API Endpoint Full Spec**

_(To be auto-generated from OpenAPI/Swagger)_

See `/api/docs` when app is running.

---

### **Appendix C: Database Schema Diagram**

_(To be generated from Prisma schema or ER diagram tool)_

Use dbdiagram.io or similar to visualise entities and relationships.

---

### **Appendix D: Test Plan**

See **Section 12: Testing Strategy** for detailed test cases.

---

### **Appendix E: Deployment Runbook**

**Pre-Deployment Checklist:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved
- [ ] Database migrations tested on staging
- [ ] Changelog updated
- [ ] Stakeholders notified of deployment window

**Deployment Steps:**
1. Tag release in Git (`v1.0.0`)
2. Trigger CI/CD pipeline
3. Deploy to staging
4. Run smoke tests on staging
5. Get approval from QA/Product
6. Deploy to production (blue-green)
7. Monitor for 30 minutes
8. Confirm success or rollback

**Rollback Procedure:**
1. Revert load balancer to previous version (blue)
2. Investigate issue
3. Fix and redeploy

---

### **Appendix F: Change Log**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | AI Assistant | Initial enhanced requirements document |

---

## **Sign-Off**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | | | |
| **Engineering Lead** | | | |
| **HR Stakeholder** | | | |
| **Security Officer** | | | |

---

**Document Status:** ✅ Ready for Review
**Next Steps:**
1. Review with stakeholders
2. Prioritise features for MVP
3. Create technical design document
4. Begin sprint planning

---

**End of Requirements Specification**
