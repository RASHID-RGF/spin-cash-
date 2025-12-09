#!/bin/bash
#!/bin/bash
# Allow overriding the port via PORT env var, default to 3001
PORT=${PORT:-3002}
./venv/bin/python manage.py runserver 0.0.0.0:${PORT}