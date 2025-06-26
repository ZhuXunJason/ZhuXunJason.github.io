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

        console.log("原始加密数据:", encryptedDataElement.textContent.trim());
        encryptedPayload = JSON.parse(encryptedDataElement.textContent);
        console.log("解析后的加密数据:", encryptedPayload);

        if (!encryptedPayload || !encryptedPayload.salt || !encryptedPayload.iv || !encryptedPayload.ciphertext) {
            console.error("加密数据格式不正确:", encryptedPayload);
            console.error("验证结果:", {
                hasPayload: !!encryptedPayload,
                hasSalt: !!(encryptedPayload && encryptedPayload.salt),
                hasIV: !!(encryptedPayload && encryptedPayload.iv),
                hasCiphertext: !!(encryptedPayload && encryptedPayload.ciphertext),
                saltType: encryptedPayload && typeof encryptedPayload.salt,
                ivType: encryptedPayload && typeof encryptedPayload.iv,
                ciphertextType: encryptedPayload && typeof encryptedPayload.ciphertext
            });
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
        if (!hexString || typeof hexString !== 'string') {
            console.error("hexToUint8Array: 输入不是有效字符串:", hexString, typeof hexString);
            throw new Error("十六进制字符串无效");
        }

        // 清理字符串：去除所有空白字符
        let cleanHexString = hexString.replace(/\s+/g, '');
        console.log("hexToUint8Array: 原始字符串长度:", hexString.length, "清理后长度:", cleanHexString.length);
        console.log("hexToUint8Array: 清理后的字符串前50个字符:", cleanHexString.substring(0, 50));

        // 如果长度是奇数，可能是数据被截断了，我们移除最后一个字符
        if (cleanHexString.length % 2 !== 0) {
            console.warn("hexToUint8Array: 字符串长度不是偶数，可能数据被截断。原长度:", cleanHexString.length);
            cleanHexString = cleanHexString.substring(0, cleanHexString.length - 1);
            console.warn("hexToUint8Array: 移除最后一个字符后的长度:", cleanHexString.length);
        }

        // 检查是否包含无效字符
        if (!/^[0-9a-fA-F]*$/.test(cleanHexString)) {
            console.error("hexToUint8Array: 包含无效的十六进制字符");
            console.error("无效字符示例:", cleanHexString.match(/[^0-9a-fA-F]/g));
            throw new Error("无效的十六进制字符串");
        }

        const byteArray = new Uint8Array(cleanHexString.length / 2);
        for (let i = 0; i < byteArray.length; i++) {
            const hexByte = cleanHexString.substr(i * 2, 2);
            byteArray[i] = parseInt(hexByte, 16);
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
            console.log("开始解密，密码长度:", password.length);
            console.log("加密数据字段:", {
                saltLength: encryptedPayload.salt ? encryptedPayload.salt.length : 'null',
                ivLength: encryptedPayload.iv ? encryptedPayload.iv.length : 'null',
                ciphertextLength: encryptedPayload.ciphertext ? encryptedPayload.ciphertext.length : 'null'
            });

            const salt = hexToUint8Array(encryptedPayload.salt);
            const iv = hexToUint8Array(encryptedPayload.iv);
            const ciphertext = hexToUint8Array(encryptedPayload.ciphertext);

            console.log("十六进制转换成功，字节数组长度:", {
                saltBytes: salt.length,
                ivBytes: iv.length,
                ciphertextBytes: ciphertext.length
            });

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
                    iv: iv
                },
                key,
                ciphertext
            ); const decryptedText = new TextDecoder().decode(decryptedBuffer);
            mainArticleContent.innerHTML = decryptedText;
            mainArticleContent.style.display = 'block';
            passwordPromptOverlay.style.display = 'none'; // 隐藏密码输入界面

            // 移动端优化：确保页面布局正确
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

                // 纯色
                if (document.body.classList.contains('article-with-background')) {
                    document.body.style.background = '#fbfbfb';
                    document.body.style.animation = 'none';
                }
            }

            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.position = 'relative';
                footer.style.bottom = 'auto';
                footer.style.marginTop = window.innerWidth <= 768 ? '0' : '2rem';
            }

        } catch (error) {
            console.error("解密错误:", error);
            const errorMessage = error.message || error.toString() || "未知错误";
            if (errorMessage.toLowerCase().includes("bad data") ||
                errorMessage.toLowerCase().includes("decryption failed") ||
                error.name === "OperationError") {
                showError('密码错误或内容已损坏。');
            } else if (errorMessage.toLowerCase().includes("十六进制字符串")) {
                showError('加密数据格式错误。');
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
