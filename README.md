# Web-messenger
A modern web-based messenger application built with HTML, CSS, and JavaScript. This is a standalone frontend-only implementation using local storage for data persistence.

**Features**
◽ User authentication (login/registration)
◽ Real-time chat interface
◽ User search functionality
◽ Dark/light theme support
◽ Responsive design for mobile and desktop
◽ Local data storage (no backend required)
◽ Profile customization
◽ Privacy settings
◽ Message history

**Project Structure**
```
index.html - Main application structure
style.css - All styling including themes and responsive design
script.js - Complete application logic (authentication, chat, settings)
```

**Technologies**
◽ HTML5 - Page structure and semantics
◽ CSS3 - Styling with CSS custom properties for theming
◽ Vanilla JavaScript - No frameworks or libraries
◽ LocalStorage API - Client-side data persistence
◽ Font Awesome - Icon set
◽ Google Fonts (Inter) - Typography

**Key Features**
*Authentication System*
◽ User registration with unique username
◽ Secure login/logout functionality
◽ Profile management

*Chat Functionality*
◽ Create and manage multiple chats
◽ Send and receive messages
◽ Message timestamps
◽ Search for other users
◽ Online/offline status indicators

*User Interface*
◽ Clean, modern design
◽ Dark/light theme with auto-detection
◽ Smooth animations and transitions
◽ Intuitive navigation

*Settings & Customization*
◽ Profile editing (nickname, avatar, password)
◽ Theme selection (light/dark/auto)
◽ Text size adjustment
◽ Privacy controls (who can find/message you)

**Local Storage Details**
*All data is stored in browser's localStorage:*
◽ User accounts and passwords
◽ Chat history
◽ Messages
◽ Application settings
**🔴Note: Data is browser-specific and will not sync across devices or browsers.**

**Privacy Notice**
📍This application stores all data locally in your browser. No data is sent to any server. Clear your browser data to remove all stored information.

**Development Notes**
The application is built with vanilla JavaScript without external frameworks. The code is structured in a single MessengerApp class that manages all functionality.

**Future Development**
◽ This is a frontend-only implementation. Potential future enhancements could include:
◽ Backend integration
◽ Database storage
◽ Real-time messaging with WebSockets
◽ File sharing
◽ Video/voice calls
◽ Group chats

🧰**How to Run**🧰
Simply open index.html in any modern web browser. No installation or server setup required.
**Test Accounts**
For immediate testing, use these credentials:
```
*Username \	Password \ Display Name*
anna	\ 123	\ Anna
oleg	\ 123	\ Oleg
maria	\ 123	\ Maria
```
