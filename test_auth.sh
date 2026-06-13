#!/bin/bash
echo "Registering user..."
curl -s -c cookie.txt -d '{"username":"test_user_x1","email":"test_user_x1@example.com","password":"password123"}' -H "Content-Type: application/json" http://localhost:5070/api/register

echo -e "\nFetching threads with cookie..."
curl -s -b cookie.txt http://localhost:5070/api/threads -o /dev/null -w "%{http_code}\n"
