const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

// Simple in-memory storage
let users = {
  'demo@example.com': {
    id: '1',
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User',
    is_active: true,
    is_onboarded: true,
    is_tour_completed: false,
    assigned_issues: 5,
    workspace_invites: 0,
    last_workspace_id: 'workspace-1',
    role: 'admin',
    theme: { theme: 'system' }
  }
};

let workspaces = {
  'workspace-1': {
    id: 'workspace-1',
    name: 'Demo Workspace',
    slug: 'demo-workspace',
    owner: 'Demo User',
    owner_id: '1',
    created_at: new Date(),
  }
};

let projects = {
  'project-1': {
    id: 'project-1',
    name: 'Sample Project',
    identifier: 'SP',
    workspace: 'workspace-1',
    created_at: new Date(),
  }
};

const SECRET = 'mock-secret-key';

function generateToken(userId) {
  return jwt.sign({ user_id: userId, email: users[Object.keys(users)[0]].email }, SECRET, { expiresIn: '24h' });
}

// Auth endpoints
app.post('/api/sign-in/', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Mock password check - any password works for demo
  if (!password) {
    return res.status(401).json({ error: 'Password is required' });
  }

  const accessToken = generateToken(user.id);
  const refreshToken = jwt.sign({ user_id: user.id }, SECRET, { expiresIn: '7d' });

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: user
  });
});

app.post('/api/sign-up/', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (users[email]) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const userId = Object.keys(users).length + 1;
  const newUser = {
    id: userId.toString(),
    email,
    first_name: email.split('@')[0],
    last_name: 'User',
    is_active: true,
    is_onboarded: false,
    is_tour_completed: false,
    assigned_issues: 0,
    workspace_invites: 0,
    last_workspace_id: null,
    role: 'member',
    theme: { theme: 'system' }
  };

  users[email] = newUser;

  const accessToken = generateToken(newUser.id);
  const refreshToken = jwt.sign({ user_id: newUser.id }, SECRET, { expiresIn: '7d' });

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: newUser
  });
});

app.post('/api/social-auth/', (req, res) => {
  const demoUser = users['demo@example.com'];
  const accessToken = generateToken(demoUser.id);
  const refreshToken = jwt.sign({ user_id: demoUser.id }, SECRET, { expiresIn: '7d' });

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: demoUser
  });
});

app.post('/api/magic-generate/', (req, res) => {
  res.json({ success: true });
});

app.post('/api/magic-sign-in/', (req, res) => {
  const demoUser = users['demo@example.com'];
  const accessToken = generateToken(demoUser.id);
  const refreshToken = jwt.sign({ user_id: demoUser.id }, SECRET, { expiresIn: '7d' });

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: demoUser
  });
});

app.post('/api/sign-out/', (req, res) => {
  res.json({ success: true });
});

// User endpoints
app.get('/api/users/me/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    jwt.verify(token, SECRET);
    const demoUser = users['demo@example.com'];
    res.json(demoUser);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.patch('/api/users/me/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    jwt.verify(token, SECRET);
    const demoUser = users['demo@example.com'];
    Object.assign(demoUser, req.body);
    res.json(demoUser);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.patch('/api/users/me/onboard/', (req, res) => {
  const demoUser = users['demo@example.com'];
  demoUser.is_onboarded = true;
  res.json(demoUser);
});

app.patch('/api/users/me/tour-completed/', (req, res) => {
  const demoUser = users['demo@example.com'];
  demoUser.is_tour_completed = true;
  res.json(demoUser);
});

// Workspace endpoints
app.get('/api/users/me/workspaces/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    jwt.verify(token, SECRET);
    res.json([workspaces['workspace-1']]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/users/me/invitations/workspaces/', (req, res) => {
  res.json([]);
});

// Dashboard endpoint
app.get('/api/users/me/workspaces/:workspaceSlug/dashboard/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    jwt.verify(token, SECRET);
    res.json({
      overdue_issues: [],
      upcoming_issues: [],
      state_distribution: {},
      completed_issues: [],
      total_issues: 0,
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Project endpoints
app.get('/api/workspaces/:workspaceSlug/projects/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    jwt.verify(token, SECRET);
    res.json([projects['project-1']]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Demo credentials: demo@example.com / any password');
});
