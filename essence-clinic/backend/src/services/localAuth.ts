import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const DATA_DIR = path.join(__dirname, '../../data');

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  clinicName: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty users file
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export const localAuthService = {
  register: async (email: string, password: string, name: string, clinicName: string) => {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this!
      name,
      clinicName,
    };

    users.push(newUser);
    saveUsers(users);

    return { id: newUser.id, email: newUser.email, name: newUser.name };
  },

  login: async (email: string, password: string) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'essence_clinic_jwt_secret_2024_production_key_change_me',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, clinicName: user.clinicName },
    };
  },

  getUser: async (userId: string) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
