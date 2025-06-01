document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const submitButton = document.getElementById('password-submit-button');
    const passwordPromptOverlay = document.getElementById('password-prompt-overlay');
    const mainArticleContent = document.getElementById('main-article-content');
    const errorMessageElement = document.getElementById('error-message');

    // 从 HTML 中获取加密数据
    let encryptedPayload;
    try {
        const encryptedDataElement = document.getElementById('encryptedDataContainer');
        if (!encryptedDataElement || !encryptedDataElement.textContent) {
            console.error("未找到加密数据容器或容器为空。");
            showError("无法加载加密内容。");
            return;
        }
        encryptedPayload = JSON.parse(encryptedDataElement.textContent);
        if (!encryptedPayload || !encryptedPayload.salt || !encryptedPayload.iv || !encryptedPayload.ciphertext) {
            console.error("加密数据格式不正确:", encryptedPayload);
            showError("加密数据无效。");
            return;
        }
    } catch (e) {
        console.error("解析加密数据失败:", e);
        showError("无法解析加密内容。");
        return;
    }

    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }

    function hexToUint8Array(hexString) {
        if (hexString.length % 2 !== 0) {
            throw "无效的十六进制字符串";
        }
        const byteArray = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < byteArray.length; i++) {
            byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
        }
        return byteArray;
    }

    async function decryptContent(password) {
        errorMessageElement.style.display = 'none'; // 重置错误消息
        if (!password) {
            showError('密码不能为空！');
            return;
        }

        try {
            const salt = hexToUint8Array(encryptedPayload.salt);
            const iv = hexToUint8Array(encryptedPayload.iv);
            const ciphertext = hexToUint8Array(encryptedPayload.ciphertext);

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
                    iterations: 100000, // 必须与加密时使用的迭代次数相同
                    hash: "SHA-256"    // 必须与加密时使用的哈希算法相同
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 }, // 必须与加密时使用的算法和密钥长度相同
                true,
                ["encrypt", "decrypt"]
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv // IV 必须与加密时使用的相同
                },
                key,
                ciphertext
            ); const decryptedText = new TextDecoder().decode(decryptedBuffer);
            mainArticleContent.innerHTML = decryptedText;
            mainArticleContent.style.display = 'block';
            passwordPromptOverlay.style.display = 'none'; // 隐藏密码输入界面

            // 移动端优化：确保页面布局正确
            if (window.innerWidth <= 768) {
                // 移动端：确保body有正确的padding-top
                document.body.style.paddingTop = '80px';

                // 确保文章容器样式正确
                const articleContainer = document.querySelector('.article-container');
                if (articleContainer) {
                    articleContainer.style.marginTop = '0';
                    articleContainer.style.marginBottom = '0';
                    articleContainer.style.backgroundColor = '#ffffff';
                    articleContainer.style.boxShadow = 'none';
                    articleContainer.style.borderRadius = '0';
                    articleContainer.style.padding = '1.5rem';
                }

                // 确保背景在移动端是纯色
                if (document.body.classList.contains('article-with-background')) {
                    document.body.style.background = '#fbfbfb';
                    document.body.style.animation = 'none';
                }
            }

            // 修改 footer 位置，让它不再固定在底部
            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.position = 'relative';
                footer.style.bottom = 'auto';
                footer.style.marginTop = window.innerWidth <= 768 ? '0' : '2rem';
            }

        } catch (error) {
            console.error("解密错误:", error);
            if (error.message.toLowerCase().includes("bad data") || error.message.toLowerCase().includes("decryption failed") || error.name === "OperationError") {
                showError('密码错误或内容已损坏。');
            } else {
                showError('解密过程中发生错误。');
            }
        }
    }

    submitButton.addEventListener('click', () => {
        decryptContent(passwordInput.value);
    });

    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            decryptContent(passwordInput.value);
        }
    });
});
