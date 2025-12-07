class MessengerApp {
    constructor() {
        this.currentUser = null;
        this.activeChat = null;
        this.users = this.loadFromStorage('messenger_users') || [];
        this.messages = this.loadFromStorage('messenger_messages') || [];
        this.chats = this.loadFromStorage('messenger_chats') || [];
        this.settings = this.loadFromStorage('messenger_settings') || {
            theme: 'light',
            textSize: 16,
            compactMode: false,
            discoverability: 'everyone',
            messagePrivacy: 'everyone',
            readReceipts: true,
            onlineStatus: true
        };
        
        this.init();
    }

    init() {
        this.applySettings();
        this.setupEventListeners();
        this.checkLoggedInUser();
        this.setupRealTimeUpdates();
        
        // Додаємо тестового користувача, якщо немає жодного
        if (this.users.length === 0) {
            this.addTestUsers();
        }
    }

    addTestUsers() {
        const testUsers = [
            {
                id: 'test1',
                nickname: 'Анна',
                username: 'anna',
                password: '123',
                avatar: 'user',
                registeredAt: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 'test2',
                nickname: 'Олег',
                username: 'oleg',
                password: '123',
                avatar: 'user-tie',
                registeredAt: new Date().toISOString(),
                isOnline: false
            },
            {
                id: 'test3',
                nickname: 'Марія',
                username: 'maria',
                password: '123',
                avatar: 'cat',
                registeredAt: new Date().toISOString(),
                isOnline: true
            }
        ];
        
        this.users.push(...testUsers);
        this.saveToStorage('messenger_users', this.users);
    }

    applySettings() {
        // Застосування теми
        const theme = this.settings.theme;
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Застосування розміру тексту
        document.documentElement.style.fontSize = `${this.settings.textSize}px`;
        
        // Застосування компактного режиму
        if (this.settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    checkLoggedInUser() {
        const loggedInUser = this.loadFromStorage('messenger_currentUser');
        if (loggedInUser) {
            this.currentUser = loggedInUser;
            this.showMainInterface();
            this.loadUserData();
        }
    }

    setupEventListeners() {
        // Авторизація
        document.getElementById('loginTab').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.switchAuthTab('register'));
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Налаштування
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        
        // Контакти
        document.getElementById('closeInfoBtn').addEventListener('click', () => this.closeContactInfo());
        document.getElementById('chatInfoBtn')?.addEventListener('click', () => this.showContactInfo());
        
        // Пошук
        document.getElementById('searchBtn').addEventListener('click', () => this.searchUser());
        document.getElementById('userSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUser();
        });
        
        // Повідомлення
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Налаштування профілю
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        document.getElementById('cancelProfileBtn').addEventListener('click', () => this.closeSettings());
        
        // Налаштування зовнішнього вигляду
        document.getElementById('saveAppearanceBtn').addEventListener('click', () => this.saveAppearance());
        document.getElementById('cancelAppearanceBtn').addEventListener('click', () => this.resetAppearance());
        
        // Налаштування конфіденційності
        document.getElementById('savePrivacyBtn').addEventListener('click', () => this.savePrivacy());
        document.getElementById('cancelPrivacyBtn').addEventListener('click', () => this.resetPrivacy());
        
        // Вкладки налаштувань
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSettingsTab(e.target.dataset.tab));
        });
        
        // Аватарки
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAvatar(e.currentTarget));
        });
        
        // Теми
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTheme(e.currentTarget));
        });
        
        // Розмір тексту
        document.getElementById('textSizeSlider').addEventListener('input', (e) => {
            this.previewTextSize(e.target.value);
        });
        
        // Закриття модального вікна
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsModal')) {
                this.closeSettings();
            }
        });
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        document.getElementById(`${tab}Tab`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('active');
        
        // Зберігаємо початкові налаштування для скасування
        this.initialSettings = JSON.parse(JSON.stringify(this.settings));
        
        if (this.currentUser) {
            document.getElementById('profileNickname').value = this.currentUser.nickname;
            
            // Аватар
            const currentAvatar = this.currentUser.avatar || 'user';
            document.querySelectorAll('.avatar-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.avatar === currentAvatar);
            });
            
            // Тема
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.theme === this.settings.theme);
            });
            
            // Інші налаштування
            document.getElementById('textSizeSlider').value = this.settings.textSize;
            document.getElementById('compactMode').checked = this.settings.compactMode;
            document.getElementById('discoverability').value = this.settings.discoverability;
            document.getElementById('messagePrivacy').value = this.settings.messagePrivacy;
            document.getElementById('readReceipts').checked = this.settings.readReceipts;
            document.getElementById('onlineStatus').checked = this.settings.onlineStatus;
        }
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    switchSettingsTab(tab) {
        document.querySelectorAll('.settings-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.querySelectorAll('.settings-tab').forEach(tabElement => {
            tabElement.classList.remove('active');
        });
        
        document.getElementById(`${tab}Pane`).classList.add('active');
        document.querySelector(`.settings-tab[data-tab="${tab}"]`).classList.add('active');
    }

    selectAvatar(avatarElement) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        avatarElement.classList.add('selected');
    }

    selectTheme(themeElement) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        themeElement.classList.add('selected');
        
        const theme = themeElement.dataset.theme;
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    previewTextSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
    }

    saveProfile() {
        if (!this.currentUser) return;
        
        const newNickname = document.getElementById('profileNickname').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        
        // Оновлення нікнейму
        if (newNickname && newNickname !== this.currentUser.nickname) {
            this.currentUser.nickname = newNickname;
            
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].nickname = newNickname;
                this.saveToStorage('messenger_users', this.users);
            }
            
            document.getElementById('userNickname').textContent = newNickname;
            this.showNotification('Нікнейм оновлено', 'success');
        }
        
        // Оновлення аватарки
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        if (selectedAvatar && selectedAvatar.dataset.avatar !== this.currentUser.avatar) {
            this.currentUser.avatar = selectedAvatar.dataset.avatar;
            
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].avatar = selectedAvatar.dataset.avatar;
                this.saveToStorage('messenger_users', this.users);
            }
            
            const avatarIcon = document.querySelector('#userAvatar i');
            avatarIcon.className = `fas fa-${selectedAvatar.dataset.avatar}`;
            this.showNotification('Аватар оновлено', 'success');
        }
        
        // Зміна пароля
        if (currentPassword && newPassword) {
            if (currentPassword === this.currentUser.password) {
                this.currentUser.password = newPassword;
                
                const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                if (userIndex !== -1) {
                    this.users[userIndex].password = newPassword;
                    this.saveToStorage('messenger_users', this.users);
                }
                
                this.showNotification('Пароль змінено', 'success');
            } else {
                this.showNotification('Поточний пароль невірний', 'error');
            }
        }
        
        this.saveToStorage('messenger_currentUser', this.currentUser);
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        this.updateChatsList();
    }

    saveAppearance() {
        const selectedTheme = document.querySelector('.theme-option.selected');
        if (selectedTheme) {
            this.settings.theme = selectedTheme.dataset.theme;
        }
        
        this.settings.textSize = parseInt(document.getElementById('textSizeSlider').value);
        this.settings.compactMode = document.getElementById('compactMode').checked;
        
        this.saveToStorage('messenger_settings', this.settings);
        this.applySettings();
        
        this.showNotification('Налаштування зовнішнього вигляду збережено', 'success');
        this.closeSettings();
    }

    resetAppearance() {
        if (this.initialSettings) {
            this.settings = JSON.parse(JSON.stringify(this.initialSettings));
            this.applySettings();
            
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.theme === this.settings.theme);
            });
            
            document.getElementById('textSizeSlider').value = this.settings.textSize;
            document.getElementById('compactMode').checked = this.settings.compactMode;
        }
    }

    savePrivacy() {
        this.settings.discoverability = document.getElementById('discoverability').value;
        this.settings.messagePrivacy = document.getElementById('messagePrivacy').value;
        this.settings.readReceipts = document.getElementById('readReceipts').checked;
        this.settings.onlineStatus = document.getElementById('onlineStatus').checked;
        
        this.saveToStorage('messenger_settings', this.settings);
        this.showNotification('Налаштування конфіденційності збережено', 'success');
        this.closeSettings();
    }

    resetPrivacy() {
        document.getElementById('discoverability').value = 'everyone';
        document.getElementById('messagePrivacy').value = 'everyone';
        document.getElementById('readReceipts').checked = true;
        document.getElementById('onlineStatus').checked = true;
    }

    register() {
        const nickname = document.getElementById('registerNickname').value.trim();
        const username = document.getElementById('registerUsername').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value;
        
        if (!nickname || !username || !password) {
            this.showNotification('Будь ласка, заповніть всі поля', 'error');
            return;
        }
        
        if (this.users.some(user => user.username === username)) {
            this.showNotification('Користувач з таким юзернеймом вже існує', 'error');
            return;
        }
        
        const newUser = {
            id: this.generateId(),
            nickname,
            username,
            password,
            avatar: 'user',
            registeredAt: new Date().toISOString(),
            isOnline: true
        };
        
        this.users.push(newUser);
        this.saveToStorage('messenger_users', this.users);
        
        this.currentUser = newUser;
        this.saveToStorage('messenger_currentUser', newUser);
        this.showMainInterface();
        this.loadUserData();
        
        this.showNotification('Реєстрація успішна! Вітаємо в Messenger', 'success');
        this.clearAuthForms();
    }

    login() {
        const username = document.getElementById('loginUsername').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            user.isOnline = true;
            this.saveToStorage('messenger_users', this.users);
            
            this.currentUser = user;
            this.saveToStorage('messenger_currentUser', user);
            this.showMainInterface();
            this.loadUserData();
            
            this.showNotification(`Вітаємо, ${user.nickname}!`, 'success');
            this.clearAuthForms();
        } else {
            this.showNotification('Невірний юзернейм або пароль', 'error');
        }
    }

    logout() {
        if (this.currentUser) {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].isOnline = false;
                this.saveToStorage('messenger_users', this.users);
            }
        }
        
        this.currentUser = null;
        localStorage.removeItem('messenger_currentUser');
        this.showAuthInterface();
        
        this.showNotification('Ви вийшли з системи', 'info');
    }

    searchUser() {
        const searchTerm = document.getElementById('userSearch').value.trim().toLowerCase();
        if (!searchTerm) return;
        
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        
        if (this.settings.discoverability === 'nobody') {
            resultsContainer.innerHTML = `
                <div class="search-result-item">
                    <p>Пошук користувачів вимкнено в налаштуваннях конфіденційності</p>
                </div>
            `;
            return;
        }
        
        const searchResults = this.users.filter(user => {
            const matchesSearch = user.username.includes(searchTerm) || user.nickname.toLowerCase().includes(searchTerm);
            const isNotCurrentUser = user.id !== this.currentUser.id;
            
            const userSettings = user.settings || { discoverability: 'everyone' };
            const isDiscoverable = userSettings.discoverability === 'everyone' || 
                                  (userSettings.discoverability === 'contacts' && this.areContacts(this.currentUser.id, user.id));
            
            return matchesSearch && isNotCurrentUser && isDiscoverable;
        });
        
        if (searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item">
                    <p>Користувачів не знайдено</p>
                </div>
            `;
            return;
        }
        
        searchResults.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'search-result-item';
            userElement.innerHTML = `
                <div class="avatar small">
                    <i class="fas fa-${user.avatar || 'user'}"></i>
                </div>
                <div class="user-info">
                    <h4>${user.nickname}</h4>
                    <p>@${user.username}</p>
                    <small>${user.isOnline ? '🟢 онлайн' : '⚫ офлайн'}</small>
                </div>
            `;
            
            userElement.addEventListener('click', () => this.startChat(user));
            resultsContainer.appendChild(userElement);
        });
    }

    areContacts(userId1, userId2) {
        return this.chats.some(chat => 
            (chat.user1Id === userId1 && chat.user2Id === userId2) ||
            (chat.user1Id === userId2 && chat.user2Id === userId1)
        );
    }

    startChat(user) {
        const userSettings = user.settings || { messagePrivacy: 'everyone' };
        if (userSettings.messagePrivacy === 'contacts' && !this.areContacts(this.currentUser.id, user.id)) {
            this.showNotification('Цей користувач приймає повідомлення тільки від контактів', 'error');
            return;
        }
        
        let chat = this.chats.find(chat => 
            (chat.user1Id === this.currentUser.id && chat.user2Id === user.id) ||
            (chat.user1Id === user.id && chat.user2Id === this.currentUser.id)
        );
        
        if (!chat) {
            chat = {
                id: this.generateId(),
                user1Id: this.currentUser.id,
                user2Id: user.id,
                createdAt: new Date().toISOString(),
                lastMessage: null,
                lastMessageTime: null
            };
            
            this.chats.push(chat);
            this.saveToStorage('messenger_chats', this.chats);
        }
        
        this.activeChat = {
            id: chat.id,
            userId: user.id,
            userNickname: user.nickname,
            userUsername: user.username,
            userAvatar: user.avatar || 'user',
            userOnline: user.isOnline || false
        };
        
        this.openChat();
        this.displayContactInfo(user);
        
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('userSearch').value = '';
    }

    openChat() {
        document.getElementById('chatPlaceholder').style.display = 'none';
        document.getElementById('activeChatInfo').style.display = 'flex';
        document.getElementById('activeChatName').textContent = this.activeChat.userNickname;
        document.getElementById('activeChatStatus').textContent = this.activeChat.userOnline ? 'онлайн' : 'офлайн';
        
        const activeChatAvatar = document.getElementById('activeChatAvatar');
        activeChatAvatar.innerHTML = `<i class="fas fa-${this.activeChat.userAvatar}"></i>`;
        
        document.getElementById('messageInputContainer').style.display = 'block';
        this.loadMessages();
        this.updateChatsList();
    }

    loadMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        
        const chatMessages = this.messages.filter(msg => 
            msg.chatId === this.activeChat.id
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        chatMessages.forEach(message => {
            this.displayMessage(message);
        });
        
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
        
        this.updateChatCount();
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        const isSent = message.senderId === this.currentUser.id;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSent ? 'sent' : 'received'} fade-in`;
        
        const time = new Date(message.timestamp);
        const timeString = time.toLocaleTimeString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = `
            ${!isSent ? `<div class="message-sender">${message.senderName}</div>` : ''}
            <div class="message-text">${message.text}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text || !this.activeChat) return;
        
        const newMessage = {
            id: this.generateId(),
            chatId: this.activeChat.id,
            senderId: this.currentUser.id,
            senderName: this.currentUser.nickname,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.messages.push(newMessage);
        this.saveToStorage('messenger_messages', this.messages);
        
        const chatIndex = this.chats.findIndex(chat => chat.id === this.activeChat.id);
        if (chatIndex !== -1) {
            this.chats[chatIndex].lastMessage = text;
            this.chats[chatIndex].lastMessageTime = new Date().toISOString();
            this.saveToStorage('messenger_chats', this.chats);
        }
        
        this.displayMessage(newMessage);
        input.value = '';
        
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.updateChatsList();
        this.simulateMessageReceipt();
    }

    simulateMessageReceipt() {
        setTimeout(() => {
            const chatMessages = this.messages.filter(msg => 
                msg.chatId === this.activeChat.id && 
                msg.senderId === this.currentUser.id &&
                !msg.read
            );
            
            chatMessages.forEach(msg => {
                msg.read = true;
            });
            
            this.saveToStorage('messenger_messages', this.messages);
            this.updateChatsList();
        }, 1000);
    }

    showContactInfo() {
        const contactInfo = document.getElementById('contactInfo');
        contactInfo.classList.add('active');
    }

    closeContactInfo() {
        const contactInfo = document.getElementById('contactInfo');
        contactInfo.classList.remove('active');
    }

    setupRealTimeUpdates() {
        setInterval(() => {
            if (this.currentUser && this.activeChat) {
                this.checkNewMessages();
            }
            this.updateOnlineStatus();
        }, 3000);
    }

    checkNewMessages() {
        const lastMessage = this.messages
            .filter(msg => msg.chatId === this.activeChat.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        if (lastMessage && lastMessage.senderId !== this.currentUser.id && !lastMessage.read) {
            this.loadMessages();
            this.updateChatsList();
            
            lastMessage.read = true;
            this.saveToStorage('messenger_messages', this.messages);
        }
    }

    updateOnlineStatus() {
        this.users.forEach(user => {
            if (user.id !== this.currentUser.id && Math.random() > 0.7) {
                user.isOnline = !user.isOnline;
            }
        });
        
        this.saveToStorage('messenger_users', this.users);
        
        if (this.activeChat) {
            const otherUser = this.users.find(u => u.id === this.activeChat.userId);
            if (otherUser) {
                this.activeChat.userOnline = otherUser.isOnline;
                document.getElementById('activeChatStatus').textContent = 
                    otherUser.isOnline ? 'онлайн' : 'офлайн';
            }
        }
    }

    loadUserData() {
        if (!this.currentUser) return;
        
        document.getElementById('userNickname').textContent = this.currentUser.nickname;
        document.getElementById('userUsername').textContent = `@${this.currentUser.username}`;
        
        const userAvatar = document.getElementById('userAvatar');
        userAvatar.innerHTML = `<i class="fas fa-${this.currentUser.avatar || 'user'}"></i>`;
        
        this.updateChatsList();
    }

    updateChatsList() {
        const chatsList = document.getElementById('chatsList');
        chatsList.innerHTML = '';
        
        const userChats = this.chats.filter(chat => 
            chat.user1Id === this.currentUser.id || chat.user2Id === this.currentUser.id
        );
        
        if (userChats.length === 0) {
            chatsList.innerHTML = `
                <div class="chat-item">
                    <p style="padding: 20px; text-align: center; color: var(--text-secondary);">
                        У вас поки що немає чатів. Знайдіть користувача, щоб почати спілкування.
                    </p>
                </div>
            `;
            this.updateChatCount();
            return;
        }
        
        userChats.sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(a.createdAt);
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(b.createdAt);
            return timeB - timeA;
        });
        
        userChats.forEach(chat => {
            const otherUserId = chat.user1Id === this.currentUser.id ? chat.user2Id : chat.user1Id;
            const otherUser = this.users.find(user => user.id === otherUserId);
            
            if (!otherUser) return;
            
            const chatMessages = this.messages.filter(msg => msg.chatId === chat.id);
            const lastMessage = chatMessages.length > 0 
                ? chatMessages[chatMessages.length - 1] 
                : null;
            
            const unreadCount = chatMessages.filter(msg => 
                !msg.read && msg.senderId !== this.currentUser.id
            ).length;
            
            let timeString = '';
            if (chat.lastMessageTime) {
                const time = new Date(chat.lastMessageTime);
                const now = new Date();
                const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    timeString = time.toLocaleTimeString('uk-UA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                } else if (diffDays === 1) {
                    timeString = 'Вчора';
                } else if (diffDays < 7) {
                    timeString = time.toLocaleDateString('uk-UA', { weekday: 'short' });
                } else {
                    timeString = time.toLocaleDateString('uk-UA', { 
                        day: '2-digit', 
                        month: '2-digit' 
                    });
                }
            }
            
            const chatElement = document.createElement('div');
            chatElement.className = `chat-item ${this.activeChat && this.activeChat.id === chat.id ? 'active' : ''}`;
            chatElement.innerHTML = `
                <div class="avatar small">
                    <i class="fas fa-${otherUser.avatar || 'user'}"></i>
                </div>
                <div class="chat-item-info">
                    <h4>${otherUser.nickname}</h4>
                    <p>${lastMessage ? (lastMessage.senderId === this.currentUser.id ? 'Ви: ' : '') + lastMessage.text : 'Немає повідомлень'}</p>
                </div>
                <div class="chat-item-meta">
                    ${timeString ? `<div class="chat-item-time">${timeString}</div>` : ''}
                    ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ''}
                </div>
            `;
            
            chatElement.addEventListener('click', () => {
                this.activeChat = {
                    id: chat.id,
                    userId: otherUser.id,
                    userNickname: otherUser.nickname,
                    userUsername: otherUser.username,
                    userAvatar: otherUser.avatar || 'user',
                    userOnline: otherUser.isOnline || false
                };
                this.openChat();
                this.displayContactInfo(otherUser);
            });
            
            chatsList.appendChild(chatElement);
        });
        
        this.updateChatCount();
    }

    updateChatCount() {
        const userChats = this.chats.filter(chat => 
            chat.user1Id === this.currentUser.id || chat.user2Id === this.currentUser.id
        );
        document.getElementById('chatCount').textContent = userChats.length;
    }

    displayContactInfo(user) {
        const contactInfoContent = document.getElementById('contactInfoContent');
        
        contactInfoContent.innerHTML = `
            <div class="contact-details">
                <div class="avatar">
                    <i class="fas fa-${user.avatar || 'user'}"></i>
                </div>
                <h3>${user.nickname}</h3>
                <div class="username">@${user.username}</div>
                <p>${user.isOnline ? '🟢 Онлайн' : '⚫ Офлайн'}</p>
                <p>Зареєстрований: ${new Date(user.registeredAt).toLocaleDateString('uk-UA')}</p>
                <div class="contact-actions">
                    <button class="btn-secondary" id="blockUserBtn">Заблокувати</button>
                    <button class="btn-primary" id="startCallBtn">Почати дзвінок</button>
                </div>
            </div>
        `;
        
        document.getElementById('blockUserBtn').addEventListener('click', () => {
            this.showNotification(`Користувач ${user.nickname} заблокований`, 'info');
        });
        
        document.getElementById('startCallBtn').addEventListener('click', () => {
            this.showNotification(`Дзвінок користувачу ${user.nickname}...`, 'info');
        });
        
        if (window.innerWidth <= 1024) {
            this.showContactInfo();
        }
    }

    showAuthInterface() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('mainContainer').style.display = 'none';
    }

    showMainInterface() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
    }

    clearAuthForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: var(--shadow);
            animation: fadeIn 0.3s;
            background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        if (!document.querySelector('#notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Ініціалізація додатка
document.addEventListener('DOMContentLoaded', () => {
    window.messengerApp = new MessengerApp();
});