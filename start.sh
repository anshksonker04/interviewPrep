#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}     Interview Preparation Portal Bootloader        ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Function to clean up background servers upon exit (Ctrl+C)
cleanup() {
  echo -e "\n${YELLOW}Terminating active dev processes concurrently...${NC}"
  
  if [ ! -z "$FLASK_PID" ]; then
    echo -e "Stopping Flask API Server (PID: $FLASK_PID)..."
    kill $FLASK_PID 2>/dev/null
  fi
  
  if [ ! -z "$VITE_PID" ]; then
    echo -e "Stopping Vite Frontend Server (PID: $VITE_PID)..."
    kill $VITE_PID 2>/dev/null
  fi
  
  echo -e "${GREEN}Cleanup completed successfully. Goodbye!${NC}"
  exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Step 1: Check and Seed SQLite Database if missing
if [ ! -f "server/interview_prep.db" ]; then
  echo -e "${YELLOW}SQLite database file not found. Seeding initial placement data...${NC}"
  PYTHONPATH=. python3 server/database/seed.py
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database successfully seeded.${NC}"
  else
    echo -e "${RED}Warning: Seeding script encountered an error. Proceeding...${NC}"
  fi
else
  echo -e "${GREEN}Seeded SQLite database detected.${NC}"
fi

# Step 2: Boot Backend Flask server in the background
echo -e "${BLUE}Starting Flask REST API on port 5000...${NC}"
PYTHONPATH=. python3 server/app.py > server/flask.log 2>&1 &
FLASK_PID=$!
echo -e "${GREEN}Flask backend running in background (PID: $FLASK_PID, logs: server/flask.log)${NC}"

# Step 3: Boot Frontend Vite server in the background
echo -e "${BLUE}Starting React Vite compiler on port 5173...${NC}"
cd client
npm run dev > vite.log 2>&1 &
VITE_PID=$!
cd ..
echo -e "${GREEN}Vite frontend running in background (PID: $VITE_PID, logs: client/vite.log)${NC}"

echo -e "\n${GREEN}✔ Both dev servers launched successfully!${NC}"
echo -e "  - Frontend Portal:  ${CYAN}http://localhost:5173${NC}"
echo -e "  - Backend REST API: ${CYAN}http://localhost:5000${NC}"
echo -e "  - System Logfiles:  ${CYAN}server/flask.log${NC} and ${CYAN}client/vite.log${NC}"
echo -e "\n${YELLOW}Press [Ctrl+C] to shutdown both dev processes concurrently.${NC}"

# Keep shell active to listen for signals
while true; do
  sleep 1
done
