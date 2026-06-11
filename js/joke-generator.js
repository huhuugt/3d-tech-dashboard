/**
 * 随机笑话生成器模块
 * 使用 JokeAPI 获取随机笑话
 */

class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.isLoading = false;
        this.apiUrl = 'https://v2.jokeapi.dev/joke/Any?type=single&format=json';
        this.jokeHistory = [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        this.createJokeContainer();
        this.attachEventListeners();
    }

    createJokeContainer() {
        // 检查是否已存在
        if (document.getElementById('joke-widget')) {
            return;
        }

        const jokeWidget = document.createElement('div');
        jokeWidget.id = 'joke-widget';
        jokeWidget.className = 'joke-widget';
        jokeWidget.innerHTML = `
            <div class="joke-header">
                <span class="joke-title">🎭 笑话生成器</span>
                <button class="joke-close" title="关闭">✕</button>
            </div>
            <div class="joke-content">
                <div class="joke-text" id="jokeText">点击"获取笑话"开始</div>
                <div class="joke-category" id="jokeCategory"></div>
            </div>
            <div class="joke-controls">
                <button class="joke-btn joke-btn-primary" id="getJokeBtn">获取笑话</button>
                <button class="joke-btn joke-btn-secondary" id="shareJokeBtn">分享</button>
                <button class="joke-btn joke-btn-secondary" id="copyJokeBtn">复制</button>
            </div>
            <div class="joke-history">
                <div class="history-title">最近笑话</div>
                <div class="history-list" id="historyList"></div>
            </div>
        `;

        document.body.appendChild(jokeWidget);
    }

    attachEventListeners() {
        const getJokeBtn = document.getElementById('getJokeBtn');
        const shareJokeBtn = document.getElementById('shareJokeBtn');
        const copyJokeBtn = document.getElementById('copyJokeBtn');
        const closeBtn = document.querySelector('.joke-close');

        if (getJokeBtn) {
            getJokeBtn.addEventListener('click', () => this.fetchJoke());
        }

        if (shareJokeBtn) {
            shareJokeBtn.addEventListener('click', () => this.shareJoke());
        }

        if (copyJokeBtn) {
            copyJokeBtn.addEventListener('click', () => this.copyJoke());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleVisibility());
        }
    }

    async fetchJoke() {
        if (this.isLoading) return;

        this.isLoading = true;
        const getJokeBtn = document.getElementById('getJokeBtn');
        const jokeText = document.getElementById('jokeText');
        const jokeCategory = document.getElementById('jokeCategory');

        if (getJokeBtn) {
            getJokeBtn.disabled = true;
            getJokeBtn.textContent = '加载中...';
        }

        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                jokeText.textContent = '获取笑话失败，请重试';
            } else {
                this.currentJoke = {
                    joke: data.joke,
                    category: data.category,
                    type: data.type,
                    timestamp: new Date().toLocaleTimeString('zh-CN')
                };

                // 显示笑话
                jokeText.textContent = data.joke;
                jokeCategory.textContent = `📂 分类: ${data.category} | 类型: ${data.type}`;

                // 添加到历史记录
                this.addToHistory(this.currentJoke);

                // 添加显示动画
                jokeText.classList.add('fade-in');
                setTimeout(() => jokeText.classList.remove('fade-in'), 300);
            }
        } catch (error) {
            console.error('Error fetching joke:', error);
            jokeText.textContent = `错误: ${error.message}`;
            jokeCategory.textContent = '请检查网络连接后重试';
        } finally {
            this.isLoading = false;
            if (getJokeBtn) {
                getJokeBtn.disabled = false;
                getJokeBtn.textContent = '获取笑话';
            }
        }
    }

    addToHistory(joke) {
        this.jokeHistory.unshift(joke);
        
        if (this.jokeHistory.length > this.maxHistory) {
            this.jokeHistory.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        this.jokeHistory.forEach((joke, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-time">${joke.timestamp}</span>
                <span class="history-preview">${this.truncateText(joke.joke, 30)}</span>
            `;
            historyItem.addEventListener('click', () => {
                document.getElementById('jokeText').textContent = joke.joke;
                document.getElementById('jokeCategory').textContent = `📂 分类: ${joke.category} | 类型: ${joke.type}`;
                this.currentJoke = joke;
            });
            historyList.appendChild(historyItem);
        });
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    copyJoke() {
        if (!this.currentJoke) {
            alert('请先获取一个笑话');
            return;
        }

        const text = this.currentJoke.joke;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('笑话已复制到剪贴板');
            }).catch(err => {
                console.error('复制失败:', err);
            });
        } else {
            // 后备方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('笑话已复制到剪贴板');
        }
    }

    shareJoke() {
        if (!this.currentJoke) {
            alert('请先获取一个笑话');
            return;
        }

        const text = `🎭 ${this.currentJoke.joke}\n\n来自 3D Tech Dashboard 笑话生成器`;
        
        if (navigator.share) {
            navigator.share({
                title: '分享一个笑话',
                text: text
            }).catch(err => console.error('分享失败:', err));
        } else {
            // 后备方案：复制到剪贴板
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('笑话已复制，可以分享了');
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'joke-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    toggleVisibility() {
        const widget = document.getElementById('joke-widget');
        if (widget) {
            widget.classList.toggle('minimized');
        }
    }
}

// 初始化笑话生成器
let jokeGenerator = null;

function initJokeGenerator() {
    if (!jokeGenerator) {
        jokeGenerator = new JokeGenerator();
        console.log('✓ Joke Generator initialized');
    }
}