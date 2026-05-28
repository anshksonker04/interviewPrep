#!/bin/bash

# Colors
GREEN=$'\e[0;32m'
BLUE=$'\e[0;34m'
CYAN=$'\e[0;36m'
YELLOW=$'\e[1;33m'
RED=$'\e[0;31m'
PURPLE=$'\e[0;35m'
NC=$'\e[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}     Interview Preparation Portal Bootloader        ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Ensure Python output is not buffered
export PYTHONUNBUFFERED=1

# Clear previous log files in workspace root
> client.log.txt
> server.log.txt
> db.log.txt

# Function to clean up background servers and log processes upon exit (Ctrl+C)
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

  if [ ! -z "$TAIL_SERVER_PID" ]; then
    kill $TAIL_SERVER_PID 2>/dev/null
  fi

  if [ ! -z "$TAIL_CLIENT_PID" ]; then
    kill $TAIL_CLIENT_PID 2>/dev/null
  fi
  
  echo -e "${GREEN}Cleanup completed successfully. Goodbye!${NC}"
  exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Ensure ports 5000 and 5173 are free of any active zombie processes from previous crashes
echo -e "${YELLOW}Ensuring ports 5000 and 5173 are clear...${NC}"
fuser -k 5000/tcp 2>/dev/null || kill -9 $(lsof -t -i:5000) 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || kill -9 $(lsof -t -i:5173) 2>/dev/null || true

# Step 1: Check and Seed SQLite Database if missing
if [ ! -f "server/interview_prep.db" ]; then
  echo -e "${YELLOW}SQLite database file not found. Seeding initial placement data...${NC}"
  # Run seeding, saving log and prefixing it as db: in purple
  PYTHONPATH=. python3 server/database/seed.py 2>&1 | tee db.log.txt | sed -u "s/^/${PURPLE}db: ${NC}/"
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}Database successfully seeded.${NC}"
  else
    echo -e "${RED}Warning: Seeding script encountered an error. Proceeding...${NC}"
  fi
else
  # Database already exists, write a note to db.log.txt
  echo -e "SQLite database detected. Seeding not required." | tee db.log.txt | sed -u "s/^/${PURPLE}db: ${NC}/"
fi

# Step 2: Boot Backend Flask server in the background
echo -e "${BLUE}Starting Flask REST API on port 5000...${NC}"
# Run Flask app, redirecting output directly to server.log.txt
PYTHONPATH=. python3 server/app.py > server.log.txt 2>&1 &
FLASK_PID=$!
echo -e "${GREEN}Flask backend running in background (PID: $FLASK_PID, logging to: server.log.txt)${NC}"

# Step 3: Boot Frontend Vite server in the background
echo -e "${BLUE}Starting React Vite compiler on port 5173...${NC}"
# Run Vite, redirecting output directly to client.log.txt
(cd client && npm run dev > ../client.log.txt 2>&1) &
VITE_PID=$!
echo -e "${GREEN}Vite frontend running in background (PID: $VITE_PID, logging to: client.log.txt)${NC}"

# Step 4: Display log streams in real-time with color prefixes
echo -e "\n${CYAN}====================================================${NC}"
echo -e "${CYAN}            REAL-TIME COLLATED LOGSTREAM             ${NC}"
echo -e "${CYAN}====================================================${NC}"
echo -e "Showing live log output. Press [Ctrl+C] to exit.\n"

# Touch log files to ensure they exist before tailing
touch server.log.txt client.log.txt

# Start background tail processes that read logs and prefix them in real time
tail -f server.log.txt | sed -u "s/^/${GREEN}server: ${NC}/" &
TAIL_SERVER_PID=$!

tail -f client.log.txt | sed -u "s/^/${CYAN}client: ${NC}/" &
TAIL_CLIENT_PID=$!

# Keep shell active to listen for trap signals
while true; do
  sleep 1
done
