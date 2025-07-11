
    const passwordInput = document.getElementById('password-input');
    const submitButton = document.getElementById('password-submit-button');
    const passwordPromptOverlay = document.getElementById('password-prompt-overlay');
    const mainArticleContent = document.getElementById('main-article-content');
    const errorMessageElement = document.getElementById('error-message');
    const contentHintElement = document.getElementById('content-hint');

    // 从 HTML 中获取多套加密数据
    let encryptedPayloads = {};
    let contentHints = {};

    try {
        const encryptedDataElement = document.getElementById('encryptedDataContainer');
        if (!encryptedDataElement || !encryptedDataElement.textContent) {
            console.error("未找到加密数据容器或容器为空。");
            showError("无法加载加密内容。");
        }

        const encryptedData = JSON.parse(encryptedDataElement.textContent);
        console.log("解析后的加密数据:", encryptedData);

        // 支持旧格式（单一密码）和新格式（多密码）
        if (encryptedData.salt && encryptedData.iv && encryptedData.ciphertext) {
            // 旧格式：转换为新格式
            encryptedPayloads['default'] = {
                salt: encryptedData.salt,
                iv: encryptedData.iv,
                ciphertext: encryptedData.ciphertext
            };
            contentHints['default'] = "请输入密码查看内容";
        } else if (encryptedData.contents) {
            // 新格式：多套内容
            encryptedPayloads = encryptedData.contents;
            contentHints = encryptedData.hints || {};
        } else {
            throw new Error("加密数据格式不正确");
        }

        // 验证所有加密数据
        for (const [key, payload] of Object.entries(encryptedPayloads)) {
            if (!payload.salt || !payload.iv || !payload.ciphertext) {
                throw new Error(`加密数据 ${key} 格式不正确`);
            }
        }

        console.log("成功加载", Object.keys(encryptedPayloads).length, "套加密内容");
    } catch (e) {
        console.error("解析加密数据失败:", e);
        showError("无法解析加密内容。");
    }

    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        setTimeout(() => {
            errorMessageElement.style.display = 'none';
        }, 3000);
    }

    function showContentHint(hint) {
        if (contentHintElement && hint) {
            contentHintElement.textContent = hint;
            contentHintElement.style.display = 'block';
        }
    }

    function hexToUint8Array(hexString) {
        if (!hexString || typeof hexString !== 'string') {
            console.error("hexToUint8Array: 输入不是有效字符串:", hexString, typeof hexString);
            throw new Error("十六进制字符串无效");
        }

        let cleanHexString = hexString.replace(/\s+/g, '');

        if (cleanHexString.length % 2 !== 0) {
            console.warn("hexToUint8Array: 字符串长度不是偶数，移除最后一个字符");
            cleanHexString = cleanHexString.substring(0, cleanHexString.length - 1);
        }

        if (!/^[0-9a-fA-F]*$/.test(cleanHexString)) {
            console.error("hexToUint8Array: 包含无效的十六进制字符");
            throw new Error("无效的十六进制字符串");
        }

        const byteArray = new Uint8Array(cleanHexString.length / 2);
        for (let i = 0; i < byteArray.length; i++) {
            const hexByte = cleanHexString.substr(i * 2, 2);
            byteArray[i] = parseInt(hexByte, 16);
        }
        return byteArray;
    }

    async function tryDecryptWithPassword(password, payloadKey, payload) {
        const salt = hexToUint8Array(payload.salt);
        const iv = hexToUint8Array(payload.iv);
        const ciphertext = hexToUint8Array(payload.ciphertext);

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decryptedBuffer);
    }

    async function decryptContent(password) {
        errorMessageElement.style.display = 'none';
        if (!password) {
            showError('密码不能为空！');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 解密中...';

        try {
            let decryptedContent = null;
            let matchedKey = null;

            // 尝试用输入的密码解密所有内容
            for (const [key, payload] of Object.entries(encryptedPayloads)) {
                try {
                    console.log(`尝试解密内容: ${key}`);
                    decryptedContent = await tryDecryptWithPassword(password, key, payload);
                    matchedKey = key;
                    console.log(`成功解密内容: ${key}`);
                    break;
                } catch (e) {
                    console.log(`密码不匹配内容: ${key}`);
                    continue;
                }
            }

            if (decryptedContent) {
                mainArticleContent.innerHTML = decryptedContent;
                mainArticleContent.style.display = 'block';
                passwordPromptOverlay.style.display = 'none';

                // 显示解密成功的内容提示
                if (contentHints[matchedKey]) {
                    console.log(`解密成功 - ${contentHints[matchedKey]}`);
                }

                // 移动端优化
                if (window.innerWidth <= 768) {
                    document.body.style.paddingTop = '80px';
                    const articleContainer = document.querySelector('.article-container');
                    if (articleContainer) {
                        articleContainer.style.marginTop = '0';
                        articleContainer.style.marginBottom = '0';
                        articleContainer.style.backgroundColor = '#ffffff';
                        articleContainer.style.boxShadow = 'none';
                        articleContainer.style.borderRadius = '0';
                        articleContainer.style.padding = '1.5rem';
                    }
                }

                // 重新渲染页面元素（如果有的话）
                if (typeof window.renderMathJax === 'function') {
                    window.renderMathJax();
                }

                const decryptedContentContainer = document.querySelector('.article-content');
                if (decryptedContentContainer) {
                    decryptedContentContainer.innerHTML = decryptedContent;
                    const script = document.createElement('script');
                    script.src = 'assets/js//toc.js';
                    script.onload = () => {
                        console.log('toc.js loaded');
                    };

                    document.body.appendChild(script);
                }
            } else {
                showError('密码错误，请重试！');
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error("解密过程中发生错误:", error);
            showError('解密失败！');
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-key"></i> <span>解锁</span>';
        }
    }

    // 事件监听器
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            const password = passwordInput.value.trim();
            decryptContent(password);
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const password = passwordInput.value.trim();
                decryptContent(password);
            }
        });

        // 自动聚焦密码输入框
        passwordInput.focus();
    }

    // 显示可用内容的提示
    const hintKeys = Object.keys(contentHints);
    if (hintKeys.length > 1) {
        const hintText = hintKeys.map(key => contentHints[key]).join(' / ');
        showContentHint(`可用内容: ${hintText}`);
    }

