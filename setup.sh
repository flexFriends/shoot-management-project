#!/bin/bash

# Studio Shoot Management - Setup Script
# This script automates the initial setup process

set -e

echo "================================================"
echo "   Studio Shoot Management System Setup"
echo "================================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL server is running on localhost:5432"
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env || echo "   .env.example not found, using default"
fi

echo "   Pushing database schema..."
npm run db:push 2>/dev/null || echo "   ⚠️  Could not push schema - ensure PostgreSQL is running"

echo "   Seeding database..."
npm run seed 2>/dev/null || echo "   ⚠️  Seeding failed - you can run 'npm run seed' later"

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "🎨 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
fi

echo "✅ Frontend setup complete!"
echo ""

# Summary
echo "================================================"
echo "   ✅ Setup Complete!"
echo "================================================"
echo ""
echo "📖 Next Steps:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Login with:"
echo "   Email:    manager1@studio.com"
echo "   Password: Manager@123"
echo ""
echo "📚 Documentation:"
echo "   - Read: README.md (overview)"
echo "   - Read: QUICKSTART.md (quick setup)"
echo "   - Read: IMPLEMENTATION_STATUS.md (what's done)"
echo "   - Read: backend/README.md (API docs)"
echo "   - Read: frontend/README.md (frontend guide)"
echo ""
echo "📝 Full Specification:"
echo "   - STUDIO_SHOOT_MANAGEMENT_CODEX_PROMPT.md"
echo ""
echo "🎉 Happy Coding!"
echo ""
