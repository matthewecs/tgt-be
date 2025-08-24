# API Examples - TGT Backend

Base URL: `http://localhost:4000`

## WorkStep API (`/work-step`)

### Get All WorkSteps
```bash
curl -X GET "http://localhost:4000/work-step?page=1&limit=10&search=review"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abcde",
      "name": "Document Review",
      "uniqueKey": "legal-document-review",
      "categoryId": {
        "_id": "64f7b8c9e1234567890abcdf",
        "name": "Legal",
        "description": "Legal related work steps"
      },
      "description": "Review legal documents for compliance",
      "options": [
        {
          "label": "Priority",
          "value": "high",
          "type": "select"
        }
      ],
      "nextActions": [
        {
          "label": "Approve",
          "action": "approve",
          "type": "button"
        },
        {
          "label": "Reject",
          "action": "reject",
          "type": "button"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "limit": 10
  }
}
```

### Get WorkStep by ID
```bash
curl -X GET "http://localhost:4000/work-step/64f7b8c9e1234567890abcde"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "name": "Document Review",
    "uniqueKey": "legal-document-review",
    "categoryId": {
      "_id": "64f7b8c9e1234567890abcdf",
      "name": "Legal",
      "description": "Legal related work steps"
    },
    "description": "Review legal documents for compliance",
    "options": [
      {
        "label": "Priority",
        "value": "high",
        "type": "select"
      }
    ],
    "nextActions": [
      {
        "label": "Approve",
        "action": "approve",
        "type": "button"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create WorkStep
```bash
curl -X POST "http://localhost:4000/work-step" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quality Assurance Check",
    "categoryId": "64f7b8c9e1234567890abcdf",
    "description": "Perform quality assurance testing",
    "options": [
      {
        "label": "Test Type",
        "value": "automated",
        "type": "select"
      }
    ],
    "nextActions": [
      {
        "label": "Pass",
        "action": "pass",
        "type": "button"
      },
      {
        "label": "Fail",
        "action": "fail",
        "type": "button"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abcdf",
    "name": "Quality Assurance Check",
    "uniqueKey": "legal-quality-assurance-check",
    "categoryId": "64f7b8c9e1234567890abcdf",
    "description": "Perform quality assurance testing",
    "options": [
      {
        "label": "Test Type",
        "value": "automated",
        "type": "select"
      }
    ],
    "nextActions": [
      {
        "label": "Pass",
        "action": "pass",
        "type": "button"
      },
      {
        "label": "Fail",
        "action": "fail",
        "type": "button"
      }
    ],
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Update WorkStep
```bash
curl -X PUT "http://localhost:4000/work-step/64f7b8c9e1234567890abcdf" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enhanced Quality Assurance Check",
    "description": "Perform comprehensive quality assurance testing"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abcdf",
    "name": "Enhanced Quality Assurance Check",
    "uniqueKey": "legal-enhanced-quality-assurance-check",
    "categoryId": "64f7b8c9e1234567890abcdf",
    "description": "Perform comprehensive quality assurance testing",
    "options": [
      {
        "label": "Test Type",
        "value": "automated",
        "type": "select"
      }
    ],
    "nextActions": [
      {
        "label": "Pass",
        "action": "pass",
        "type": "button"
      },
      {
        "label": "Fail",
        "action": "fail",
        "type": "button"
      }
    ],
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
}
```

### Delete WorkStep
```bash
curl -X DELETE "http://localhost:4000/work-step/64f7b8c9e1234567890abcdf"
```

**Response:**
```json
{
  "success": true,
  "message": "WorkStep deleted successfully"
}
```

## Workflow API (`/workflow`)

### Get Next Available Step
```bash
curl -X GET "http://localhost:4000/workflow/get-next-available-step"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "name": "Document Review",
    "uniqueKey": "legal-document-review",
    "categoryId": {
      "_id": "64f7b8c9e1234567890abcdf",
      "name": "Legal",
      "description": "Legal related work steps"
    },
    "description": "Review legal documents for compliance",
    "options": [
      {
        "label": "Priority",
        "value": "high",
        "type": "select"
      }
    ],
    "nextActions": [
      {
        "label": "Approve",
        "action": "approve",
        "type": "button"
      },
      {
        "label": "Reject",
        "action": "reject",
        "type": "button"
      }
    ]
  }
}
```

## Customer API (`/customer`)

### Get All Customers
```bash
curl -X GET "http://localhost:4000/customer?page=1&limit=5&search=tech"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abce0",
      "companyName": "TechCorp Solutions",
      "address": "123 Tech Street, Silicon Valley, CA 94000",
      "contacts": [
        {
          "name": "John Smith",
          "email": "john.smith@techcorp.com",
          "phone": "+1-555-0123",
          "status": "OWNER"
        },
        {
          "name": "Jane Doe",
          "email": "jane.doe@techcorp.com",
          "phone": "+1-555-0124",
          "status": "EMPLOYEE"
        }
      ],
      "status": "active",
      "joinDate": "2024-01-10T00:00:00.000Z",
      "description": "Leading technology solutions provider",
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-10T09:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 8,
    "limit": 5
  }
}
```

### Get Customer by ID
```bash
curl -X GET "http://localhost:4000/customer/64f7b8c9e1234567890abce0"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce0",
    "companyName": "TechCorp Solutions",
    "address": "123 Tech Street, Silicon Valley, CA 94000",
    "contacts": [
      {
        "name": "John Smith",
        "email": "john.smith@techcorp.com",
        "phone": "+1-555-0123",
        "status": "OWNER"
      }
    ],
    "status": "active",
    "joinDate": "2024-01-10T00:00:00.000Z",
    "description": "Leading technology solutions provider",
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-10T09:00:00.000Z"
  }
}
```

### Create Customer
```bash
curl -X POST "http://localhost:4000/customer" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Innovation Labs Inc",
    "address": "456 Innovation Drive, Austin, TX 78701",
    "contacts": [
      {
        "name": "Alice Johnson",
        "email": "alice@innovationlabs.com",
        "phone": "+1-555-0200",
        "status": "OWNER"
      }
    ],
    "status": "active",
    "joinDate": "2024-01-20",
    "description": "Innovative research and development company"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce1",
    "companyName": "Innovation Labs Inc",
    "address": "456 Innovation Drive, Austin, TX 78701",
    "contacts": [
      {
        "name": "Alice Johnson",
        "email": "alice@innovationlabs.com",
        "phone": "+1-555-0200",
        "status": "OWNER"
      }
    ],
    "status": "active",
    "joinDate": "2024-01-20T00:00:00.000Z",
    "description": "Innovative research and development company",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Get Customers for Dropdown
```bash
curl -X GET "http://localhost:4000/customer/getAllForDropdownOption"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abce0",
      "companyName": "TechCorp Solutions"
    },
    {
      "_id": "64f7b8c9e1234567890abce1",
      "companyName": "Innovation Labs Inc"
    }
  ]
}
```

## WorkStep Category API (`/workstep-category`)

### Get All Categories
```bash
curl -X GET "http://localhost:4000/workstep-category?page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abcdf",
      "name": "Legal",
      "description": "Legal related work steps",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "64f7b8c9e1234567890abce2",
      "name": "Development",
      "description": "Software development work steps",
      "status": "active",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "limit": 10
  }
}
```

### Create Category
```bash
curl -X POST "http://localhost:4000/workstep-category" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quality Assurance",
    "description": "Quality assurance and testing work steps",
    "status": "active"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce3",
    "name": "Quality Assurance",
    "description": "Quality assurance and testing work steps",
    "status": "active",
    "createdAt": "2024-01-25T14:30:00.000Z",
    "updatedAt": "2024-01-25T14:30:00.000Z"
  }
}
```

### Get Categories for Dropdown
```bash
curl -X GET "http://localhost:4000/workstep-category/getAllForDropdownOption"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abcdf",
      "name": "Legal",
      "description": "Legal related work steps"
    },
    {
      "_id": "64f7b8c9e1234567890abce2",
      "name": "Development",
      "description": "Software development work steps"
    }
  ]
}
```

## Project API (`/project`)

### Get All Projects
```bash
curl -X GET "http://localhost:4000/project?page=1&limit=5&search=website"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e1234567890abce4",
      "name": "E-commerce Website Redesign",
      "description": "Complete redesign of the company e-commerce platform",
      "period": {
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-06-30T00:00:00.000Z"
      },
      "customerId": {
        "_id": "64f7b8c9e1234567890abce0",
        "companyName": "TechCorp Solutions",
        "address": "123 Tech Street, Silicon Valley, CA 94000"
      },
      "status": "ongoing",
      "createdAt": "2024-01-25T15:00:00.000Z",
      "updatedAt": "2024-01-25T15:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "limit": 5
  }
}
```

### Get Project by ID
```bash
curl -X GET "http://localhost:4000/project/64f7b8c9e1234567890abce4"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce4",
    "name": "E-commerce Website Redesign",
    "description": "Complete redesign of the company e-commerce platform",
    "period": {
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-06-30T00:00:00.000Z"
    },
    "customerId": {
      "_id": "64f7b8c9e1234567890abce0",
      "companyName": "TechCorp Solutions",
      "address": "123 Tech Street, Silicon Valley, CA 94000",
      "contacts": [
        {
          "name": "John Smith",
          "email": "john.smith@techcorp.com",
          "phone": "+1-555-0123",
          "status": "OWNER"
        }
      ]
    },
    "status": "ongoing",
    "createdAt": "2024-01-25T15:00:00.000Z",
    "updatedAt": "2024-01-25T15:00:00.000Z"
  }
}
```

### Create Project
```bash
curl -X POST "http://localhost:4000/project" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Development",
    "description": "Develop a new mobile application for iOS and Android",
    "period": {
      "startDate": "2024-03-01",
      "endDate": "2024-08-31"
    },
    "customerId": "64f7b8c9e1234567890abce1",
    "status": "draft"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce5",
    "name": "Mobile App Development",
    "description": "Develop a new mobile application for iOS and Android",
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-08-31T00:00:00.000Z"
    },
    "customerId": "64f7b8c9e1234567890abce1",
    "status": "draft",
    "createdAt": "2024-01-25T16:00:00.000Z",
    "updatedAt": "2024-01-25T16:00:00.000Z"
  }
}
```

### Update Project
```bash
curl -X PUT "http://localhost:4000/project/64f7b8c9e1234567890abce5" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "offering",
    "description": "Develop a comprehensive mobile application for iOS and Android with advanced features"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abce5",
    "name": "Mobile App Development",
    "description": "Develop a comprehensive mobile application for iOS and Android with advanced features",
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-08-31T00:00:00.000Z"
    },
    "customerId": "64f7b8c9e1234567890abce1",
    "status": "offering",
    "createdAt": "2024-01-25T16:00:00.000Z",
    "updatedAt": "2024-01-25T16:15:00.000Z"
  }
}
```

### Delete Project
```bash
curl -X DELETE "http://localhost:4000/project/64f7b8c9e1234567890abce5"
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "WorkStep not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Company name is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Search
- `search`: Search term to filter results

### Example with all parameters:
```bash
curl -X GET "http://localhost:4000/work-step?page=2&limit=5&search=review"
```

## Status Enums

### Project Status
- `draft`: Project is in draft state
- `offering`: Project is being offered to client
- `ongoing`: Project is currently active
- `done`: Project is completed

### Customer Status
- `active`: Customer is active
- `inactive`: Customer is inactive

### WorkStep Category Status
- `active`: Category is active
- `inactive`: Category is inactive

### Contact Status
- `OWNER`: Contact is the business owner
- `EMPLOYEE`: Contact is an employee
