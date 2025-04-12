/**
 * Mock Active Directory API Service
 * 
 * This utility simulates the responses from the AD API server for local development and testing.
 * It provides the same structure as the real API responses without requiring an actual AD server.
 */

// Generate Windows file time (100-nanosecond intervals since January 1, 1601 UTC)
const toWindowsFileTime = (date: Date): string => {
  // Convert JavaScript date to Windows file time
  // Add milliseconds since epoch + 11644473600000 (diff between 1601 and 1970)
  // Then multiply by 10000 (to convert from ms to 100ns intervals)
  const windowsTime = (date.getTime() + 11644473600000) * 10000;
  return windowsTime.toString();
};

// Generate a user account control value based on account status
const generateUserAccountControl = (isDisabled: boolean, isLocked: boolean): number => {
  let uac = 512; // Normal account
  if (isDisabled) uac |= 2; // Disabled flag
  if (isLocked) uac |= 16; // Locked flag
  return uac;
};

// Mock the users API response
export const mockGetUsersResponse = {
  status: "success",
  message: "user fetched successfully",
  description: "user fetch, total number of users are: 17",
  users: [
    {
      samAccountName: "Administrator",
      userPrincipalName: "administrator@adscanner.local",
      displayName: "Administrator",
      givenName: "",
      surName: "",
      mail: "admin@adscanner.local",
      description: "Built-in account for administering the computer/domain",
      memberof: [
        "CN=Group Policy Creator Owners,CN=Users,DC=adscanner,DC=local",
        "CN=Domain Admins,CN=Users,DC=adscanner,DC=local",
        "CN=Enterprise Admins,CN=Users,DC=adscanner,DC=local",
        "CN=Schema Admins,CN=Users,DC=adscanner,DC=local",
        "CN=Administrators,CN=Builtin,DC=adscanner,DC=local"
      ],
      objectGUID: "5d647832-694d-4c86-a4ef-b8d1a15ec6e5",
      objectSID: "S-1-5-21-3842939050-3880317879-2865463114-500",
      whenCreated: "2023-04-05T13:31:03Z",
      whenChanged: "2023-04-05T13:49:57Z",
      lastLogon: toWindowsFileTime(new Date("2023-04-18T12:23:51Z")),
      lastLogonTimestamp: toWindowsFileTime(new Date("2023-04-15T08:30:00Z")),
      pwdLastSet: toWindowsFileTime(new Date("2023-04-05T13:31:03Z")),
      userAccountControl: generateUserAccountControl(false, false),
      accountExpires: "9223372036854775807",
      distinguishedName: "CN=Administrator,CN=Users,DC=adscanner,DC=local",
      title: "System Administrator",
      department: "IT",
      company: "ACME Corporation",
      manager: "",
      telephoneNumber: "",
      mobile: ""
    },
    {
      samAccountName: "Guest",
      userPrincipalName: "",
      displayName: "Guest Account",
      givenName: "",
      surName: "",
      mail: "",
      description: "Built-in account for guest access to the computer/domain",
      memberof: ["CN=Guests,CN=Builtin,DC=adscanner,DC=local"],
      objectGUID: "8f798c08-4d6a-4721-9e8c-c9d8c2b557bd",
      objectSID: "S-1-5-21-3842939050-3880317879-2865463114-501",
      whenCreated: "2023-04-05T13:31:03Z",
      whenChanged: "2023-04-05T13:31:03Z",
      lastLogon: "0",
      lastLogonTimestamp: "0",
      pwdLastSet: "0",
      userAccountControl: generateUserAccountControl(true, false),
      accountExpires: "9223372036854775807",
      distinguishedName: "CN=Guest,CN=Users,DC=adscanner,DC=local",
      title: "",
      department: "",
      company: "",
      manager: "",
      telephoneNumber: "",
      mobile: ""
    },
    {
      samAccountName: "john.smith",
      userPrincipalName: "john.smith@adscanner.local",
      displayName: "John Smith",
      givenName: "John",
      surName: "Smith",
      mail: "john.smith@adscanner.local",
      description: "IT System Administrator",
      memberof: [
        "CN=Domain Users,CN=Users,DC=adscanner,DC=local",
        "CN=IT Staff,OU=Groups,DC=adscanner,DC=local"
      ],
      objectGUID: "7a1e3c04-9b2d-48f5-a673-8921d4e3bc25",
      objectSID: "S-1-5-21-3842939050-3880317879-2865463114-1104",
      whenCreated: "2023-04-10T08:15:00Z",
      whenChanged: "2023-04-15T09:30:00Z",
      lastLogon: toWindowsFileTime(new Date("2023-04-18T07:45:00Z")),
      lastLogonTimestamp: toWindowsFileTime(new Date("2023-04-18T07:45:00Z")),
      pwdLastSet: toWindowsFileTime(new Date("2023-04-10T08:15:00Z")),
      userAccountControl: generateUserAccountControl(false, false),
      accountExpires: "9223372036854775807",
      distinguishedName: "CN=John Smith,OU=IT,DC=adscanner,DC=local",
      title: "System Administrator",
      department: "IT",
      company: "ACME Corporation",
      manager: "CN=Administrator,CN=Users,DC=adscanner,DC=local",
      telephoneNumber: "555-1234",
      mobile: "555-5678"
    },
    {
      samAccountName: "jane.doe",
      userPrincipalName: "jane.doe@adscanner.local",
      displayName: "Jane Doe",
      givenName: "Jane",
      surName: "Doe",
      mail: "jane.doe@adscanner.local",
      description: "HR Manager",
      memberof: [
        "CN=Domain Users,CN=Users,DC=adscanner,DC=local",
        "CN=HR Staff,OU=Groups,DC=adscanner,DC=local"
      ],
      objectGUID: "4b2c6d78-3e1f-49a2-b5c7-8492d5f7e129",
      objectSID: "S-1-5-21-3842939050-3880317879-2865463114-1105",
      whenCreated: "2023-04-12T09:20:00Z",
      whenChanged: "2023-04-16T10:15:00Z",
      lastLogon: toWindowsFileTime(new Date("2023-04-19T08:30:00Z")),
      lastLogonTimestamp: toWindowsFileTime(new Date("2023-04-19T08:30:00Z")),
      pwdLastSet: toWindowsFileTime(new Date("2023-04-12T09:20:00Z")),
      userAccountControl: generateUserAccountControl(false, false),
      accountExpires: "9223372036854775807",
      distinguishedName: "CN=Jane Doe,OU=HR,DC=adscanner,DC=local",
      title: "HR Manager",
      department: "Human Resources",
      company: "ACME Corporation",
      manager: "CN=Administrator,CN=Users,DC=adscanner,DC=local",
      telephoneNumber: "555-2345",
      mobile: "555-6789"
    },
    {
      samAccountName: "robert.johnson",
      userPrincipalName: "robert.johnson@adscanner.local",
      displayName: "Robert Johnson",
      givenName: "Robert",
      surName: "Johnson",
      mail: "robert.johnson@adscanner.local",
      description: "Sales Director",
      memberof: [
        "CN=Domain Users,CN=Users,DC=adscanner,DC=local",
        "CN=Sales Staff,OU=Groups,DC=adscanner,DC=local"
      ],
      objectGUID: "2e5a7b9c-8d3f-47e1-a6b5-c4d2e8f9a012",
      objectSID: "S-1-5-21-3842939050-3880317879-2865463114-1106",
      whenCreated: "2023-04-14T11:40:00Z",
      whenChanged: "2023-04-17T15:20:00Z",
      lastLogon: toWindowsFileTime(new Date()),
      lastLogonTimestamp: toWindowsFileTime(new Date()),
      pwdLastSet: toWindowsFileTime(new Date("2023-04-14T11:40:00Z")),
      userAccountControl: generateUserAccountControl(false, true), // Locked account
      accountExpires: "9223372036854775807",
      distinguishedName: "CN=Robert Johnson,OU=Sales,DC=adscanner,DC=local",
      title: "Sales Director",
      department: "Sales",
      company: "ACME Corporation",
      manager: "CN=Administrator,CN=Users,DC=adscanner,DC=local",
      telephoneNumber: "555-3456",
      mobile: "555-7890"
    }
  ]
};

// Mock API call function
export const mockFetchAdUsers = (serverIP: string, domain: string): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(mockGetUsersResponse);
    }, 1500);
  });
};

export default {
  mockGetUsersResponse,
  mockFetchAdUsers
}; 