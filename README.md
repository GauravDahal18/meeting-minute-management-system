# Frontend for Meeting Minute Management System

**Institution of Engineering, Pulchowk Campus**

## Team Members

-  Gaurav Dahal (079bct039)
-  Gyaneshar Sha (079bct040)
-  Kapil Upreti (079bct042)
-  Kushal Shrestha (079bct043)

## Repository Information

**Backend Repository:** The backend for this system is available at [meeting-minute-management-system](https://github.com/kushvlshresthv/meeting-minute-management-system)

## Problem Statement

This project addresses the following institutional challenges:

1. **Committee Management** - Track active committees from a centralized dashboard

   ![Dashboard](images/Dashboard.png)

2. **Meeting History** - Maintain records of previously created meeting minutes

   ![Committee Details](images/CommitteeDetails.png)

3. **Document Generation** - Create standardized meeting minutes using templates

   ![Preview](images/Preview.png)

## System Workflow

1. **Committee Creation** - Admin establishes committees in the system that mirror real institutional committees

   ![Create Committee](images/CreateCommittee.png)

2. **Member Management** - Admin creates member profiles for all committee participants or reuses existing profiles

   ![Create Member](images/CreateMember.png)

3. **Meeting Documentation** - Admin creates meetings, records agendas, and documents decisions

   ![Create Meeting](images/CreateMeeting.png)

4. **Document Export** - Admin previews and downloads meeting minutes as Word documents for final formatting

   ![Document Export](images/Docx.png)

## Additional Features

-  Update committee, member, and meeting details after creation
-  Create meeting invitees through new or existing member profiles
-  Same member profile can be used in multiple committees

## Technology Stack

**Frontend:**

-  React
-  Tailwind CSS

**Backend:**

-  Spring Boot
-  Spring Data JPA with custom queries for complex database operations
-  Spring Security
