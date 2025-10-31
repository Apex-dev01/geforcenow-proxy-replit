# GeForce NOW Proxy Server - Replit/Render Edition

> A Node.js Express-based proxy server for GeForce NOW, easily deployable on Replit or Render

## 📋 Overview

This is a simple yet powerful proxy server built with Node.js and Express that can be deployed on cloud platforms like Replit or Render. It provides a flexible architecture for proxying requests to backend APIs with built-in error handling, logging, and health checks.

## ✨ Features

- ✅ Express.js server framework
- ✅ CORS support enabled
- ✅ Health check endpoint `/health`
- ✅ GET and POST proxy endpoints
- ✅ Comprehensive error handling
- ✅ Request logging
- ✅ Environment variable configuration
- ✅ Easy deployment on Replit and Render
- ✅ Production-ready structure

## 📁 Project Structure

```
geforcenow-proxy-replit/
├── index.js                 # Main server file
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ (Replit and Render have Node.js pre-installed)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Apex-dev01/geforcenow-proxy-replit.git
   cd geforcenow-proxy-replit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `TARGET_URL`:
   ```env
   PORT=3000
   TARGET_URL=https://your-api.example.com
   ```

4. **Run locally**
   ```bash
   npm start
   ```
   
   Server will be available at `http://localhost:3000`

## 🎯 API Endpoints

### Health Check
**GET** `/health`
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "status": "OK",
  "message": "Proxy server is running",
  "timestamp": "2025-10-31T10:51:00.000Z"
}
```

### Root Endpoint
**GET** `/`
```bash
curl http://localhost:3000/
```
Response:
```json
{
  "name": "GeForce NOW Proxy Server",
  "version": "1.0.0",
  "description": "A Node.js Express-based proxy server for GeForce NOW",
  "endpoints": {
    "health": "/health",
    "api": "/api/*"
  }
}
```

### Proxy Endpoints
**GET/POST** `/api/*`
```bash
# GET request example
curl http://localhost:3000/api/users

# POST request example
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

## 🌐 Deployment on Replit

### Step 1: Fork to Replit
1. Click on the "Deploy" button or use the Replit import feature
2. Connect your GitHub account and select this repository
3. Replit will automatically detect `package.json`

### Step 2: Configure Environment
1. Open the **Secrets** tab (lock icon in the left sidebar)
2. Add your environment variables:
   - `TARGET_URL`: Your backend API URL
   - `PORT`: (optional, defaults to 3000)
   - `NODE_ENV`: development or production

### Step 3: Run
1. Click the "Run" button
2. Replit will execute `npm start` automatically
3. Your proxy server will be live at the provided Replit URL

### Step 4: Access Your Server
Replit provides a unique URL (e.g., `https://yourproject.username.repl.co`)
You can access your proxy at that URL

## 🚀 Deployment on Render

### Step 1: Create a New Web Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select this repository

### Step 2: Configure the Service
- **Name**: `geforcenow-proxy` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid for better performance)

### Step 3: Add Environment Variables
1. Scroll to "Environment" section
2. Add your variables:
   - `TARGET_URL`: Your backend API URL
   - `NODE_ENV`: production
   - `PORT`: 3000 (Render will map this automatically)

### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Your proxy server will be available at the provided Render URL

### Step 5: Monitor
- View logs in real-time
- Render automatically restarts the service if it crashes
- Set up alerts for downtime

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000                          # Server port (default: 3000)
NODE_ENV=development               # Environment (development/production)

# Target API
TARGET_URL=https://api.example.com # Backend API to proxy to

# Optional
API_KEY=your_api_key_here          # If your target API requires authentication
CORS_ORIGIN=*                      # CORS origin (default: all)
```

## 📝 Usage Examples

### Example 1: Proxying to a Public API
```bash
export TARGET_URL=https://api.github.com
npm start

# Then access
curl http://localhost:3000/api/users/github
```

### Example 2: Proxying to a Local Service
```bash
export TARGET_URL=http://localhost:5000
npm start

# Then access
curl http://localhost:3000/api/data
```

### Example 3: With Query Parameters
```bash
curl 'http://localhost:3000/api/search?q=test&limit=10'
```

## 🛠️ Customization

To modify the proxy behavior:

1. Edit `index.js` to add custom middleware
2. Add authentication logic
3. Implement request/response transformation
4. Add rate limiting
5. Implement caching

## 📦 Dependencies

- **express**: Web framework
- **axios**: HTTP client for proxying requests
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management

## 🐛 Troubleshooting

### Server won't start
- Check if PORT is in use
- Verify Node.js version compatibility
- Check console logs for errors

### Proxy requests failing
- Verify `TARGET_URL` is correct and accessible
- Check CORS settings
- Review error logs

### Deployment issues
- For Replit: Check secrets are properly set
- For Render: Review deployment logs
- Ensure dependencies are in `package.json`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Replit Documentation](https://docs.replit.com/)
- [Render Documentation](https://render.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 📄 License

MIT License - Feel free to use this project for any purpose

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📧 Support

If you have questions or need help:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub

---

**Happy Proxying! 🚀**
