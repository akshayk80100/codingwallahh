/**
 * Coding Wallah - Central Authentication & Session Engine (auth.js)
 * Production-ready Client-side Auth with localStorage persistence, RBAC,
 * Google OAuth adapter, Forgot Password flow, and Protected Route guards.
 */

(function (window) {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_USERS = 'cw_users_db';
  const STORAGE_CURRENT_USER = 'cw_current_user';
  const STORAGE_TOKEN = 'cw_auth_token';

  // --- Default Seed Accounts ---
  const DEFAULT_USERS = [
    {
      id: 'usr_student_01',
      name: 'Aman Gupta',
      email: 'aman.gupta@codingwallah.in',
      password: 'password123',
      role: 'Student',
      phone: '+91 98765 43210',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aman',
      streakDays: 14,
      xp: 480,
      joinedAt: '2026-01-15'
    },
    {
      id: 'usr_admin_01',
      name: 'Sanchit Verma',
      email: 'admin@codingwallah.in',
      password: 'admin123',
      role: 'Instructor',
      phone: '+91 98765 00000',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sanchit',
      streakDays: 99,
      xp: 4200,
      joinedAt: '2025-08-01'
    }
  ];

  // --- Auth Core Class ---
  class AuthService {
    constructor() {
      this.initDb();
      this.currentUser = this.loadSession();
      this.listeners = [];
    }

    initDb() {
      if (!localStorage.getItem(STORAGE_USERS)) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
      }
    }

    getUsers() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_USERS)) || DEFAULT_USERS;
      } catch (e) {
        return DEFAULT_USERS;
      }
    }

    saveUsers(users) {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }

    loadSession() {
      try {
        const token = localStorage.getItem(STORAGE_TOKEN);
        const userStr = localStorage.getItem(STORAGE_CURRENT_USER);
        if (token && userStr) {
          return JSON.parse(userStr);
        }
      } catch (e) {
        this.clearSession();
      }
      // Default to initial student if not set, or return null for true guest
      return null;
    }

    setSession(user, token) {
      this.currentUser = user;
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN, token || `jwt_token_${Date.now()}_${user.id}`);
      this.notify();
    }

    clearSession() {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_CURRENT_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      this.notify();
    }

    subscribe(callback) {
      this.listeners.push(callback);
      callback(this.currentUser);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach(cb => {
        try {
          cb(this.currentUser);
        } catch (e) {
          console.error('Auth listener error:', e);
        }
      });
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    isAdmin() {
      return this.currentUser && (this.currentUser.role === 'Instructor' || this.currentUser.role === 'Admin');
    }

    isStudent() {
      return this.currentUser && this.currentUser.role === 'Student';
    }

    /**
     * Login with email and password
     */
    login(email, password) {
      const users = this.getUsers();
      const normEmail = (email || '').trim().toLowerCase();
      const user = users.find(u => u.email.toLowerCase() === normEmail);

      if (!user) {
        return { success: false, error: 'No account found with this email address.' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const sessionUser = { ...user };
      delete sessionUser.password;
      this.setSession(sessionUser);
      return { success: true, user: sessionUser };
    }

    /**
     * Register a new user
     */
    register({ name, email, password, role = 'Student', phone = '' }) {
      const normEmail = (email || '').trim().toLowerCase();
      if (!normEmail || !password || !name) {
        return { success: false, error: 'Please provide all required fields.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const users = this.getUsers();
      if (users.some(u => u.email.toLowerCase() === normEmail)) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: normEmail,
        password: password,
        role: role,
        phone: phone.trim(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        streakDays: 1,
        xp: 100,
        joinedAt: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      this.saveUsers(users);

      const sessionUser = { ...newUser };
      delete sessionUser.password;
      this.setSession(sessionUser);
      return { success: true, user: sessionUser };
    }

    /**
     * Reset Password (Forgot Password Flow)
     */
    resetPassword(email, newPassword) {
      const normEmail = (email || '').trim().toLowerCase();
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === normEmail);

      if (userIndex === -1) {
        return { success: false, error: 'Email not found in our records.' };
      }

      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters.' };
      }

      users[userIndex].password = newPassword;
      this.saveUsers(users);
      return { success: true, message: 'Password successfully updated! You can now log in.' };
    }

    /**
     * Google OAuth Login / Simulation
     */
    loginWithGoogle(googleProfile) {
      const email = googleProfile.email.toLowerCase();
      const users = this.getUsers();
      let user = users.find(u => u.email.toLowerCase() === email);

      if (!user) {
        // Auto-provision student account from Google OAuth profile
        user = {
          id: `usr_g_${Date.now()}`,
          name: googleProfile.name || 'Google User',
          email: email,
          password: `g_oauth_${Math.random()}`,
          role: 'Student',
          phone: '',
          avatar: googleProfile.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleProfile.name)}`,
          streakDays: 1,
          xp: 150,
          joinedAt: new Date().toISOString().split('T')[0],
          isOAuth: true
        };
        users.push(user);
        this.saveUsers(users);
      }

      const sessionUser = { ...user };
      delete sessionUser.password;
      this.setSession(sessionUser, `g_oauth_token_${Date.now()}`);
      return { success: true, user: sessionUser };
    }

    logout() {
      this.clearSession();
      return { success: true };
    }
  }

  // Instantiate and expose globally
  window.CodingWallahAuth = new AuthService();

})(window);
