const API_URL = 'http://localhost:3000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Login
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Login error response:', text);
      try {
        const data = JSON.parse(text);
        return { error: data.error || data.message || 'Login failed' };
      } catch {
        return { error: `Server error: ${response.status}` };
      }
    }
    
    const data = await response.json();
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { error: error.message };
  }
};

// Register
export const registerUser = async (fullName, handle, email, password, role = 'member') => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, handle, email, password, role })
    });
    
    // Check if response is ok first
    if (!response.ok) {
      const text = await response.text();
      console.error('Registration error response:', text);
      try {
        const data = JSON.parse(text);
        return { error: data.error || 'Registration failed' };
      } catch {
        return { error: `Server error: ${response.status}` };
      }
    }
    
    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { error: error.message };
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') {
      return null;
    }
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Get events
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Get blogs/articles
export const getArticles = async (tag = null) => {
  try {
    const url = tag 
      ? `${API_URL}/blogs?tag=${tag}`
      : `${API_URL}/blogs`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Get problems
export const getProblems = async (tag = null) => {
  try {
    const url = tag 
      ? `${API_URL}/blogs/problems?tag=${tag}`
      : `${API_URL}/blogs/problems`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Update event interest status
export const updateEventInterest = async (eventId, status) => {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Get members with attendance counts (office dashboard)
export const getMembersWithAttendance = async () => {
  try {
    const response = await fetch(`${API_URL}/users/dashboard/members`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Get managers with attendance counts (office dashboard)
export const getManagersWithAttendance = async () => {
  try {
    const response = await fetch(`${API_URL}/users/dashboard/managers`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Get event interest summary (office dashboard)
export const getEventInterestSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/events/admin/interest-summary`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};
