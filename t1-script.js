body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  min-height: 100vh;
  background-color: #ecf0f1;
}

/* Main container */
.main-container {
  display: flex;
  width: 100%;
  position: relative;
}

/* Sidebar styling */
.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  height: 100vh;
  z-index: 2;
  overflow: auto;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-200px);
}

.sidebar h2 {
  color: #ecf0f1;
  margin-top: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin: 10px 0;
}

.sidebar ul li a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 18px;
}

.sidebar ul li a:hover {
  text-decoration: underline;
}

/* Sidebar toggle button */
.sidebar-toggle {
  position: fixed;
  left: 220px;
  top: 20px;
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 3;
  transition: left 0.3s ease;
}

.sidebar-toggle.collapsed {
  left: 20px;
}

/* Center content */
.center-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* Move history panel */
.move-history-panel {
  width: 250px;
  padding: 15px;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  height: 100vh;
  overflow-y: auto;
}

.move-history-panel h3 {
  color: #2c3e50;
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.move-history {
  white-space: pre-wrap;
}

/* Hex container */
.hex-container {
  position: relative;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  margin-top: 60px;
}

/* Status bar */
.status-bar {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-items: center;
  width: 80%;
  max-width: 800px;
}

.status-bar button {
  padding: 6px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.status-bar button:hover {
  background-color: #0056b3;
}

.timers {
  display: flex;
  gap: 10px;
  font-weight: bold;
}

.displayPlayerMove, .display-score {
  font-weight: bold;
}

/* Node styling */
.node {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px solid #ccc;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.5s ease-in-out;
  z-index: 2;
}

.node:hover {
  background-color: #e2e6ea;
  transform: scale(1.05);
}

.highlight {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  transition: left 0.5s ease-in-out, top 0.5s ease-in-out, opacity 0.5s ease-in-out, background-color 0.5s ease-in-out;
  opacity: 0;
  z-index: 1;
}

.p {
  position: absolute;
  color: #333;
  font-size: 0.9;
}
