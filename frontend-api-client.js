// api-client.js - Frontend API client for Skillfeed

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SkillFeedAPI {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // AUTH ENDPOINTS
  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // USER ENDPOINTS
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(userId, profileData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async searchUsers(skill, location, level) {
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (location) params.append('location', location);
    if (level) params.append('level', level);
    
    return this.request(`/users/search/query?${params}`);
  }

  // SKILLS ENDPOINTS
  async addSkill(userId, skillName, proficiency = 'Beginner') {
    return this.request(`/users/${userId}/skills`, {
      method: 'POST',
      body: JSON.stringify({ name: skillName, proficiency })
    });
  }

  async removeSkill(userId, skillName) {
    return this.request(`/users/${userId}/skills/${skillName}`, {
      method: 'DELETE'
    });
  }

  async getTrendingSkills() {
    return this.request('/skills/trending');
  }

  async endorseSkill(userId, skillName) {
    return this.request(`/skills/endorse/${userId}/${skillName}`, {
      method: 'POST'
    });
  }

  async getSkillRecommendations(userId) {
    return this.request(`/skills/recommendations/${userId}`);
  }

  // IDEAS ENDPOINTS
  async createIdea(ideaData) {
    return this.request('/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData)
    });
  }

  async getIdeas(category, stage, skill, page = 1, limit = 10) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (stage) params.append('stage', stage);
    if (skill) params.append('skill', skill);
    params.append('page', page);
    params.append('limit', limit);
    
    return this.request(`/ideas?${params}`);
  }

  async getIdea(ideaId) {
    return this.request(`/ideas/${ideaId}`);
  }

  async updateIdea(ideaId, ideaData) {
    return this.request(`/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify(ideaData)
    });
  }

  async deleteIdea(ideaId) {
    return this.request(`/ideas/${ideaId}`, {
      method: 'DELETE'
    });
  }

  async expressInterest(ideaId, role = 'Other') {
    return this.request(`/ideas/${ideaId}/interest`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  async removeInterest(ideaId) {
    return this.request(`/ideas/${ideaId}/interest`, {
      method: 'DELETE'
    });
  }

  // CONNECTION ENDPOINTS
  async sendConnectionRequest(targetUserId) {
    return this.request(`/connections/request/${targetUserId}`, {
      method: 'POST'
    });
  }

  async acceptConnection(userId) {
    return this.request(`/connections/accept/${userId}`, {
      method: 'POST'
    });
  }

  async rejectConnection(userId) {
    return this.request(`/connections/reject/${userId}`, {
      method: 'POST'
    });
  }

  async getConnections(userId) {
    return this.request(`/connections/${userId}`);
  }

  async getPendingRequests() {
    return this.request('/connections/pending/requests');
  }

  // MESSAGE ENDPOINTS
  async getOrCreateConversation(otherUserId) {
    return this.request(`/messages/conversation/${otherUserId}`, {
      method: 'POST'
    });
  }

  async sendMessage(conversationId, content) {
    return this.request(`/messages/${conversationId}/send`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async getConversation(conversationId) {
    return this.request(`/messages/${conversationId}`);
  }

  async getAllConversations() {
    return this.request('/messages/');
  }

  async markMessagesAsRead(conversationId) {
    return this.request(`/messages/${conversationId}/mark-read`, {
      method: 'PUT'
    });
  }

  async deleteConversation(conversationId) {
    return this.request(`/messages/${conversationId}`, {
      method: 'DELETE'
    });
  }
}

export default new SkillFeedAPI();
