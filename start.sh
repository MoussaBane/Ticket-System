#!/bin/bash
# Start script for Ticket Management System

echo "🎫 Starting Ticket Management System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please create a .env file from .env.example:"
    echo "  cp .env.example .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Seed database with default users if needed
echo "🌱 Seeding database with default users..."
node scripts/seedUsers.js

# Start the server
echo "🚀 Starting server..."
npm start
