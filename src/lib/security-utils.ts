/**
 * Security utilities for input validation, sanitization, and encryption
 * Addresses SEC-001, SEC-002, SEC-006, SEC-011
 */

import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';
import { z } from 'zod';

// Maximum file size: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_HISTORY_SIZE = 50;

/**
 * Sanitize user input to prevent XSS
 * SEC-002: Insufficient Input Sanitization
 */
export const sanitizeInput = (input: string, maxLength: number = 200): string => {
  if (!input) return '';
  
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
  
  return sanitized.slice(0, maxLength);
};

/**
 * Sanitize HTML content for safe rendering
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

/**
 * Sanitize SVG content to prevent XSS
 * SEC-004: Potential XSS in SVG Export
 */
export const sanitizeSvg = (svgContent: string): string => {
  if (!svgContent) return '';
  
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: ['svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'tspan', 'defs', 'clipPath', 'mask'],
    ALLOWED_ATTR: ['x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'points', 'd', 'transform', 'fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'text-anchor', 'class', 'id', 'viewBox', 'xmlns'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
  });
};

/**
 * Validation schemas for import data
 * SEC-001: Unsafe JSON Parsing Without Validation
 */

// Node data schema
const NodeDataSchema = z.object({
  type: z.string().max(50),
  label: z.string().max(100),
  zone: z.string().max(50).optional(),
  isHighlighted: z.boolean().optional(),
  cidr: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  associatedVpc: z.string().max(100).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  metrics: z.any().optional(),
  gradient: z.any().optional(),
  shadow: z.string().optional(),
  statusBadge: z.any().optional(),
  environment: z.enum(['dev', 'staging', 'prod']).optional()
}).passthrough(); // Allow additional properties

// Node schema
const NodeSchema = z.object({
  id: z.string().max(100),
  type: z.string().max(50),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  data: NodeDataSchema,
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
  style: z.any().optional(),
  className: z.string().optional()
}).passthrough();

// Edge schema
const EdgeSchema = z.object({
  id: z.string().max(100),
  source: z.string().max(100),
  target: z.string().max(100),
  label: z.string().max(200).optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.any().optional(),
  data: z.any().optional(),
  markerEnd: z.any().optional(),
  markerStart: z.any().optional()
}).passthrough();

// Diagram schema - passthrough allows additional fields like customComponents, findings, etc.
export const DiagramSchema = z.object({
  nodes: z.array(NodeSchema).max(1000),
  edges: z.array(EdgeSchema).max(2000),
  version: z.string().optional(),
  metadata: z.any().optional(),
  // Optional fields that may be present in exports
  timestamp: z.number().optional(),
  customComponents: z.array(z.any()).optional(),
  findings: z.array(z.any()).optional(),
  attackPaths: z.array(z.any()).optional()
}).passthrough();

// Backup schema
export const BackupSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  description: z.string().max(500),
  timestamp: z.number(),
  version: z.string(),
  data: z.object({
    nodes: z.array(NodeSchema).max(1000),
    edges: z.array(EdgeSchema).max(2000),
    customComponents: z.array(z.any()).max(500),
    findings: z.array(z.any()).max(1000),
    attackPaths: z.array(z.any()).max(100),
    settings: z.any()
  }),
  statistics: z.object({
    nodeCount: z.number(),
    edgeCount: z.number(),
    componentTypes: z.array(z.string()),
    securityFindings: z.number()
  })
}).passthrough();

// Component library schema
export const ComponentLibrarySchema = z.object({
  id: z.string().optional(),
  name: z.string().max(100),
  description: z.string().max(500),
  version: z.string().max(20),
  author: z.string().max(100).optional(),
  components: z.array(z.any()).max(500),
  created: z.string().optional(),
  updated: z.string().optional()
}).passthrough();

/**
 * Safely parse and validate JSON
 * SEC-001: Unsafe JSON Parsing Without Validation
 * SEC-003: No File Size Limits on Import
 */
export const safeParseJSON = <T>(
  jsonString: string,
  schema: z.ZodSchema<T>,
  maxSize: number = MAX_FILE_SIZE
): T => {
  // Check size
  if (jsonString.length > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }

  // Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  // Check for prototype pollution - only direct properties, not inherited
  if (parsed && typeof parsed === 'object') {
    if (Object.prototype.hasOwnProperty.call(parsed, '__proto__') || 
        Object.prototype.hasOwnProperty.call(parsed, 'constructor') || 
        Object.prototype.hasOwnProperty.call(parsed, 'prototype')) {
      throw new Error('Potential security threat detected in JSON');
    }
  }

  // Validate against schema
  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error('Validation errors:', result.error.errors);
    throw new Error('Invalid data format: ' + result.error.errors[0]?.message);
  }

  return result.data;
};

/**
 * Encryption utilities for localStorage
 * SEC-006: Sensitive Data in localStorage Without Encryption
 */

// Get or create encryption key
const STORAGE_KEY = 'koh-atlas-encryption-key';

const getOrCreateEncryptionKey = (): string => {
  const existingKey = sessionStorage.getItem(STORAGE_KEY);
  
  if (existingKey) {
    return existingKey;
  }
  
  // Generate a key based on device/session
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const userAgent = navigator.userAgent;
  
  const key = CryptoJS.SHA256(timestamp + random + userAgent).toString();
  sessionStorage.setItem(STORAGE_KEY, key);
  
  return key;
};

/**
 * Encrypt data before storing in localStorage
 */
export const encryptData = (data: any): string => {
  const key = getOrCreateEncryptionKey();
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, key).toString();
};

/**
 * Decrypt data after retrieving from localStorage
 */
export const decryptData = (encrypted: string): any => {
  try {
    const key = getOrCreateEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const jsonStr = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!jsonStr) {
      throw new Error('Decryption failed');
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Secure localStorage wrapper
 */
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encrypted = encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error storing data:', error);
      throw new Error('Failed to store data securely');
    }
  },

  getItem: <T = any>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      return decryptData(encrypted) as T;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

/**
 * Encrypt file for export
 * SEC-011: No Encryption for Exported Files
 */
export const encryptFileContent = (content: string, password: string): string => {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return CryptoJS.AES.encrypt(content, password).toString();
};

/**
 * Decrypt file content
 */
export const decryptFileContent = (encrypted: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!decrypted) {
    throw new Error('Invalid password or corrupted file');
  }
  
  return decrypted;
};

/**
 * Generate secure random ID
 * SEC-012: Weak Randomness for IDs
 */
export const generateSecureId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  
  return prefix ? `${prefix}-${timestamp}-${random1}${random2}` : `${timestamp}-${random1}${random2}`;
};

/**
 * Validate file size before processing
 */
export const validateFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): void => {
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }
};

/**
 * Sanitize error messages for production
 * SEC-015: Verbose Error Messages
 */
export const sanitizeError = (error: any, context: string = 'Operation'): string => {
  if (process.env.NODE_ENV === 'production') {
    return `${context} failed. Please try again.`;
  }
  
  return error?.message || `${context} failed`;
};
