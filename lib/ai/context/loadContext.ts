// URL constants for fetching context data
const PWRCHAIN_DOCS_OVERVIEW_URL = process.env.PWRCHAIN_DOCS_OVERVIEW_URL as string;
const PWRCHAIN_DEVELOPERS_DOCS_URL = process.env.PWRCHAIN_DEVELOPERS_DOCS_URL as string;
const PWRCHAIN_BUILDING_VIDA_DOCS_URL = process.env.PWRCHAIN_BUILDING_VIDA_DOCS_URL as string;

if (!PWRCHAIN_DOCS_OVERVIEW_URL || !PWRCHAIN_DEVELOPERS_DOCS_URL) {
  console.log('loadContext: One or more required environment variables for context URLs are missing.');
  throw new Error('One or more required environment variables for context URLs are missing.');
}

// Cache variables to store fetched data
let pwrChainDocsCache: string | null = null;
let pwrChainDocsMiddlewareCache: string | null = null;
let pwrChainBuildingVidasDocsCache: string | null = null;

/**
 * Fetches the PWR Chain docs overview, using a cached version if available.
 */
export async function fetchPwrChainDocsOverview(): Promise<string> {
  // Return cached docs if available
  if (pwrChainDocsCache) {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainDocsOverview: returning cached docs');
    }
    return pwrChainDocsCache;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainDocsOverview: fetching new docs');
    }
  }

  try {
    const response = await fetch(PWRCHAIN_DOCS_OVERVIEW_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch PWR Chain docs: ${response.statusText}`);
    }
    const pwrChainDocsOverview = await response.text();
      
    // Cache the docs for future use
    pwrChainDocsCache = pwrChainDocsOverview;
    
    return pwrChainDocsOverview;
  } catch (error) {
    console.error("Error fetching PWR Chain docs:", error);
    // Return a descriptive error message or rethrow, depending on desired error handling
    return 'Error loading PWR Chain documentation.'; 
  }
}

/**
 * Fetches the PWR Chain middleware docs, using a cached version if available.
 */
export async function fetchPwrChainDevelopersDocs(): Promise<string> {
  // Return cached docs if available
  if (pwrChainDocsMiddlewareCache) {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainDevelopersDocs: returning cached docs');
    }
    return pwrChainDocsMiddlewareCache;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainDevelopersDocs: fetching new docs');
    }
  }

  try {
    const response = await fetch(PWRCHAIN_DEVELOPERS_DOCS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch PWR Chain middleware docs: ${response.statusText}`);
    }
    const pwrChainDocsMiddleware = await response.text();

    // Cache the docs for future use
    pwrChainDocsMiddlewareCache = pwrChainDocsMiddleware;

    return pwrChainDocsMiddleware;
  } catch (error) {
    console.error("Error fetching PWR Chain middleware docs:", error);
    // Return a descriptive error message or rethrow
    return 'Error loading PWR Chain middleware documentation.'; 
  }
}

/**
 * Fetches the PWR Chain building VIDA docs, using a cached version if available.
 */
export async function fetchPwrChainBuildingVidasDocs(): Promise<string> {
  // Return cached docs if available
  if (pwrChainBuildingVidasDocsCache) {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainBuildingVidasDocs: returning cached docs');
    }
    return pwrChainBuildingVidasDocsCache;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadContext: fetchPwrChainBuildingVidasDocs: fetching new docs');
    }
  }

  try {
    const response = await fetch(PWRCHAIN_BUILDING_VIDA_DOCS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch PWR Chain building VIDA docs: ${response.statusText}`);
    }
    const pwrChainBuildingVidasDocs = await response.text();

    // Cache the docs for future use
    pwrChainBuildingVidasDocsCache = pwrChainBuildingVidasDocs;

    return pwrChainBuildingVidasDocs;
  } catch (error) {
    console.error("Error fetching PWR Chain building VIDA docs:", error);
    // Return a descriptive error message or rethrow
    return 'Error loading PWR Chain building VIDA documentation.'; 
  }
}