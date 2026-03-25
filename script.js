document.addEventListener('DOMContentLoaded', () => {
    // 公告弹窗逻辑
    const noticeModal = document.getElementById('notice-modal');
    const closeNoticeBtn = document.getElementById('close-notice');

    if (noticeModal) {
        // 检查本地存储中是否已有公告已读标记
        const noticeShown = localStorage.getItem('noticeShown');
        
        if (!noticeShown) {
            // 延迟一小会儿显示，增加仪式感
            setTimeout(() => {
                noticeModal.style.display = 'flex';
            }, 500);
        }
    }

    if (closeNoticeBtn) {
        closeNoticeBtn.addEventListener('click', () => {
            noticeModal.style.display = 'none';
            // 用户点击确认后，在本地存储记录已读标记
            localStorage.setItem('noticeShown', 'true');
        });
    }

    // 深色模式切换逻辑
    const themeToggle = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;

    // 检查本地存储
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // 侧边栏开关逻辑
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    menuToggle.addEventListener('click', () => {
        if (window.innerWidth < 1200) {
            sidebar.classList.toggle('active');
        } else {
            sidebar.classList.toggle('sidebar-closed');
            mainContent.classList.toggle('expanded');
        }
    });

    // 点击侧边栏外部自动关闭 (移动端)
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1200 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // 搜索切换逻辑
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchInput = document.querySelector('.search-input-box input');
    
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const engine = tab.textContent.trim();
            searchInput.placeholder = engine === '站内' ? '站内搜索' : `在 ${engine} 中搜索`;
        });
    });

    // 自定义链接逻辑
    const myLinksGrid = document.getElementById('my-links-grid');
    const customModal = document.getElementById('custom-modal');
    const customForm = document.getElementById('custom-form');
    const btnCustomSidebar = document.querySelector('.btn-custom');
    const btnClearSidebar = document.querySelector('.btn-clear');
    const closeModal = document.querySelector('.close-modal');
    const btnCancelModal = document.querySelector('.btn-cancel');

    let isDeleteMode = false;

    // 从 localStorage 加载自定义链接
    const loadCustomLinks = () => {
        const links = JSON.parse(localStorage.getItem('customLinks') || '[]');
        
        // 保留“添加自定义”按钮，并根据模式重新生成链接卡片
        const customBtnHtml = `
            <div class="link-card-wrapper btn-inline-custom-wrap">
                <div class="link-card btn-inline-custom" id="add-custom-btn-inline">
                    <div class="card-left">
                        <div class="link-icon-placeholder">➕</div>
                    </div>
                    <div class="card-mid">
                        <div class="link-name">添加自定义</div>
                        <div class="link-desc">点击添加您的链接</div>
                    </div>
                    <div class="card-right"><span class="arrow-icon">›</span></div>
                </div>
            </div>
        `;

        const linksHtml = links.map((link, index) => `
            <div class="link-card-wrapper" style="position: relative;">
                <a href="${isDeleteMode ? 'javascript:void(0)' : link.url}" target="${isDeleteMode ? '_self' : '_blank'}" class="link-card ${isDeleteMode ? 'delete-mode' : ''}">
                    <div class="card-left">
                        <img src="${link.icon || 'https://www.google.com/s2/favicons?sz=64&domain=' + new URL(link.url).hostname}" class="link-icon" onerror="this.src='https://www.google.com/s2/favicons?sz=64&domain=google.com'"/>
                    </div>
                    <div class="card-mid">
                        <div class="link-name">${link.name}</div>
                        <div class="link-desc">${link.desc || link.name}</div>
                    </div>
                    <div class="card-right">
                        <span class="arrow-icon">›</span>
                    </div>
                    ${isDeleteMode ? `<div class="delete-btn" data-index="${index}">&times;</div>` : ''}
                </a>
            </div>
        `).join('');

        myLinksGrid.innerHTML = linksHtml + customBtnHtml;

        // 重新绑定“添加自定义”按钮事件
        document.getElementById('add-custom-btn-inline').addEventListener('click', () => {
            if (isDeleteMode) return;
            customModal.style.display = 'block';
        });

        // 绑定删除按钮事件
        if (isDeleteMode) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const index = parseInt(btn.getAttribute('data-index'));
                    deleteCustomLink(index);
                });
            });
        }
    };

    const deleteCustomLink = (index) => {
        const links = JSON.parse(localStorage.getItem('customLinks') || '[]');
        links.splice(index, 1);
        localStorage.setItem('customLinks', JSON.stringify(links));
        loadCustomLinks();
    };

    // 初始化加载
    loadCustomLinks();

    // 侧边栏“自定义”按钮
    btnCustomSidebar.addEventListener('click', () => {
        if (isDeleteMode) toggleDeleteMode();
        customModal.style.display = 'block';
    });

    // 侧边栏“清除定义”按钮
    btnClearSidebar.addEventListener('click', () => {
        toggleDeleteMode();
    });

    const toggleDeleteMode = () => {
        isDeleteMode = !isDeleteMode;
        btnClearSidebar.classList.toggle('active', isDeleteMode);
        loadCustomLinks();
    };

    // 弹窗关闭逻辑
    const closeCustomModal = () => {
        customModal.style.display = 'none';
        customForm.reset();
    };

    closeModal.addEventListener('click', closeCustomModal);
    btnCancelModal.addEventListener('click', closeCustomModal);
    window.addEventListener('click', (e) => {
        if (e.target === customModal) closeCustomModal();
    });

    // 表单提交逻辑
    customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('site-name').value;
        const url = document.getElementById('site-url').value;
        const icon = document.getElementById('site-icon').value;
        const desc = document.getElementById('site-desc').value;

        const newLink = { name, url, icon, desc };
        const links = JSON.parse(localStorage.getItem('customLinks') || '[]');
        links.push(newLink);
        localStorage.setItem('customLinks', JSON.stringify(links));

        closeCustomModal();
        loadCustomLinks();
    });

    // 图片加载失败处理
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && e.target.classList.contains('link-icon')) {
            e.target.src = 'https://www.google.com/s2/favicons?sz=64&domain=google.com';
        }
    }, true);

    // 平滑滚动逻辑
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 更新激活状态
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                // 移动端点击后收起侧边栏
                if (window.innerWidth < 1200) {
                    sidebar.classList.remove('active');
                }

                // 滚动
                const yOffset = -80; // 对应 header 高度
                const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
    });

    // 滚动监听更新激活分类
    const observerOptions = {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (!id) return;
                
                menuItems.forEach(mi => {
                    if (mi.getAttribute('data-target') === id) {
                        mi.classList.add('active');
                    } else {
                        mi.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.category-block[id]').forEach(block => {
        observer.observe(block);
    });

    // 图片加载失败处理
    /* 之前的内联代码已经处理了图片加载失败 */

    // 搜索回车逻辑
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                const activeEngine = document.querySelector('.search-tab.active').textContent.trim();
                alert(`正在使用 ${activeEngine} 搜索: ${query}`);
                // 这里可以替换为实际的搜索跳转逻辑
            }
        }
    });
});
